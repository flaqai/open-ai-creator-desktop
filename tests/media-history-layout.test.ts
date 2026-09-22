import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const creatorHistorySource = readFileSync(
  new URL('../components/unified-generator/CreatorHistory.tsx', import.meta.url),
  'utf8',
);
const creatorVideoPreviewSource = readFileSync(
  new URL('../components/unified-generator/CreatorVideoPreview.tsx', import.meta.url),
  'utf8',
);
const creatorImagePreviewSource = readFileSync(
  new URL('../components/unified-generator/CreatorImagePreview.tsx', import.meta.url),
  'utf8',
);
const legacyVideoHistorySource = readFileSync(
  new URL('../components/video-ui-form/VideoHistory.tsx', import.meta.url),
  'utf8',
);

test('generation history exposes a thumbnail size control instead of fixed grid sizing', () => {
  assert.match(creatorHistorySource, /<Slider/);
  assert.match(creatorHistorySource, /thumbnail-size/);
  assert.doesNotMatch(creatorHistorySource, /aspect-square/);
  assert.doesNotMatch(creatorHistorySource, /aspect-video/);
});

test('history previews contain the full image or video frame without cropping', () => {
  assert.doesNotMatch(creatorHistorySource, /object-cover/);
  assert.doesNotMatch(creatorImagePreviewSource, /object-cover/);
  assert.doesNotMatch(creatorVideoPreviewSource, /object-cover/);
  assert.doesNotMatch(legacyVideoHistorySource, /object-cover/);
  assert.match(creatorImagePreviewSource, /object-contain/);
  assert.match(creatorVideoPreviewSource, /object-contain/);
  assert.match(legacyVideoHistorySource, /object-contain/);
});
