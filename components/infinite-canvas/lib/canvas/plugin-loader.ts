// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
import i18n from '../../i18n';
import type { StoreApi } from 'zustand/vanilla';

import type { InstalledPlugin, PluginStore } from '../../stores/canvas/use-plugin-store';
import type { CanvasPlugin } from '../../types/canvas-plugin';
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { registerNodeDefinitions, unregisterPluginNodes } from './node-registry';
import { getPluginRuntime } from './plugin-runtime';

type PluginRuntimeState = { cleanups: Map<string, () => void>; loaded: boolean };

const runtimeStates = new WeakMap<StoreApi<PluginStore>, PluginRuntimeState>();

function runtimeState(store: StoreApi<PluginStore>): PluginRuntimeState {
  const existing = runtimeStates.get(store);
  if (existing) return existing;
  const created = { cleanups: new Map<string, () => void>(), loaded: false };
  runtimeStates.set(store, created);
  return created;
}

// A remote plugin may export CanvasPlugin directly or a factory that receives runtime and returns CanvasPlugin.
// The factory uses runtime.React so the bundle does not need its own React copy.
async function evaluatePluginSource(source: string): Promise<CanvasPlugin> {
  const blob = new Blob([source], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  try {
    const mod = (await import(/* webpackIgnore: true */ url)) as { default?: unknown; plugin?: unknown };
    const exported = mod.default ?? mod.plugin;
    const plugin =
      typeof exported === 'function' ? (exported as (runtime: unknown) => unknown)(getPluginRuntime()) : exported;
    assertPlugin(plugin);
    return plugin;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function assertPlugin(plugin: unknown): asserts plugin is CanvasPlugin {
  const value = plugin as Partial<CanvasPlugin> | null;
  if (!value || typeof value !== 'object') throw new Error(i18n.t('canvas.pluginErrors.invalidExport'));
  if (!value.id || !Array.isArray(value.nodes) || !value.nodes.length)
    throw new Error(i18n.t('canvas.pluginErrors.missingFields'));
}

export function activatePlugin(store: StoreApi<PluginStore>, plugin: CanvasPlugin) {
  registerNodeDefinitions(plugin.nodes, plugin.id);
  const runtime = getPluginRuntime();
  const disposers: Array<() => void> = [];
  // Inject declared styles when enabled and remove them when disabled or uninstalled.
  if (plugin.css) disposers.push(runtime.injectCSS(plugin.css, plugin.id));
  const cleanup = plugin.setup?.(runtime);
  if (typeof cleanup === 'function') disposers.push(cleanup);
  if (disposers.length)
    runtimeState(store).cleanups.set(plugin.id, () => disposers.forEach((dispose) => dispose()));
}

export function deactivatePlugin(store: StoreApi<PluginStore>, pluginId: string) {
  runtimeState(store).cleanups.get(pluginId)?.();
  runtimeState(store).cleanups.delete(pluginId);
  unregisterPluginNodes(pluginId);
}

async function fetchPluginSource(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(i18n.t('canvas.pluginErrors.downloadFailed', { status: response.status }));
  return response.text();
}

// Add a cache-busting parameter so watch builds load the latest output.
function withCacheBust(url: string) {
  return `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
}

// Install or replace a plugin from a URL and enable it immediately.
// bustCache bypasses HTTP/CDN caches during upgrades while persisting a clean URL without the timestamp query.
export async function installPluginFromUrl(
  store: StoreApi<PluginStore>,
  url: string,
  opts?: { official?: boolean; bustCache?: boolean },
) {
  const source = await fetchPluginSource(opts?.bustCache ? withCacheBust(url) : url);
  const plugin = await evaluatePluginSource(source);
  deactivatePlugin(store, plugin.id); // Replace the previous version.
  store.getState().upsert({
    id: plugin.id,
    name: plugin.name || plugin.id,
    version: plugin.version || '0.0.0',
    description: plugin.description,
    url,
    source,
    enabled: true,
    official: opts?.official,
  });
  activatePlugin(store, plugin);
  return plugin;
}

export async function updatePlugin(store: StoreApi<PluginStore>, record: InstalledPlugin) {
  // Upgrades must fetch the latest output and therefore always bypass caches.
  return installPluginFromUrl(store, record.url, { official: record.official, bustCache: true });
}

export async function setPluginEnabled(store: StoreApi<PluginStore>, record: InstalledPlugin, enabled: boolean) {
  store.getState().setEnabled(record.id, enabled);
  if (!enabled) {
    deactivatePlugin(store, record.id);
    return;
  }
  // Reload local plugins from their URL when enabled because the cached source may be stale.
  const source = record.local ? await fetchPluginSource(withCacheBust(record.url)) : record.source;
  const plugin = await evaluatePluginSource(source);
  activatePlugin(store, plugin);
}

export function uninstallPlugin(store: StoreApi<PluginStore>, id: string) {
  deactivatePlugin(store, id);
  store.getState().remove(id);
}

// Load installed and enabled plugins at application startup.
export async function ensurePluginsLoaded(store: StoreApi<PluginStore>) {
  const runtime = runtimeState(store);
  if (runtime.loaded) return;
  runtime.loaded = true;
  await loadLocalPlugins(store); // Discover disabled local plugins first, then activate all enabled records.
  const records = store.getState().plugins.filter((record) => record.enabled);
  await Promise.all(
    records.map(async (record) => {
      try {
        // Local plugins use the latest output; other plugins use their cached source.
        const source = record.local ? await fetchPluginSource(withCacheBust(record.url)) : record.source;
        activatePlugin(store, await evaluatePluginSource(source));
      } catch (error) {
        console.error(`[plugin] Failed to load: ${record.id}`, error);
      }
    }),
  );
  await loadDevPlugins(store);
}

// Discover local plugins from web/public/plugins, add them disabled, and expose them in the manager without a URL.
// Refresh metadata and source for existing records while preserving the enabled flag so persisted versions stay current.
async function loadLocalPlugins(storeApi: StoreApi<PluginStore>) {
  let urls: unknown;
  try {
    const response = await fetch('/plugins/index.json');
    if (!response.ok) return;
    urls = await response.json();
  } catch {
    return; // Skip when no local manifest exists, such as production builds without plugins.
  }
  if (!Array.isArray(urls) || !urls.length) return;
  const store = storeApi.getState();
  await Promise.all(
    urls.map(async (url: string) => {
      try {
        const source = await fetchPluginSource(withCacheBust(url));
        const plugin = await evaluatePluginSource(source);
        const existing = store.plugins.find((item) => item.id === plugin.id);
        store.upsert({
          id: plugin.id,
          name: plugin.name || plugin.id,
          version: plugin.version || '0.0.0',
          description: plugin.description,
          url,
          source,
          enabled: existing?.enabled ?? false, // Preserve the user setting; new discoveries default to disabled.
          local: true,
        });
      } catch (error) {
        console.error(`[plugin] Failed to discover local plugin: ${url}`, error);
      }
    }),
  );
}

// During local development, refetch VITE_DEV_PLUGINS URLs without caching or persistence on every startup.
// Together with watch builds, refreshing the page loads code changes without reinstalling the plugin.
function readDevPluginSources(): string | undefined {
  return undefined;
}

async function loadDevPlugins(store: StoreApi<PluginStore>) {
  const raw = readDevPluginSources();
  if (!raw) return;
  const urls = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  await Promise.all(
    urls.map(async (url) => {
      try {
        const source = await fetchPluginSource(withCacheBust(url));
        const plugin = await evaluatePluginSource(source);
        deactivatePlugin(store, plugin.id);
        activatePlugin(store, plugin);
        console.info(`[plugin] Dev plugin loaded: ${plugin.id} (${url})`);
      } catch (error) {
        console.error(`[plugin] Failed to load dev plugin: ${url}`, error);
      }
    }),
  );
}
