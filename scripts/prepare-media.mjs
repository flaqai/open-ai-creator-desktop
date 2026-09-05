import { copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
export async function prepareMedia(root) {
  const source = path.dirname(require.resolve('@ffmpeg/core'));
  const destination = path.join(root, 'public/vendor/ffmpeg');
  await mkdir(destination, { recursive: true });
  await Promise.all(
    ['ffmpeg-core.js', 'ffmpeg-core.wasm'].map((name) =>
      copyFile(path.join(source, name), path.join(destination, name)),
    ),
  );
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await prepareMedia(process.cwd());
}
