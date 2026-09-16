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
  const result = await attemptMediaArchive(input, {
    native: true,
    archive: async () => {
      throw new Error('disk full');
    },
  });
  assert.equal(result.status, 'failed');
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
