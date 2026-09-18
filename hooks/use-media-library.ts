'use client';

import { useSyncExternalStore } from 'react';

import { getMediaCatalogSnapshot, subscribeMediaCatalog, type MediaCatalogItem } from '@/lib/desktop/media-library';

const EMPTY_CATALOG: readonly MediaCatalogItem[] = Object.freeze([]);

export default function useMediaCatalog() {
  return useSyncExternalStore(subscribeMediaCatalog, getMediaCatalogSnapshot, () => EMPTY_CATALOG);
}
