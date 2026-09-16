import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { buildDesktop } from '../scripts/desktop-build.mjs';
import { desktopDevEnvironment } from '../scripts/desktop-dev.mjs';

test('desktop development enables desktop rendering before Next starts', () => {
  const environment = desktopDevEnvironment({ EXISTING_VALUE: 'kept' });
  assert.equal(environment.EXISTING_VALUE, 'kept');
  assert.equal(environment.FLAQ_DESKTOP_RUNTIME, 'true');
  assert.equal(environment.NEXT_PUBLIC_FLAQ_DESKTOP_RUNTIME, 'true');
});

test('failed isolated builds preserve source routes and the last usable output', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'flaq-build-test-'));
  try {
    await mkdir(path.join(dir, 'app/api'), { recursive: true });
    await mkdir(path.join(dir, 'out'));
    await mkdir(path.join(dir, 'node_modules'));
    await writeFile(path.join(dir, 'app/api/route.ts'), 'original route');
    await writeFile(path.join(dir, 'out/index.html'), 'previous output');
    await assert.rejects(
      buildDesktop(dir, async (work: string) => {
        await assert.rejects(access(path.join(work, 'app/api')));
        assert.equal(await readFile(path.join(dir, 'app/api/route.ts'), 'utf8'), 'original route');
        throw new Error('simulated compiler failure');
      }),
      /simulated compiler/,
    );
    assert.equal(await readFile(path.join(dir, 'out/index.html'), 'utf8'), 'previous output');
    assert.equal(await readFile(path.join(dir, 'app/api/route.ts'), 'utf8'), 'original route');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('successful isolated builds publish output and locale-aware entry without touching source', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'flaq-build-test-'));
  try {
    await mkdir(path.join(dir, 'node_modules'));
    await buildDesktop(dir, async (work: string) => {
      await mkdir(path.join(work, 'out/zh'), { recursive: true });
      await writeFile(path.join(work, 'out/zh/index.html'), 'Chinese workspace');
    });
    assert.equal(await readFile(path.join(dir, 'out/zh/index.html'), 'utf8'), 'Chinese workspace');
    assert.match(await readFile(path.join(dir, 'out/index.html'), 'utf8'), /flaq-desktop-locale/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
