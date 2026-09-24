import { nanoid } from 'nanoid';
import { createStore } from 'zustand/vanilla';

import { useInfiniteCanvasStore } from './editor-store-registry';

export type AssetKind = 'text' | 'image' | 'video';
export type TextAsset = AssetBase<'text'> & { data: { content: string } };
export type ImageAsset = AssetBase<'image'> & {
  data: { dataUrl: string; storageKey?: string; width: number; height: number; bytes: number; mimeType: string };
};
export type VideoAsset = AssetBase<'video'> & {
  data: { url: string; storageKey?: string; width: number; height: number; bytes: number; mimeType: string };
};
export type Asset = TextAsset | ImageAsset | VideoAsset;

type AssetBase<Kind extends AssetKind> = {
  id: string;
  kind: Kind;
  title: string;
  coverUrl: string;
  tags: string[];
  source?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
};

export type AssetStore = {
  hydrated: true;
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateAsset: (id: string, patch: Partial<Omit<Asset, 'id' | 'createdAt'>>) => void;
  removeAsset: (id: string) => void;
  replaceAssets: (assets: Asset[]) => void;
};

export function createAssetStore() {
  return createStore<AssetStore>()((set) => ({
    hydrated: true,
    assets: [],
    addAsset: (asset) => {
      const now = new Date().toISOString();
      const id = nanoid();
      const record = { ...asset, id, createdAt: now, updatedAt: now } as Asset;
      if (hasDurableAssetUrl(record)) set((state) => ({ assets: [record, ...state.assets] }));
      return id;
    },
    updateAsset: (id, patch) =>
      set((state) => ({
        assets: state.assets.map((asset) =>
          asset.id === id ? ({ ...asset, ...patch, updatedAt: new Date().toISOString() } as Asset) : asset,
        ),
      })),
    removeAsset: (id) => set((state) => ({ assets: state.assets.filter((asset) => asset.id !== id) })),
    replaceAssets: (assets) => set({ assets: assets.filter(hasDurableAssetUrl) }),
  }));
}

export function useAssetStore<Selected>(selector: (state: AssetStore) => Selected): Selected {
  return useInfiniteCanvasStore('assets', selector);
}

export function hasDurableAssetUrl(asset: Asset): boolean {
  if (asset.kind === 'text') return true;
  const url = asset.kind === 'image' ? asset.data.dataUrl : asset.data.url;
  return /^https?:\/\//i.test(url);
}
