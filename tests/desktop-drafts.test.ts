import assert from 'node:assert/strict';
import test from 'node:test';

import 'fake-indexeddb/auto';

import { IDBObjectStore } from 'fake-indexeddb';

import { decodeDraft, deleteDraft, encodeDraft, migrateLegacyDraft, readDraft, saveDraft } from '../lib/desktop/drafts';
import { parsePreferences } from '../lib/desktop/preferences';

test('preferences default to system and reject corrupt/unsupported data', () => {
  for (const value of [null, '{broken', '{"version":99}']) {
    assert.deepEqual(parsePreferences(value), { version: 1, theme: 'system', collapsed: false });
  }
  for (const theme of ['system', 'light', 'dark']) {
    assert.equal(parsePreferences(JSON.stringify({ version: 1, theme, collapsed: true })).theme, theme);
  }
});

test('draft encoding removes credentials, functions, object URLs and submission state', async () => {
  const file = new File(['local reference'], 'reference.png', { type: 'image/png', lastModified: 100 });
  const url = URL.createObjectURL(file);
  try {
    const encoded = await encodeDraft({
      prompt: 'test',
      file,
      source: url,
      previewUrl: url,
      apiKey: 'test-secret',
      nested: { token: 'test-token' },
      pendingCreatorSubmit: true,
      action: () => {},
    });
    assert.ok((encoded as { file: { $bytes: unknown } }).file.$bytes instanceof ArrayBuffer);
    assert.equal('$file' in (encoded as { file: object }).file, false);
    const decoded = decodeDraft(encoded) as Record<string, unknown>;
    assert.equal(decoded.prompt, 'test');
    assert.equal(decoded.apiKey, undefined);
    assert.equal(decoded.pendingCreatorSubmit, undefined);
    assert.equal(decoded.previewUrl, undefined);
    assert.deepEqual(decoded.nested, {});
    assert.ok(decoded.file instanceof File);
    assert.equal(decoded.file.name, 'reference.png');
    assert.equal(await decoded.file.text(), 'local reference');
    assert.ok(decoded.source instanceof File);
  } finally {
    URL.revokeObjectURL(url);
  }
});

test('legacy drafts keep text while dropping unreadable external Blob media', async () => {
  class UnreadableBlob extends Blob {
    override arrayBuffer(): Promise<ArrayBuffer> {
      return Promise.reject(new Error('Blob loading failed'));
    }
  }
  const migrated = await migrateLegacyDraft({
    prompt: 'keep me',
    image: { $file: new UnreadableBlob(['lost'], { type: 'image/png' }), name: 'lost.png', modified: 1 },
  });
  assert.equal((migrated.value as Record<string, unknown>).prompt, 'keep me');
  assert.equal((migrated.value as Record<string, unknown>).image, undefined);
  assert.equal(migrated.missingMedia, true);
});

test('all seven workflows persist independently, restore Blobs and never restore submit intent', async () => {
  const keys = [
    'text-to-image',
    'image-to-image',
    'virtual-try-on',
    'text-to-video',
    'image-to-video',
    'reference-to-video',
    'ai-media-creator',
  ];
  for (const key of keys) {
    await saveDraft(key, {
      prompt: key,
      ratio: '16:9',
      file: new File([key], 'sample.png', { type: 'image/png' }),
      pendingCreatorSubmit: true,
    });
  }
  for (const key of keys) {
    const restored = await readDraft(key);
    assert.equal(restored?.prompt, key);
    assert.equal(restored?.ratio, '16:9');
    assert.equal(restored?.pendingCreatorSubmit, undefined);
    assert.ok(restored?.file instanceof File);
    assert.equal(await restored.file.text(), key);
    await deleteDraft(key);
    assert.equal(await readDraft(key), null);
  }
});

test('queued writes and clear cannot resurrect an older draft', async () => {
  await Promise.all([saveDraft('race', { prompt: 'old' }), saveDraft('race', { prompt: 'new' })]);
  assert.equal((await readDraft('race'))?.prompt, 'new');
  await Promise.all([saveDraft('race', { prompt: 'pending' }), deleteDraft('race')]);
  assert.equal(await readDraft('race'), null);
});

test('quota failure rejects and a later save can recover', async () => {
  const original = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = () => {
    throw new DOMException('Disk full', 'QuotaExceededError');
  };
  try {
    await assert.rejects(saveDraft('quota', { prompt: 'unsaved' }), { name: 'QuotaExceededError' });
  } finally {
    IDBObjectStore.prototype.put = original;
  }
  await saveDraft('quota', { prompt: 'retry' });
  assert.equal((await readDraft('quota'))?.prompt, 'retry');
});
