import { useStore } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { createStore, type StoreApi } from 'zustand/vanilla';

import { PROMPT_LIBRARY_SOURCES } from '@/components/canvas-shared/components/ai-canvas-prompt-library/prompt-source-loaders';

interface PromptSourcePreference {
  readonly id: string;
  readonly enabled: boolean;
}

export interface PromptSourceStore {
  readonly sources: readonly PromptSourcePreference[];
  readonly toggleSource: (sourceId: string, enabled: boolean) => void;
}

const DEFAULT_SOURCES: readonly PromptSourcePreference[] = PROMPT_LIBRARY_SOURCES.map(({ id }) => ({
  id,
  enabled: true,
}));

export function createPromptSourceStore(options?: {
  readonly persistKey?: string;
  readonly storage?: StateStorage;
}): StoreApi<PromptSourceStore> {
  const initialize = (set: StoreApi<PromptSourceStore>['setState']): PromptSourceStore => ({
    sources: DEFAULT_SOURCES,
    toggleSource: (sourceId, enabled) =>
      set((state) => ({
        sources: state.sources.map((source) => (source.id === sourceId ? { ...source, enabled } : source)),
      })),
  });

  if (!options?.persistKey) return createStore<PromptSourceStore>()(initialize);

  return createStore<PromptSourceStore>()(
    persist(initialize, {
      name: options.persistKey,
      storage: createJSONStorage(() => options.storage ?? window.localStorage),
      partialize: (state) => ({ sources: state.sources }) as PromptSourceStore,
      merge: (persisted, current) => ({
        ...current,
        sources: normalizePromptSourceState(persisted).sources,
      }),
    }),
  );
}

export function usePromptSourceStore<Selected>(
  store: StoreApi<PromptSourceStore>,
  selector: (state: PromptSourceStore) => Selected,
): Selected {
  return useStore(store, selector);
}

export function normalizePromptSourceState(value: unknown): Pick<PromptSourceStore, 'sources'> {
  const state = (value ?? {}) as { readonly sources?: readonly PromptSourcePreference[] };
  const saved = new Map(
    (Array.isArray(state.sources) ? state.sources : []).map((source) => [source.id, source.enabled !== false]),
  );
  return {
    sources: DEFAULT_SOURCES.map((source) => ({
      enabled: saved.get(source.id) ?? source.enabled,
      id: source.id,
    })),
  };
}
