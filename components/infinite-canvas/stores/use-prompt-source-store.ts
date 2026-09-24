import { useInfiniteCanvasStore } from './editor-store-registry';
import {
  createPromptSourceStore,
  normalizePromptSourceState,
  type PromptSourceStore,
} from '@/components/canvas-shared/components/ai-canvas-prompt-library/use-prompt-source-store';

export { createPromptSourceStore, normalizePromptSourceState, type PromptSourceStore };

export function usePromptSourceStore<Selected>(selector: (state: PromptSourceStore) => Selected): Selected {
  return useInfiniteCanvasStore('promptSources', selector);
}
