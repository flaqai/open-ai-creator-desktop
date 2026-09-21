import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { access, appendFile, copyFile, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const RELEASE_ASSETS = [
  {
    name: 'Flaq-Creator-macos-arm64.dmg',
    target: 'macos-arm64',
    platform: 'macos',
    arch: 'arm64',
    type: 'dmg',
    extension: '.dmg',
  },
  {
    name: 'Flaq-Creator-macos-arm64.zip',
    target: 'macos-arm64',
    platform: 'macos',
    arch: 'arm64',
    type: 'app-zip',
    extension: '.zip',
  },
  {
    name: 'Flaq-Creator-macos-x64.dmg',
    target: 'macos-x64',
    platform: 'macos',
    arch: 'x64',
    type: 'dmg',
    extension: '.dmg',
  },
  {
    name: 'Flaq-Creator-macos-x64.zip',
    target: 'macos-x64',
    platform: 'macos',
    arch: 'x64',
    type: 'app-zip',
    extension: '.zip',
  },
  {
    name: 'Flaq-Creator-windows-x64-setup.exe',
    target: 'windows-x64',
    platform: 'windows',
    arch: 'x64',
    type: 'nsis',
    extension: '.exe',
  },
];

export const RELEASE_FILE_NAMES = [...RELEASE_ASSETS.map((asset) => asset.name), 'SHA256SUMS', 'release-manifest.json'];

const TARGETS = {
  'macos-arm64': {
    id: 'macos-arm64',
    name: 'macOS Apple Silicon',
    runner: 'macos-15',
    rustTarget: 'aarch64-apple-darwin',
    bundles: 'app,dmg',
  },
  'macos-x64': {
    id: 'macos-x64',
    name: 'macOS Intel',
    runner: 'macos-15-intel',
    rustTarget: 'x86_64-apple-darwin',
    bundles: 'app,dmg',
  },
  'windows-x64': {
    id: 'windows-x64',
    name: 'Windows x64',
    runner: 'windows-2025',
    rustTarget: 'x86_64-pc-windows-msvc',
    bundles: 'nsis',
  },
};

// Keep .msi in the rejected installer set so a stale or accidentally produced MSI
// cannot silently enter a candidate or formal release.
const INSTALLER_EXTENSIONS = new Set(['.dmg', '.zip', '.exe', '.msi']);

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(root) {
  const files = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(file);
      else if (entry.isFile()) files.push(file);
    }
  }
  await visit(root);
  return files;
}

function packageVersionFromCargo(source) {
  const start = source.indexOf('[package]');
  if (start < 0) throw new Error('Could not find [package] in src-tauri/Cargo.toml.');
  const remainder = source.slice(start + '[package]'.length);
  const nextSection = remainder.search(/\n\[/);
  const packageSection = nextSection < 0 ? remainder : remainder.slice(0, nextSection);
  const version = packageSection.match(/^version\s*=\s*"([^"]+)"/m)?.[1];
  if (!version) throw new Error('Could not read the package version from src-tauri/Cargo.toml.');
  return version;
}

function packageVersionFromLock(source) {
  const entry = source.match(/\[\[package\]\]\s*\nname = "flaq-creator"\s*\nversion = "([^"]+)"/m);
  if (!entry) throw new Error('Could not read flaq-creator from src-tauri/Cargo.lock.');
  return entry[1];
}

export function releaseMatrix(target = 'all') {
  if (target === 'all') return Object.values(TARGETS);
  if (!(target in TARGETS)) throw new Error(`Unsupported desktop release target: ${target}`);
  return [TARGETS[target]];
}

export async function readReleaseMetadata(projectRoot, { tag = '', target = 'all' } = {}) {
  const [packageJson, tauriConfig, cargoToml, cargoLock] = await Promise.all([
    readFile(path.join(projectRoot, 'package.json'), 'utf8').then(JSON.parse),
    readFile(path.join(projectRoot, 'src-tauri/tauri.conf.json'), 'utf8').then(JSON.parse),
    readFile(path.join(projectRoot, 'src-tauri/Cargo.toml'), 'utf8'),
    readFile(path.join(projectRoot, 'src-tauri/Cargo.lock'), 'utf8'),
  ]);
  const versions = {
    packageJson: packageJson.version,
    tauri: tauriConfig.version,
    cargo: packageVersionFromCargo(cargoToml),
    cargoLock: packageVersionFromLock(cargoLock),
  };
  const unique = new Set(Object.values(versions));
  if (unique.size !== 1) {
    throw new Error(`Desktop release versions do not match: ${JSON.stringify(versions)}`);
  }
  const version = versions.packageJson;
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`Desktop release version is invalid: ${version}`);
  }
  const expectedTag = `desktop-v${version}`;
  if (tag && tag !== expectedTag) throw new Error(`Release tag ${tag} does not match ${expectedTag}.`);
  const notes = path.join(projectRoot, 'docs/releases', `${version}.md`);
  if (!(await exists(notes))) throw new Error(`Missing bilingual release notes: docs/releases/${version}.md`);
  return { version, expectedTag, notes, matrix: releaseMatrix(target), versions };
}

