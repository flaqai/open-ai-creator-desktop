import type { TemplateModelConfig } from '../types';

const HAPPYHORSE_1_1_RATIOS = ['16:9', '9:16', '3:4', '4:3', '4:5', '5:4', '1:1', '9:21', '21:9'];
const HAPPYHORSE_1_1_PARAMS = {
  ratio: HAPPYHORSE_1_1_RATIOS,
  resolution: ['1080p', '720p'],
  durationRange: { min: 3, max: 15 },
  seed: true,
};

export const HAPPYHORSE_VIDEO_MODELS: TemplateModelConfig[] = [
  {
    id: 'happyhorse-1-1-text-to-video',
    label: 'Happy Horse 1.1 Text to Video',
    mediaType: 'video',
    provider: 'happyhorse',
    generationType: 'text-to-video',
    request: { endpoint: 'video', modelName: 'happyhorse-1.1-text-to-video' },
    inputs: {
      prompt: { supported: true, required: true },
      startFrame: { supported: false, required: false },
      endFrame: { supported: false, required: false },
    },
    params: HAPPYHORSE_1_1_PARAMS,
  },
  {
    id: 'happyhorse-1-1-image-to-video',
    label: 'Happy Horse 1.1 Image to Video',
    mediaType: 'video',
    provider: 'happyhorse',
    generationType: 'image-to-video',
    request: { endpoint: 'video', modelName: 'happyhorse-1.1-image-to-video' },
    inputs: {
      prompt: { supported: true, required: true },
      startFrame: { supported: true, required: true },
      endFrame: { supported: false, required: false },
    },
    params: {
      ...HAPPYHORSE_1_1_PARAMS,
      ratio: undefined,
    },
  },
  {
    id: 'happyhorse-1-1-reference-to-video',
    label: 'Happy Horse 1.1 Reference to Video',
    mediaType: 'video',
    provider: 'happyhorse',
    generationType: 'reference-to-video',
    request: { endpoint: 'video', modelName: 'happyhorse-1.1-reference-to-video' },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: true, required: true, multiple: true, min: 1, max: 9 },
      startFrame: { supported: false, required: false },
      endFrame: { supported: false, required: false },
    },
    params: HAPPYHORSE_1_1_PARAMS,
  },
];
