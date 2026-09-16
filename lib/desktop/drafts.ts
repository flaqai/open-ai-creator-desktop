// Drafts intentionally contain form data only, never connection settings or task state.
export const DRAFT_VERSION = 2;
export type DraftRecord = { version: 1 | 2; updatedAt: number; data: Record<string, unknown> };
const excluded = /^(?:__proto__|constructor|prototype|clientKey|apiKey|secret|password|token|pendingCreatorSubmit)$/i;
const draftsWithMissingMedia = new WeakSet<Record<string, unknown>>();

type EncodedFile = {
  $bytes: ArrayBuffer;
  name: string;
  modified: number;
  type: string;
};

export async function encodeDraft(value: unknown): Promise<unknown> {
  if (typeof value === 'function' || value === undefined) return undefined;
  if (value instanceof Blob) {
    const bytes = await value.arrayBuffer();
    return {
      $bytes: bytes,
      name: value instanceof File ? value.name : 'reference',
      modified: value instanceof File ? value.lastModified : 0,
      type: value.type,
    };
  }
  if (typeof value === 'string' && value.startsWith('blob:')) {
    const response = await fetch(value);
    if (!response.ok) throw new Error('Reference is unavailable. Please select it again.');
    return encodeDraft(await response.blob());
  }
  if (Array.isArray(value)) return Promise.all(value.map(encodeDraft));
  if (value && typeof value === 'object') {
    const rows = await Promise.all(
      Object.entries(value)
        .filter(([key]) => !excluded.test(key) && key !== 'previewUrl')
        .map(async ([key, entry]) => [key, await encodeDraft(entry)] as const),
    );
    return Object.fromEntries(rows.filter(([, entry]) => entry !== undefined));
  }
  return value;
}

export function decodeDraft(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(decodeDraft);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (record.$bytes instanceof ArrayBuffer)
      return new File([record.$bytes], String(record.name || 'reference'), {
        type: String(record.type || ''),
        lastModified: Number(record.modified) || 0,
      });
    if (record.$file instanceof Blob)
      return new File([record.$file], String(record.name || 'reference'), {
        type: record.$file.type,
        lastModified: Number(record.modified) || 0,
      });
    return Object.fromEntries(
      Object.entries(record)
        .filter(([key]) => !excluded.test(key))
        .map(([key, entry]) => [key, decodeDraft(entry)]),
    );
  }
  return value;
}

type MigrationResult = { value: unknown; missingMedia: boolean };

export async function migrateLegacyDraft(value: unknown): Promise<MigrationResult> {
  if (Array.isArray(value)) {
    const entries = await Promise.all(value.map(migrateLegacyDraft));
    return {
      value: entries.flatMap((entry) => (entry.value === undefined ? [] : [entry.value])),
      missingMedia: entries.some((entry) => entry.missingMedia),
    };
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (record.$file instanceof Blob) {
      try {
        return {
          value: {
            $bytes: await record.$file.arrayBuffer(),
            name: String(record.name || 'reference'),
            modified: Number(record.modified) || 0,
            type: record.$file.type,
          } satisfies EncodedFile,
          missingMedia: false,
        };
      } catch {
        return { value: undefined, missingMedia: true };
      }
    }
    const entries = await Promise.all(
      Object.entries(record)
        .filter(([key]) => !excluded.test(key))
        .map(async ([key, entry]) => [key, await migrateLegacyDraft(entry)] as const),
    );
    return {
      value: Object.fromEntries(
        entries.flatMap(([key, entry]) => (entry.value === undefined ? [] : [[key, entry.value] as const])),
      ),
      missingMedia: entries.some(([, entry]) => entry.missingMedia),
    };
  }
  return { value, missingMedia: false };
}

export function draftHasMissingMedia(data: Record<string, unknown>) {
  return draftsWithMissingMedia.has(data);
}

let database: Promise<IDBDatabase> | undefined;
function openDatabase() {
  if (!database)
    database = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('flaq-creator-drafts', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('drafts');
      request.onsuccess = () => {
        request.result.onversionchange = () => {
          request.result.close();
          database = undefined;
        };
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Draft storage is blocked by another window.'));
    }).catch((error) => {
      database = undefined;
      throw error;
    });
  return database;
}

async function transaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('drafts', mode);
    const request = operation(tx.objectStore('drafts'));
    tx.oncomplete = () => resolve(request.result);
    tx.onabort = () => reject(tx.error || new Error('Draft transaction aborted'));
    tx.onerror = () => reject(tx.error || new Error('Draft storage failed'));
  });
}

// Serialize operations per workflow: an older large file write cannot overwrite a newer save or clear.
const queues = new Map<string, Promise<unknown>>();
function enqueue<T>(key: string, action: () => Promise<T>): Promise<T> {
  const next = (queues.get(key) || Promise.resolve()).catch(() => {}).then(action);
  queues.set(key, next);
  void next
    .finally(() => {
      if (queues.get(key) === next) queues.delete(key);
    })
    .catch(() => {});
  return next;
}
export function saveDraft(key: string, data: Record<string, unknown>) {
  return enqueue(key, async () => {
    const encoded = await encodeDraft(data);
    await transaction('readwrite', (store) =>
      store.put({ version: DRAFT_VERSION, updatedAt: Date.now(), data: encoded }, key),
    );
  });
}
export function readDraft(key: string) {
  return enqueue(key, async () => {
    const record = await transaction<DraftRecord | undefined>('readonly', (store) => store.get(key));
    if (!record) return null;
    if (![1, DRAFT_VERSION].includes(record.version) || !record.data || typeof record.data !== 'object')
      throw new Error('Unsupported draft version');
    let encoded = record.data;
    let missingMedia = false;
    if (record.version === 1) {
      const migration = await migrateLegacyDraft(record.data);
      encoded = migration.value as Record<string, unknown>;
      missingMedia = migration.missingMedia;
      await transaction('readwrite', (store) =>
        store.put({ version: DRAFT_VERSION, updatedAt: record.updatedAt, data: encoded }, key),
      );
    }
    const decoded = decodeDraft(encoded) as Record<string, unknown>;
    if (missingMedia) draftsWithMissingMedia.add(decoded);
    return decoded;
  });
}
export function deleteDraft(key: string) {
  return enqueue(key, () => transaction('readwrite', (store) => store.delete(key)));
}
