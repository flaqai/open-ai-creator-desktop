import type { TemplateModelConfig } from '../types';

export const SEEDREAM_IMAGE_MODELS: TemplateModelConfig[] = [
  {
    id: 'seedream-4.5',
    label: 'Seedream 4.5',
    mediaType: 'image',
    provider: 'seedream',
    request: {
      endpoint: 'image',
      modelName: 'seedream-v4.5',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: false, required: false, multiple: false, min: 0, max: 0 },
    },
    params: {
      ratio: ['21:9', '16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16', '9:21'],
      resolution: ['2k', '4k'],
    },
  },
  {
    id: 'seedream-4.5-edit',
    label: 'Seedream 4.5 Edit',
    mediaType: 'image',
    provider: 'seedream',
    request: {
      endpoint: 'image',
      modelName: 'seedream-v4.5-edit',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: true, required: true, multiple: true, min: 1, max: 10 },
    },
    params: {
      ratio: ['21:9', '16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16', '9:21'],
      resolution: ['2k', '4k'],
    },
  },
  {
    id: 'seedream-5.0',
    label: 'Seedream 5.0',
    mediaType: 'image',
    provider: 'seedream',
    request: {
      endpoint: 'image',
      modelName: 'seedream-v5.0',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: false, required: false, multiple: false, min: 0, max: 0 },
    },
    params: {
      ratio: ['16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16'],
      resolution: ['2k', '4k'],
    },
  },
  {
    id: 'seedream-5.0-edit',
    label: 'Seedream 5.0 Edit',
    mediaType: 'image',
    provider: 'seedream',
    request: {
      endpoint: 'image',
      modelName: 'seedream-v5.0-edit',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: true, required: true, multiple: true, min: 1, max: 10 },
    },
    params: {
      ratio: ['16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16'],
      resolution: ['2k', '4k'],
    },
  },
  {
    id: 'seedream-5.0-pro',
    label: 'Seedream 5.0 Pro',
    mediaType: 'image',
    provider: 'seedream',
    generationType: 'text-to-image',
    request: {
      endpoint: 'image',
      modelName: 'seedream-v5.0-pro',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: false, required: false, multiple: false, min: 0, max: 0 },
    },
    params: {
      ratio: ['16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16', '21:9'],
      resolution: ['1k', '2k'],
    },
  },
  {
    id: 'seedream-5.0-pro-edit',
    label: 'Seedream 5.0 Pro Edit',
    mediaType: 'image',
    provider: 'seedream',
    generationType: 'image-to-image',
    request: {
      endpoint: 'image',
      modelName: 'seedream-v5.0-pro-edit',
    },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: true, required: true, multiple: true, min: 1, max: 10 },
    },
    params: {
      ratio: ['16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16', '21:9'],
      resolution: ['1k', '2k'],
    },
  },
];
