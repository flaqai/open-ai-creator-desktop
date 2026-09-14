import assert from 'node:assert/strict';
import test from 'node:test';

import { ALL_IMAGE_PROVIDERS } from '../lib/constants/image';
import { ALL_VIDEO_MODELS, getVersionConfig } from '../lib/constants/video';
import { validImageDraft, validUnifiedDraft, validVideoDraft } from '../lib/desktop/draft-validation';
import useUnifiedGeneratorStore from '../store/unified-generator/useUnifiedGeneratorStore';

test('draft validation recognizes current models and rejects removed models or parameters', () => {
  const image = ALL_IMAGE_PROVIDERS.flatMap((provider) => provider.versions).find((version) => !version.isComingSoon)!;
  assert.equal(validImageDraft({ modelVersion: image.modelVersion }), true);
  assert.equal(validImageDraft({ modelVersion: image.modelVersion, aspectRatio: '999:1' }), false);
  assert.equal(validImageDraft({ modelVersion: 'retired-model' }), false);
  const video = ALL_VIDEO_MODELS.find((model) => !model.disabled)!;
  const version = getVersionConfig(video.modelVersion)!;
  const duration = version.options.durationRange
    ? `${version.options.durationRange.min}s`
    : version.options.duration?.[0];
  assert.equal(validVideoDraft({ modelVersion: video.modelVersion, duration }), true);
  assert.equal(validVideoDraft({ modelVersion: video.modelVersion, resolution: 'invalid' }), false);
  assert.equal(validUnifiedDraft({ ...useUnifiedGeneratorStore.getInitialState() }), true);
  assert.equal(
    validUnifiedDraft({ ...useUnifiedGeneratorStore.getInitialState(), imageModel: 'retired-model' }),
    false,
  );
});
