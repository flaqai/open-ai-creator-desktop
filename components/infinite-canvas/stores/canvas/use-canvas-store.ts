import { createStore } from 'zustand/vanilla';

import type { CanvasProjectGenerationTask } from '@/components/infinite-canvas/types/project';

import type { CanvasBackgroundMode } from '../../lib/canvas-theme';
import { useInfiniteCanvasStore, useInfiniteCanvasStoreApi } from '../editor-store-registry';
import type { CanvasAssistantSession, CanvasConnection, CanvasNodeData, ViewportTransform } from '../../types/canvas';

export type CanvasProject = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  nodes: CanvasNodeData[];
  connections: CanvasConnection[];
  chatSessions: CanvasAssistantSession[];
  activeChatId: string | null;
  backgroundMode: CanvasBackgroundMode;
  showImageInfo: boolean;
  viewport: ViewportTransform;
  generationTasks?: readonly CanvasProjectGenerationTask[];
};

export type CanvasStore = {
  hydrated: true;
  project: CanvasProject;
  openProject: (id: string) => CanvasProject | null;
  replaceProject: (project: CanvasProject) => void;
  updateProject: (id: string, patch: Partial<CanvasProject>) => void;
};

export function createCanvasStore(initialProject: CanvasProject) {
  return createStore<CanvasStore>()((set, get) => ({
    hydrated: true,
    project: initialProject,
    openProject: (id) => (get().project.id === id ? get().project : null),
    replaceProject: (project) => set({ project }),
    updateProject: (id, patch) =>
      set((state) =>
        state.project.id === id
          ? {
              project: {
                ...state.project,
                ...patch,
                id: state.project.id,
                updatedAt: new Date().toISOString(),
              },
            }
          : state,
      ),
  }));
}

export function useCanvasStore<Selected>(selector: (state: CanvasStore) => Selected): Selected {
  return useInfiniteCanvasStore('canvas', selector);
}

export function useCanvasStoreApi() {
  return useInfiniteCanvasStoreApi<CanvasStore>('canvas');
}
