'use client';

import { getClientOpenApiConfigAsync, MissingApiKeyError } from '@/network/clientFetch';
import { getImageTask } from '@/network/image/client';
import {
  completeImageHistory,
  failImageHistory,
  imageHistoryKey,
  updateImageArchive,
  type ImageHistoryItem,
} from '@/network/image/history';
import { readLocalHistory } from '@/network/local-history';
import { getVideoTask } from '@/network/video/client';
import {
  completeVideoHistory,
  failVideoHistory,
  updateVideoArchive,
  videoHistoryKey,
  type VideoHistoryItem,
} from '@/network/video/history';
import useGenerationPollingStore from '@/store/useGenerationPollingStore';
import { toast } from 'sonner';

import { attemptMediaArchive, type MediaKind } from '@/lib/desktop/media-storage';
import { isNativeDesktop } from '@/lib/desktop/runtime';

import { PollingManager } from './polling-manager';

function archiveFailureMessage() {
  return navigator.language.toLowerCase().startsWith('zh')
    ? '作品已生成，但自动保存到本地失败。应用下次启动时会重试。'
    : 'The result was generated, but automatic local saving failed. The app will retry next time it starts.';
}

async function archiveResult(type: MediaKind, taskId: string, url: string, completedAt: number) {
  const outcome = await attemptMediaArchive({ url, mediaType: type, taskId, completedAt });
  if (outcome.status === 'skipped') return;
  const payload =
    outcome.status === 'saved'
      ? { archiveStatus: 'saved' as const, localPath: outcome.localPath }
      : { archiveStatus: 'failed' as const };
  if (type === 'image') updateImageArchive(taskId, payload);
  else updateVideoArchive(taskId, payload);
  if (outcome.status === 'failed') toast.error(archiveFailureMessage());
}

const manager = new PollingManager({
  timeout: (task) => {
    if (task.type === 'image') failImageHistory(task.traceId, 'Task timeout');
    else failVideoHistory(task.traceId, 'Task timeout');
  },
  finish: (task) => useGenerationPollingStore.getState().remove(task.traceId),
  poll: async (task, signal) => {
    let config;
    try {
      config = await getClientOpenApiConfigAsync();
    } catch (error) {
      // Session-only keys disappear on restart; do not turn paid pending tasks
      // into failed history merely because settings need to be restored.
      if (error instanceof MissingApiKeyError) return 'done';
      throw error;
    }
    if (signal.aborted) return 'done';
    if (task.type === 'image') {
      const res = await getImageTask(config, task.traceId, signal);
      if (signal.aborted) return 'done';
      if (res.data?.task_status === 'succeed') {
        const result = res.data.task_result?.images?.[0];
        if (!result?.url) throw new Error('Image result is not available yet.');
        const completedAt = Date.now();
        completeImageHistory(task.traceId, {
          url: result.url,
          thumbnailUrl: result.thumbnail_url,
          resolution: result.resolution,
          archiveStatus: isNativeDesktop() ? 'pending' : undefined,
          archiveCompletedAt: isNativeDesktop() ? completedAt : undefined,
        });
        await archiveResult('image', task.traceId, result.url, completedAt);
        return 'done';
      }
      if (res.data?.task_status === 'failed') {
        failImageHistory(task.traceId, res.data.task_status_msg || undefined);
        if (res.data.task_status_msg) toast.error(res.data.task_status_msg);
        return 'done';
      }
    } else {
      const res = await getVideoTask(config, task.traceId, signal);
      if (signal.aborted) return 'done';
      if (res.data?.task_status === 'succeed') {
        const result = res.data.task_result?.videos?.[0];
        if (!result?.url) throw new Error('Video result is not available yet.');
        const completedAt = Date.now();
        completeVideoHistory(task.traceId, {
          videoUrl: result.url,
          videoThumbnailUrl: result.cover_url,
          duration: result.duration,
          ratio: result.ratio,
          archiveStatus: isNativeDesktop() ? 'pending' : undefined,
          archiveCompletedAt: isNativeDesktop() ? completedAt : undefined,
        });
        await archiveResult('video', task.traceId, result.url, completedAt);
        return 'done';
      }
      if (res.data?.task_status === 'failed') {
        failVideoHistory(task.traceId, res.data.task_status_msg || undefined);
        if (res.data.task_status_msg) toast.error(res.data.task_status_msg);
        return 'done';
      }
    }
    return 'pending';
  },
});

export function startTaskPolling(traceId: string, type: 'image' | 'video', submitTime = Date.now()) {
  if (typeof window === 'undefined' || !traceId) return;
  if (manager.start({ traceId, type, submitTime })) useGenerationPollingStore.getState().add(traceId, type);
}

export function restorePendingTaskPolling() {
  if (typeof window === 'undefined') return;

  const pendingImages = readLocalHistory<ImageHistoryItem>(imageHistoryKey).filter(
    (item) => item.status === 'processing' && (item.taskId || item.id),
  );
  const pendingVideos = readLocalHistory<VideoHistoryItem>(videoHistoryKey).filter(
    (item) => (item.status === 'processing' || item.status === 'pending') && (item.traceId || item.id),
  );

  pendingImages.forEach((item) => {
    startTaskPolling(item.taskId || item.id, 'image', item.createTime || Date.now());
  });

  pendingVideos.forEach((item) => {
    startTaskPolling(item.traceId || item.id, 'video', item.createTime || Date.now());
  });
}

let archiveRecovery: Promise<void> | null = null;

export function restorePendingMediaArchives() {
  if (typeof window === 'undefined' || !isNativeDesktop() || archiveRecovery) return archiveRecovery;
  const images = readLocalHistory<ImageHistoryItem>(imageHistoryKey)
    .filter(
      (item) =>
        item.status === 'completed' &&
        item.url &&
        (item.archiveStatus === 'pending' || item.archiveStatus === 'failed'),
    )
    .map((item) => ({
      type: 'image' as const,
      id: item.taskId || item.id,
      url: item.url,
      at: item.archiveCompletedAt,
    }));
  const videos = readLocalHistory<VideoHistoryItem>(videoHistoryKey)
    .filter(
      (item) =>
        item.status === 'completed' &&
        item.videoUrl &&
        (item.archiveStatus === 'pending' || item.archiveStatus === 'failed'),
    )
    .map((item) => ({
      type: 'video' as const,
      id: item.traceId || item.id,
      url: item.videoUrl,
      at: item.archiveCompletedAt,
    }));
  archiveRecovery = (async () => {
    for (const item of [...images, ...videos]) {
      await archiveResult(item.type, item.id, item.url, item.at || Date.now());
    }
  })().finally(() => {
    archiveRecovery = null;
  });
  return archiveRecovery;
}

export function stopAllTaskPolling() {
  manager.stopAll();
}
