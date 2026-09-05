import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { mediaFileName, mediaRequestUrl } from '../lib/platform/media';
import { fetchWithRetry } from '../lib/utils/promiseUtils';
import { buildOpenApiUrl, createOpenApiHeaders, openApiFetchJson } from '../network/clientFetch';
import { testApiConnection } from '../network/connection-test';
import { createImageTask, getImageTask } from '../network/image/client';
import { uploadFiles } from '../network/upload/upload-files';
import { createVideoTask, getVideoTask } from '../network/video/client';

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});
const config = { baseUrl: 'https://api.example.test', clientKey: 'test-only-key' };
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

test('base URL validation and Headers instances preserve custom headers', () => {
  assert.equal(
    buildOpenApiUrl(' https://api.example.test/gateway/ ', '/api/v1/image/task'),
    'https://api.example.test/gateway/api/v1/image/task',
  );
  for (const url of ['file:///tmp', 'https://u:p@example.test', 'https://example.test?secret=1'])
    assert.throws(() => buildOpenApiUrl(url, '/api'));
  const headers = new Headers(
    createOpenApiHeaders('new-key', new Headers({ 'X-Custom': 'value', Authorization: 'old' })),
  );
  assert.equal(headers.get('X-Custom'), 'value');
  assert.equal(headers.get('Authorization'), 'Bearer new-key');
});

test('image/video submit and poll use exact upstream contracts including multimodal inputs', async () => {
  const requests: { url: string; init?: RequestInit }[] = [];
  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), init });
    return json({ code: 0, data: { task_id: 'task-1', task_status: 'submitted' } });
  };
  const image = {
    model_name: 'gpt-image-2',
    prompt: 'test',
    width: 1024,
    height: 1024,
    image_url_list: ['https://assets.test/a.png'],
    seed: 7,
  };
  const video = {
    model_name: 'reference-model',
    prompt: '@image1',
    images: ['https://assets.test/a.png'],
    videos: ['https://assets.test/a.mp4'],
    audios: ['https://assets.test/a.mp3'],
    files: ['https://assets.test/a.pdf'],
    links: ['https://example.test'],
    image_url: 'https://assets.test/start.png',
    image_end_url: 'https://assets.test/end.png',
    sound: true,
  };
  await createImageTask(config, image);
  await getImageTask(config, 'task-1');
  await createVideoTask(config, video);
  await getVideoTask(config, 'task-2');
  assert.deepEqual(
    requests.map((r) => [r.url, r.init?.method]),
    [
      ['https://api.example.test/api/v1/image/task', 'POST'],
      ['https://api.example.test/api/v1/image/task-1', 'GET'],
      ['https://api.example.test/api/v1/video/task', 'POST'],
      ['https://api.example.test/api/v1/video/task-2', 'GET'],
    ],
  );
  assert.deepEqual(JSON.parse(requests[0].init?.body as string), image);
  assert.deepEqual(JSON.parse(requests[2].init?.body as string), video);
});

test('invalid success body is rejected rather than treated as a generated task', async () => {
  globalThis.fetch = async () => new Response('<html>gateway</html>');
  await assert.rejects(openApiFetchJson(config, '/api'), /invalid JSON/);
});

test('connection test distinguishes auth errors, outages, invalid endpoints and reachability', async () => {
  for (const status of [401, 403, 429, 500, 502]) {
    await assert.rejects(testApiConnection(config, async () => json({ message: 'service error' }, status)));
  }
  await assert.rejects(testApiConnection(config, async () => new Response('<html>404</html>', { status: 404 })));
  await assert.rejects(testApiConnection(config, async () => json({ message: 'route not found' }, 404)));
  assert.equal(
    await testApiConnection(config, async () => json({ error: { message: 'Task not found' } }, 404)),
    'reachable',
  );
  assert.equal(await testApiConnection(config, async () => json({ data: { task_status: 'processing' } })), 'verified');
});

test('retry handles transient failures, avoids permanent retries and respects cancellation', async () => {
  let calls = 0;
  await fetchWithRetry('https://example.test', {}, { delay: 0 }, async () =>
    ++calls < 3 ? new Response('', { status: 503 }) : new Response('ok'),
  );
  assert.equal(calls, 3);
  calls = 0;
  await assert.rejects(
    fetchWithRetry('https://example.test', {}, { delay: 0 }, async () => {
      calls++;
      return new Response('', { status: 403 });
    }),
  );
  assert.equal(calls, 1);
  const controller = new AbortController();
  controller.abort(new Error('cancelled'));
  await assert.rejects(fetchWithRetry('https://example.test', { signal: controller.signal }), /cancelled/);
});

test('upload validates all signed URLs before sending files', async () => {
  let uploads = 0;
  const files = [{ data: new File(['test'], 'a.png', { type: 'image/png' }), type: 'image/png' }];
  await assert.rejects(
    uploadFiles(files, undefined, {
      sign: async () => ({ rows: [] }),
      put: async () => {
        uploads++;
        return new Response();
      },
    }),
    /incomplete/,
  );
  assert.equal(uploads, 0);
});

test('uploads keep reference order and use at most three transfers', async () => {
  let active = 0;
  let max = 0;
  const files = Array.from({ length: 8 }, (_, i) => ({ data: new File([String(i)], `${i}.png`), type: 'image/png' }));
  const result = await uploadFiles(files, undefined, {
    sign: async () => ({
      rows: files.map((_, i) => ({ signedUrl: `https://upload.test/${i}`, url: `https://asset.test/${i}` })),
    }),
    put: async () => {
      active++;
      max = Math.max(max, active);
      await new Promise((r) => setTimeout(r, 2));
      active--;
      return new Response();
    },
  });
  assert.equal(max, 3);
  assert.deepEqual(
    result,
    files.map((_, i) => `https://asset.test/${i}`),
  );
});

test('desktop media bypasses unavailable web proxy and signed URL filenames remain valid', () => {
  assert.equal(mediaRequestUrl('https://asset.test/a.mp4?token=x', true), 'https://asset.test/a.mp4?token=x');
  assert.match(mediaRequestUrl('https://asset.test/a.png', false), /^\/api\/proxy-image/);
  assert.equal(mediaRequestUrl('blob:local', false), 'blob:local');
  assert.equal(mediaFileName('https://asset.test/my%20image.png?token=x#hash'), 'my image.png');
});
