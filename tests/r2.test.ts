import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

import { createDesktopSignedUrls, validateR2Config } from '../network/upload/desktop-r2';
import { createUploadAuthorizer } from '../network/upload/upload-policy';

const config = {
  accountId: 'test-account',
  accessKeyId: 'test-access-key',
  secretAccessKey: 'test-secret-key',
  bucketName: 'test-bucket',
  publicDomain: 'assets.example.test',
};

beforeEach(() => {
  Object.defineProperty(globalThis, 'window', { value: new EventTarget(), configurable: true });
});

test('R2 signing keeps credentials out of public URLs and retains input order', async () => {
  const result = await createDesktopSignedUrls(['image/png', 'video/mp4', 'application/pdf'], config);
  assert.equal(result.rows.length, 3);
  for (const [index, row] of result.rows.entries()) {
    const upload = new URL(row.signedUrl!);
    const asset = new URL(row.url!);
    assert.equal(upload.hostname, 'test-account.r2.cloudflarestorage.com');
    assert.equal(asset.hostname, 'assets.example.test');
    assert.equal(asset.search, '');
    assert.ok(upload.searchParams.has('X-Amz-Signature'));
    assert.ok(row.url!.endsWith(['.png', '.mp4', '.pdf'][index]));
    assert.ok(!row.url!.includes(config.secretAccessKey));
  }
});
test('R2 validation rejects incomplete or malformed config before persisting', () => {
  assert.throws(() => validateR2Config({ ...config, accessKeyId: '' }));
  assert.throws(() => validateR2Config({ ...config, accountId: 'account.example/other' }));
  assert.throws(() => validateR2Config({ ...config, publicDomain: 'https://user:secret@example.test' }));
});

test('desktop upload policy selects custom R2 without consulting built-in storage', async () => {
  let bundledCalls = 0;
  let flaqCalls = 0;
  const custom = { ...config, bucketName: 'custom-bucket' };
  const authorize = createUploadAuthorizer({
    desktop: () => true,
    provider: () => 'custom-r2',
    customConfig: async () => custom,
    bundledConfig: async () => {
      bundledCalls++;
      return config;
    },
    directR2: async (mimeTypes, input) => ({
      rows: mimeTypes.map((mimeType) => ({ signedUrl: 'https://upload.test', url: input.bucketName, mimeType })),
    }),
    flaq: async () => {
      flaqCalls++;
      return { rows: [] };
    },
  });

  const result = await authorize(['image/png']);
  assert.equal(result.rows[0].url, 'custom-bucket');
  assert.equal(bundledCalls, 0);
  assert.equal(flaqCalls, 0);
});

test('built-in desktop storage prefers the packaged R2 preset and falls back to the Flaq service', async () => {
  let directCalls = 0;
  let flaqCalls = 0;
  const direct = async (mimeTypes: string[], input: typeof config) => {
    directCalls++;
    assert.deepEqual(input, config);
    return {
      rows: mimeTypes.map((mimeType) => ({ signedUrl: 'https://upload.test', url: 'https://asset.test', mimeType })),
    };
  };
  const flaq = async (mimeTypes: string[]) => {
    flaqCalls++;
    return {
      rows: mimeTypes.map((mimeType) => ({ signedUrl: 'https://fallback.test', url: 'https://asset.test', mimeType })),
    };
  };

  const withBundle = createUploadAuthorizer({
    desktop: () => true,
    provider: () => 'builtin',
    bundledConfig: async () => config,
    directR2: direct,
    flaq,
  });
  await withBundle(['image/png'], false);
  assert.equal(directCalls, 1);
  assert.equal(flaqCalls, 0);

  const withoutBundle = createUploadAuthorizer({
    desktop: () => true,
    provider: () => 'builtin',
    bundledConfig: async () => null,
    directR2: direct,
    flaq,
  });
  await withoutBundle(['video/mp4'], false);
  assert.equal(directCalls, 1);
  assert.equal(flaqCalls, 1);
});

test('web upload policy preserves the existing browser signing adapter', async () => {
  let webCalls = 0;
  const authorize = createUploadAuthorizer({
    desktop: () => false,
    provider: () => 'builtin',
    web: async (mimeTypes) => {
      webCalls++;
      return {
        rows: mimeTypes.map((mimeType) => ({ signedUrl: 'https://upload.test', url: 'https://asset.test', mimeType })),
      };
    },
  });

  await authorize(['image/png'], true);
  assert.equal(webCalls, 1);
});