export async function normalizeCandidate({ target, bundleRoot, output }) {
  const expected = RELEASE_ASSETS.filter((asset) => asset.target === target);
  if (!expected.length) throw new Error(`Unsupported desktop release target: ${target}`);
  const files = await walkFiles(bundleRoot);
  const installers = files.filter((file) => INSTALLER_EXTENSIONS.has(path.extname(file).toLowerCase()));
  if (installers.length !== expected.length) {
    throw new Error(
      `${target} produced ${installers.length} installer(s), expected ${expected.length}: ${installers.map((file) => path.basename(file)).join(', ')}`,
    );
  }
  await mkdir(output, { recursive: true });
  const normalized = [];
  for (const asset of expected) {
    const matches = installers.filter((file) => path.extname(file).toLowerCase() === asset.extension);
    if (matches.length !== 1) {
      throw new Error(`${target} must produce exactly one ${asset.extension} installer, found ${matches.length}.`);
    }
    const destination = path.join(output, asset.name);
    await copyFile(matches[0], destination);
    normalized.push(asset.name);
  }
  await writeFile(
    path.join(output, `${target}.candidate.json`),
    `${JSON.stringify({ schemaVersion: 1, target, assets: normalized.sort() }, null, 2)}\n`,
  );
  return normalized.sort();
}

export async function sha256File(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}

export async function assembleRelease({ input, output, version, tag, commit }) {
  if (tag !== `desktop-v${version}`) throw new Error(`Release tag ${tag} does not match desktop-v${version}.`);
  if (!/^[0-9a-f]{40}$/i.test(commit)) throw new Error('Release commit must be a full 40-character SHA.');
  const files = await walkFiles(input);
  const installable = files.filter((file) => INSTALLER_EXTENSIONS.has(path.extname(file).toLowerCase()));
  const expectedNames = new Set(RELEASE_ASSETS.map((asset) => asset.name));
  const unexpected = installable.filter((file) => !expectedNames.has(path.basename(file)));
  if (unexpected.length) {
    throw new Error(`Unexpected installer assets: ${unexpected.map((file) => path.basename(file)).join(', ')}`);
  }
  await mkdir(output, { recursive: true });
  const assets = [];
  for (const asset of RELEASE_ASSETS) {
    const matches = installable.filter((file) => path.basename(file) === asset.name);
    if (matches.length !== 1) throw new Error(`Expected exactly one ${asset.name}, found ${matches.length}.`);
    const destination = path.join(output, asset.name);
    await copyFile(matches[0], destination);
    assets.push({
      name: asset.name,
      platform: asset.platform,
      arch: asset.arch,
      type: asset.type,
      size: (await stat(destination)).size,
      sha256: await sha256File(destination),
    });
  }
  assets.sort((left, right) => left.name.localeCompare(right.name));
  const manifestPath = path.join(output, 'release-manifest.json');
  await writeFile(
    manifestPath,
    `${JSON.stringify({ schemaVersion: 1, product: 'Flaq Creator', version, tag, commit, assets }, null, 2)}\n`,
  );
  const checksums = [...assets.map((asset) => ({ name: asset.name, sha256: asset.sha256 }))];
  checksums.push({ name: 'release-manifest.json', sha256: await sha256File(manifestPath) });
  checksums.sort((left, right) => left.name.localeCompare(right.name));
  await writeFile(
    path.join(output, 'SHA256SUMS'),
    `${checksums.map((entry) => `${entry.sha256}  ${entry.name}`).join('\n')}\n`,
  );
  await verifyReleaseDirectory(output);
  return { assets, checksums };
}

