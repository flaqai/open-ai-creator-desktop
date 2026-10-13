import assert from 'node:assert/strict';
import test from 'node:test';

import { TEMPLATE_MODELS_BY_ID } from '../lib/constants/template-models/index';
import {
  getTemplateModelFamilyId,
  getTemplateModelFamilyLabel,
  preferredVideoVariant,
} from '../lib/constants/template-models/model-family';

test('video API variants share one public model name and family', () => {
  const text = TEMPLATE_MODELS_BY_ID['seedance-2-5-text-to-video'];
  const image = TEMPLATE_MODELS_BY_ID['seedance-2-5-image-to-video'];
  const reference = TEMPLATE_MODELS_BY_ID['seedance-2-5-reference-to-video'];
  assert.equal(getTemplateModelFamilyId(text), getTemplateModelFamilyId(image));
  assert.equal(getTemplateModelFamilyId(image), getTemplateModelFamilyId(reference));
  assert.equal(getTemplateModelFamilyLabel(text), 'Seedance 2.5');
  assert.equal(getTemplateModelFamilyLabel(reference), 'Seedance 2.5');
});

test('image edit shares its family, but client models remain unchanged', () => {
  const text = TEMPLATE_MODELS_BY_ID['gpt-image-2'];
  const edit = TEMPLATE_MODELS_BY_ID['gpt-image-2-edit'];
  const client = TEMPLATE_MODELS_BY_ID['gpt-image-2-client'];
  const editClient = TEMPLATE_MODELS_BY_ID['gpt-image-2-edit-client'];
  assert.equal(getTemplateModelFamilyId(text), getTemplateModelFamilyId(edit));
  assert.notEqual(getTemplateModelFamilyId(text), getTemplateModelFamilyId(client));
  assert.notEqual(getTemplateModelFamilyId(client), getTemplateModelFamilyId(editClient));
  assert.equal(getTemplateModelFamilyLabel(edit), 'GPT Image 2');
  assert.equal(getTemplateModelFamilyLabel(editClient), 'GPT Image 2 Edit Client');
});

test('start/end-frame selection uses the correct FLUX API variant', () => {
  const first = TEMPLATE_MODELS_BY_ID['flux-3-image-to-video'];
  const both = TEMPLATE_MODELS_BY_ID['flux-3-start-end-to-video'];
  assert.equal(getTemplateModelFamilyId(first), getTemplateModelFamilyId(both));
  const variants = [first, both].map((model) => ({
    model: model.request.modelName,
    options: {
      endFrame: {
        isSupported: Boolean(model.inputs.endFrame?.supported),
        required: Boolean(model.inputs.endFrame?.required),
      },
    },
  }));
  assert.equal(preferredVideoVariant(variants, false)?.model, 'flux-3.0-image-to-video');
  assert.equal(preferredVideoVariant(variants, true)?.model, 'flux-3.0-start-end-to-video');
});
