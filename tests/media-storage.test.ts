import assert from 'node:assert/strict';
import { test } from 'node:test';

import { attemptMediaArchive } from '../lib/desktop/media-storage';

const input = {
  url: 'https://assets.example.test/result.png',
  mediaType: 'image' as const,
  taskId: 'image-task',
  completedAt: 1_725_955_200_000,
};

test('web media completion skips native archiving', async () => {
  const result = await attemptMediaArchive(input, {
    native: false,
    archive: async () => {
      throw new Error('must not run');
    },
  });
  assert.deepEqual(result, { status: 'skipped' });
});

test('archive failures are returned as local state instead of rejecting generation completion', async () => {
  const logs: Array<{ level: string; scope: string; message: string }> = [];
  const result = await attemptMediaArchive(input, {
    native: true,
    archive: async () => {
      throw new Error('error sending request for url (https://assets.example.test/result.png?token=secret)');
    },
    log: async (level, scope, message) => {
      logs.push({ level, scope, message });
    },
  });
  assert.equal(result.status, 'failed');
  assert.deepEqual(
    logs.map(({ level, scope }) => ({ level, scope })),
    [{ level: 'error', scope: 'media-archive' }],
  );
  assert.match(logs[0].message, /image task image-task/);
  assert.match(logs[0].message, /<URL>/);
  assert.doesNotMatch(logs[0].message, /assets\.example\.test|token=secret/);
});

test('successful archive returns the native local path', async () => {
  const result = await attemptMediaArchive(input, {
    native: true,
    archive: async () => '/data/media/2024/09/10/image-image-task.png',
  });
  assert.deepEqual(result, {
    status: 'saved',
    localPath: '/data/media/2024/09/10/image-image-task.png',
  });
});
