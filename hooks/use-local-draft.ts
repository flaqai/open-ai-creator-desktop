'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

import { deleteDraft, draftHasMissingMedia, readDraft, saveDraft } from '@/lib/desktop/drafts';
import { isDesktopRuntime } from '@/lib/desktop/runtime';

export type DraftAdapter = {
  get: () => Record<string, unknown>;
  restore: (data: Record<string, unknown>) => void;
  reset: () => void;
  subscribe: (callback: () => void) => () => void;
  validate?: (data: Record<string, unknown>) => boolean;
  shouldRestore?: () => boolean;
  initialize?: () => void;
};
export type DraftStatus = 'loading' | 'ready' | 'saving' | 'saved' | 'error';

export function useLocalDraft(key: string | null, adapter: DraftAdapter) {
  const locale = useLocale();
  const zh = locale === 'zh' || locale === 'tw';
  const current = useRef(adapter);
  current.current = adapter;
  const [status, setStatus] = useState<DraftStatus>('loading');
  const controls = useRef<{ clear: () => Promise<void> } | null>(null);
  useEffect(() => {
    if (!key || !isDesktopRuntime()) {
      setStatus('ready');
      return;
    }
    let disposed = false;
    let enabled = false;
    let dirty = false;
    let revision = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const failed = () => {
      if (!disposed) {
        setStatus('error');
        toast.error(
          zh
            ? '草稿未能保存或恢复，请检查本地存储和参考素材。'
            : 'Draft storage failed. Check local storage and reference files.',
          { id: `draft-${key}` },
        );
      }
    };
    const flush = () => {
      clearTimeout(timer);
      if (!enabled || !dirty) return;
      dirty = false;
      const savedRevision = revision;
      const snapshot = current.current.get();
      if (!disposed) setStatus('saving');
      void saveDraft(key, snapshot)
        .then(() => {
          if (!disposed && savedRevision === revision) setStatus('saved');
        })
        .catch(failed);
    };
    const unsubscribe = current.current.subscribe(() => {
      if (!enabled) return;
      dirty = true;
      revision += 1;
      setStatus('saving');
      clearTimeout(timer);
      timer = setTimeout(flush, 500);
    });
    setStatus('loading');
    const shouldRestore = current.current.shouldRestore?.() !== false;
    if (shouldRestore) current.current.initialize?.();
    void readDraft(key)
      .then((data) => {
        if (disposed) return;
        if (data && shouldRestore) {
          if (draftHasMissingMedia(data)) {
            toast.warning(
              zh
                ? '旧草稿的参考素材已失效，提示词和参数已恢复。请重新选择素材，之后将使用新的本地缓存格式。'
                : 'Old draft media is unavailable. Prompt and settings were restored; select the media once more.',
              { id: `draft-media-${key}` },
            );
          }
          if (current.current.validate && !current.current.validate(data)) {
            toast.warning(
              zh
                ? '草稿中的模型或参数已变化，请检查后再生成。'
                : 'Draft model or parameters have changed. Review before generating.',
            );
          }
          current.current.restore(data);
        }
        enabled = true;
        setStatus(data && shouldRestore ? 'saved' : 'ready');
      })
      .catch(() => {
        if (!disposed) {
          enabled = true;
          failed();
        }
      });
    controls.current = {
      clear: async () => {
        enabled = false;
        dirty = false;
        revision += 1;
        clearTimeout(timer);
        try {
          await deleteDraft(key);
          current.current.reset();
          setStatus('ready');
        } catch {
          failed();
        } finally {
          enabled = true;
        }
      },
    };
    const visibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      flush();
      disposed = true;
      unsubscribe();
      controls.current = null;
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [key, zh]);
  return { status, clear: () => controls.current?.clear() };
}
