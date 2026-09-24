import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const videoPreviewSource = readFileSync(
  new URL('../components/unified-generator/CreatorVideoPreview.tsx', import.meta.url),
  'utf8',
);

test('hover video playback handles an interrupted play promise', () => {
  assert.doesNotMatch(videoPreviewSource, /void event\.currentTarget\.play\(\)/);
  assert.match(videoPreviewSource, /\.play\(\)\.catch\(/);
  assert.match(videoPreviewSource, /AbortError/);
});
