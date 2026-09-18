import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { buildDesktop } from '../scripts/desktop-build.mjs';
import { desktopDevEnvironment } from '../scripts/desktop-dev.mjs';
import { prepareBundledR2 } from '../scripts/prepare-bundled-r2.mjs';
import { assertDesktopDevPortAvailable, DESKTOP_DEV_HOST, DESKTOP_DEV_PORT } from '../scripts/tauri-dev.mjs';

test('desktop development enables desktop rendering before Next starts', () => {
  const environment = desktopDevEnvironment({ EXISTING_VALUE: 'kept' });
  assert.equal(environment.EXISTING_VALUE, 'kept');
  assert.equal(environment.FLAQ_DESKTOP_RUNTIME, 'true');
  assert.equal(environment.NEXT_PUBLIC_FLAQ_DESKTOP_RUNTIME, 'true');
  assert.equal(environment.NEXT_PUBLIC_SITE_URL, 'http://localhost:31415');
});

test('desktop development uses an isolated app identity and never shares installed app data', async () => {
  const projectRoot = path.resolve(import.meta.dirname, '..');
  const packageJson = JSON.parse(await readFile(path.join(projectRoot, 'package.json'), 'utf8'));
  const production = JSON.parse(await readFile(path.join(projectRoot, 'src-tauri/tauri.conf.json'), 'utf8'));
  const development = JSON.parse(await readFile(path.join(projectRoot, 'src-tauri/tauri.dev.conf.json'), 'utf8'));

  assert.match(packageJson.scripts['desktop:dev'], /^node scripts\/tauri-dev\.mjs && tauri dev --config /);
  assert.equal(production.identifier, 'ai.flaq.creator');
  assert.equal(development.identifier, 'ai.flaq.creator.dev');
  assert.notEqual(development.identifier, production.identifier);
  assert.equal(development.productName, 'Flaq Creator Dev');
  assert.equal(development.app.windows[0].title, 'Flaq Creator Dev');
  assert.equal(development.build.devUrl, `http://${DESKTOP_DEV_HOST}:${DESKTOP_DEV_PORT}`);
  assert.match(
    development.build.beforeDevCommand,
    new RegExp(`--hostname ${DESKTOP_DEV_HOST} --port ${DESKTOP_DEV_PORT}`),
  );
});

test('desktop development refuses to attach to an already running frontend', async () => {
  const server = net.createServer();
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, DESKTOP_DEV_HOST, resolve);
  });

  try {
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    await assert.rejects(assertDesktopDevPortAvailable(address.port, DESKTOP_DEV_HOST), /already in use/);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test('desktop packaging encrypts the bundled R2 preset without leaving plaintext in generated source', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'flaq-r2-bundle-test-'));
  try {
    const output = path.join(dir, 'bundled_r2.rs');
    const config = {
      accountId: 'account-that-must-not-leak',
      accessKeyId: 'access-that-must-not-leak',
      secretAccessKey: 'secret-that-must-not-leak',
      bucketName: 'bucket-that-must-not-leak',
      publicDomain: 'https://assets-that-must-not-leak.example.test',
    };
    const result = await prepareBundledR2(dir, {
      output,
      config,
      encryptionKey: Buffer.alloc(32, 7),
      nonce: Buffer.alloc(12, 3),
    });
    const generated = await readFile(output, 'utf8');

    assert.equal(result.available, true);
    for (const secret of Object.values(config)) assert.equal(generated.includes(secret), false);
    assert.match(generated, /BUNDLED_R2_AVAILABLE: bool = true/);
    assert.match(generated, /BUNDLED_R2_CIPHERTEXT/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('desktop packaging emits an unavailable placeholder when no bundled R2 preset exists', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'flaq-r2-bundle-test-'));
  try {
    const output = path.join(dir, 'bundled_r2.rs');
    const result = await prepareBundledR2(dir, { output, environment: {} });
    assert.equal(result.available, false);
    assert.match(await readFile(output, 'utf8'), /BUNDLED_R2_AVAILABLE: bool = false/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('release packaging refuses to publish an installer without the bundled R2 preset', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'flaq-r2-bundle-test-'));
  try {
    await assert.rejects(
      prepareBundledR2(dir, {
        output: path.join(dir, 'bundled_r2.rs'),
        environment: { FLAQ_REQUIRE_BUNDLED_R2: 'true' },
      }),
      /required for this build/,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
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
