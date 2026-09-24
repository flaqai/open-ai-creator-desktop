import { CanvasStorageError } from '@/components/infinite-canvas/runtime/persistence/canvas-storage-error';
import { type CanvasProject } from '@/components/infinite-canvas/types/project';

type ProjectSaveFailureKind = 'transient' | 'missing' | 'deterministic';

export interface ProjectSaveState {
  readonly dirty: boolean;
  readonly saving: boolean;
  readonly automaticRetryBlocked: boolean;
  readonly lastSavedAt: number | null;
}

export interface ProjectSaveRuntimeOptions {
  readonly projectId: string;
  readonly save: (projectId: string, project: CanvasProject) => Promise<unknown>;
  readonly onFailure?: (error: unknown, kind: ProjectSaveFailureKind) => void;
  readonly onRecovered?: () => void;
  readonly debounceMs?: number;
  readonly initialSavedAt?: number | null;
  readonly now?: () => number;
  readonly random?: () => number;
}

export interface ProjectSaveRuntime {
  readonly start: () => void;
  readonly queue: (project: CanvasProject) => void;
  readonly flush: () => Promise<boolean>;
  readonly retryNow: () => Promise<boolean>;
  readonly discard: () => void;
  readonly dispose: () => void;
  readonly getState: () => ProjectSaveState;
  readonly subscribe: (listener: () => void) => () => void;
}

export async function flushProjectBeforeNavigation(
  runtime: ProjectSaveRuntime,
  navigate: () => void,
): Promise<boolean> {
  if (!(await runtime.flush())) return false;
  navigate();
  return true;
}

const RETRY_DELAYS_MS = [1000, 2000, 5000, 10_000, 30_000] as const;
export const DEFAULT_PROJECT_SAVE_DEBOUNCE_MS = 5000;

function classifyProjectSaveFailure(error: unknown): ProjectSaveFailureKind {
  if (error instanceof CanvasStorageError) return error.kind;
  if (error instanceof TypeError || error instanceof DOMException) return 'deterministic';
  return 'transient';
}

export function createProjectSaveRuntime({
  projectId,
  save,
  onFailure,
  onRecovered,
  debounceMs = DEFAULT_PROJECT_SAVE_DEBOUNCE_MS,
  initialSavedAt = null,
  now = Date.now,
  random = Math.random,
}: ProjectSaveRuntimeOptions): ProjectSaveRuntime {
  let dirtySnapshot: CanvasProject | undefined;
  let inFlight: Promise<boolean> | undefined;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let retryIndex = 0;
  let failureEpisode = false;
  let automaticRetryBlocked = false;
  let disposed = false;
  let lastSavedAt = initialSavedAt;
  let state: ProjectSaveState = {
    automaticRetryBlocked: false,
    dirty: false,
    lastSavedAt,
    saving: false,
  };
  const listeners = new Set<() => void>();

  const notify = () => {
    const next = {
      automaticRetryBlocked,
      dirty: dirtySnapshot !== undefined,
      lastSavedAt,
      saving: inFlight !== undefined,
    };
    if (
      state.automaticRetryBlocked === next.automaticRetryBlocked &&
      state.dirty === next.dirty &&
      state.lastSavedAt === next.lastSavedAt &&
      state.saving === next.saving
    ) {
      return;
    }
    state = next;
    for (const listener of listeners) listener();
  };

  const clearTimers = () => {
    if (debounceTimer !== undefined) clearTimeout(debounceTimer);
    if (retryTimer !== undefined) clearTimeout(retryTimer);
    debounceTimer = undefined;
    retryTimer = undefined;
  };

  const scheduleRetry = () => {
    if (disposed || dirtySnapshot === undefined || retryTimer !== undefined || automaticRetryBlocked) return;
    const baseDelay = RETRY_DELAYS_MS[Math.min(retryIndex, RETRY_DELAYS_MS.length - 1)]!;
    retryIndex += 1;
    const jitteredDelay = Math.round(baseDelay * (0.8 + random() * 0.4));
    retryTimer = setTimeout(() => {
      retryTimer = undefined;
      void attempt(true);
    }, jitteredDelay);
  };

  const attempt = (allowAutomaticRetry: boolean): Promise<boolean> => {
    if (disposed || dirtySnapshot === undefined) return Promise.resolve(dirtySnapshot === undefined);
    if (inFlight !== undefined) return inFlight;
    const attemptedSnapshot = dirtySnapshot;

    inFlight = save(projectId, attemptedSnapshot)
      .then(() => {
        if (dirtySnapshot === attemptedSnapshot) dirtySnapshot = undefined;
        lastSavedAt = now();
        automaticRetryBlocked = false;
        retryIndex = 0;
        if (failureEpisode) {
          failureEpisode = false;
          onRecovered?.();
        }
        return true;
      })
      .catch((error: unknown) => {
        const kind = classifyProjectSaveFailure(error);
        automaticRetryBlocked = kind !== 'transient';
        if (!failureEpisode) {
          failureEpisode = true;
          onFailure?.(error, kind);
        }
        if (kind === 'transient' && allowAutomaticRetry) scheduleRetry();
        return false;
      })
      .finally(() => {
        inFlight = undefined;
        notify();
        if (!disposed && dirtySnapshot !== undefined && !automaticRetryBlocked && retryTimer === undefined) {
          debounceTimer = setTimeout(() => {
            debounceTimer = undefined;
            void attempt(true);
          }, 0);
        }
      });
    notify();
    return inFlight;
  };

  const queue = (project: CanvasProject) => {
    if (disposed) return;
    dirtySnapshot = project;
    automaticRetryBlocked = false;
    if (retryTimer !== undefined) {
      clearTimeout(retryTimer);
      retryTimer = undefined;
    }
    if (inFlight === undefined) {
      if (debounceTimer !== undefined) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        debounceTimer = undefined;
        void attempt(true);
      }, debounceMs);
    }
    notify();
  };

  const flush = async (): Promise<boolean> => {
    clearTimers();
    if (inFlight !== undefined && !(await inFlight)) return false;
    const drain = async (): Promise<boolean> => {
      if (dirtySnapshot === undefined) return true;
      if (!(await attempt(false))) return false;
      return drain();
    };
    return drain();
  };

  const retryNow = async (): Promise<boolean> => {
    if (disposed || dirtySnapshot === undefined) return dirtySnapshot === undefined;
    clearTimers();
    automaticRetryBlocked = false;
    if (inFlight !== undefined) await inFlight;
    clearTimers();
    return attempt(true);
  };

  return {
    start() {
      disposed = false;
      if (
        dirtySnapshot !== undefined &&
        inFlight === undefined &&
        debounceTimer === undefined &&
        retryTimer === undefined &&
        !automaticRetryBlocked
      ) {
        debounceTimer = setTimeout(() => {
          debounceTimer = undefined;
          void attempt(true);
        }, debounceMs);
      }
      notify();
    },
    queue,
    flush,
    retryNow,
    discard() {
      clearTimers();
      dirtySnapshot = undefined;
      automaticRetryBlocked = false;
      retryIndex = 0;
      failureEpisode = false;
      notify();
    },
    dispose() {
      disposed = true;
      clearTimers();
      listeners.clear();
    },
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
