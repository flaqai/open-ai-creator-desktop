import { getClientOpenApiConfigAsync, MissingApiKeyError, type OpenApiConfig } from '@/network/clientFetch';
import { getImageTask } from '@/network/image/client';
import {
  completeImageHistory,
  failImageHistory,
  readImageHistoryItems,
  updateImageArchive,
} from '@/network/image/history';
import { getVideoTask } from '@/network/video/client';
import {
  completeVideoHistory,
  failVideoHistory,
  readVideoHistoryItems,
  updateVideoArchive,
} from '@/network/video/history';

import { sanitizeDesktopLogText, writeDesktopLog, type DesktopLogger } from '@/lib/desktop/logging';
import { attemptMediaArchive, type MediaArchiveOutcome, type MediaKind } from '@/lib/desktop/media-storage';
import { isNativeDesktop } from '@/lib/desktop/runtime';
import { generateVideoHistoryCover } from '@/lib/media/video-history-frame';

import type { PollTask } from './polling-manager';

type RemoteMedia = {
  url: string;
  thumbnailUrl?: string;
  resolution?: string;
  duration?: number;
  ratio?: string;
};

type RemoteOutcome =
  | { status: 'pending'; remoteStatus: string }
  | { status: 'failed'; message?: string }
  | { status: 'succeeded'; media: RemoteMedia };

type GenerationAdapter = {
  poll(config: OpenApiConfig, taskId: string, signal: AbortSignal): Promise<RemoteOutcome>;
  complete(taskId: string, media: RemoteMedia, completedAt: number, archivePending: boolean): void;
  fail(taskId: string, message?: string): void;
  updateArchive(taskId: string, outcome: MediaArchiveOutcome): void;
};

type ArchiveJob = {
  type: MediaKind;
  taskId: string;
  url: string;
  completedAt: number;
};

export type GenerationLifecyclePollResult = {
  state: 'pending' | 'done' | 'paused';
  failureMessage?: string;
  archiveFailed?: boolean;
};

export type ArchiveRecoverySummary = {
  attempted: number;
  failed: number;
};

type GenerationLifecycleDependencies = {
  getConfig: () => Promise<OpenApiConfig>;
  getImageTask: typeof getImageTask;
  getVideoTask: typeof getVideoTask;
  archive: (input: ArchiveJob) => Promise<MediaArchiveOutcome>;
  generateVideoCover: (taskId: string, videoUrl: string, localPath: string) => Promise<unknown>;
  native: () => boolean;
  now: () => number;
  log: DesktopLogger;
};

export type GenerationLifecycle = {
  poll(task: PollTask, signal: AbortSignal): Promise<GenerationLifecyclePollResult>;
  timeout(task: PollTask): void;
  pendingTasks(): PollTask[];
  recoverArchives(): Promise<ArchiveRecoverySummary>;
};

const defaultDependencies: GenerationLifecycleDependencies = {
  getConfig: getClientOpenApiConfigAsync,
  getImageTask,
  getVideoTask,
  archive: ({ type, taskId, url, completedAt }) => attemptMediaArchive({ mediaType: type, taskId, url, completedAt }),
  generateVideoCover: generateVideoHistoryCover,
  native: isNativeDesktop,
  now: Date.now,
  log: writeDesktopLog,
};

function archivePayload(outcome: MediaArchiveOutcome) {
  if (outcome.status === 'saved') {
    return { archiveStatus: 'saved' as const, localPath: outcome.localPath };
  }
  if (outcome.status === 'failed') return { archiveStatus: 'failed' as const };
  return null;
}

