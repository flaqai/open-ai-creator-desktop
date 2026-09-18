import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createMediaDirectoryPreferences } from '../lib/desktop/media-storage';

const original = { directory: '/default/media', isDefault: true };

test('choosing a media directory performs the complete choose-and-persist intent', async () => {
  const persisted: Array<string | undefined> = [];
  const preferences = createMediaDirectoryPreferences({
    read: async () => original,
    choose: async () => '/custom/media',
    persist: async (directory) => {
      persisted.push(directory);
      return { directory: directory!, isDefault: false };
    },
    open: async () => {},
  });

  assert.deepEqual(await preferences.choose(), { directory: '/custom/media', isDefault: false });
  assert.deepEqual(persisted, ['/custom/media']);
});

test('cancelling directory selection leaves the current preference untouched', async () => {
  let persists = 0;
  const preferences = createMediaDirectoryPreferences({
    read: async () => original,
    choose: async () => null,
    persist: async () => {
      persists++;
      return original;
    },
    open: async () => {},
  });

  assert.equal(await preferences.choose(), null);
  assert.equal(persists, 0);
  assert.deepEqual(await preferences.load(), original);
});

test('failed custom persistence rejects without synthesizing a new displayed preference', async () => {
  const preferences = createMediaDirectoryPreferences({
    read: async () => original,
    choose: async () => '/unwritable/media',
    persist: async () => {
      throw new Error('Media directory is not writable');
    },
    open: async () => {},
  });

  await assert.rejects(preferences.choose(), /not writable/);
  assert.deepEqual(await preferences.load(), original);
});

test('reset and open map to complete native preferences actions', async () => {
  let opened = 0;
  const persisted: Array<string | undefined> = [];
  const preferences = createMediaDirectoryPreferences({
    read: async () => original,
    choose: async () => null,
    persist: async (directory) => {
      persisted.push(directory);
      return original;
    },
    open: async () => {
      opened++;
    },
  });

  assert.deepEqual(await preferences.reset(), original);
  await preferences.open();
  assert.deepEqual(persisted, [undefined]);
  assert.equal(opened, 1);
});
