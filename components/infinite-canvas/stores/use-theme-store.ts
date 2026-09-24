import { createStore } from 'zustand/vanilla';

import { useInfiniteCanvasStore } from './editor-store-registry';

export type ThemeName = 'light' | 'dark';

export type ThemeStore = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

export function createThemeStore() {
  return createStore<ThemeStore>()((set) => ({
    theme: typeof document !== 'undefined' && document.documentElement.classList.contains('light') ? 'light' : 'dark',
    setTheme: (theme) => set({ theme }),
  }));
}

export function useThemeStore<Selected>(selector: (state: ThemeStore) => Selected): Selected {
  return useInfiniteCanvasStore('theme', selector);
}
