import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

import { decryptValue, encryptValue } from '../lib/utils/cryptoUtils';
import { clearAllSecureStorage, getSecureItem, isRememberMeEnabled, setSecureItem } from '../lib/utils/secureStorage';
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

test('settings encrypt with unique IVs and damaged ciphertext never becomes an API key', async () => {
  const a = await encryptValue('test-key');
  const b = await encryptValue('test-key');
  assert.notEqual(a, b);
  assert.ok(a.startsWith('v2:'));
  assert.equal(await decryptValue(a), 'test-key');
  await assert.rejects(decryptValue('v2:corrupt'));
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
