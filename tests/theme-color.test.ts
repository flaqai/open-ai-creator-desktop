import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const globalStyles = readFileSync(new URL('../app/[locale]/globals.css', import.meta.url), 'utf8');

test('application semantic primary colors use the Flaq blue theme', () => {
  assert.match(globalStyles, /--brand-primary:\s*#4c52fe/gi);
  assert.match(globalStyles, /--primary:\s*var\(--brand-primary\)/gi);
  assert.match(globalStyles, /--ring:\s*var\(--brand-primary\)/gi);
  assert.match(globalStyles, /--sidebar-primary:\s*var\(--brand-primary\)/gi);
  assert.match(globalStyles, /--color-main:\s*var\(--brand-primary\)/gi);
  assert.doesNotMatch(globalStyles, /#(?:5c24ff|7c3aed|8b5cf6)/gi);
});
