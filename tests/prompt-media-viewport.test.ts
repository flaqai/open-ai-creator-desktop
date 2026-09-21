import assert from 'node:assert/strict';
import test from 'node:test';

import {
  clampDividerPercent,
  clampMediaZoom,
  clampPan,
  clampSplitMediaPercent,
  containSize,
  panBounds,
  promptResizeIntent,
  resolvePromptResize,
  supportsMediaInteraction,
  supportsPromptPanelResize,
  zoomAroundPoint,
} from '../lib/prompt-media-viewport';

test('containSize preserves the source ratio inside landscape and portrait canvases', () => {
  assert.deepEqual(containSize({ width: 800, height: 600 }, { width: 1600, height: 900 }), {
    width: 800,
    height: 450,
  });
  assert.deepEqual(containSize({ width: 400, height: 700 }, { width: 1600, height: 900 }), {
    width: 400,
    height: 225,
  });
});

test('panBounds removes empty-space travel at fit and constrains zoomed media', () => {
  const viewport = { width: 800, height: 600 };
  const fitted = { width: 800, height: 450 };

  assert.deepEqual(panBounds(viewport, fitted, 1), { x: 0, y: 0 });
  assert.deepEqual(panBounds(viewport, fitted, 3), { x: 800, y: 375 });
  assert.deepEqual(clampPan({ x: 1200, y: -900 }, { x: 800, y: 375 }), { x: 800, y: -375 });
});

test('zoomAroundPoint keeps the pointed image area stable and clamps its result', () => {
  const result = zoomAroundPoint({
    currentZoom: 1,
    nextZoom: 2,
    pan: { x: 0, y: 0 },
    pointer: { x: 600, y: 300 },
    viewport: { width: 800, height: 600 },
    fitted: { width: 800, height: 450 },
  });

  assert.equal(result.zoom, 2);
  assert.deepEqual(result.pan, { x: -200, y: 0 });
});

test('zoom is limited to 100–300% and fitting resets translation', () => {
  assert.equal(clampMediaZoom(0.25), 1);
  assert.equal(clampMediaZoom(4), 3);
  assert.deepEqual(
    zoomAroundPoint({
      currentZoom: 2,
      nextZoom: 1,
      pan: { x: 100, y: 50 },
      pointer: { x: 100, y: 100 },
      viewport: { width: 800, height: 600 },
      fitted: { width: 800, height: 450 },
    }),
    { zoom: 1, pan: { x: 0, y: 0 } },
  );
});

test('only desktop images opt into zoom and pan behavior', () => {
  assert.equal(supportsMediaInteraction('image', true), true);
  assert.equal(supportsMediaInteraction('image', false), false);
  assert.equal(supportsMediaInteraction('video', true), false);
  assert.equal(supportsMediaInteraction('video', false), false);
});

test('prompt divider percentages retain the complete 0–100 drag range and clamp split widths to 20–72', () => {
  assert.equal(clampDividerPercent(-10), 0);
  assert.equal(clampDividerPercent(108), 100);
  assert.equal(clampSplitMediaPercent(0), 20);
  assert.equal(clampSplitMediaPercent(45), 45);
  assert.equal(clampSplitMediaPercent(100), 72);
});

test('prompt resize intent keeps exact thresholds split and arms complete modes only beyond them', () => {
  assert.equal(promptResizeIntent(0), 'prompt');
  assert.equal(promptResizeIntent(19.99), 'prompt');
  assert.equal(promptResizeIntent(20), 'split');
  assert.equal(promptResizeIntent(72), 'split');
  assert.equal(promptResizeIntent(72.01), 'media');
  assert.equal(promptResizeIntent(100), 'media');
});

test('prompt resize release commits split widths and preserves the previous split width for complete modes', () => {
  assert.deepEqual(resolvePromptResize(36, 65), { mode: 'split', splitPercent: 36 });
  assert.deepEqual(resolvePromptResize(8, 61), { mode: 'prompt', splitPercent: 61 });
  assert.deepEqual(resolvePromptResize(94, 61), { mode: 'media', splitPercent: 61 });
  assert.deepEqual(resolvePromptResize(94, 500), { mode: 'media', splitPercent: 72 });
});

test('three-state prompt panel resizing remains desktop-only', () => {
  assert.equal(supportsPromptPanelResize(true), true);
  assert.equal(supportsPromptPanelResize(false), false);
});
