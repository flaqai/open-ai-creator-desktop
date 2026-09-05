import type { TemplateModelConfig } from '../types';

// First draft keeps Kling 3.0 on the std variants from flaq.ai.
export const KLING_VIDEO_MODELS: TemplateModelConfig[] = [
  {
    id: 'kling-3.0-text-to-video',
    label: 'Kling 3.0',
    mediaType: 'video',
    request: {
      endpoint: 'video',
      modelName: 'kling-v3.0-std-text-to-video',
    },
    inputs: {
      prompt: { supported: true, required: true },
      startFrame: { supported: false, required: false },
      endFrame: { supported: false, required: false },
      audio: { supported: false, required: false },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1'],
      durationRange: { min: 3, max: 15 },
      guidanceScale: true,
      negativePrompt: true,
      sound: true,
    },
  },
  {
    id: 'kling-3.0-image-to-video',
    label: 'Kling 3.0',
    mediaType: 'video',
    request: {
      endpoint: 'video',
      modelName: 'kling-v3.0-std-image-to-video',
    },
    inputs: {
      prompt: { supported: true, required: true },
      startFrame: { supported: true, required: true },
      endFrame: { supported: false, required: false },
      audio: { supported: false, required: false },
    },
    params: {
      ratio: ['16:9', '9:16', '1:1'],
      durationRange: { min: 3, max: 15 },
      guidanceScale: true,
      negativePrompt: true,
      sound: true,
    },
  },
];
