import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';

import { getModelIcon, getModelIconConfig } from '../lib/utils/modelIcons';

const IMAGE_MODEL_ICONS = [
  ['nano-banana-pro', '/images/model-icon/veo.svg'],
  ['nano-banana-pro-edit', '/images/model-icon/veo.svg'],
  ['nano-banana-2', '/images/model-icon/veo.svg'],
  ['nano-banana-2-edit', '/images/model-icon/veo.svg'],
  ['gpt-image-2', '/images/model-icon/openai.svg'],
  ['gpt-image-2-edit', '/images/model-icon/openai.svg'],
  ['gpt-image-2-client', '/images/model-icon/openai.svg'],
  ['gpt-image-2-edit-client', '/images/model-icon/openai.svg'],
  ['chatgpt-images-2.5', '/images/model-icon/openai.svg'],
] as const;

test('canvas image models resolve their provider icon with and without a channel prefix', () => {
  for (const [model, icon] of IMAGE_MODEL_ICONS) {
    assert.equal(getModelIcon(model), icon, model);
    assert.equal(getModelIcon(`default::${model}`), icon, `default::${model}`);
    assert.ok(existsSync(`public${icon}`), `Missing icon resource: ${icon}`);
  }
});

test('dark-tile model icons have a white-tile presentation for light mode', () => {
  for (const model of ['nano-banana-pro', 'veo-3.1', 'seedance-v2.5']) {
    const icon = getModelIconConfig(model);
    assert.ok(icon.lightSrc, `${model} should use a light-mode asset`);
    assert.ok(existsSync(`public${icon.lightSrc}`), `Missing light-mode asset: ${icon.lightSrc}`);
  }

  for (const model of ['gpt-image-2', 'chatgpt-images-2.5', 'kling-v2.6']) {
    assert.equal(getModelIconConfig(model).invertOnLight, true, model);
  }

  assert.equal(getModelIconConfig('wan-2.6').lightSrc, undefined);
});
