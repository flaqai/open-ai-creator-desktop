import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { safelyUnlisten } from '@/lib/desktop/tauri-listener';

const shellSource = readFileSync(new URL('../components/desktop/DesktopShell.tsx', import.meta.url), 'utf8');
const titleBarSource = readFileSync(new URL('../components/desktop/DesktopTitleBar.tsx', import.meta.url), 'utf8');

test('native listener cleanup is safe when the runtime already removed the listener', async () => {
  let attempts = 0;
  const stop = () => {
    attempts += 1;
    throw new TypeError("undefined is not an object (evaluating 'listeners[eventId].handlerId')");
  };

  await assert.doesNotReject(() => safelyUnlisten(stop));
  assert.equal(attempts, 1);
});

test('native listener cleanup also handles an asynchronous rejection', async () => {
  await assert.doesNotReject(() => safelyUnlisten(() => Promise.reject(new Error('listener is gone'))));
});

test('desktop native listeners use rejection-safe cleanup in every race path', () => {
  for (const source of [shellSource, titleBarSource]) {
    assert.doesNotMatch(source, /if \(disposed\) stop\(\)/);
    assert.doesNotMatch(source, /unlisten\?\.\(\)/);
    assert.match(source, /if \(disposed\) void safelyUnlisten\(stop\)/);
    assert.match(source, /void safelyUnlisten\(unlisten\)/);
  }
});
