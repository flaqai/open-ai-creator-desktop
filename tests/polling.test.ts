import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PollingManager, type PollTask } from '../network/polling-manager';

const task: PollTask = { traceId: 'task', type: 'image', submitTime: Date.now() };
const tick = () => new Promise((resolve) => setImmediate(resolve));

test('reserves in-flight tasks synchronously and deduplicates concurrent starts', async () => {
  let calls = 0;
  let complete!: (status: 'done') => void;
  const manager = new PollingManager({
    poll: async () => {
      calls++;
      return new Promise((r) => {
        complete = r;
      });
    },
    timeout: () => {},
    finish: () => {},
  });
  assert.equal(manager.start(task), true);
  assert.equal(manager.start(task), false);
  assert.equal(calls, 1);
  complete('done');
  await tick();
  assert.equal(manager.size, 0);
});

test('stopping aborts active requests and cannot resurrect a polling timer', async () => {
  let complete!: (status: 'pending') => void;
  let signal!: AbortSignal;
  let finished = 0;
  const manager = new PollingManager({
    poll: async (_, s) => {
      signal = s;
      return new Promise((r) => {
        complete = r;
      });
    },
    timeout: () => {},
    finish: () => {
      finished++;
    },
    interval: 1,
  });
  manager.start(task);
  manager.stopAll();
  complete('pending');
  await tick();
  assert.equal(signal.aborted, true);
  assert.equal(manager.size, 0);
  assert.equal(finished, 1);
});

test('expired restored tasks are queried once so completed server results can be recovered', async () => {
  let expired = 0;
  let calls = 0;
  const manager = new PollingManager({
    poll: async () => {
      calls++;
      return 'done';
    },
    timeout: () => {
      expired++;
    },
    finish: () => {},
    now: () => task.submitTime + 99_000,
    maxAge: () => 1,
  });
  manager.start(task);
  await tick();
  assert.equal(calls, 1);
  assert.equal(expired, 0);
});

test('pending tasks eventually timeout and release the processing store', async () => {
  let expired = 0;
  let finished = 0;
  const manager = new PollingManager({
    poll: async () => 'pending',
    timeout: () => {
      expired++;
    },
    finish: () => {
      finished++;
    },
    now: () => task.submitTime + 1000,
    maxAge: () => 10,
  });
  manager.start(task);
  await tick();
  assert.equal(expired, 1);
  assert.equal(finished, 1);
  assert.equal(manager.size, 0);
});
