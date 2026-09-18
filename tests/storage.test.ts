import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

import { loadImageHostingSettings, saveImageHostingSettings } from '../lib/desktop/image-hosting-settings';
import {
  initialR2Preset,
  loadR2Presets,
  removeR2Preset,
  saveR2Presets,
  upsertR2Preset,
} from '../lib/desktop/r2-presets';
import {
  CUSTOM_R2_ACCESS_KEY_ID_STORAGE_KEY,
  CUSTOM_R2_ACCOUNT_ID_STORAGE_KEY,
  CUSTOM_R2_BUCKET_NAME_STORAGE_KEY,
  CUSTOM_R2_PUBLIC_DOMAIN_STORAGE_KEY,
  CUSTOM_R2_SECRET_ACCESS_KEY_STORAGE_KEY,
  getUploadProvider,
  R2_ACCESS_KEY_ID_STORAGE_KEY,
  R2_ACCOUNT_ID_STORAGE_KEY,
  R2_BUCKET_NAME_STORAGE_KEY,
  R2_PUBLIC_DOMAIN_STORAGE_KEY,
  R2_SECRET_ACCESS_KEY_STORAGE_KEY,
  setUploadProvider,
} from '../lib/desktop/storage';
import { decryptValue, encryptValue } from '../lib/utils/cryptoUtils';
import { clearAllSecureStorage, getSecureItem, isRememberMeEnabled, setSecureItem } from '../lib/utils/secureStorage';
import { isApiConnectionAuthorized, setApiConnectionAuthorized } from '../network/connection-status';
import { readLocalHistory, subscribeLocalHistory, writeLocalHistory } from '../network/local-history';

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  values() {
    return [...this.data.values()];
  }
}
beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true });
  Object.defineProperty(globalThis, 'sessionStorage', { value: new MemoryStorage(), configurable: true });
  Object.defineProperty(globalThis, 'window', { value: new EventTarget(), configurable: true });
});

test('switching remember preference never leaves a stale key in the other store', async () => {
  const key = 'FLAQ-SAAS-TEMPLATE-open-api-client-key';
  await setSecureItem(key, 'session-key', false);
  await setSecureItem(key, 'remembered-key', true);
  assert.equal(await getSecureItem(key), 'remembered-key');
  assert.equal(sessionStorage.getItem(key), null);
  assert.equal(isRememberMeEnabled(), true);
  await setSecureItem(key, 'new-session-key', false);
  assert.equal(await getSecureItem(key), 'new-session-key');
  assert.equal(localStorage.getItem(key), null);
  assert.equal(isRememberMeEnabled(), false);
  clearAllSecureStorage();
  assert.equal(await getSecureItem(key), null);
});

test('upload provider defaults to Flaq storage and persists an explicit custom R2 choice', () => {
  assert.equal(getUploadProvider(), 'builtin');
  setUploadProvider('custom-r2');
  assert.equal(getUploadProvider(), 'custom-r2');
  localStorage.setItem('FLAQ-CREATOR-DESKTOP-upload-provider-v1', 'invalid');
  assert.equal(getUploadProvider(), 'builtin');
});

test('image hosting settings read legacy credentials and keep custom credentials separate', async () => {
  const legacy = ['legacy-account', 'legacy-access', 'legacy-secret', 'legacy-bucket', 'legacy.assets.test'];
  const legacyKeys = [
    R2_ACCOUNT_ID_STORAGE_KEY,
    R2_ACCESS_KEY_ID_STORAGE_KEY,
    R2_SECRET_ACCESS_KEY_STORAGE_KEY,
    R2_BUCKET_NAME_STORAGE_KEY,
    R2_PUBLIC_DOMAIN_STORAGE_KEY,
  ];
  await Promise.all(legacyKeys.map((key, index) => setSecureItem(key, legacy[index], true)));
  assert.deepEqual((await loadImageHostingSettings()).customR2, {
    accountId: 'legacy-account',
    accessKeyId: 'legacy-access',
    secretAccessKey: 'legacy-secret',
    bucketName: 'legacy-bucket',
    publicDomain: 'legacy.assets.test',
  });

  const custom = {
    accountId: 'custom-account',
    accessKeyId: 'custom-access',
    secretAccessKey: 'custom-secret',
    bucketName: 'custom-bucket',
    publicDomain: 'custom.assets.test',
  };
  await saveImageHostingSettings('custom-r2', custom, false);
  assert.deepEqual(await loadImageHostingSettings(), { provider: 'custom-r2', customR2: custom });
  assert.equal(await getSecureItem(R2_ACCOUNT_ID_STORAGE_KEY), 'legacy-account');
  for (const key of [
    CUSTOM_R2_ACCOUNT_ID_STORAGE_KEY,
    CUSTOM_R2_ACCESS_KEY_ID_STORAGE_KEY,
    CUSTOM_R2_SECRET_ACCESS_KEY_STORAGE_KEY,
    CUSTOM_R2_BUCKET_NAME_STORAGE_KEY,
    CUSTOM_R2_PUBLIC_DOMAIN_STORAGE_KEY,
  ]) {
    assert.notEqual(await getSecureItem(key), null);
  }
});

