// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
import type { PluginStorage } from '../../types/canvas-plugin';

// Lightweight canvas event bus for communication between nodes and plugins.
type Handler = (payload: unknown) => void;
const handlers = new Map<string, Set<Handler>>();

export function emitCanvasEvent(event: string, payload?: unknown) {
  handlers.get(event)?.forEach((handler) => {
    try {
      handler(payload);
    } catch (error) {
      console.error(`[canvas-event] handler for "${event}" failed`, error);
    }
  });
}

export function onCanvasEvent(event: string, handler: Handler) {
  let set = handlers.get(event);
  if (!set) {
    set = new Set();
    handlers.set(event, set);
  }
  set.add(handler);
  return () => set!.delete(handler);
}

// Private plugin storage isolated by consumer prefix and pluginId namespace.
export function createPluginStorage(storageKeyPrefix: string, pluginId: string): PluginStorage {
  const storageKey = `${storageKeyPrefix}:infinite-canvas:v1:plugin-data:${pluginId}`;
  const read = () => {
    try {
      return JSON.parse(window.localStorage.getItem(storageKey) ?? '{}') as Record<string, unknown>;
    } catch {
      return {};
    }
  };
  const write = (value: Record<string, unknown>) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Plugin-local persistence is optional and cannot affect the Canvas project authority.
    }
  };
  return {
    get: async <T = unknown>(key: string) => (read()[key] as T | undefined) ?? null,
    set: async (key, value) => {
      write({ ...read(), [key]: value });
    },
    remove: async (key) => {
      const value = read();
      delete value[key];
      write(value);
    },
  };
}
