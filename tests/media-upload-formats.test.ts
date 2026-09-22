import assert from 'node:assert/strict';
import test from 'node:test';

import {
  filterAcceptedMediaFiles,
  getMediaDropzoneAccept,
  getMediaInputAccept,
  isAcceptedMediaFile,
  normalizeMediaFormats,
} from '../lib/utils/media-upload-formats';

test('uses explicit image and video format allowlists by default', () => {
  assert.deepEqual(normalizeMediaFormats('image'), ['jpg', 'jpeg', 'png', 'webp']);
  assert.deepEqual(normalizeMediaFormats('video'), ['mp4', 'mov', 'webm']);
  assert.equal(getMediaInputAccept('image'), '.jpg,.jpeg,.png,.webp');
  assert.equal(getMediaInputAccept('video'), '.mp4,.mov,.webm');
});

test('builds model-specific dropzone restrictions without wildcard-only fallbacks', () => {
  assert.deepEqual(getMediaDropzoneAccept('image', ['png', 'bmp']), {
    'image/png': ['.png'],
    'image/bmp': ['.bmp'],
  });
  assert.deepEqual(getMediaDropzoneAccept('video', ['mp4', 'mov']), {
    'video/mp4': ['.mp4'],
    'video/quicktime': ['.mov'],
  });
});

test('rejects unsupported extensions even when the MIME type is broadly compatible', () => {
  assert.equal(isAcceptedMediaFile({ name: 'vector.svg', type: 'image/svg+xml' }, 'image'), false);
  assert.equal(isAcceptedMediaFile({ name: 'clip.avi', type: 'video/x-msvideo' }, 'video'), false);
  assert.equal(isAcceptedMediaFile({ name: 'photo.png', type: 'image/png' }, 'image'), true);
  assert.equal(isAcceptedMediaFile({ name: 'movie.mov', type: 'video/quicktime' }, 'video', ['mov']), true);
});

test('rejects mismatched MIME types and filters mixed selections', () => {
  assert.equal(isAcceptedMediaFile({ name: 'fake.png', type: 'text/plain' }, 'image'), false);
  assert.deepEqual(
    filterAcceptedMediaFiles(
      [
        { name: 'one.webp', type: 'image/webp' },
        { name: 'two.svg', type: 'image/svg+xml' },
      ],
      'image',
    ).map((file) => file.name),
    ['one.webp'],
  );
});