export async function verifyReleaseDirectory(directory) {
  const entries = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
  const expected = [...RELEASE_FILE_NAMES].sort();
  if (JSON.stringify(entries) !== JSON.stringify(expected)) {
    throw new Error(`Release directory must contain exactly ${expected.join(', ')}; found ${entries.join(', ')}.`);
  }
  const sums = (await readFile(path.join(directory, 'SHA256SUMS'), 'utf8'))
    .trim()
    .split('\n')
    .map((line) => line.match(/^([0-9a-f]{64})  (.+)$/i))
    .map((match) => {
      if (!match) throw new Error('SHA256SUMS contains an invalid line.');
      return { sha256: match[1].toLowerCase(), name: match[2] };
    });
  const expectedChecksummed = [...RELEASE_ASSETS.map((asset) => asset.name), 'release-manifest.json'].sort();
  if (JSON.stringify(sums.map((entry) => entry.name).sort()) !== JSON.stringify(expectedChecksummed)) {
    throw new Error('SHA256SUMS does not cover every release installer and release-manifest.json exactly once.');
  }
  for (const entry of sums) {
    if ((await sha256File(path.join(directory, entry.name))) !== entry.sha256) {
      throw new Error(`Checksum mismatch for ${entry.name}.`);
    }
  }
  const manifest = JSON.parse(await readFile(path.join(directory, 'release-manifest.json'), 'utf8'));
  if (manifest.schemaVersion !== 1 || manifest.product !== 'Flaq Creator') {
    throw new Error('release-manifest.json has an unsupported identity or schema version.');
  }
  if (
    JSON.stringify(manifest.assets.map((asset) => asset.name).sort()) !==
    JSON.stringify(RELEASE_ASSETS.map((asset) => asset.name).sort())
  ) {
    throw new Error('release-manifest.json does not describe the exact installer set.');
  }
  return manifest;
}

export async function verifyRemoteRelease({ releaseDirectory, metadataFile, expectedCommit }) {
  const manifest = await verifyReleaseDirectory(releaseDirectory);
  const remote = JSON.parse(await readFile(metadataFile, 'utf8'));
  if (!remote.isDraft) throw new Error('Release must remain a draft until remote assets are verified.');
  if (remote.targetCommitish !== expectedCommit) {
    throw new Error(`Remote release targets ${remote.targetCommitish}, expected ${expectedCommit}.`);
  }
  const local = new Map();
  for (const name of RELEASE_FILE_NAMES) local.set(name, (await stat(path.join(releaseDirectory, name))).size);
  const remoteAssets = new Map(remote.assets.map((asset) => [asset.name, asset.size]));
  if (JSON.stringify([...remoteAssets.keys()].sort()) !== JSON.stringify([...local.keys()].sort())) {
    throw new Error('Remote release assets do not match the local release file set.');
  }
  for (const [name, size] of local) {
    if (remoteAssets.get(name) !== size) throw new Error(`Remote release size mismatch for ${name}.`);
  }
  if (manifest.commit !== expectedCommit)
    throw new Error('Local release manifest commit does not match the release target.');
}

function parseArguments(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (!argument.startsWith('--')) throw new Error(`Unexpected argument: ${argument}`);
    const key = argument.slice(2);
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) throw new Error(`Missing value for --${key}`);
    values[key] = value;
    index++;
  }
  return values;
}

async function writeOutputs(values) {
  if (!process.env.GITHUB_OUTPUT) {
    console.log(JSON.stringify(values));
    return;
  }
  await appendFile(
    process.env.GITHUB_OUTPUT,
    `${Object.entries(values)
      .map(([key, value]) => `${key}=${typeof value === 'string' ? value : JSON.stringify(value)}`)
      .join('\n')}\n`,
  );
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const args = parseArguments(rest);
  if (command === 'metadata') {
    const metadata = await readReleaseMetadata(process.cwd(), {
      tag: args.tag || '',
      target: args.target || 'all',
    });
    await writeOutputs({
      version: metadata.version,
      tag: metadata.expectedTag,
      notes: path.relative(process.cwd(), metadata.notes).split(path.sep).join('/'),
      matrix: { include: metadata.matrix },
    });
    return;
  }
  if (command === 'normalize') {
    await normalizeCandidate({ target: args.target, bundleRoot: args['bundle-root'], output: args.output });
    return;
  }
  if (command === 'assemble') {
    await assembleRelease({
      input: args.input,
      output: args.output,
      version: args.version,
      tag: args.tag,
      commit: args.commit,
    });
    return;
  }
  if (command === 'verify') {
    await verifyReleaseDirectory(args.directory);
    return;
  }
  if (command === 'verify-remote') {
    await verifyRemoteRelease({
      releaseDirectory: args.directory,
      metadataFile: args.metadata,
      expectedCommit: args.commit,
    });
    return;
  }
  throw new Error(`Unknown desktop release command: ${command || '<missing>'}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main();
}
