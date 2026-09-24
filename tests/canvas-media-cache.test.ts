import assert from 'node:assert/strict';
import test from 'node:test';

import 'fake-indexeddb/auto';

import JSZip from 'jszip';

import {
  readCanvasMedia,
  readCanvasMediaPath,
  resolveCanvasMediaBlob,
  storeCanvasMedia,
  storeCanvasMediaPath,
} from '../components/infinite-canvas/runtime/persistence/canvas-media-cache';
import { exportCanvasProjects } from '../components/infinite-canvas/runtime/persistence/project-archive';
import { createEmptyCanvasProject } from '../components/infinite-canvas/runtime/persistence/project-codec';

test('canvas uploads keep a reusable local blob without persisting object URLs', async () => {
  const url = 'https://storage.example.test/canvas/upload.png';
  const image = new Blob(['source-image'], { type: 'image/png' });
  await storeCanvasMedia(url, image);
  assert.equal(await (await readCanvasMedia(url))?.text(), 'source-image');
  const fetched = await resolveCanvasMediaBlob(url, async () => {
    throw new Error('remote should not be used');
  });
  assert.equal(await fetched.text(), 'source-image');
});

test('canvas generated media can retain a native archive path', async () => {
  const url = 'https://storage.example.test/canvas/result.mp4';
  await storeCanvasMediaPath(url, '/private/example/result.mp4');
  assert.equal(await readCanvasMediaPath(url), '/private/example/result.mp4');
  assert.equal(await readCanvasMedia(url), null);
});

test('canvas ZIP export uses local image data when the network is unavailable', async () => {
  const url = 'https://storage.example.test/canvas/offline.png';
  await storeCanvasMedia(url, new Blob(['offline-image'], { type: 'image/png' }));
  const empty = createEmptyCanvasProject('offline-project', 'Offline');
  const project = {
    ...empty,
    nodes: [
      {
        id: 'image-1',
        type: 'image',
        title: 'Photo',
        position: { x: 0, y: 0 },
        width: 200,
        height: 160,
        metadata: { content: url },
      },
    ],
  };
  const archive = await exportCanvasProjects([project], 'offline', async () => {
    throw new Error('network should not be used');
  });
  const zip = await JSZip.loadAsync(await archive.blob.arrayBuffer());
  const media = Object.keys(zip.files).find((path) => path.endsWith('.png'));
  assert.ok(media);
  assert.equal(await zip.file(media)?.async('string'), 'offline-image');
});
