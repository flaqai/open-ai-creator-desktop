'use client';

import { STORE_PREFIX } from '@/lib/constants/config';

const DATABASE = `${STORE_PREFIX}-video-history-covers`;
const STORE = 'covers';
export const VIDEO_HISTORY_COVER_SAVED_EVENT = 'flaq:video-history-cover-saved';

type StoredVideoCover = {
  key: string;
  source: string;
  blob: Blob;
  updatedAt: number;
};

function openCoverDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Video cover cache is blocked by another window.'));
  });
}

function coverOperation<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openCoverDatabase().then(
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

async function readVideoHistoryCoverRecord(key: string): Promise<StoredVideoCover | null> {
  if (!key || typeof indexedDB === 'undefined') return null;
  return (await coverOperation<StoredVideoCover | undefined>('readonly', (store) => store.get(key))) ?? null;
}

export async function readVideoHistoryCover(key: string, source?: string): Promise<Blob | null> {
  const record = await readVideoHistoryCoverRecord(key);
  return record && (!source || record.source === source) && record.blob.size > 0 ? record.blob : null;
}

export async function storeVideoHistoryCover(key: string, source: string, blob: Blob): Promise<Blob> {
  if (!key || !source || blob.size === 0) throw new Error('Video history cover cache entry is invalid.');
  await coverOperation('readwrite', (store) =>
    store.put({ key, source, blob, updatedAt: Date.now() } satisfies StoredVideoCover),
  );
  if (typeof window !== 'undefined')
    window.dispatchEvent(new CustomEvent(VIDEO_HISTORY_COVER_SAVED_EVENT, { detail: key }));
  return blob;
}

export async function deleteVideoHistoryCover(key: string): Promise<void> {
  if (!key || typeof indexedDB === 'undefined') return;
  await coverOperation('readwrite', (store) => store.delete(key));
}
