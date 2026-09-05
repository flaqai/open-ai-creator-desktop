import type { TemplateModelConfig } from '../types';

export const GEMINI_IMAGE_MODELS: TemplateModelConfig[] = [
  {
    id: 'nano-banana-pro',
    label: 'Nano Banana Pro',
    mediaType: 'image',
    provider: 'gemini',
    request: {
      endpoint: 'image',
      modelName: 'nano-banana-pro',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: false, required: false, multiple: false, min: 0, max: 0 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '4:3', '3:4', '4:5', '5:4', '21:9', '9:21'],
      resolution: ['2k', '4k', '1k'],
    },
  },
  {
    id: 'nano-banana-pro-edit',
    label: 'Nano Banana Pro Edit',
    mediaType: 'image',
    provider: 'gemini',
    request: {
      endpoint: 'image',
      modelName: 'nano-banana-pro-edit',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: true, required: true, multiple: true, min: 1, max: 14 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '4:3', '3:4', '4:5', '5:4', '21:9', '9:21'],
      resolution: ['2k', '4k', '1k'],
    },
  },
  {
    id: 'nano-banana-2',
    label: 'Nano Banana 2',
    mediaType: 'image',
    provider: 'gemini',
    request: {
      endpoint: 'image',
      modelName: 'nano-banana-2',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: false, required: false, multiple: false, min: 0, max: 0 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '4:3', '3:4', '4:5', '5:4', '21:9', '9:21'],
      resolution: ['2k', '4k', '1k'],
    },
  },
  {
    id: 'nano-banana-2-edit',
    label: 'Nano Banana 2 Edit',
    mediaType: 'image',
    provider: 'gemini',
    request: {
      endpoint: 'image',
      modelName: 'nano-banana-2-edit',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: true, required: true, multiple: true, min: 1, max: 10 },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1', '3:2', '2:3', '4:3', '3:4', '4:5', '5:4', '21:9', '9:21'],
      resolution: ['2k', '4k', '1k'],
    },
  },
];
