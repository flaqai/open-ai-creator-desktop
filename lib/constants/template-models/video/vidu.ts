import type { TemplateModelConfig } from '../types';

// First draft keeps Vidu Q3 on the turbo variants from flaq.ai.
export const VIDU_VIDEO_MODELS: TemplateModelConfig[] = [
  {
    id: 'vidu-q3-text-to-video',
    label: 'Vidu Q3',
    mediaType: 'video',
    request: {
      endpoint: 'video',
      modelName: 'viduq3-turbo-text-to-video',
    },
    inputs: {
      prompt: { supported: true, required: true },
      startFrame: { supported: false, required: false },
      endFrame: { supported: false, required: false },
      audio: { supported: false, required: false },
    },
    params: {
      ratio: ['16:9', '4:3', '1:1', '3:4', '9:16'],
      resolution: ['540p', '720p', '1080p'],
      durationRange: { min: 1, max: 15 },
      style: ['general', 'anime'],
      seed: true,
      sound: true,
      bgm: true,
    },
  },
  {
    id: 'vidu-q3-image-to-video',
    label: 'Vidu Q3',
    mediaType: 'video',
    request: {
      endpoint: 'video',
      modelName: 'viduq3-turbo-image-to-video',
    },
    inputs: {
      prompt: { supported: true, required: true },
      startFrame: { supported: true, required: true },
      endFrame: { supported: false, required: false },
      audio: { supported: false, required: false },
    },
    params: {
      ratio: ['16:9', '4:3', '1:1', '3:4', '9:16'],
      resolution: ['540p', '720p', '1080p'],
      durationRange: { min: 1, max: 15 },
      seed: true,
      sound: true,
      bgm: true,
    },
  },
];
