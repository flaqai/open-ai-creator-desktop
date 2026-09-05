import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createSerialQueue } from '../lib/utils/serial-queue';

test('shared media runtime serializes jobs and recovers after a failed trim', async () => {
  const queue = createSerialQueue();
  const events: string[] = [];
  const first = queue(async () => {
    events.push('start first');
    await new Promise((resolve) => setImmediate(resolve));
    events.push('fail first');
    throw new Error('bad media');
  });
  const second = queue(async () => {
    events.push('start second');
    return 'output.mp4';
  });
  await assert.rejects(first, /bad media/);
  assert.equal(await second, 'output.mp4');
  assert.deepEqual(events, ['start first', 'fail first', 'start second']);
});
