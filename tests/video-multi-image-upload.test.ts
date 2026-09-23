import assert from 'node:assert/strict';
import test from 'node:test';

import { takeMultiImageUrls } from '../lib/utils/video-multi-image-upload';

test('history URLs and uploaded video input images retain their visible order', () => {
  const firstFile = new File(['first'], 'first.png', { type: 'image/png' });
  const secondFile = new File(['second'], 'second.png', { type: 'image/png' });
  const uploadedUrls = ['start-frame', 'end-frame', 'uploaded-first', 'uploaded-second'];

  assert.deepEqual(takeMultiImageUrls([firstFile, 'https://example.test/history.png', secondFile], uploadedUrls), [
    'uploaded-first',
    'https://example.test/history.png',
    'uploaded-second',
  ]);
  assert.deepEqual(uploadedUrls, ['start-frame', 'end-frame']);
});

test('history-only video inputs do not consume uploaded frame URLs', () => {
  const uploadedUrls = ['start-frame', 'end-frame'];
  assert.deepEqual(takeMultiImageUrls(['https://example.test/one.png'], uploadedUrls), [
    'https://example.test/one.png',
  ]);
  assert.deepEqual(uploadedUrls, ['start-frame', 'end-frame']);
});
