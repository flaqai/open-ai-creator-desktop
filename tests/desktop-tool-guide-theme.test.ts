import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const featureInfoSource = readFileSync(
  new URL('../components/desktop/DesktopFeatureInfo.tsx', import.meta.url),
  'utf8',
);
const globalStyles = readFileSync(new URL('../app/[locale]/globals.css', import.meta.url), 'utf8');
const faqSource = readFileSync(new URL('../components/Faq.tsx', import.meta.url), 'utf8');

test('desktop tool guide content preserves its original dark presentation in every app theme', () => {
  assert.match(featureInfoSource, /desktop-tool-guide-content/);
  assert.match(globalStyles, /\.desktop-tool-guide-content\s*\{/);
  assert.match(globalStyles, /\.desktop-tool-guide-content[\s\S]*?--background:\s*#0f1113/);
  assert.match(globalStyles, /\.desktop-tool-guide-content[\s\S]*?--color-bg0:\s*#020202/);
  assert.match(globalStyles, /\.desktop-tool-guide-content[\s\S]*?--color-t1:\s*#ffffff/);
});

test('desktop tool guide FAQ keeps a responsive horizontal content gutter', () => {
  assert.match(faqSource, /data-faq-section/);
  assert.match(globalStyles, /\.desktop-tool-guide-content \[data-faq-section\]\s*\{/);
  assert.match(globalStyles, /padding-inline:\s*clamp\(1\.25rem, 3vw, 2rem\)/);
});
