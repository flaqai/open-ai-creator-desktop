import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createDesktopSignedUrls, validateR2Config } from '../network/upload/desktop-r2';

const config = {
  accountId: 'test-account',
  accessKeyId: 'test-access-key',
  secretAccessKey: 'test-secret-key',
  bucketName: 'test-bucket',
  publicDomain: 'assets.example.test',
};
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
