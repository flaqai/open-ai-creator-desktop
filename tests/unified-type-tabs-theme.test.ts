import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const typeTabsSource = readFileSync(new URL('../components/unified-generator/TypeTabs.tsx', import.meta.url), 'utf8');

test('media type icons only add their depth shadow in dark mode', () => {
  assert.doesNotMatch(typeTabsSource, /object-contain drop-shadow-\[/);
  assert.match(typeTabsSource, /object-contain[^'\n]*dark:drop-shadow-\[0_8px_14px_rgba\(0,0,0,0\.4\)\]/);
});
