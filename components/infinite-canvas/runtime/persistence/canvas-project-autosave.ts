import type { CanvasProject } from '@/components/infinite-canvas/types/project';

import type { CanvasStore } from '../../stores/canvas/use-canvas-store';
import type { ProjectSaveRuntime } from './project-save-runtime';

interface CanvasProjectStoreSource {
  readonly getState: () => Pick<CanvasStore, 'project'>;
  readonly subscribe: (listener: (state: Pick<CanvasStore, 'project'>) => void) => () => void;
}

export function subscribeCanvasProjectAutosave(
  canvasStore: CanvasProjectStoreSource,
  saveRuntime: ProjectSaveRuntime,
): () => void {
  let previous = canvasStore.getState().project;
  return canvasStore.subscribe((state) => {
    if (state.project === previous) return;
    previous = state.project;
    saveRuntime.queue(structuredClone(state.project) as CanvasProject);
  });
}

export function saveCanvasProjectNow(
  canvasStore: CanvasProjectStoreSource,
  saveRuntime: ProjectSaveRuntime,
): Promise<boolean> {
  saveRuntime.queue(structuredClone(canvasStore.getState().project) as CanvasProject);
  return saveRuntime.flush();
}

export async function saveCanvasProjectManually(
  canvasStore: CanvasProjectStoreSource,
  saveRuntime: ProjectSaveRuntime,
  onSaved: () => void,
): Promise<boolean> {
  const saved = await saveCanvasProjectNow(canvasStore, saveRuntime);
  if (saved) onSaved();
  return saved;
}

export async function saveCanvasProjectBeforeNavigation(
  canvasStore: CanvasProjectStoreSource,
  saveRuntime: ProjectSaveRuntime,
  navigate: () => void,
): Promise<boolean> {
  if (!(await saveCanvasProjectNow(canvasStore, saveRuntime))) return false;
  navigate();
  return true;
}
