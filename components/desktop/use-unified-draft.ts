'use client';

import useUnifiedGeneratorStore from '@/store/unified-generator/useUnifiedGeneratorStore';

import { sanitizeUnifiedDraft, validUnifiedDraft } from '@/lib/desktop/draft-validation';
import { useLocalDraft } from '@/hooks/use-local-draft';

export function useUnifiedDraft(reference: boolean) {
  const store = useUnifiedGeneratorStore;
  return useLocalDraft(reference ? 'reference-to-video' : 'ai-media-creator', {
    shouldRestore: () => reference || !store.getState().pendingCreatorSubmit,
    initialize: () => {
      store.getState().reset();
      if (reference) store.getState().openReferenceDraft();
    },
    get: () =>
      Object.fromEntries(
        Object.entries(store.getState()).filter(
          ([key, value]) => typeof value !== 'function' && key !== 'pendingCreatorSubmit',
        ),
      ),
    restore: (data) => {
      const initial = store.getInitialState();
      const sanitized = sanitizeUnifiedDraft(data);
      const safe = Object.fromEntries(
        Object.entries(sanitized).filter(
          ([key]) =>
            key in initial &&
            typeof initial[key as keyof typeof initial] !== 'function' &&
            key !== 'pendingCreatorSubmit',
        ),
      );
      store.setState({
        ...safe,
        pendingCreatorSubmit: false,
        ...(reference ? { mediaType: 'video' as const, videoType: 'reference-to-video' as const } : {}),
      });
    },
    reset: () => {
      store.getState().reset();
      if (reference) store.getState().openReferenceDraft();
    },
    subscribe: (callback) => store.subscribe(callback),
    validate: validUnifiedDraft,
  });
}
