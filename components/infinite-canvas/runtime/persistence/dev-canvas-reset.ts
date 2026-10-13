'use client';

import { STORE_PREFIX } from '@/lib/constants/config';

const RESET_MARKER = `${STORE_PREFIX}:infinite-canvas:dev-model-routing-reset:v1`;
const EDITOR_STORAGE_PREFIX = `${STORE_PREFIX}:infinite-canvas:v1:`;
const CANVAS_DATABASES = [`${STORE_PREFIX}-canvas`, `${STORE_PREFIX}-canvas-media`] as const;

let pendingReset: Promise<void> | undefined;

function deleteDatabase(factory: IDBFactory, name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = factory.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error(`Unable to clear ${name}.`));
    request.onblocked = () => reject(new Error(`Canvas database ${name} is open in another window.`));
  });
}

/** One-time cleanup for the unpublished canvas model-routing change. Never runs in a production build. */
export function ensureCanvasDevelopmentDataReset(): Promise<void> {
  if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') return Promise.resolve();
  if (pendingReset) return pendingReset;

  pendingReset = (async () => {
    const storage = window.localStorage;
    if (storage.getItem(RESET_MARKER) === 'done') return;

    for (const name of CANVAS_DATABASES) await deleteDatabase(indexedDB, name);

    const editorKeys = Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(
      (key): key is string => key?.startsWith(EDITOR_STORAGE_PREFIX) === true,
    );
    for (const key of editorKeys) storage.removeItem(key);
    storage.setItem(RESET_MARKER, 'done');
  })().catch((error: unknown) => {
    pendingReset = undefined;
    throw error;
  });
  return pendingReset;
}
