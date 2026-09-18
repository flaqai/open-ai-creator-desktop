import {
  imageHistoryKey,
  readImageHistoryItems,
  subscribeImageHistory,
  type ImageHistoryItem,
} from '@/network/image/history';
import {
  readVideoHistoryItems,
  subscribeVideoHistory,
  videoHistoryKey,
  type VideoHistoryItem,
} from '@/network/video/history';

import type { FileType } from '@/lib/utils/fileUtils';

export const MEDIA_LIBRARY_UPLOADS_KEY = 'FLAQ-CREATOR-DESKTOP-media-library-uploads-v1';
const MEDIA_LIBRARY_UPLOADS_CHANGED_EVENT = 'flaq-media-library-uploads-changed';

const STORAGE_VERSION = 1;
const MAX_UPLOAD_RECORDS = 500;
const EMPTY_CATALOG: readonly MediaCatalogItem[] = Object.freeze([]);

export type MediaCatalogKind = 'image' | 'video' | 'audio' | 'file';
export type MediaCatalogOrigin = 'upload' | 'generated';
export type MediaCatalogAvailability = 'saved-locally' | 'cloud-only';

interface StoredReferenceMedia {
  id: string;
  url: string;
  name: string;
  mimeType: string;
  kind: MediaCatalogKind;
  createdAt: number;
}

export interface MediaCatalogItem {
  id: string;
  historyId?: string;
  url: string;
  previewUrl?: string;
  name: string;
  mimeType: string;
  kind: MediaCatalogKind;
  origin: MediaCatalogOrigin;
  availability: MediaCatalogAvailability;
  localPath?: string;
  createdAt: number;
  prompt?: string;
  modelName?: string;
  resolution?: string;
  duration?: number;
}

export type MediaLibraryItem = MediaCatalogItem;

let cachedStorage: Storage | undefined;
let cachedFingerprint = '';
let cachedCatalog: readonly MediaCatalogItem[] = EMPTY_CATALOG;

function isRemoteUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function kindFromMimeType(mimeType: string): MediaCatalogKind {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'file';
}

function fallbackName(url: string, fallback: string) {
  try {
    return decodeURIComponent(new URL(url).pathname.split('/').pop() || fallback);
  } catch {
    return fallback;
  }
}

function isStoredReferenceMedia(value: unknown): value is StoredReferenceMedia {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<StoredReferenceMedia>;
  return (
    typeof item.id === 'string' &&
    isRemoteUrl(item.url) &&
    typeof item.name === 'string' &&
    typeof item.mimeType === 'string' &&
    ['image', 'video', 'audio', 'file'].includes(String(item.kind)) &&
    typeof item.createdAt === 'number' &&
    Number.isFinite(item.createdAt)
  );
}

function parseReferenceMedia(raw: string | null): StoredReferenceMedia[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as { version?: number; items?: unknown[] };
    if (parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.items)) return [];
    return parsed.items.filter(isStoredReferenceMedia).slice(0, MAX_UPLOAD_RECORDS);
  } catch {
    return [];
  }
}

function serializeReferenceMedia(items: StoredReferenceMedia[]) {
  return JSON.stringify({ version: STORAGE_VERSION, items: items.slice(0, MAX_UPLOAD_RECORDS) });
}

