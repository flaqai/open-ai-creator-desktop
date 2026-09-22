import assert from 'node:assert/strict';
import test from 'node:test';

import { continuousWheelZoom } from '../lib/media-zoom';

test('wheel zoom follows fine trackpad deltas without snapping to fixed stops', () => {
  const first = continuousWheelZoom({
    currentZoom: 1,
    deltaY: -2,
    minZoom: 1,
    maxZoom: 3,
  });
  const second = continuousWheelZoom({
    currentZoom: first,
    deltaY: -2,
    minZoom: 1,
    maxZoom: 3,
  });

  assert.ok(first > 1 && first < 1.01);
  assert.ok(second > first && second < 1.02);
  assert.notEqual(first, 1.25);
});

test('wheel zoom normalizes line input, preserves direction and clamps limits', () => {
  const zoomedIn = continuousWheelZoom({
    currentZoom: 2,
    deltaY: -3,
    deltaMode: 1,
    minZoom: 1,
    maxZoom: 3,
  });
  const zoomedOut = continuousWheelZoom({
    currentZoom: zoomedIn,
    deltaY: 3,
    deltaMode: 1,
    minZoom: 1,
    maxZoom: 3,
  });

  assert.ok(zoomedIn > 2);
  assert.ok(zoomedOut < zoomedIn);
  assert.equal(continuousWheelZoom({ currentZoom: 3, deltaY: -1000, minZoom: 1, maxZoom: 3 }), 3);
  assert.equal(continuousWheelZoom({ currentZoom: 1, deltaY: 1000, minZoom: 1, maxZoom: 3 }), 1);
});
