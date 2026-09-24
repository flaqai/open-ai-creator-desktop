import { createStore } from 'zustand/vanilla';

import { useInfiniteCanvasStore } from './editor-store-registry';

export const CANVAS_SIDE_PANEL_MOTION_MS = 500;
export const CANVAS_SIDE_PANEL_MIN_WIDTH = 220;
export const CANVAS_SIDE_PANEL_MAX_WIDTH = 480;
export const CANVAS_SIDE_PANEL_DEFAULT_WIDTH = 280;
export const CANVAS_MOBILE_QUERY = '(max-width: 639px)';

export type CanvasSidePanelStore = {
  width: number;
  panelOpen: boolean;
  panelMounted: boolean;
  panelClosing: boolean;
  setWidth: (width: number) => void;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
};

export function createCanvasSidePanelStore() {
  return createStore<CanvasSidePanelStore>()((set, get) => ({
  width: CANVAS_SIDE_PANEL_DEFAULT_WIDTH,
  panelOpen: true,
  panelMounted: true,
  panelClosing: false,
  setWidth: (width) => set({ width }),
  openPanel: () => {
    set({ panelOpen: true, panelMounted: true, panelClosing: false });
  },
  closePanel: () => {
    if (!get().panelMounted || get().panelClosing) return;
    set({ panelOpen: false, panelClosing: true });
    setTimeout(() => {
      if (get().panelClosing) set({ panelMounted: false, panelClosing: false });
    }, CANVAS_SIDE_PANEL_MOTION_MS);
  },
  togglePanel: () => (get().panelOpen ? get().closePanel() : get().openPanel()),
  }));
}

export function useCanvasSidePanelStore<Selected>(selector: (state: CanvasSidePanelStore) => Selected): Selected {
  return useInfiniteCanvasStore('sidePanel', selector);
}
