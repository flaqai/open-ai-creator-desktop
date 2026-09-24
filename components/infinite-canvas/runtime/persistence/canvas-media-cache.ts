'use client';

import { STORE_PREFIX } from '@/lib/constants/config';

const DATABASE = `${STORE_PREFIX}-canvas-media`;
const STORE = 'media';

type StoredMedia = { url: string; blob?: Blob; localPath?: string };

function openMediaDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'url' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Canvas media storage is blocked by another window.'));
  });
}

function mediaOperation<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openMediaDatabase().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(STORE, mode);
        const request = operation(transaction.objectStore(STORE));
        transaction.oncomplete = () => {
          database.close();
          resolve(request.result);
        };
        transaction.onabort = () => {
          database.close();
          reject(transaction.error ?? request.error);
        };
        transaction.onerror = () => {
          database.close();
          reject(transaction.error ?? request.error);
        };
      }),
  );
}

export function storeCanvasMedia(url: string, blob: Blob): Promise<void> {
  if (!/^https?:\/\//i.test(url) || blob.size === 0)
    return Promise.reject(new Error('Canvas media must have a URL and nonempty file.'));
  return mediaOperation('readwrite', (store) => store.put({ url, blob } satisfies StoredMedia)).then(() => {
    if (typeof window !== 'undefined')
      window.dispatchEvent(new CustomEvent('flaq:canvas-media-saved', { detail: url }));
  });
}

export function storeCanvasMediaPath(url: string, localPath: string): Promise<void> {
  if (!/^https?:\/\//i.test(url) || !localPath) return Promise.reject(new Error('Canvas media path is invalid.'));
  return mediaOperation('readwrite', (store) => store.put({ url, localPath } satisfies StoredMedia)).then(() => {
    if (typeof window !== 'undefined')
      window.dispatchEvent(new CustomEvent('flaq:canvas-media-saved', { detail: url }));
  });
}

export async function readCanvasMedia(url: string): Promise<Blob | null> {
  if (!/^https?:\/\//i.test(url)) return null;
  const record = await mediaOperation<StoredMedia | undefined>('readonly', (store) => store.get(url));
  return record?.blob ?? null;
}

export async function readCanvasMediaPath(url: string): Promise<string | null> {
  if (!/^https?:\/\//i.test(url)) return null;
  const record = await mediaOperation<StoredMedia | undefined>('readonly', (store) => store.get(url));
  return record?.localPath ?? null;
}

export async function registeredCanvasMediaUrl(path: string): Promise<string> {
  const [{ invoke, convertFileSrc }] = await Promise.all([import('@tauri-apps/api/core')]);
  await invoke('register_canvas_media_path', { path });
  return convertFileSrc(path);
}

/** Keep remote URLs in project JSON; object URLs are only ephemeral display handles. */
export async function resolveCanvasMediaBlob(url: string, fetchRemote = globalThis.fetch): Promise<Blob> {
  const local = await readCanvasMedia(url);
  if (local) return local;
  const localPath = await readCanvasMediaPath(url);
  if (localPath) {
    try {
      const response = await fetchRemote(await registeredCanvasMediaUrl(localPath));
      if (response.ok) return response.blob();
    } catch {
      /* Fall back to the durable remote URL. */
    }
  }
  const response = await fetchRemote(url);
  if (!response.ok) throw new Error(`Unable to load canvas media (${response.status}).`);
  return response.blob();
}
