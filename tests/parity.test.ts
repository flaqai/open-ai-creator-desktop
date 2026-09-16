import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

import { getLanguageDirection, languages } from '../i18n/languages';
import { ALL_FEATURE_ROUTES } from '../lib/constants/navigation';
import { TEMPLATE_MODELS } from '../lib/constants/template-models';
import { FEATURE_MODULES } from '../lib/features/catalog';
import baseline from './fixtures/upstream-models.json';

test('all 50 upstream model variants retain their complete input and parameter contracts', () => {
  const current = new Map(TEMPLATE_MODELS.map((model) => [model.id, model]));
  for (const model of baseline.models) {
    assert.ok(current.has(model.id), `Missing upstream model ${model.id}`);
    assert.equal(
      createHash('sha256')
        .update(JSON.stringify(current.get(model.id)))
        .digest('hex'),
      model.digest,
      `Changed upstream contract ${model.id}`,
    );
  }
});

test('seven creative routes are registered once and backed by actual Next pages', () => {
  const expected = [
    'ai-media-creator',
    'text-to-image',
    'image-to-image',
    'virtual-try-on',
    'text-to-video',
    'image-to-video',
    'reference-to-video',
  ];
  assert.deepEqual(FEATURE_MODULES.map((f) => f.id).sort(), expected.sort());
  assert.equal(new Set(ALL_FEATURE_ROUTES.map((f) => f.href)).size, expected.length);
  const pages = readdirSync('app', { recursive: true })
    .map(String)
    .filter((file) => file.endsWith('/page.tsx'));
  for (const id of expected)
    assert.ok(
      pages.some((file) => file.endsWith(`/${id}/page.tsx`)),
      id,
    );
});

test('every supported language has desktop and tool guide translation keys', () => {
  assert.equal(languages.length, 15);
  assert.equal(getLanguageDirection('ar'), 'rtl');
  const english = JSON.parse(readFileSync('messages/en.json', 'utf8'));
  const flatten = (object: Record<string, unknown>, prefix = ''): string[] =>
    Object.entries(object).flatMap(([key, value]) =>
      typeof value === 'object' && value
        ? flatten(value as Record<string, unknown>, prefix + key + '.')
        : [prefix + key],
    );
  const required = flatten(english.Desktop);
  const requiredHosting = flatten(english.components['image-hosting']);
  for (const locale of languages) {
    const messages = JSON.parse(readFileSync(path.join('messages', locale.lang + '.json'), 'utf8'));
    const keys = new Set(flatten(messages.Desktop));
    for (const key of required) assert.ok(keys.has(key), `${locale.lang}: Desktop.${key}`);
    const hostingKeys = new Set(flatten(messages.components['image-hosting']));
    for (const key of requiredHosting)
      assert.ok(hostingKeys.has(key), `${locale.lang}: components.image-hosting.${key}`);
    for (const tool of FEATURE_MODULES) {
      assert.ok(messages.Navigation[tool.code], `${locale.lang}: ${tool.code}`);
      assert.ok(messages[tool.id]?.manual, `${locale.lang}: missing ${tool.id} manual`);
      assert.ok(messages[tool.id]?.faq, `${locale.lang}: missing ${tool.id} FAQ`);
    }
  }
});
