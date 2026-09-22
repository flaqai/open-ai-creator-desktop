import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const videoHistorySource = readFileSync(
  new URL('../components/video-ui-form/VideoHistory.tsx', import.meta.url),
  'utf8',
);
const lightPlaceholder = readFileSync(new URL('../public/images/cover/video-cover-light.svg', import.meta.url), 'utf8');

test('video history uses the supplied SVG placeholder only in light mode', () => {
  assert.match(videoHistorySource, /video-cover-light\.svg/);
  assert.match(videoHistorySource, /size-12 object-contain dark:hidden/);
  assert.match(videoHistorySource, /video-cover\.png/);
  assert.match(videoHistorySource, /hidden h-full w-full object-contain dark:block/);
  assert.match(lightPlaceholder, /stroke="#1677FF"/);
  assert.match(lightPlaceholder, /fill="#D5E7FF"/);
});
