import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

import type { DesktopLogLevel } from '../lib/desktop/logging';
import { MissingApiKeyError, type OpenApiConfig } from '../network/clientFetch';
import { createGenerationLifecycle } from '../network/generation-lifecycle';
import type { GetImageTaskResponse } from '../network/image/client';
import { imageHistoryKey, readImageHistoryItems } from '../network/image/history';
import { writeLocalHistory } from '../network/local-history';
import type { GetVideoTaskResponse } from '../network/video/client';
import { readVideoHistoryItems, videoHistoryKey } from '../network/video/history';

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}

const config: OpenApiConfig = { baseUrl: 'https://api.example.test', clientKey: 'test-key' };
const signal = new AbortController().signal;

function imageResponse(
  status: GetImageTaskResponse['data']['task_status'],
  images: GetImageTaskResponse['data']['task_result'] extends infer Result
    ? Result extends { images: infer Images }
      ? Images
      : never
    : never = [],
  message: string | null = null,
): GetImageTaskResponse {
  return {
    code: 0,
    message: 'ok',
    data: {
      task_id: 'image-task',
      task_status: status,
      task_status_msg: message,
      response_url: '',
      task_result: status === 'succeed' ? { images } : null,
    },
  };
}

function videoResponse(
  status: GetVideoTaskResponse['data']['task_status'],
  videos: GetVideoTaskResponse['data']['task_result'] extends infer Result
    ? Result extends { videos: infer Videos }
      ? Videos
      : never
    : never = [],
  message: string | null = null,
): GetVideoTaskResponse {
  return {
    code: 0,
    message: 'ok',
    data: {
      task_id: 'video-task',
      task_status: status,
      task_status_msg: message,
      response_url: '',
      task_result: status === 'succeed' ? { videos } : null,
    },
  };
}

beforeEach(() => {
  const storage = new MemoryStorage();
  const browserWindow = new EventTarget();
  Object.defineProperty(browserWindow, 'localStorage', { value: storage });
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
  Object.defineProperty(globalThis, 'window', { value: browserWindow, configurable: true });
});

test('image completion is committed before archive failure and keeps only the first remote result', async () => {
  writeLocalHistory(imageHistoryKey, [
    {
      id: 'image-task',
      taskId: 'image-task',
      prompt: 'A studio',
      createTime: 10,
      url: '',
      thumbnailUrl: '',
      resolution: '1:1',
      status: 'processing',
    },
  ]);
  const archived: string[] = [];
  const lifecycle = createGenerationLifecycle({
    getConfig: async () => config,
    native: () => true,
    now: () => 100,
    getImageTask: async () =>
      imageResponse('succeed', [
        { url: 'https://asset.test/first.png', thumbnail_url: 'https://asset.test/first-thumb.png' },
        { url: 'https://asset.test/second.png' },
      ]),
    archive: async (input) => {
      archived.push(input.url);
      return { status: 'failed', error: new Error('disk full') };
    },
  });

  const result = await lifecycle.poll({ traceId: 'image-task', type: 'image', submitTime: 10 }, signal);
  const history = readImageHistoryItems()[0];

  assert.deepEqual(result, { state: 'done', archiveFailed: true });
  assert.deepEqual(archived, ['https://asset.test/first.png']);
  assert.equal(history.status, 'completed');
  assert.equal(history.url, 'https://asset.test/first.png');
  assert.equal(history.archiveStatus, 'failed');
  assert.equal(history.archiveCompletedAt, 100);
});

test('video completion maps through its adapter and records a saved local archive', async () => {
  writeLocalHistory(videoHistoryKey, [
    {
      id: 'video-task',
      traceId: 'video-task',
      status: 'processing',
      platformName: 'seedance',
      categoryName: '',
      createTime: 10,
      duration: 0,
      errorInfo: '',
      imageEndUrl: '',
      imageUrl: '',
      prompt: 'Orbit',
      videoId: '',
      videoThumbnailUrl: '',
      videoUrl: '',
      videoType: 'Text-to-video',
    },
  ]);
  const covers: Array<{ taskId: string; videoUrl: string; localPath: string }> = [];
  const lifecycle = createGenerationLifecycle({
    getConfig: async () => config,
    native: () => true,
    now: () => 200,
    getVideoTask: async () =>
      videoResponse('succeed', [
        { url: 'https://asset.test/video.mp4', cover_url: 'https://asset.test/cover.png', duration: 5, ratio: '16:9' },
      ]),
    archive: async () => ({ status: 'saved', localPath: '/media/2026/09/17/video-video-task.mp4' }),
    generateVideoCover: async (taskId, videoUrl, localPath) => {
      covers.push({ taskId, videoUrl, localPath });
    },
  });

  assert.deepEqual(await lifecycle.poll({ traceId: 'video-task', type: 'video', submitTime: 10 }, signal), {
    state: 'done',
    archiveFailed: false,
  });
  const history = readVideoHistoryItems()[0];
  assert.equal(history.status, 'completed');
  assert.equal(history.videoUrl, 'https://asset.test/video.mp4');
  assert.equal(history.videoThumbnailUrl, 'https://asset.test/cover.png');
  assert.equal(history.duration, 5);
  assert.equal(history.ratio, '16:9');
  assert.equal(history.archiveStatus, 'saved');
  assert.equal(history.localPath, '/media/2026/09/17/video-video-task.mp4');
  assert.deepEqual(covers, [
    {
      taskId: 'video-task',
      videoUrl: 'https://asset.test/video.mp4',
      localPath: '/media/2026/09/17/video-video-task.mp4',
    },
  ]);
});

