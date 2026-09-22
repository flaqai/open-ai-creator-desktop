import assert from 'node:assert/strict';
import test from 'node:test';

import type { UnifiedGeneratorReferenceMediaAsset } from '../lib/constants/unified-generator/types';
import { filterCompatibleHistoryAssets, getMediaSourceExtension } from '../lib/utils/history-media-selection';

const assets: UnifiedGeneratorReferenceMediaAsset[] = [
  { id: 'png', kind: 'image', source: 'https://cdn.example.com/a.png?token=1' },
  { id: 'webp', kind: 'image', source: 'https://cdn.example.com/b.webp' },
  { id: 'unknown', kind: 'image', source: 'https://cdn.example.com/media/asset' },
  { id: 'video', kind: 'video', source: 'https://cdn.example.com/c.mp4' },
];

test('extracts a normalized extension without query parameters', () => {
  assert.equal(getMediaSourceExtension('https://cdn.example.com/IMAGE.JPEG?download=1'), 'jpeg');
  assert.equal(getMediaSourceExtension('https://cdn.example.com/no-extension'), '');
});

test('filters history by media kind and supported formats', () => {
  assert.deepEqual(
    filterCompatibleHistoryAssets(assets, 'image', ['png']).map((asset) => asset.id),
    ['png', 'unknown'],
  );
});

test('keeps all records of the requested kind when formats are unrestricted', () => {
  assert.deepEqual(
    filterCompatibleHistoryAssets(assets, 'image').map((asset) => asset.id),
    ['png', 'webp', 'unknown'],
  );
});
