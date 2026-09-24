'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useStore } from 'zustand';
import type { StoreApi } from 'zustand/vanilla';

export type InfiniteCanvasStoreName =
  | 'assets'
  | 'canvas'
  | 'config'
  | 'plugins'
  | 'promptSources'
  | 'sidePanel'
  | 'theme';

export type InfiniteCanvasStoreRegistry = Readonly<Record<InfiniteCanvasStoreName, StoreApi<unknown>>>;

const InfiniteCanvasStoreRegistryContext = createContext<InfiniteCanvasStoreRegistry | null>(null);
const InfiniteCanvasStorageKeyPrefixContext = createContext<string | null>(null);

export function InfiniteCanvasStoreRegistryProvider({
  children,
  storageKeyPrefix,
  stores,
}: {
  readonly children: ReactNode;
  readonly storageKeyPrefix: string;
  readonly stores: InfiniteCanvasStoreRegistry;
}) {
  return (
    <InfiniteCanvasStorageKeyPrefixContext.Provider value={storageKeyPrefix}>
      <InfiniteCanvasStoreRegistryContext.Provider value={stores}>
        {children}
      </InfiniteCanvasStoreRegistryContext.Provider>
    </InfiniteCanvasStorageKeyPrefixContext.Provider>
  );
}

export function useInfiniteCanvasStorageKeyPrefix(): string {
  const storageKeyPrefix = useContext(InfiniteCanvasStorageKeyPrefixContext);
  if (storageKeyPrefix === null) throw new Error('Infinite Canvas Editor requires a storage key prefix.');
  return storageKeyPrefix;
}

export function useInfiniteCanvasStoreApi<State>(name: InfiniteCanvasStoreName): StoreApi<State> {
  const stores = useContext(InfiniteCanvasStoreRegistryContext);
  if (stores === null) throw new Error('Infinite Canvas Editor requires its instance-scoped Store registry.');
  return stores[name] as StoreApi<State>;
}

export function useInfiniteCanvasStore<State, Selected>(
  name: InfiniteCanvasStoreName,
  selector: (state: State) => Selected,
): Selected {
  return useStore(useInfiniteCanvasStoreApi<State>(name), selector);
}