test('connection authorization status follows the key storage lifetime', async () => {
  const key = 'FLAQ-SAAS-TEMPLATE-open-api-client-key';
  await setSecureItem(key, 'session-key', false);
  setApiConnectionAuthorized(true, false);
  assert.equal(await isApiConnectionAuthorized(), true);
  sessionStorage.removeItem(key);
  assert.equal(await isApiConnectionAuthorized(), false);
  setApiConnectionAuthorized(false, false);
  assert.equal(sessionStorage.getItem('FLAQ-SAAS-TEMPLATE-open-api-authorized'), null);
  assert.equal(localStorage.getItem('FLAQ-SAAS-TEMPLATE-open-api-authorized'), null);
});

test('settings encrypt with unique IVs and damaged ciphertext never becomes an API key', async () => {
  const a = await encryptValue('test-key');
  const b = await encryptValue('test-key');
  assert.notEqual(a, b);
  assert.ok(a.startsWith('v2:'));
  assert.equal(await decryptValue(a), 'test-key');
  await assert.rejects(decryptValue('v2:corrupt'));
});

test('clearing API connection settings preserves separately managed custom R2 credentials', async () => {
  await setSecureItem(R2_ACCOUNT_ID_STORAGE_KEY, 'existing-r2-account', true);
  await setSecureItem(CUSTOM_R2_ACCOUNT_ID_STORAGE_KEY, 'custom-r2-account', true);
  clearAllSecureStorage();
  assert.equal(await getSecureItem(R2_ACCOUNT_ID_STORAGE_KEY), 'existing-r2-account');
  assert.equal(await getSecureItem(CUSTOM_R2_ACCOUNT_ID_STORAGE_KEY), 'custom-r2-account');
});

test('R2 presets are encrypted, can be selected for reuse and reject duplicate names', async () => {
  const input = {
    name: 'Production',
    accountId: 'account',
    accessKeyId: 'access',
    secretAccessKey: 'secret',
    bucketName: 'bucket',
    publicDomain: 'https://assets.example.test',
  };
  const created = upsertR2Preset([], input);
  await saveR2Presets(created);
  const rawValues = (localStorage as unknown as MemoryStorage).values();
  assert.equal(
    rawValues.some((value) => value.includes('secret')),
    false,
  );
  assert.deepEqual(await loadR2Presets(), created);
  assert.equal(initialR2Preset(created, {})?.id, created[0].id);
  assert.equal(initialR2Preset(created, input)?.id, created[0].id);
  assert.equal(initialR2Preset(created, { ...input, bucketName: 'different' }), undefined);

  const updated = upsertR2Preset(created, { ...input, bucketName: 'new-bucket' }, created[0].id);
  assert.equal(updated[0].bucketName, 'new-bucket');
  assert.throws(() => upsertR2Preset(updated, { ...input, name: 'Production' }), /already exists/);
  assert.deepEqual(removeR2Preset(updated, updated[0].id), []);
});

test('history tolerates malformed storage and notifies only active subscribers', () => {
  localStorage.setItem('history', 'broken');
  assert.deepEqual(readLocalHistory('history'), []);
  let changes = 0;
  const unsubscribe = subscribeLocalHistory('history', () => {
    changes++;
  });
  writeLocalHistory('history', [{ id: 'a' }]);
  assert.equal(changes, 1);
  assert.deepEqual(readLocalHistory('history'), [{ id: 'a' }]);
  unsubscribe();
  writeLocalHistory('history', []);
  assert.equal(changes, 1);
});
