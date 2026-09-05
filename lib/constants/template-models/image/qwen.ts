import type { TemplateModelConfig } from '../types';

const QWEN_IMAGE_3_PRO_PARAMS = {
  ratio: ['16:9', '9:16', '1:1', '4:3', '3:4', '3:2', '2:3'],
  resolution: ['1k', '2k'],
  seed: true,
};

export const QWEN_IMAGE_MODELS: TemplateModelConfig[] = [
  {
    id: 'qwen-image-3.0-pro',
    label: 'Qwen Image 3.0 Pro',
    mediaType: 'image',
    provider: 'qwen',
    generationType: 'text-to-image',
    request: {
      endpoint: 'image',
      modelName: 'qwen-image-3.0-pro',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: false, required: false, multiple: false, min: 0, max: 0 },
    },
    params: QWEN_IMAGE_3_PRO_PARAMS,
  },
  {
    id: 'qwen-image-3.0-pro-edit',
    label: 'Qwen Image 3.0 Pro Edit',
    mediaType: 'image',
    provider: 'qwen',
    generationType: 'image-to-image',
    request: {
      endpoint: 'image',
      modelName: 'qwen-image-3.0-pro-edit',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: true, required: true, multiple: true, min: 1, max: 3 },
    },
    params: QWEN_IMAGE_3_PRO_PARAMS,
  },
];
