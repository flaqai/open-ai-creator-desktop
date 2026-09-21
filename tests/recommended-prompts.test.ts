import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import { PROMPT_COLLECTIONS } from '../lib/recommended-prompts';

const expectedCollections = [
  [
    'qwen-image-3-0',
    'https://flaq.ai/awesome-prompt/qwen-image-3-0-prompts/',
    '/text-to-image',
    8,
    '7a6b026bfd6e92369b4b8a2294df6e22ff440f20776830614de968298d38b217',
  ],
  [
    'wan-3-0',
    'https://flaq.ai/awesome-prompt/wan-3-0-prompts/',
    '/text-to-video',
    8,
    'd520da360803e1b931578a0e82d85f04892f17cdf72c0ffbc834810564be64ab',
  ],
  [
    'minimax-h3',
    'https://flaq.ai/awesome-prompt/minimax-h3-prompts/',
    '/text-to-video',
    6,
    '8b5ea25e29756b5b1f3ae40624c35b93ebdbd3b32bce2b385eda200ee1f573d5',
  ],
  [
    'seedance-2-5',
    'https://flaq.ai/awesome-prompt/seedance-2-5-prompts/',
    '/text-to-video',
    4,
    'c6ea79ac15ab3aeda7d89472003244288c9bb355ac58fd9ed777010a1b7c1bab',
  ],
] as const;

test('recommended prompt collections cover the requested models and Flaq sources', () => {
  assert.deepEqual(
    PROMPT_COLLECTIONS.map(({ id, sourceUrl, toolHref, prompts }) => [id, sourceUrl, toolHref, prompts.length]),
    expectedCollections.map(([id, sourceUrl, toolHref, count]) => [id, sourceUrl, toolHref, count]),
  );
});

test('every exact prompt snapshot has a local image and valid online video when applicable', () => {
  const promptIds = new Set<string>();

  for (const collection of PROMPT_COLLECTIONS) {
    const expected = expectedCollections.find(([id]) => id === collection.id);
    assert.ok(expected);
    assert.equal(createHash('sha256').update(JSON.stringify(collection.prompts)).digest('hex'), expected[4]);

    for (const prompt of collection.prompts) {
      assert.ok(!promptIds.has(prompt.id), `duplicate prompt id: ${prompt.id}`);
      promptIds.add(prompt.id);
      assert.ok(prompt.title);
      assert.ok(prompt.prompt.length > 40);
      assert.ok(existsSync(join(process.cwd(), 'public', prompt.media.image)));
      if (prompt.media.type === 'video') {
        const url = new URL(prompt.media.url);
        assert.equal(url.protocol, 'https:');
        assert.equal(url.hostname, 'cdn.flaq.ai');
      }
    }
  }
});