export function createGenerationLifecycle(
  overrides: Partial<GenerationLifecycleDependencies> = {},
): GenerationLifecycle {
  const dependencies = { ...defaultDependencies, ...overrides };
  const remoteStatuses = new Map<string, string>();

  const taskKey = (task: PollTask) => `${task.type}:${task.traceId}`;
  const safeTaskId = (task: PollTask) => sanitizeDesktopLogText(task.traceId, 180);
  const elapsedMs = (task: PollTask) => Math.max(0, dependencies.now() - task.submitTime);
  const logStatus = (task: PollTask, status: string) => {
    const key = taskKey(task);
    if (remoteStatuses.get(key) === status) return;
    remoteStatuses.set(key, status);
    void dependencies.log(
      status === 'failed' ? 'error' : 'info',
      `${task.type}-generation`,
      `Task status changed task=${safeTaskId(task)} status=${sanitizeDesktopLogText(status, 60)} elapsedMs=${elapsedMs(task)}`,
    );
  };

  const adapters: Record<MediaKind, GenerationAdapter> = {
    image: {
      async poll(config, taskId, signal) {
        const response = await dependencies.getImageTask(config, taskId, signal);
        if (response.data?.task_status === 'failed') {
          return { status: 'failed', message: response.data.task_status_msg || undefined };
        }
        if (response.data?.task_status !== 'succeed') {
          return { status: 'pending', remoteStatus: response.data?.task_status || 'unknown' };
        }
        const result = response.data.task_result?.images?.[0];
        if (!result?.url) throw new Error('Image result is not available yet.');
        return {
          status: 'succeeded',
          media: { url: result.url, thumbnailUrl: result.thumbnail_url, resolution: result.resolution },
        };
      },
      complete(taskId, media, completedAt, archivePending) {
        completeImageHistory(taskId, {
          url: media.url,
          thumbnailUrl: media.thumbnailUrl,
          resolution: media.resolution,
          archiveStatus: archivePending ? 'pending' : undefined,
          archiveCompletedAt: archivePending ? completedAt : undefined,
        });
      },
      fail: failImageHistory,
      updateArchive(taskId, outcome) {
        const payload = archivePayload(outcome);
        if (payload) updateImageArchive(taskId, payload);
      },
    },
    video: {
      async poll(config, taskId, signal) {
        const response = await dependencies.getVideoTask(config, taskId, signal);
        if (response.data?.task_status === 'failed') {
          return { status: 'failed', message: response.data.task_status_msg || undefined };
        }
        if (response.data?.task_status !== 'succeed') {
          return { status: 'pending', remoteStatus: response.data?.task_status || 'unknown' };
        }
        const result = response.data.task_result?.videos?.[0];
        if (!result?.url) throw new Error('Video result is not available yet.');
        return {
          status: 'succeeded',
          media: {
            url: result.url,
            thumbnailUrl: result.cover_url,
            duration: result.duration,
            ratio: result.ratio,
          },
        };
      },
      complete(taskId, media, completedAt, archivePending) {
        completeVideoHistory(taskId, {
          videoUrl: media.url,
          videoThumbnailUrl: media.thumbnailUrl,
          duration: media.duration,
          ratio: media.ratio,
          archiveStatus: archivePending ? 'pending' : undefined,
          archiveCompletedAt: archivePending ? completedAt : undefined,
        });
      },
      fail: failVideoHistory,
      updateArchive(taskId, outcome) {
        const payload = archivePayload(outcome);
        if (payload) updateVideoArchive(taskId, payload);
      },
    },
  };

  const archive = async (job: ArchiveJob) => {
    const outcome = await dependencies.archive(job);
    adapters[job.type].updateArchive(job.taskId, outcome);
    if (job.type === 'video' && outcome.status === 'saved') {
      try {
        await dependencies.generateVideoCover(job.taskId, job.url, outcome.localPath);
      } catch (error) {
        const reason = error instanceof Error ? error.name : 'UnknownError';
        void dependencies.log(
          'warn',
          'video-history-cover',
          `Local frame generation failed task=${sanitizeDesktopLogText(job.taskId, 180)} reason=${reason}`,
        );
      }
    }
    return outcome;
  };

  let recovery: Promise<ArchiveRecoverySummary> | null = null;

  return {
    async poll(task, signal) {
      let config: OpenApiConfig;
      try {
        config = await dependencies.getConfig();
      } catch (error) {
        if (error instanceof MissingApiKeyError) {
          void dependencies.log(
            'warn',
            `${task.type}-generation`,
            `Polling paused because credentials are unavailable task=${safeTaskId(task)}`,
          );
          return { state: 'paused' };
        }
        throw error;
      }
      if (signal.aborted) return { state: 'done' };

      const adapter = adapters[task.type];
      const outcome = await adapter.poll(config, task.traceId, signal);
      if (signal.aborted) return { state: 'done' };
      if (outcome.status === 'pending') {
        logStatus(task, outcome.remoteStatus);
        return { state: 'pending' };
      }
      if (outcome.status === 'failed') {
        logStatus(task, 'failed');
        adapter.fail(task.traceId, outcome.message);
        void dependencies.log(
          'error',
          `${task.type}-generation`,
          `Task failed task=${safeTaskId(task)} status=failed elapsedMs=${elapsedMs(task)} message=${sanitizeDesktopLogText(outcome.message || 'No server failure reason')}`,
        );
        remoteStatuses.delete(taskKey(task));
        return { state: 'done', failureMessage: outcome.message };
      }

      logStatus(task, 'succeed');
      const completedAt = dependencies.now();
      const archivePending = dependencies.native();
      adapter.complete(task.traceId, outcome.media, completedAt, archivePending);
      if (!archivePending) {
        void dependencies.log(
          'info',
          `${task.type}-generation`,
          `Task completed task=${safeTaskId(task)} elapsedMs=${elapsedMs(task)} localArchive=skipped`,
        );
        remoteStatuses.delete(taskKey(task));
        return { state: 'done' };
      }

      const archiveOutcome = await archive({
        type: task.type,
        taskId: task.traceId,
        url: outcome.media.url,
        completedAt,
      });
      void dependencies.log(
        archiveOutcome.status === 'failed' ? 'error' : 'info',
        `${task.type}-generation`,
        `Task completed task=${safeTaskId(task)} elapsedMs=${elapsedMs(task)} localArchive=${archiveOutcome.status}`,
      );
      remoteStatuses.delete(taskKey(task));
      return { state: 'done', archiveFailed: archiveOutcome.status === 'failed' };
    },

    timeout(task) {
      adapters[task.type].fail(task.traceId, 'Task timeout');
      void dependencies.log(
        'error',
        `${task.type}-generation`,
        `Task timed out task=${safeTaskId(task)} elapsedMs=${elapsedMs(task)}`,
      );
      remoteStatuses.delete(taskKey(task));
    },

    pendingTasks() {
      const now = dependencies.now();
      const images: PollTask[] = readImageHistoryItems()
        .filter((item) => item.status === 'processing' && (item.taskId || item.id))
        .map((item) => ({
          traceId: item.taskId || item.id,
          type: 'image',
          submitTime: item.createTime || now,
        }));
      const videos: PollTask[] = readVideoHistoryItems()
        .filter((item) => (item.status === 'processing' || item.status === 'pending') && (item.traceId || item.id))
        .map((item) => ({
          traceId: item.traceId || item.id,
          type: 'video',
          submitTime: item.createTime || now,
        }));
      return [...images, ...videos];
    },

    recoverArchives() {
      if (!dependencies.native()) return Promise.resolve({ attempted: 0, failed: 0 });
      if (recovery) return recovery;

      const now = dependencies.now();
      const images: ArchiveJob[] = readImageHistoryItems()
        .filter(
          (item) =>
            item.status === 'completed' &&
            Boolean(item.url) &&
            (item.archiveStatus === 'pending' || item.archiveStatus === 'failed'),
        )
        .map((item) => ({
          type: 'image',
          taskId: item.taskId || item.id,
          url: item.url,
          completedAt: item.archiveCompletedAt || now,
        }));
      const videos: ArchiveJob[] = readVideoHistoryItems()
        .filter(
          (item) =>
            item.status === 'completed' &&
            Boolean(item.videoUrl) &&
            (item.archiveStatus === 'pending' || item.archiveStatus === 'failed'),
        )
        .map((item) => ({
          type: 'video',
          taskId: item.traceId || item.id,
          url: item.videoUrl,
          completedAt: item.archiveCompletedAt || now,
        }));
      const jobs = [...images, ...videos];

      recovery = (async () => {
        let failed = 0;
        for (const job of jobs) {
          const outcome = await archive(job);
          if (outcome.status === 'failed') failed++;
        }
        return { attempted: jobs.length, failed };
      })().finally(() => {
        recovery = null;
      });
      return recovery;
    },
  };
}

export const generationLifecycle = createGenerationLifecycle();
