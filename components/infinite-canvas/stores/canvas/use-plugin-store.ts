import { createStore } from 'zustand/vanilla';

import { useInfiniteCanvasStore, useInfiniteCanvasStoreApi } from '../editor-store-registry';

export type InstalledPlugin = {
  id: string;
  name: string;
  version: string;
  description?: string;
  url: string;
  source: string;
  enabled: boolean;
  local?: boolean;
  official?: boolean;
  installedAt: string;
};

export type PluginStore = {
  plugins: InstalledPlugin[];
  upsert: (plugin: Omit<InstalledPlugin, 'installedAt'> & { installedAt?: string }) => void;
  setEnabled: (id: string, enabled: boolean) => void;
  remove: (id: string) => void;
};

export function createPluginStore() {
  return createStore<PluginStore>()((set) => ({
    plugins: [],
    upsert: (plugin) =>
      set((state) => {
        const installedAt = plugin.installedAt || new Date().toISOString();
        const exists = state.plugins.some((item) => item.id === plugin.id);
        const next = { ...plugin, installedAt };
        return {
          plugins: exists
            ? state.plugins.map((item) => (item.id === plugin.id ? next : item))
            : [next, ...state.plugins],
        };
      }),
    setEnabled: (id, enabled) =>
      set((state) => ({ plugins: state.plugins.map((item) => (item.id === id ? { ...item, enabled } : item)) })),
    remove: (id) => set((state) => ({ plugins: state.plugins.filter((item) => item.id !== id) })),
  }));
}

export function usePluginStore<Selected>(selector: (state: PluginStore) => Selected): Selected {
  return useInfiniteCanvasStore('plugins', selector);
}

export function usePluginStoreApi() {
  return useInfiniteCanvasStoreApi<PluginStore>('plugins');
}
