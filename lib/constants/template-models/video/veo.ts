import type { TemplateModelConfig } from '../types';

export const VEO_VIDEO_MODELS: TemplateModelConfig[] = [
  {
    id: 'veo-3.1-fast-text-to-video',
    label: 'Veo 3.1 Fast',
    mediaType: 'video',
    request: {
      endpoint: 'video',
      modelName: 'veo3.1-fast-text-to-video',
    },
    inputs: {
      prompt: { supported: true, required: true },
      startFrame: { supported: false, required: false },
      endFrame: { supported: false, required: false },
      audio: { supported: false, required: false },
    },
    params: {
      ratio: ['16:9', '9:16'],
    },
  },
  {
    id: 'veo-3.1-text-to-video',
    label: 'Veo 3.1',
    mediaType: 'video',
    request: {
      endpoint: 'video',
      modelName: 'veo3.1-text-to-video',
    },
    inputs: {
      prompt: { supported: true, required: true },
      startFrame: { supported: false, required: false },
      endFrame: { supported: false, required: false },
      audio: { supported: false, required: false },
    },
    params: {
      ratio: ['16:9', '9:16'],
    },
  },
  {
    id: 'veo-3.1-fast-image-to-video',
    label: 'Veo 3.1 Fast',
    mediaType: 'video',
    request: {
      endpoint: 'video',
      modelName: 'veo3.1-fast-image-to-video',
    },
    inputs: {
      prompt: { supported: true, required: true },
      startFrame: { supported: true, required: false },
      endFrame: { supported: true, required: false },
      audio: { supported: false, required: false },
    },
    params: {
      ratio: ['16:9', '9:16'],
    },
  },
  {
    id: 'veo-3.1-image-to-video',
    label: 'Veo 3.1',
    mediaType: 'video',
    request: {
      endpoint: 'video',
      modelName: 'veo3.1-image-to-video',
    },
    inputs: {
      prompt: { supported: true, required: true },
      startFrame: { supported: true, required: false },
      endFrame: { supported: true, required: false },
      audio: { supported: false, required: false },
    },
    params: {
      ratio: ['16:9', '9:16'],
    },
  },
];
