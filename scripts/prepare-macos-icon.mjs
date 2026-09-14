// Reuse the original editable F artwork. A padded rounded plate fits legacy macOS icon grids.
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require(require.resolve('sharp', { paths: [require.resolve('next')] }));
const root = new URL('../', import.meta.url);
const original = await readFile(new URL('app/icon.svg', root), 'utf8');
const artwork = original
  .replace(/<svg[^>]*>/, '')
  .replace('</svg>', '')
  .replace(/<rect[^>]*\/>/, '');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><defs><filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity=".18"/></filter></defs><rect x="100" y="100" width="824" height="824" rx="184" fill="#08041D" filter="url(#shadow)"/><g transform="translate(100 100) scale(4.12)">${artwork}</g></svg>`;
const icons = new URL('src-tauri/icons/macos.iconset/', root);
await mkdir(icons, { recursive: true });
await writeFile(new URL('src-tauri/icons/macos-source.svg', root), svg);
for (const size of [16, 32, 128, 256, 512]) {
  for (const scale of [1, 2]) {
    await sharp(Buffer.from(svg))
      .resize(size * scale)
      .png()
      .toFile(fileURLToPath(new URL(`icon_${size}x${size}${scale === 2 ? '@2x' : ''}.png`, icons)));
  }
}
execFileSync('iconutil', [
  '-c',
  'icns',
  fileURLToPath(icons),
  '-o',
  fileURLToPath(new URL('src-tauri/icons/macos.icns', root)),
]);
