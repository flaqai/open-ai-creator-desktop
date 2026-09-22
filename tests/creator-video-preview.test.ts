import { createElement } from 'react';
import assert from 'node:assert/strict';
import test from 'node:test';
import type { ImageHistoryItem } from '@/network/image/history';
import type { VideoHistoryItem } from '@/network/video/history';
import { renderToStaticMarkup } from 'react-dom/server';

import CreatorImagePreview from '@/components/unified-generator/CreatorImagePreview';
import CreatorVideoPreview from '@/components/unified-generator/CreatorVideoPreview';

function videoHistoryItem(overrides: Partial<VideoHistoryItem> = {}): VideoHistoryItem {
  return {
    id: 'video-task',
    traceId: 'video-task',
    status: 'processing',
    platformName: 'seedance',
    categoryName: '',
    createTime: 0,
    duration: 4,
    errorInfo: '',
    imageEndUrl: '',
    imageUrl: '',
    prompt: 'A flowing paper crane',
    videoId: 'video-task',
    videoThumbnailUrl: '',
    videoUrl: '',
    videoType: 'Reference-to-video',
    ...overrides,
  };
}

test('processing video history keeps its preview while exposing a loading indicator for every video mode', () => {
  for (const videoType of ['Text-to-video', 'Image-to-video', 'Reference-to-video'] as const) {
    const markup = renderToStaticMarkup(
      createElement(CreatorVideoPreview, {
        item: videoHistoryItem({
          videoType,
          coverImage: 'https://assets.example.test/reference-cover.webp',
        }),
        noPreviewLabel: 'No preview',
        loadingLabel: 'Loading',
      }),
    );

    assert.match(markup, /reference-cover\.webp/);
    assert.match(markup, /animate-spin/);
    assert.match(markup, /role="status"/);
  }
});

test('processing image-to-image history keeps its source preview while exposing a loading indicator', () => {
  const item: ImageHistoryItem = {
    id: 'image-task',
    prompt: 'Turn this sketch into a watercolor',
    createTime: 0,
    url: '',
    thumbnailUrl: 'https://assets.example.test/source-image.webp',
    resolution: '1:1',
    status: 'processing',
  };
  const markup = renderToStaticMarkup(
    createElement(CreatorImagePreview, {
      item,
      noPreviewLabel: 'No preview',
      loadingLabel: 'Loading',
    }),
  );

  assert.match(markup, /source-image\.webp/);
  assert.match(markup, /animate-spin/);
  assert.match(markup, /role="status"/);
});
