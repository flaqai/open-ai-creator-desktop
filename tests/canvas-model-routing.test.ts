import assert from 'node:assert/strict';
import test from 'node:test';

import {
  resolveSourceModelForInputs,
  sourceModelFamilyKey,
  sourceModelFamilyLabel,
} from '../components/infinite-canvas/runtime/generation/source-model-data';
import {
  convertSourceImageRequest,
  convertSourceVideoRequest,
} from '../components/infinite-canvas/runtime/generation/source-network-converter';
import { defaultConfig } from '../components/infinite-canvas/stores/use-config-store';

test('canvas groups a model family under a plain public name', () => {
  assert.equal(sourceModelFamilyKey('seedance-2-5-text-to-video'), sourceModelFamilyKey('seedance-2-5-image-to-video'));
  assert.equal(sourceModelFamilyLabel('seedance-2-5-reference-to-video'), 'Seedance 2.5');
  assert.notEqual(sourceModelFamilyKey('gpt-image-2-client'), sourceModelFamilyKey('gpt-image-2-edit-client'));
});

test('canvas routes each input shape only inside the selected video family', () => {
  const selected = 'seedance-2-5-text-to-video';
  assert.equal(resolveSourceModelForInputs(selected, 'video', { imageCount: 0 })?.id, selected);
  assert.equal(resolveSourceModelForInputs(selected, 'video', { imageCount: 1 })?.id, 'seedance-2-5-image-to-video');
  assert.equal(
    resolveSourceModelForInputs(selected, 'video', { imageCount: 0, videoCount: 1 })?.id,
    'seedance-2-5-reference-to-video',
  );
  assert.equal(
    resolveSourceModelForInputs(selected, 'video', { imageCount: 3 })?.id,
    'seedance-2-5-reference-to-video',
  );
  assert.equal(
    resolveSourceModelForInputs('flux-3-text-to-video', 'video', { imageCount: 2 })?.id,
    'flux-3-start-end-to-video',
  );
});

test('canvas requests submit the routed image edit and video variants', () => {
  const imageConfig = {
    ...defaultConfig,
    model: 'default::gpt-image-2',
    size: '1:1',
    imageResolution: '1k',
    imageVersion: 'medium',
  };
  assert.equal(
    convertSourceImageRequest({
      config: imageConfig,
      prompt: 'Change the color',
      referenceUrls: ['https://example.test/input.png'],
    }).model_name,
    'gpt-image-2-edit',
  );
  const videoConfig = {
    ...defaultConfig,
    model: 'default::flux-3-text-to-video',
    size: '16:9',
    vquality: '720p',
    videoSeconds: '5s',
  };
  assert.equal(
    convertSourceVideoRequest({
      config: videoConfig,
      prompt: 'Animate',
      imageUrls: ['https://example.test/start.png', 'https://example.test/end.png'],
    }).model_name,
    'flux-3.0-start-end-to-video',
  );
  assert.throws(
    () =>
      convertSourceVideoRequest({
        config: videoConfig,
        prompt: 'Animate',
        imageUrls: ['https://example.test/a.png', 'https://example.test/b.png', 'https://example.test/c.png'],
      }),
    { code: 'unsupported-model' },
  );
});

test('canvas edit uses an image input variant and rejects unsupported family input', () => {
  assert.equal(resolveSourceModelForInputs('gpt-image-2', 'image', { imageCount: 1 })?.id, 'gpt-image-2-edit');
  assert.equal(resolveSourceModelForInputs('gpt-image-2-edit', 'image', { imageCount: 0 })?.id, 'gpt-image-2');
  assert.equal(resolveSourceModelForInputs('flux-3-text-to-video', 'video', { imageCount: 3 }), null);
  assert.equal(resolveSourceModelForInputs('gpt-image-2-client', 'image', { imageCount: 1 }), null);
});
