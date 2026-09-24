'use client';

import { useEffect, useSyncExternalStore } from 'react';

import type { ProjectSaveRuntime, ProjectSaveState } from './project-save-runtime';

const CLEAN_STATE: ProjectSaveState = {
  automaticRetryBlocked: false,
  dirty: false,
  lastSavedAt: null,
  saving: false,
};

export function useProjectSaveLifecycle(runtime: ProjectSaveRuntime | null): ProjectSaveState {
  const state = useSyncExternalStore(
    runtime?.subscribe ?? (() => () => undefined),
    runtime?.getState ?? (() => CLEAN_STATE),
    () => CLEAN_STATE,
  );

  useEffect(() => {
    if (runtime === null) return;
    runtime.start();
    return () => runtime.dispose();
  }, [runtime]);

  useEffect(() => {
    if (runtime === null) return;
    const retry = () => void runtime.retryNow();
    const retryWhenVisible = () => {
      if (document.visibilityState === 'visible') retry();
    };
    window.addEventListener('online', retry);
    document.addEventListener('visibilitychange', retryWhenVisible);
    return () => {
      window.removeEventListener('online', retry);
      document.removeEventListener('visibilitychange', retryWhenVisible);
    };
  }, [runtime]);

  useEffect(() => {
    if (runtime === null || (!state.dirty && !state.saving)) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      void runtime.flush();
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [runtime, state.dirty, state.saving]);

  return state;
}
