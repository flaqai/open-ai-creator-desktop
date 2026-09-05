import type { TemplateModelConfig } from '../types';

export const GPT_IMAGE_MODELS: TemplateModelConfig[] = [
  {
    id: 'gpt-image-2',
    label: 'GPT Image 2',
    mediaType: 'image',
    provider: 'openai',
    request: {
      endpoint: 'image',
      modelName: 'gpt-image-2',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: false, required: false, multiple: false, min: 0, max: 0 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '3:4', '4:3', '5:4', '4:5', '21:9'],
      resolution: ['1k', '2k'],
      quality: ['medium', 'high', 'low'],
    },
  },
  {
    id: 'gpt-image-2-edit',
    label: 'GPT Image 2 Edit',
    mediaType: 'image',
    provider: 'openai',
    request: {
      endpoint: 'image',
      modelName: 'gpt-image-2-edit',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: true, required: true, multiple: true, min: 1, max: 16 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '3:4', '4:3', '5:4', '4:5', '21:9'],
      resolution: ['1k', '2k'],
      quality: ['medium', 'high', 'low'],
    },
  },
  {
    id: 'gpt-image-2-client',
    label: 'GPT Image 2 Client',
    mediaType: 'image',
    provider: 'openai',
    request: {
      endpoint: 'image',
      modelName: 'gpt-image-2-client',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: false, required: false, multiple: false, min: 0, max: 0 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '3:4', '4:3', '5:4', '4:5', '21:9'],
      resolution: ['1k', '2k'],
      quality: ['medium', 'high', 'low'],
    },
  },
  {
    id: 'gpt-image-2-edit-client',
    label: 'GPT Image 2 Edit Client',
    mediaType: 'image',
    provider: 'openai',
    request: {
      endpoint: 'image',
      modelName: 'gpt-image-2-edit-client',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: true, required: true, multiple: true, min: 1, max: 16 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '3:4', '4:3', '5:4', '4:5', '21:9'],
      resolution: ['1k', '2k'],
      quality: ['medium', 'high', 'low'],
    },
  },
];
