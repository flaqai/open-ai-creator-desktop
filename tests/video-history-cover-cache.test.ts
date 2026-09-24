import { createElement } from 'react';
import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';

import 'fake-indexeddb/auto';

import { readFileSync } from 'node:fs';

import { readVideoHistoryCover, storeVideoHistoryCover } from '@/lib/media/video-history-cover-cache';
import { generateVideoHistoryCover } from '@/lib/media/video-history-frame';
import CreatorVideoPreview from '@/components/unified-generator/CreatorVideoPreview';

const creatorHistorySource = readFileSync(
  new URL('../components/unified-generator/CreatorHistory.tsx', import.meta.url),
  'utf8',
);

test('a first frame from a locally archived video survives a history tab switch', async () => {
  const key = 'video-task-local-frame';
  const videoUrl = 'https://assets.example.test/video.mp4';
  const localPath = '/media/video-task-local-frame.mp4';
  const reads: string[] = [];
  let captures = 0;

  const frame = await generateVideoHistoryCover(key, videoUrl, localPath, {
    readVideo: async (path) => {
      reads.push(path);
      return new Blob(['local-video'], { type: 'video/mp4' });
    },
    captureFrame: async (video) => {
      captures += 1;
      assert.equal(await video.text(), 'local-video');
      return new Blob(['local-frame'], { type: 'image/jpeg' });
    },
  });

  assert.equal(await frame.text(), 'local-frame');
  assert.equal(await (await readVideoHistoryCover(key, `video:${videoUrl}`))?.text(), 'local-frame');
  assert.equal(await readVideoHistoryCover(key, 'https://assets.example.test/remote-cover.jpg'), null);

  const afterTabSwitch = await generateVideoHistoryCover(key, videoUrl, localPath, {
    readVideo: async () => {
      throw new Error('Local video should not be decoded twice');
    },
  });
  assert.equal(await afterTabSwitch.text(), 'local-frame');
  assert.deepEqual(reads, [localPath]);
  assert.equal(captures, 1);
});

test('old remote cover records are not mistaken for generated video frames', async () => {
  const key = 'video-task-old-remote-cover';
  await storeVideoHistoryCover(key, 'https://assets.example.test/old-cover.jpg', new Blob(['old-cover']));
  assert.equal(await readVideoHistoryCover(key, 'video:https://assets.example.test/video.mp4'), null);
});

test('reading a missing video history cover does not throw', async () => {
  assert.equal(await readVideoHistoryCover('missing-video-task'), null);
});

test('creator history warms local video frames and completed previews ignore reference covers', () => {
  assert.match(
    creatorHistorySource,
    /preloadVideoHistoryCover\(item\.id \|\| item\.traceId, item\.videoUrl, item\.localPath\)/,
  );
  const markup = renderToStaticMarkup(
    createElement(CreatorVideoPreview, {
      item: {
        id: 'completed-video',
        traceId: 'completed-video',
        status: 'completed',
        platformName: 'seedance',
        categoryName: '',
        createTime: 0,
        duration: 4,
        errorInfo: '',
        imageEndUrl: '',
        imageUrl: 'https://assets.example.test/reference.webp',
        prompt: 'A flowing paper crane',
        videoId: 'completed-video',
        videoThumbnailUrl: 'https://assets.example.test/remote-cover.webp',
        videoUrl: 'https://assets.example.test/generated-video.mp4',
        videoType: 'Reference-to-video',
        coverImage: 'https://assets.example.test/reference-cover.webp',
      },
      noPreviewLabel: 'No preview',
      loadingLabel: 'Loading',
    }),
  );
  assert.match(markup, /generated-video\.mp4/);
  assert.doesNotMatch(markup, /reference-cover\.webp|remote-cover\.webp|reference\.webp/);
});
