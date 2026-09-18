import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

import {
  getMediaCatalogSnapshot,
  MEDIA_LIBRARY_UPLOADS_KEY,
  recordReferenceUploads,
  subscribeMediaCatalog,
} from '../lib/desktop/media-library';
import { deleteImageHistoryItem, imageHistoryKey } from '../network/image/history';
import { writeLocalHistory } from '../network/local-history';
import { videoHistoryKey } from '../network/video/history';

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}

beforeEach(() => {
  const storage = new MemoryStorage();
  const browserWindow = new EventTarget();
  Object.defineProperty(browserWindow, 'localStorage', { value: storage });
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
  Object.defineProperty(globalThis, 'window', { value: browserWindow, configurable: true });
});

test('catalog records successful reference uploads behind one interface', () => {
  const older = new File(['old'], 'old-name.png', { type: 'image/png' });
  const newer = new File(['new'], 'reference.png', { type: 'image/png' });
  const url = 'https://storage.flaq.ai/uploads/2026/09/17/reference.png';

  assert.equal(recordReferenceUploads([{ data: older, type: older.type }], [url]), true);
  assert.equal(recordReferenceUploads([{ data: newer, type: newer.type }], [url]), true);
  assert.deepEqual(
    getMediaCatalogSnapshot().map(({ name, origin, availability }) => ({ name, origin, availability })),
    [{ name: 'reference.png', origin: 'upload', availability: 'cloud-only' }],
  );

  localStorage.setItem(MEDIA_LIBRARY_UPLOADS_KEY, '{broken');
  assert.deepEqual(getMediaCatalogSnapshot(), []);
});

test('catalog combines all source adapters and exposes local availability', () => {
  recordReferenceUploads(
    [{ data: new File(['video'], 'source.mp4', { type: 'video/mp4' }), type: 'video/mp4' }],
    ['https://storage.flaq.ai/uploads/2026/09/17/source.mp4'],
  );
  writeLocalHistory(imageHistoryKey, [
    {
      id: 'saved-image',
      prompt: 'A purple studio',
      createTime: 40,
      url: 'https://storage.flaq.ai/generated/image.png',
      thumbnailUrl: 'https://storage.flaq.ai/generated/image-thumb.png',
      resolution: '2048x2048',
      status: 'completed',
      localPath: '/media/2026/09/17/image-saved-image.png',
      archiveStatus: 'saved',
      userImageUrlList: ['https://storage.flaq.ai/uploads/2026/09/17/reference.png'],
    },
    {
      id: 'failed-archive',
      prompt: 'Still a successful work',
      createTime: 35,
      url: 'https://storage.flaq.ai/generated/cloud-only.png',
      thumbnailUrl: '',
      resolution: '1024x1024',
      status: 'completed',
      archiveStatus: 'failed',
    },
    {
      id: 'processing-image',
      prompt: 'Not ready',
      createTime: 50,
      url: '',
      thumbnailUrl: '',
      resolution: '1:1',
      status: 'processing',
    },
  ]);
  writeLocalHistory(videoHistoryKey, [
    {
      id: 'video-task',
      traceId: 'video-task',
      status: 'completed',
      platformName: 'seedance',
      coverImage: 'https://storage.flaq.ai/generated/video-cover.png',
      categoryName: '',
      createTime: 60,
      duration: 5,
      errorInfo: '',
      imageEndUrl: '',
      imageUrl: 'https://storage.flaq.ai/uploads/2026/09/17/reference.png',
      prompt: 'Camera orbit',
      videoId: 'video-task',
      videoThumbnailUrl: 'https://storage.flaq.ai/generated/video-cover.png',
      videoUrl: 'https://storage.flaq.ai/generated/video.mp4',
      videoType: 'Image-to-video',
    },
  ]);

  assert.deepEqual(
    getMediaCatalogSnapshot().map(({ id, origin, availability }) => ({ id, origin, availability })),
    [
      {
        id: 'upload:https://storage.flaq.ai/uploads/2026/09/17/source.mp4',
        origin: 'upload',
        availability: 'cloud-only',
      },
      { id: 'generated-video:video-task', origin: 'generated', availability: 'cloud-only' },
      {
        id: 'upload:https://storage.flaq.ai/uploads/2026/09/17/reference.png',
        origin: 'upload',
        availability: 'cloud-only',
      },
      { id: 'generated-image:saved-image', origin: 'generated', availability: 'saved-locally' },
      { id: 'generated-image:failed-archive', origin: 'generated', availability: 'cloud-only' },
    ],
  );
});

test('catalog subscription observes each adapter and stops cleanly', () => {
  let changes = 0;
  const unsubscribe = subscribeMediaCatalog(() => {
    changes++;
  });

  recordReferenceUploads(
    [{ data: new File(['image'], 'reference.png', { type: 'image/png' }), type: 'image/png' }],
    ['https://storage.flaq.ai/reference.png'],
  );
  writeLocalHistory(imageHistoryKey, []);
  writeLocalHistory(videoHistoryKey, []);
  const crossTabUpload = new Event('storage') as StorageEvent;
  Object.defineProperty(crossTabUpload, 'key', { value: MEDIA_LIBRARY_UPLOADS_KEY });
  window.dispatchEvent(crossTabUpload);
  assert.equal(changes, 4);

  unsubscribe();
  writeLocalHistory(imageHistoryKey, [{ id: 'ignored' }]);
  assert.equal(changes, 4);
});

test('catalog migrates legacy image history and removes deleted history without touching files', () => {
  localStorage.setItem(
    'flaq_image_history',
    JSON.stringify([
      {
        id: 'legacy-image',
        prompt: 'Legacy work',
        createTime: 10,
        url: 'https://storage.flaq.ai/generated/legacy.png',
        thumbnailUrl: '',
        resolution: '512x512',
        status: 'completed',
        localPath: '/media/legacy.png',
      },
    ]),
  );

  assert.equal(getMediaCatalogSnapshot()[0]?.availability, 'saved-locally');
  assert.equal(localStorage.getItem('flaq_image_history'), null);
  assert.ok(localStorage.getItem(imageHistoryKey));

  deleteImageHistoryItem('legacy-image');
  assert.deepEqual(getMediaCatalogSnapshot(), []);
});

test('catalog reads every local history record without an arbitrary page limit', () => {
  writeLocalHistory(
    imageHistoryKey,
    Array.from({ length: 1001 }, (_, index) => ({
      id: `image-${index}`,
      prompt: `Image ${index}`,
      createTime: index,
      url: `https://storage.flaq.ai/generated/${index}.png`,
      thumbnailUrl: '',
      resolution: '512x512',
      status: 'completed',
    })),
  );
  assert.equal(getMediaCatalogSnapshot().length, 1001);
});
