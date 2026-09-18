'use client';

import useGenerationPollingStore from '@/store/useGenerationPollingStore';
import { toast } from 'sonner';

import { generationLifecycle } from './generation-lifecycle';
import { PollingManager } from './polling-manager';

function archiveFailureMessage() {
  return navigator.language.toLowerCase().startsWith('zh')
    ? '作品已生成，但自动保存到本地失败。应用下次启动时会重试。'
    : 'The result was generated, but automatic local saving failed. The app will retry next time it starts.';
}

function archiveRecoveryFailureMessage(failed: number) {
  return navigator.language.toLowerCase().startsWith('zh')
    ? `${failed} 个作品仍未保存到本地，将在下次启动重试。`
    : `${failed} ${failed === 1 ? 'work is' : 'works are'} still not saved locally. The app will retry next time it starts.`;
}

const manager = new PollingManager({
  timeout: (task) => generationLifecycle.timeout(task),
  finish: (task) => useGenerationPollingStore.getState().remove(task.traceId),
  poll: async (task, signal) => {
    const result = await generationLifecycle.poll(task, signal);
    if (result.failureMessage) toast.error(result.failureMessage);
    if (result.archiveFailed) toast.error(archiveFailureMessage());
    return result.state === 'pending' ? 'pending' : 'done';
  },
});

export function startTaskPolling(traceId: string, type: 'image' | 'video', submitTime = Date.now()) {
  if (typeof window === 'undefined' || !traceId) return;
  if (manager.start({ traceId, type, submitTime })) useGenerationPollingStore.getState().add(traceId, type);
}

export function restorePendingTaskPolling() {
  if (typeof window === 'undefined') return;
  generationLifecycle.pendingTasks().forEach((task) => {
    startTaskPolling(task.traceId, task.type, task.submitTime);
  });
}

let archiveRecoveryNotification: Promise<void> | null = null;

export function restorePendingMediaArchives() {
  if (typeof window === 'undefined') return;
  if (archiveRecoveryNotification) return archiveRecoveryNotification;
  archiveRecoveryNotification = generationLifecycle
    .recoverArchives()
    .then((summary) => {
      if (summary.failed) toast.error(archiveRecoveryFailureMessage(summary.failed));
    })
    .finally(() => {
      archiveRecoveryNotification = null;
    });
  return archiveRecoveryNotification;
}

export function stopAllTaskPolling() {
  manager.stopAll();
}