test('remote failure and missing credentials preserve their distinct lifecycle semantics', async () => {
  writeLocalHistory(imageHistoryKey, [
    {
      id: 'image-task',
      taskId: 'image-task',
      prompt: '',
      createTime: 10,
      url: '',
      thumbnailUrl: '',
      resolution: '',
      status: 'processing',
    },
  ]);
  const logs: Array<{ level: DesktopLogLevel; scope: string; message: string }> = [];
  const failed = createGenerationLifecycle({
    getConfig: async () => config,
    getImageTask: async () => imageResponse('failed', [], 'moderation rejected'),
    now: () => 1_234,
    log: (level, scope, message) => {
      logs.push({ level, scope, message });
    },
  });
  assert.deepEqual(await failed.poll({ traceId: 'image-task', type: 'image', submitTime: 10 }, signal), {
    state: 'done',
    failureMessage: 'moderation rejected',
  });
  assert.equal(readImageHistoryItems()[0].status, 'fail');
  assert.equal(logs.at(-1)?.level, 'error');
  assert.equal(logs.at(-1)?.scope, 'image-generation');
  assert.match(logs.at(-1)?.message || '', /task=image-task status=failed elapsedMs=1224/);
  assert.match(logs.at(-1)?.message || '', /moderation rejected/);

  writeLocalHistory(imageHistoryKey, [{ ...readImageHistoryItems()[0], status: 'processing', errorInfo: undefined }]);
  let networkCalls = 0;
  const paused = createGenerationLifecycle({
    getConfig: async () => {
      throw new MissingApiKeyError();
    },
    getImageTask: async () => {
      networkCalls++;
      return imageResponse('processing');
    },
  });
  assert.deepEqual(await paused.poll({ traceId: 'image-task', type: 'image', submitTime: 10 }, signal), {
    state: 'paused',
  });
  assert.equal(networkCalls, 0);
  assert.equal(readImageHistoryItems()[0].status, 'processing');
});

test('startup archive recovery is deduplicated, aggregated and never submits generation again', async () => {
  writeLocalHistory(imageHistoryKey, [
    {
      id: 'image-task',
      taskId: 'image-task',
      prompt: '',
      createTime: 10,
      url: 'https://asset.test/image.png',
      thumbnailUrl: '',
      resolution: '',
      status: 'completed',
      archiveStatus: 'pending',
      archiveCompletedAt: 100,
    },
  ]);
  writeLocalHistory(videoHistoryKey, [
    {
      id: 'video-task',
      traceId: 'video-task',
      status: 'completed',
      platformName: '',
      categoryName: '',
      createTime: 20,
      duration: 0,
      errorInfo: '',
      imageEndUrl: '',
      imageUrl: '',
      prompt: '',
      videoId: '',
      videoThumbnailUrl: '',
      videoUrl: 'https://asset.test/video.mp4',
      archiveStatus: 'failed',
    },
  ]);
  let archiveCalls = 0;
  let networkCalls = 0;
  const lifecycle = createGenerationLifecycle({
    native: () => true,
    getImageTask: async () => {
      networkCalls++;
      return imageResponse('processing');
    },
    getVideoTask: async () => {
      networkCalls++;
      return videoResponse('processing');
    },
    archive: async ({ type }) => {
      archiveCalls++;
      await new Promise((resolve) => setImmediate(resolve));
      return type === 'image'
        ? { status: 'saved', localPath: '/media/image.png' }
        : { status: 'failed', error: new Error('offline') };
    },
  });

  const first = lifecycle.recoverArchives();
  const second = lifecycle.recoverArchives();
  assert.equal(first, second);
  assert.deepEqual(await first, { attempted: 2, failed: 1 });
  assert.equal(archiveCalls, 2);
  assert.equal(networkCalls, 0);
  assert.equal(readImageHistoryItems()[0].archiveStatus, 'saved');
  assert.equal(readVideoHistoryItems()[0].archiveStatus, 'failed');
});

test('pending task discovery retains image and video storage compatibility', () => {
  writeLocalHistory(imageHistoryKey, [
    {
      id: 'image-task',
      taskId: 'image-task',
      prompt: '',
      createTime: 10,
      url: '',
      thumbnailUrl: '',
      resolution: '',
      status: 'processing',
    },
  ]);
  writeLocalHistory(videoHistoryKey, [
    {
      id: 'video-task',
      traceId: 'video-task',
      status: 'pending',
      platformName: '',
      categoryName: '',
      createTime: 20,
      duration: 0,
      errorInfo: '',
      imageEndUrl: '',
      imageUrl: '',
      prompt: '',
      videoId: '',
      videoThumbnailUrl: '',
      videoUrl: '',
    },
  ]);
  const lifecycle = createGenerationLifecycle({ now: () => 999 });
  assert.deepEqual(lifecycle.pendingTasks(), [
    { traceId: 'image-task', type: 'image', submitTime: 10 },
    { traceId: 'video-task', type: 'video', submitTime: 20 },
  ]);
});
