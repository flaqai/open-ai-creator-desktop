import type { TemplateModelConfig } from '../types';

const FLUX_3_PARAMS = {
  ratio: ['21:9', '2:1', '16:9', '4:3', '1:1', '3:4', '9:16'],
  resolution: ['720p', '1080p'],
  durationRange: { min: 5, max: 20 },
  sound: true,
  defaultSound: true,
};

export const FLUX_VIDEO_MODELS: TemplateModelConfig[] = [
  {
    id: 'flux-3-text-to-video',
    label: 'FLUX 3 Text to Video',
    mediaType: 'video',
    provider: 'flux',
    generationType: 'text-to-video',
    request: { endpoint: 'video', modelName: 'flux-3.0-text-to-video' },
    inputs: {
      prompt: { supported: true, required: true },
      startFrame: { supported: false, required: false },
      endFrame: { supported: false, required: false },
    },
    params: FLUX_3_PARAMS,
  },
  {
    id: 'flux-3-image-to-video',
    label: 'FLUX 3 Image to Video',
    mediaType: 'video',
    provider: 'flux',
    generationType: 'image-to-video',
    request: { endpoint: 'video', modelName: 'flux-3.0-image-to-video' },
    inputs: {
      prompt: { supported: true, required: true },
      startFrame: { supported: true, required: true },
      endFrame: { supported: false, required: false },
    },
    params: FLUX_3_PARAMS,
  },
  {
    id: 'flux-3-start-end-to-video',
    label: 'FLUX 3 Start End to Video',
    mediaType: 'video',
    provider: 'flux',
    generationType: 'image-to-video',
    request: { endpoint: 'video', modelName: 'flux-3.0-start-end-to-video' },
    inputs: {
      prompt: { supported: true, required: true },
      startFrame: { supported: true, required: true },
      endFrame: { supported: true, required: true },
    },
    params: FLUX_3_PARAMS,
  },
];
