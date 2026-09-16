import assert from 'node:assert/strict';
import { test } from 'node:test';

import { generateR2Path, R2_UPLOAD_ROOT } from '../lib/utils/r2PathUtils';

test('R2 uploads share one root and use date-based directories', () => {
  const now = new Date(2026, 8, 16, 12, 0, 0);

  assert.equal(R2_UPLOAD_ROOT, 'uploads');
  assert.equal(generateR2Path('image/jpeg', { now, id: 'image123' }), 'uploads/2026/09/16/image123.jpg');
  assert.equal(generateR2Path('video/mp4', { now, id: 'video123' }), 'uploads/2026/09/16/video123.mp4');
});
