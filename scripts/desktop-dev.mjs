import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { prepareMedia } from './prepare-media.mjs';

const require = createRequire(import.meta.url);

export function desktopDevEnvironment(environment = process.env) {
  return {
    ...environment,
    FLAQ_DESKTOP_RUNTIME: 'true',
    NEXT_PUBLIC_FLAQ_DESKTOP_RUNTIME: 'true',
    NEXT_PUBLIC_FLAQ_NATIVE_DESKTOP: 'true',
    NEXT_PUBLIC_SITE_URL: environment.NEXT_PUBLIC_SITE_URL || 'http://localhost:31415',
  };
}

export async function startDesktopDev(projectRoot = process.cwd(), args = []) {
  await prepareMedia(projectRoot);
  const nextArgs = args[0] === '--' ? args.slice(1) : args;

  const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'dev', ...nextArgs], {
    cwd: projectRoot,
    env: desktopDevEnvironment(),
    stdio: 'inherit',
  });

  const forwardSignal = (signal) => {
    if (!child.killed) child.kill(signal);
  };
  process.once('SIGINT', () => forwardSignal('SIGINT'));
  process.once('SIGTERM', () => forwardSignal('SIGTERM'));

  return new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (signal) process.kill(process.pid, signal);
      else resolve(code ?? 1);
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exitCode = await startDesktopDev(process.cwd(), process.argv.slice(2));
}
