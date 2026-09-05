import type { TemplateModelConfig } from '../types';

const MINIMAX_H3_PARAMS = {
  ratio: ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16'],
  resolution: ['768p', '2k'],
  durationRange: { min: 5, max: 15 },
};

export const MINIMAX_VIDEO_MODELS: TemplateModelConfig[] = [
  {
    id: 'minimax-h3-text-to-video',
    label: 'MiniMax H3 Text to Video',
    mediaType: 'video',
    provider: 'minimax',
    generationType: 'text-to-video',
    request: { endpoint: 'video', modelName: 'minimax-h3-text-to-video' },
    inputs: {
      prompt: { supported: true, required: true },
      startFrame: { supported: false, required: false },
      endFrame: { supported: false, required: false },
    },
    params: MINIMAX_H3_PARAMS,
  },
  {
    id: 'minimax-h3-image-to-video',
    label: 'MiniMax H3 Image to Video',
    mediaType: 'video',
    provider: 'minimax',
    generationType: 'image-to-video',
    request: { endpoint: 'video', modelName: 'minimax-h3-image-to-video' },
    inputs: {
      prompt: { supported: true, required: true },
      startFrame: { supported: true, required: true },
      endFrame: { supported: true, required: false },
    },
    params: {
      ...MINIMAX_H3_PARAMS,
      ratio: undefined,
    },
  },
  {
    id: 'minimax-h3-reference-to-video',
    label: 'MiniMax H3 Reference to Video',
    mediaType: 'video',
    provider: 'minimax',
    generationType: 'reference-to-video',
    request: { endpoint: 'video', modelName: 'minimax-h3-reference-to-video' },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: true, required: false, multiple: true, min: 0, max: 9 },
      video: { supported: true, required: false, multiple: true, min: 0, max: 3 },
      audio: { supported: true, required: false, multiple: true, min: 0, max: 3 },
      startFrame: { supported: false, required: false },
      endFrame: { supported: false, required: false },
    },
    params: {
      ...MINIMAX_H3_PARAMS,
      maxReferenceSubjects: 12,
    },
  },
];
