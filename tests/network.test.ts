import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { prepareNativeRequestInit } from '../lib/platform/http';
import { mediaFileName, mediaRequestUrl } from '../lib/platform/media';
import { detectImageFormat, imageFormatFromUrl } from '../lib/utils/fileUtils';
import { fetchWithRetry } from '../lib/utils/promiseUtils';
import { buildOpenApiUrl, createOpenApiHeaders, openApiFetchJson } from '../network/clientFetch';
import { testApiConnection } from '../network/connection-test';
import { createImageTask, getImageTask } from '../network/image/client';
import { createFlaqSignedUrls } from '../network/upload/flaq-storage';
import { uploadFiles } from '../network/upload/upload-files';
import { createVideoTask, getVideoTask } from '../network/video/client';

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});
const config = { baseUrl: 'https://api.example.test', clientKey: 'test-only-key' };
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

test('image format detection uses the URL first and degrades quietly when probing fails', async () => {
  let requests = 0;
  const failingFetcher = async () => {
    requests += 1;
    throw new Error('network unavailable');
  };

  assert.equal(imageFormatFromUrl('https://asset.test/image.JPEG?token=secret'), 'JPG');
  assert.equal(await detectImageFormat('https://asset.test/image.png', failingFetcher), 'PNG');
  assert.equal(requests, 0);
  assert.equal(await detectImageFormat('https://asset.test/image', failingFetcher), null);
  assert.equal(requests, 1);
});

test('native requests materialize Blob bodies before the Tauri transport reads them', async () => {
  const source = new Blob(['stable upload'], { type: 'image/png' });
  const prepared = await prepareNativeRequestInit({ method: 'PUT', body: source });
  assert.ok(prepared?.body instanceof ArrayBuffer);
  assert.equal(new TextDecoder().decode(prepared.body), 'stable upload');

  class UnreadableBlob extends Blob {
    override arrayBuffer(): Promise<ArrayBuffer> {
      return Promise.reject(new Error('Blob loading failed'));
    }
  }
  await assert.rejects(
    prepareNativeRequestInit({ method: 'PUT', body: new UnreadableBlob(['lost']) }),
    /select the file again/,
  );
});

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

test('connection test uses the dedicated key status endpoint and its availability result', async () => {
  let request: { url: string; init?: RequestInit } | undefined;
  assert.equal(
    await testApiConnection(config, async (url, init) => {
      request = { url: String(url), init };
      return json({ code: 0, msg: 'ok', data: { client_key: 'redacted', status: 1 } });
    }),
    'verified',
  );
  assert.equal(request?.url, 'https://api.example.test/api/v1/key/status');
  assert.equal(request?.init?.method, 'POST');
  assert.equal(new Headers(request?.init?.headers).get('Authorization'), null);
  assert.deepEqual(JSON.parse(request?.init?.body as string), { client_key: 'test-only-key' });

  for (const status of [401, 403]) {
    await assert.rejects(testApiConnection(config, async () => json({ message: 'service error' }, status)));
  }
  await assert.rejects(
    testApiConnection(config, async () => json({ code: 0, msg: 'key unavailable', data: { status: 0 } })),
    /key unavailable/,
  );
  await assert.rejects(
    testApiConnection(config, async () => json({ message: 'service unavailable' }, 503)),
    /503/,
  );
  await assert.rejects(
    testApiConnection(config, async () => new Response('<html>gateway</html>')),
    /not authorized/,
  );
  await assert.rejects(
    testApiConnection(config, async () => {
      throw new Error('network unavailable');
    }),
    /network unavailable/,
  );
});

test('built-in Flaq storage requests authenticated presigned URLs without R2 credentials', async () => {
  let request: { url: string; init?: RequestInit } | undefined;
  globalThis.fetch = async (url, init) => {
    request = { url: String(url), init };
    return json({
      code: 200,
      total: 2,
      msg: 'success',
      rows: [
        { signedUrl: 'https://upload.test/1', url: 'https://asset.test/1' },
        { signedUrl: 'https://upload.test/2', url: 'https://asset.test/2' },
      ],
    });
  };

  const result = await createFlaqSignedUrls(['image/png', 'video/mp4'], true, {
    config,
    site: 'desktop-test',
  });

  assert.equal(request?.url, 'https://api.example.test/image/presignedUrl');
  assert.equal(request?.init?.method, 'POST');
  assert.equal(new Headers(request?.init?.headers).get('Authorization'), 'Bearer test-only-key');
  assert.deepEqual(JSON.parse(request?.init?.body as string), {
    mineType: ['image/png', 'video/mp4'],
    site: 'desktop-test',
    isForever: true,
  });
  assert.deepEqual(
    result.rows.map((row) => row.mimeType),
    ['image/png', 'video/mp4'],
  );

  globalThis.fetch = async () => json({ code: 401, msg: 'not authorized', data: null });
  await assert.rejects(createFlaqSignedUrls(['image/png'], false, { config, site: 'desktop-test' }), /not authorized/);
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
