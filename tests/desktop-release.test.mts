import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  assembleRelease,
  normalizeCandidate,
  readReleaseMetadata,
  RELEASE_FILE_NAMES,
  releaseMatrix,
  verifyReleaseDirectory,
} from '../scripts/desktop-release.mjs';

const repositoryRoot = path.resolve(import.meta.dirname, '..');
const commit = '0123456789abcdef0123456789abcdef01234567';

test('desktop release metadata keeps all application versions and tags aligned', async () => {
  const metadata = await readReleaseMetadata(repositoryRoot, { tag: 'desktop-v1.1.0', target: 'all' });
  assert.equal(metadata.version, '1.1.0');
  assert.equal(metadata.expectedTag, 'desktop-v1.1.0');
  assert.deepEqual(
    metadata.matrix.map((entry) => entry.id),
    ['macos-arm64', 'macos-x64', 'windows-x64'],
  );
  await assert.rejects(
    readReleaseMetadata(repositoryRoot, { tag: 'desktop-v9.9.9', target: 'all' }),
    /does not match desktop-v1\.1\.0/,
  );
});

test('manual candidate targets select one platform without changing the release contract', () => {
  assert.deepEqual(
    releaseMatrix('macos-arm64').map((entry) => entry.id),
    ['macos-arm64'],
  );
  assert.deepEqual(
    releaseMatrix('macos-x64').map((entry) => entry.id),
    ['macos-x64'],
  );
  assert.deepEqual(
    releaseMatrix('windows-x64').map((entry) => entry.id),
    ['windows-x64'],
  );
  assert.throws(() => releaseMatrix('linux-x64'), /Unsupported desktop release target/);
});

test('candidate normalization produces stable public names and rejects extra installers', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'flaq-candidate-test-'));
  try {
    const bundle = path.join(root, 'bundle');
    const output = path.join(root, 'output');
    await mkdir(path.join(bundle, 'nsis'), { recursive: true });
    await mkdir(path.join(bundle, 'msi'), { recursive: true });
    await writeFile(path.join(bundle, 'nsis', 'Flaq Creator_1.1.0_x64-setup.exe'), 'exe');
    await writeFile(path.join(bundle, 'msi', 'Flaq Creator_1.1.0_x64_en-US.msi'), 'msi');
    assert.deepEqual(await normalizeCandidate({ target: 'windows-x64', bundleRoot: bundle, output }), [
      'Flaq-Creator-windows-x64-setup.exe',
      'Flaq-Creator-windows-x64.msi',
    ]);

    await writeFile(path.join(bundle, 'nsis', 'unexpected.exe'), 'duplicate');
    await assert.rejects(
      normalizeCandidate({ target: 'windows-x64', bundleRoot: bundle, output }),
      /produced 3 installer\(s\), expected 2/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('release assembly emits an exact deterministic file set with verified checksums', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'flaq-release-test-'));
  try {
    const input = path.join(root, 'candidates');
    const output = path.join(root, 'release');
    await mkdir(input, { recursive: true });
    const inputs = {
      'Flaq-Creator-macos-arm64.dmg': 'arm64-dmg',
      'Flaq-Creator-macos-x64.dmg': 'x64-dmg',
      'Flaq-Creator-windows-x64-setup.exe': 'windows-exe',
      'Flaq-Creator-windows-x64.msi': 'windows-msi',
    };
    for (const [name, value] of Object.entries(inputs)) await writeFile(path.join(input, name), value);

    const assembled = await assembleRelease({
      input,
      output,
      version: '1.1.0',
      tag: 'desktop-v1.1.0',
      commit,
    });
    assert.equal(assembled.assets.length, 4);
    assert.equal(assembled.checksums.length, 5);
    const manifest = await verifyReleaseDirectory(output);
    assert.deepEqual(
      manifest.assets.map((asset: { name: string }) => asset.name),
      [
        'Flaq-Creator-macos-arm64.dmg',
        'Flaq-Creator-macos-x64.dmg',
        'Flaq-Creator-windows-x64-setup.exe',
        'Flaq-Creator-windows-x64.msi',
      ],
    );
    assert.deepEqual((await readdir(output)).sort(), [...RELEASE_FILE_NAMES].sort());
    assert.match(await readFile(path.join(output, 'SHA256SUMS'), 'utf8'), /release-manifest\.json/);

    await writeFile(path.join(output, 'unexpected.zip'), 'extra');
    await assert.rejects(verifyReleaseDirectory(output), /must contain exactly/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('release assembly rejects missing and unexpected installers', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'flaq-release-invalid-test-'));
  try {
    await mkdir(path.join(root, 'input'), { recursive: true });
    await writeFile(path.join(root, 'input', 'Flaq-Creator-macos-arm64.dmg'), 'only-one');
    await writeFile(path.join(root, 'input', 'rogue.exe'), 'rogue');
    await assert.rejects(
      assembleRelease({
        input: path.join(root, 'input'),
        output: path.join(root, 'output'),
        version: '1.1.0',
        tag: 'desktop-v1.1.0',
        commit,
      }),
      /Unexpected installer assets: rogue\.exe/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('desktop workflow publishes only after the candidate matrix and keeps manual runs candidate-only', async () => {
  const workflow = await readFile(path.join(repositoryRoot, '.github/workflows/desktop-build.yml'), 'utf8');
  assert.match(workflow, /workflow_dispatch:[\s\S]*target:[\s\S]*macos-arm64[\s\S]*windows-x64/);
  assert.match(workflow, /release:\n[\s\S]*if: startsWith\(github\.ref, 'refs\/tags\/desktop-v'\)/);
  assert.match(workflow, /needs: \[preflight, package\]/);
  assert.match(workflow, /permissions:\n\s+contents: write/);
  assert.doesNotMatch(workflow.match(/package:[\s\S]*?\n  release:/)?.[0] || '', /gh release create/);
});