function mergeReferenceMedia(current: StoredReferenceMedia[], incoming: StoredReferenceMedia[]) {
  const byUrl = new Map<string, StoredReferenceMedia>();
  [...current, ...incoming].forEach((item) => byUrl.set(item.url, item));
  return Array.from(byUrl.values())
    .toSorted((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_UPLOAD_RECORDS);
}

function createReferenceMediaRecords(files: FileType[], urls: string[], createdAt = Date.now()) {
  return urls.flatMap<StoredReferenceMedia>((url, index) => {
    if (!isRemoteUrl(url)) return [];
    const file = files[index];
    const mimeType = file?.type || file?.data?.type || 'application/octet-stream';
    const name = file?.data?.name || fallbackName(url, `upload-${index + 1}`);
    return [
      {
        id: `upload:${url}`,
        url,
        name,
        mimeType,
        kind: kindFromMimeType(mimeType),
        createdAt: createdAt + index,
      },
    ];
  });
}

function buildCatalogItems(
  uploads: StoredReferenceMedia[],
  imageHistory: ImageHistoryItem[],
  videoHistory: VideoHistoryItem[],
): readonly MediaCatalogItem[] {
  const items = new Map<string, MediaCatalogItem>();

  uploads.forEach((item) => {
    items.set(item.url, { ...item, origin: 'upload', availability: 'cloud-only' });
  });

  const addLegacyImageUpload = (url: string, createdAt: number) => {
    if (!isRemoteUrl(url) || items.has(url)) return;
    items.set(url, {
      id: `upload:${url}`,
      url,
      previewUrl: url,
      name: fallbackName(url, 'Uploaded image'),
      mimeType: 'image/*',
      kind: 'image',
      origin: 'upload',
      availability: 'cloud-only',
      createdAt,
    });
  };

  imageHistory.forEach((item) => {
    item.userImageUrlList?.forEach((url) => addLegacyImageUpload(url, item.createTime));
    if (item.status === 'processing' || item.status === 'fail' || !isRemoteUrl(item.url)) return;
    items.set(item.url, {
      id: `generated-image:${item.id}`,
      historyId: item.id,
      url: item.url,
      previewUrl: isRemoteUrl(item.thumbnailUrl) ? item.thumbnailUrl : item.url,
      name: item.prompt || fallbackName(item.url, 'Generated image'),
      mimeType: 'image/*',
      kind: 'image',
      origin: 'generated',
      availability: item.localPath ? 'saved-locally' : 'cloud-only',
      localPath: item.localPath,
      createdAt: item.createTime,
      prompt: item.prompt,
      modelName: item.modelInfo || item.modelName,
      resolution: item.resolution,
    });
  });

  videoHistory.forEach((item) => {
    addLegacyImageUpload(item.imageUrl, item.createTime);
    addLegacyImageUpload(item.imageEndUrl, item.createTime);
    if (item.status !== 'completed' || !isRemoteUrl(item.videoUrl)) return;
    items.set(item.videoUrl, {
      id: `generated-video:${item.id}`,
      historyId: item.id,
      url: item.videoUrl,
      previewUrl: [item.videoThumbnailUrl, item.coverImage, item.imageUrl].find(isRemoteUrl) || item.videoUrl,
      name: item.prompt || fallbackName(item.videoUrl, 'Generated video'),
      mimeType: 'video/*',
      kind: 'video',
      origin: 'generated',
      availability: item.localPath ? 'saved-locally' : 'cloud-only',
      localPath: item.localPath,
      createdAt: item.createTime,
      prompt: item.prompt,
      modelName: item.platformName,
      duration: item.duration,
      resolution: item.ratio,
    });
  });

  return Object.freeze(Array.from(items.values()).toSorted((a, b) => b.createdAt - a.createdAt));
}

function sourceFingerprint(storage: Storage) {
  return [
    storage.getItem(MEDIA_LIBRARY_UPLOADS_KEY),
    storage.getItem(imageHistoryKey),
    storage.getItem(videoHistoryKey),
  ].join('\u001f');
}

/** Read the complete normalized catalog through its single external seam. */
export function getMediaCatalogSnapshot(): readonly MediaCatalogItem[] {
  if (typeof window === 'undefined') return EMPTY_CATALOG;
  const storage = window.localStorage;
  const fingerprint = sourceFingerprint(storage);
  if (cachedStorage === storage && cachedFingerprint === fingerprint) return cachedCatalog;

  const imageHistory = readImageHistoryItems();
  const videoHistory = readVideoHistoryItems();
  cachedStorage = storage;
  cachedFingerprint = sourceFingerprint(storage);
  cachedCatalog = buildCatalogItems(
    parseReferenceMedia(storage.getItem(MEDIA_LIBRARY_UPLOADS_KEY)),
    imageHistory,
    videoHistory,
  );
  return cachedCatalog;
}

/** Subscribe once while the catalog internally observes all three source adapters. */
export function subscribeMediaCatalog(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const unsubscribeImage = subscribeImageHistory(callback);
  const unsubscribeVideo = subscribeVideoHistory(callback);
  const onUploadChange = () => callback();
  const onStorage = (event: StorageEvent) => {
    if (event.key === MEDIA_LIBRARY_UPLOADS_KEY) callback();
  };
  window.addEventListener(MEDIA_LIBRARY_UPLOADS_CHANGED_EVENT, onUploadChange);
  window.addEventListener('storage', onStorage);
  return () => {
    unsubscribeImage();
    unsubscribeVideo();
    window.removeEventListener(MEDIA_LIBRARY_UPLOADS_CHANGED_EVENT, onUploadChange);
    window.removeEventListener('storage', onStorage);
  };
}

/** Record successful reference uploads without exposing catalog storage to upload callers. */
export function recordReferenceUploads(files: FileType[], urls: string[]) {
  if (typeof window === 'undefined') return false;
  const records = createReferenceMediaRecords(files, urls);
  if (!records.length) return false;
  try {
    const current = parseReferenceMedia(window.localStorage.getItem(MEDIA_LIBRARY_UPLOADS_KEY));
    const next = mergeReferenceMedia(current, records);
    window.localStorage.setItem(MEDIA_LIBRARY_UPLOADS_KEY, serializeReferenceMedia(next));
    window.dispatchEvent(new Event(MEDIA_LIBRARY_UPLOADS_CHANGED_EVENT));
    return true;
  } catch {
    return false;
  }
}
