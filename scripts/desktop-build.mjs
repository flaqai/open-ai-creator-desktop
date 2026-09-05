import { spawn } from 'node:child_process';
import { access, cp, mkdtemp, rename, rm, symlink, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { prepareMedia } from './prepare-media.mjs';

const require = createRequire(import.meta.url);
export const WEB_ONLY_PATHS = [
  'app/api',
  'app/llms.txt',
  'app/llms-full.txt',
  'app/robots.ts',
  'app/sitemap.ts',
  'app/[locale]/404',
  'app/[locale]/[...rest]',
  'proxy.ts',
];
const INPUTS = [
  'app',
  'components',
  'hooks',
  'i18n',
  'lib',
  'messages',
  'network',
  'store',
  'public',
  'package.json',
  'tsconfig.json',
  'next.config.mjs',
  'postcss.config.js',
  '.env',
  '.env.local',
  '.env.production',
  '.env.production.local',
];
async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

export async function buildDesktop(projectRoot, runBuild = runNextBuild) {
  // Build in an isolated copy: crashes and concurrent web development can never
  // remove or alter the source route tree.
  const work = await mkdtemp(path.join(projectRoot, '.desktop-build-'));
  try {
    for (const input of INPUTS) {
      const source = path.join(projectRoot, input);
      if (!(await exists(source))) continue;
      await cp(source, path.join(work, input), {
        recursive: true,
        filter: (file) => {
          const relative = path.relative(projectRoot, file).split(path.sep).join('/');
          return !WEB_ONLY_PATHS.some((excluded) => relative === excluded || relative.startsWith(excluded + '/'));
        },
      });
    }
    await symlink(
      path.join(projectRoot, 'node_modules'),
      path.join(work, 'node_modules'),
      process.platform === 'win32' ? 'junction' : 'dir',
    );
    await runBuild(work);
    await writeFile(path.join(work, 'out/index.html'), desktopEntry(), 'utf8');

    const destination = path.join(projectRoot, 'out');
    const previous = path.join(work, 'previous-out');
    if (await exists(destination)) await rename(destination, previous);
    try {
      await rename(path.join(work, 'out'), destination);
    } catch (error) {
      if (await exists(previous)) await rename(previous, destination);
      throw error;
    }
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

function runNextBuild(cwd) {
  return prepareMedia(cwd).then(
    () =>
      new Promise((resolve, reject) => {
        // Launch the JS entry with Node, including on Windows (.cmd cannot be
        // executed directly by spawn without a shell).
        const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'build', '--webpack'], {
          cwd,
          env: { ...process.env, FLAQ_DESKTOP_BUILD: 'true', NEXT_PUBLIC_FLAQ_DESKTOP_BUILD: 'true' },
          stdio: 'inherit',
        });
        child.once('error', reject);
        child.once('exit', (code, signal) =>
          code === 0 ? resolve() : reject(new Error(`Desktop build failed: ${signal || code}`)),
        );
      }),
  );
}

function desktopEntry() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Flaq Creator</title></head><body><script>
var supported=['en','ja','id','it','pt','es','de','ru','fr','zh','tw','ko','th','vi','ar'];
var locale='en';
try {
  var saved=localStorage.getItem('flaq-desktop-locale');
  var preferred=(navigator.language||'en').toLowerCase();
  var detected=/^zh-(tw|hk|hant)/.test(preferred)?'tw':preferred.split('-')[0];
  locale=supported.includes(saved)?saved:(supported.includes(detected)?detected:'en');
} catch {}
location.replace('./'+locale+'/');
</script><noscript><a href="./en/">Open Flaq Creator</a></noscript></body></html>`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await buildDesktop(process.cwd());
}
