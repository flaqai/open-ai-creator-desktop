import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function plistJson(file) {
  return JSON.parse(execFileSync('/usr/bin/plutil', ['-convert', 'json', '-o', '-', file], { encoding: 'utf8' }));
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function inspectApplication(application, version, arch) {
  const plist = plistJson(path.join(application, 'Contents/Info.plist'));
  if (plist.CFBundleIdentifier !== 'ai.flaq.creator') {
    throw new Error(`Unexpected CFBundleIdentifier: ${plist.CFBundleIdentifier}`);
  }
  if (plist.CFBundleShortVersionString !== version) {
    throw new Error(`Unexpected macOS application version: ${plist.CFBundleShortVersionString}`);
  }
  const executable = path.join(application, 'Contents/MacOS', plist.CFBundleExecutable);
  const architectures = execFileSync('/usr/bin/lipo', ['-archs', executable], { encoding: 'utf8' }).trim().split(/\s+/);
  if (architectures.length !== 1 || architectures[0] !== arch) {
    throw new Error(`Expected ${arch} executable, found ${architectures.join(', ')}.`);
  }
  return { executable, plist };
}

export async function smokeMacRelease({ dmg, zip, version, arch }) {
  if (process.platform !== 'darwin') throw new Error('macOS release smoke must run on macOS.');
  if (!['arm64', 'x86_64'].includes(arch)) throw new Error(`Unsupported expected macOS architecture: ${arch}`);
  const temporary = mkdtempSync(path.join(tmpdir(), 'flaq-release-smoke-'));
  const mount = path.join(temporary, 'mounted');
  const extracted = path.join(temporary, 'zip-extracted');
  let mounted = false;
  let child;
  try {
    execFileSync('/usr/bin/hdiutil', ['attach', '-readonly', '-nobrowse', '-mountpoint', mount, path.resolve(dmg)], {
      timeout: 120_000,
      stdio: 'pipe',
    });
    mounted = true;
    const applications = readdirSync(mount).filter((entry) => entry.endsWith('.app'));
    if (applications.length !== 1)
      throw new Error(`Expected one application in the DMG, found ${applications.length}.`);
    const application = path.join(mount, applications[0]);
    const { executable, plist } = inspectApplication(application, version, arch);

    execFileSync('/usr/bin/ditto', ['-x', '-k', path.resolve(zip), extracted], {
      timeout: 120_000,
      stdio: 'pipe',
    });
    const archivedApplications = readdirSync(extracted).filter((entry) => entry.endsWith('.app'));
    if (archivedApplications.length !== 1) {
      throw new Error(`Expected one application in the ZIP, found ${archivedApplications.length}.`);
    }
    inspectApplication(path.join(extracted, archivedApplications[0]), version, arch);

    child = spawn(executable, [], {
      env: { ...process.env, HOME: temporary, TMPDIR: temporary },
      stdio: 'ignore',
    });
    await Promise.race([
      new Promise((_, reject) => child.once('error', reject)),
      new Promise((_, reject) =>
        child.once('exit', (code, signal) =>
          reject(new Error(`Packaged application exited during smoke: ${signal || code}`)),
        ),
      ),
      wait(8_000),
    ]);
    if (child.exitCode !== null) throw new Error(`Packaged application exited during smoke with ${child.exitCode}.`);
    console.log(
      `PASS ${path.basename(dmg)} and ${path.basename(zip)}: ${version}, ${plist.CFBundleIdentifier}, ${arch}, startup stable.`,
    );
  } finally {
    if (child && child.exitCode === null) {
      child.kill('SIGTERM');
      await wait(1_000);
      if (child.exitCode === null) child.kill('SIGKILL');
    }
    if (mounted) {
      execFileSync('/usr/bin/hdiutil', ['detach', mount, '-force'], { timeout: 30_000, stdio: 'pipe' });
    }
    rmSync(temporary, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [dmg, zip, version, arch] = process.argv.slice(2);
  if (!dmg || !zip || !version || !arch) {
    throw new Error('Usage: node scripts/smoke-macos-release.mjs <dmg> <zip> <version> <arm64|x86_64>');
  }
  await smokeMacRelease({ dmg, zip, version, arch });
}
