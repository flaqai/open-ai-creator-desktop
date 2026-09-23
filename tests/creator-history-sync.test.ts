import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  INDICATOR_TIMES,
  INDICATOR_TRACK_WIDTH,
  INDICATOR_WIDTH,
  indicatorKeyframes,
  indicatorTarget,
} from '../lib/creator-history-motion';
import { filterImageHistoryItems, type ImageHistoryItem } from '../network/image/history';
import { filterVideoHistoryItems, type VideoHistoryItem } from '../network/video/history';

const creatorHistorySource = readFileSync(
  new URL('../components/unified-generator/CreatorHistory.tsx', import.meta.url),
  'utf8',
);

test('creator history follows the unified generator media type instead of local state', () => {
  assert.match(creatorHistorySource, /useUnifiedGeneratorStore\(\(state\) => state\.mediaType\)/);
  assert.match(creatorHistorySource, /useUnifiedGeneratorStore\(\(state\) => state\.setMediaType\)/);
  assert.doesNotMatch(creatorHistorySource, /useState<HistoryType>/);
});

test('creator history coordinates content and active indicator motion with a reduced-motion fallback', () => {
  assert.match(creatorHistorySource, /<AnimatePresence initial=\{false\} mode='sync'/);
  assert.match(creatorHistorySource, /data-testid='creator-history-tab-indicator'/);
  assert.match(creatorHistorySource, /data-testid='creator-history-tab-indicator-stretch'/);
  assert.match(creatorHistorySource, /indicatorKeyframes\(current, type\)/);
  assert.match(creatorHistorySource, /useTransform\(\s*\[indicatorLeft, indicatorRight\]/);
  assert.match(creatorHistorySource, /overflow-x-clip/);
  assert.match(creatorHistorySource, /x: `\$\{direction \* 100\}%`/);
  assert.match(creatorHistorySource, /useReducedMotion\(\)/);
  assert.doesNotMatch(creatorHistorySource, /after:bg-primary/);
});

test('history indicator edges overlap, stay inside the track and finish at the expected width', () => {
  assert.deepEqual(INDICATOR_TIMES, [0, 0.35, 0.72, 1]);
  assert.equal(INDICATOR_TRACK_WIDTH, 132);
  for (const [start, target] of [
    [indicatorTarget('video'), 'image'],
    [indicatorTarget('image'), 'video'],
    [{ left: 24, right: 105 }, 'image'],
    [{ left: 24, right: 105 }, 'video'],
  ] as const) {
    const frames = indicatorKeyframes(start, target);
    const direction = target === 'image' ? 1 : -1;
    for (let index = 0; index < INDICATOR_TIMES.length; index++) {
      assert.ok(frames.left[index] >= 0 && frames.left[index] <= INDICATOR_TRACK_WIDTH);
      assert.ok(frames.right[index] >= 0 && frames.right[index] <= INDICATOR_TRACK_WIDTH);
      assert.ok(frames.left[index] < frames.right[index]);
      if (index > 0) {
        assert.ok((frames.left[index] - frames.left[index - 1]) * direction >= 0);
        assert.ok((frames.right[index] - frames.right[index - 1]) * direction >= 0);
      }
    }
    assert.equal(frames.left[0], start.left);
    assert.equal(frames.right[0], start.right);
    assert.equal(frames.right[3] - frames.left[3], INDICATOR_WIDTH);
    assert.deepEqual({ left: frames.left[3], right: frames.right[3] }, indicatorTarget(target));
  }

  const movingRight = indicatorKeyframes(indicatorTarget('video'), 'image');
  assert.equal(movingRight.left[1], 0);
  assert.equal(movingRight.right[1], 98);
  assert.ok(movingRight.left[2] > 0 && movingRight.left[2] < 68);
  assert.equal(movingRight.right[2], 132);

  const movingLeft = indicatorKeyframes(indicatorTarget('image'), 'video');
  assert.equal(movingLeft.right[1], 132);
  assert.equal(movingLeft.left[1], 34);
  assert.ok(movingLeft.right[2] > 64 && movingLeft.right[2] < 132);
  assert.equal(movingLeft.left[2], 0);
});

test('creator history filters failed items before pagination while retaining active work', () => {
  const images = [
    { id: 'processing-image', status: 'processing' },
    { id: 'failed-image', status: 'fail' },
    { id: 'completed-image', status: 'completed' },
  ] as ImageHistoryItem[];
  const videos = [
    { id: 'processing-video', status: 'processing' },
    { id: 'failed-video', status: 'fail' },
    { id: 'completed-video', status: 'completed' },
  ] as VideoHistoryItem[];

  assert.deepEqual(
    filterImageHistoryItems(images, { excludeFailed: true }).map((item) => item.id),
    ['processing-image', 'completed-image'],
  );
  assert.deepEqual(
    filterVideoHistoryItems(videos, { excludeFailed: true }).map((item) => item.id),
    ['processing-video', 'completed-video'],
  );
});
