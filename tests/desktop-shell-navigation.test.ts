import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

test('workspace active state uses the same primary text color as every other sidebar destination', () => {
  const source = readFileSync('components/desktop/DesktopShell.tsx', 'utf8');
  const workspaceLink = source.match(/href='\/'[\s\S]*?<\/Link>/)?.[0];

  assert.ok(workspaceLink, 'Workspace link should exist');
  assert.match(workspaceLink, /bg-accent text-primary font-semibold/);
});

test('appearance settings use a semantic, theme-colored three-option radio group', () => {
  const source = readFileSync('components/desktop/DesktopShell.tsx', 'utf8');

  assert.match(source, /grid grid-cols-3 gap-3/);
  assert.match(source, /className='peer sr-only'/);
  assert.match(source, /peer-checked:bg-primary\/10/);
  assert.match(source, /peer-checked:text-primary/);
  assert.match(source, /<Monitor aria-hidden='true'/);
  assert.match(source, /<Sun aria-hidden='true'/);
  assert.match(source, /<Moon aria-hidden='true'/);
});
