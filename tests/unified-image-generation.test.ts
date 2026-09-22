import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getUnifiedImageDimensions } from '../lib/utils/unified-image-generation';

test('AI creation sends aspect-ratio dimensions instead of pixel dimensions', () => {
  assert.deepEqual(getUnifiedImageDimensions('1:1'), { width: 1, height: 1 });
  assert.deepEqual(getUnifiedImageDimensions('16:9'), { width: 16, height: 9 });
  assert.deepEqual(getUnifiedImageDimensions('9:16'), { width: 9, height: 16 });
});

test('AI creation falls back to a valid square ratio', () => {
  assert.deepEqual(getUnifiedImageDimensions(), { width: 1, height: 1 });
  assert.deepEqual(getUnifiedImageDimensions('-'), { width: 1, height: 1 });
});
