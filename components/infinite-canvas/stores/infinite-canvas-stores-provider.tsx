'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { StoreApi } from 'zustand/vanilla';

import { isDesktopRuntime } from '@/lib/desktop/runtime';

import type { InfiniteCanvasModelAdapter } from '../infinite-canvas-model-adapter';
import { createCanvasStore, type CanvasProject, type CanvasStore } from './canvas/use-canvas-store';
import { createPluginStore, type InstalledPlugin, type PluginStore } from './canvas/use-plugin-store';
import { InfiniteCanvasStoreRegistryProvider, type InfiniteCanvasStoreRegistry } from './editor-store-registry';
import { createAssetStore, hasDurableAssetUrl, type Asset, type AssetStore } from './use-asset-store';
import {
  CANVAS_MOBILE_QUERY,
  CANVAS_SIDE_PANEL_DEFAULT_WIDTH,
  CANVAS_SIDE_PANEL_MAX_WIDTH,
  CANVAS_SIDE_PANEL_MIN_WIDTH,
  createCanvasSidePanelStore,
  type CanvasSidePanelStore,
} from './use-canvas-side-panel-store';
import { createConfigStore, normalizeConfig, persistedConfig, type ConfigStore } from './use-config-store';
import { createPromptSourceStore, normalizePromptSourceState, type PromptSourceStore } from './use-prompt-source-store';
import { createThemeStore, type ThemeStore } from './use-theme-store';

interface EditorStores {
  readonly assets: StoreApi<AssetStore>;
  readonly canvas: StoreApi<CanvasStore>;
  readonly config: StoreApi<ConfigStore>;
  readonly plugins: StoreApi<PluginStore>;
  readonly promptSources: StoreApi<PromptSourceStore>;
  readonly sidePanel: StoreApi<CanvasSidePanelStore>;
  readonly theme: StoreApi<ThemeStore>;
}

export function InfiniteCanvasStoresProvider({
  children,
  initialProject,
  storageKeyPrefix,
  modelAdapter,
}: {
  readonly children: ReactNode;
  readonly initialProject: CanvasProject;
  readonly storageKeyPrefix: string;
  readonly modelAdapter?: InfiniteCanvasModelAdapter;
}) {
  const [stores] = useState<EditorStores>(() => ({
    assets: createAssetStore(),
    canvas: createCanvasStore(initialProject),
    config: createConfigStore(modelAdapter),
    plugins: createPluginStore(),
    promptSources: createPromptSourceStore(),
    sidePanel: createCanvasSidePanelStore(),
    theme: createThemeStore(),
  }));

  useEffect(() => hydrateAndPersistStores(stores, storageKeyPrefix), [storageKeyPrefix, stores]);

  return (
    <InfiniteCanvasStoreRegistryProvider
      storageKeyPrefix={storageKeyPrefix}
      stores={stores as unknown as InfiniteCanvasStoreRegistry}
    >
      {children}
    </InfiniteCanvasStoreRegistryProvider>
  );
}

function hydrateAndPersistStores(stores: EditorStores, storageKeyPrefix: string): () => void {
  const key = (name: string) => `${storageKeyPrefix}:infinite-canvas:v1:${name}`;
  const config = readJson(key('config')) as { readonly config?: Partial<ConfigStore['config']> } | null;
  if (config !== null)
    stores.config.setState({
      config: normalizeConfig(
        {
          ...stores.config.getState().config,
          ...(config.config ?? (config as Partial<ConfigStore['config']>)),
          modelAdapter: undefined,
        },
        stores.config.getState().config.modelAdapter,
      ),
    });

  const desktop = isDesktopRuntime();
  const theme = desktop ? null : (readJson(key('theme')) as Partial<ThemeStore> | null);
  if (theme?.theme === 'light' || theme?.theme === 'dark') stores.theme.setState({ theme: theme.theme });
  const syncDesktopTheme = () =>
    stores.theme.setState({ theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light' });
  const themeObserver = desktop ? new MutationObserver(syncDesktopTheme) : null;
  if (themeObserver) {
    syncDesktopTheme();
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  const assets = readJson(key('assets')) as readonly Asset[] | null;
  if (Array.isArray(assets)) stores.assets.setState({ assets: assets.filter(hasDurableAssetUrl) });

  const promptSources = readJson(key('prompt-sources'));
  if (promptSources !== null) stores.promptSources.setState(normalizePromptSourceState(promptSources));

  const plugins = readJson(key('plugins')) as { readonly plugins?: readonly InstalledPlugin[] } | null;
  if (Array.isArray(plugins?.plugins)) stores.plugins.setState({ plugins: [...plugins.plugins] });

  const sidePanel = readJson(key('preferences')) as {
    readonly sidePanelOpen?: boolean;
    readonly sidePanelWidth?: number;
  } | null;
  if (sidePanel !== null) {
    const width = clampSidePanelWidth(sidePanel.sidePanelWidth);
    const panelOpen = sidePanel.sidePanelOpen !== false;
    stores.sidePanel.setState({ panelClosing: false, panelMounted: panelOpen, panelOpen, width });
  }

  const stopMobileSidePanelSync = closeSidePanelOnMobile(stores.sidePanel);

  return combineCleanups([
    stopMobileSidePanelSync,
    () => themeObserver?.disconnect(),
    stores.config.subscribe((state) => {
      writeJson(key('config'), { config: persistedConfig(state.config) });
    }),
    desktop ? () => undefined : stores.theme.subscribe((state) => writeJson(key('theme'), { theme: state.theme })),
    stores.assets.subscribe((state) => writeJson(key('assets'), state.assets.filter(hasDurableAssetUrl))),
    stores.promptSources.subscribe((state) => writeJson(key('prompt-sources'), { sources: state.sources })),
    stores.plugins.subscribe((state) => writeJson(key('plugins'), { plugins: state.plugins })),
    stores.sidePanel.subscribe((state) =>
      writeJson(key('preferences'), { sidePanelOpen: state.panelOpen, sidePanelWidth: state.width }),
    ),
  ]);
}

function closeSidePanelOnMobile(store: StoreApi<CanvasSidePanelStore>): () => void {
  const query = window.matchMedia?.(CANVAS_MOBILE_QUERY);
  if (!query) return () => undefined;
  const sync = () => {
    if (query.matches) store.setState({ panelClosing: false, panelMounted: false, panelOpen: false });
  };
  sync();
  query.addEventListener('change', sync);
  return () => query.removeEventListener('change', sync);
}

function clampSidePanelWidth(value: unknown): number {
  const width = typeof value === 'number' && Number.isFinite(value) ? value : CANVAS_SIDE_PANEL_DEFAULT_WIDTH;
  return Math.min(CANVAS_SIDE_PANEL_MAX_WIDTH, Math.max(CANVAS_SIDE_PANEL_MIN_WIDTH, width));
}

function readJson(key: string): unknown | null {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? null : (JSON.parse(value) as unknown);
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local preferences must never break the backend-authoritative Editor.
  }
}

function combineCleanups(cleanups: readonly (() => void)[]): () => void {
  return () => cleanups.forEach((cleanup) => cleanup());
}
