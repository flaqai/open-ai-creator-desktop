import type { TemplateModelConfig } from '../types';

const SEEDANCE_RATIOS = ['21:9', '16:9', '9:16', '1:1', '4:3', '3:4'];

function createSeedance20Models(
  idPrefix: string,
  modelPrefix: string,
  labelPrefix: string,
  resolutions: string[],
  maxReferenceSubjects?: number,
): TemplateModelConfig[] {
  const sharedParams = {
    ratio: SEEDANCE_RATIOS,
    resolution: resolutions,
    durationRange: { min: 4, max: 15 },
    sound: true,
  };

  return [
    {
      id: `${idPrefix}-text-to-video`,
      label: `${labelPrefix} Text to Video`,
      mediaType: 'video',
      provider: 'seedance',
      generationType: 'text-to-video',
      request: { endpoint: 'video', modelName: `${modelPrefix}-text-to-video` },
      inputs: {
        prompt: { supported: true, required: true },
        startFrame: { supported: false, required: false },
        endFrame: { supported: false, required: false },
      },
      params: sharedParams,
    },
    {
      id: `${idPrefix}-image-to-video`,
      label: `${labelPrefix} Image to Video`,
      mediaType: 'video',
      provider: 'seedance',
      generationType: 'image-to-video',
      request: { endpoint: 'video', modelName: `${modelPrefix}-image-to-video` },
      inputs: {
        prompt: { supported: true, required: true },
        startFrame: { supported: true, required: true },
        endFrame: { supported: true, required: false },
      },
      params: sharedParams,
    },
    {
      id: `${idPrefix}-reference-to-video`,
      label: `${labelPrefix} Reference to Video`,
      mediaType: 'video',
      provider: 'seedance',
      generationType: 'reference-to-video',
      request: { endpoint: 'video', modelName: `${modelPrefix}-reference-to-video` },
      inputs: {
        prompt: { supported: true, required: true },
        image: { supported: true, required: false, multiple: true, min: 0, max: 9 },
        video: {
          supported: true,
          required: false,
          multiple: true,
          min: 0,
          max: 3,
          minDurationSeconds: 2,
          maxDurationSeconds: 15,
        },
        audio: {
          supported: true,
          required: false,
          multiple: true,
          min: 0,
          max: 3,
          minDurationSeconds: 2,
          maxDurationSeconds: 15,
        },
        startFrame: { supported: false, required: false },
        endFrame: { supported: false, required: false },
      },
      params: {
        ...sharedParams,
        defaultSound: true,
        minReferenceSubjects: 1,
        maxReferenceSubjects,
      },
    },
  ];
}

export const SEEDANCE_VIDEO_MODELS: TemplateModelConfig[] = [
  ...createSeedance20Models('seedance-2-0', 'seedance-v2.0', 'Seedance 2.0', ['480p', '720p', '1080p', '4k']),
  ...createSeedance20Models('seedance-2-0-fast', 'seedance-v2.0-fast', 'Seedance 2.0 Fast', ['480p', '720p']),
  ...createSeedance20Models('seedance-2-0-mini', 'seedance-v2.0-mini', 'Seedance 2.0 Mini', ['480p', '720p'], 12),
  {
    id: 'seedance-2-5-text-to-video',
    label: 'Seedance 2.5 Text to Video',
    mediaType: 'video',
    provider: 'seedance',
    generationType: 'text-to-video',
    request: { endpoint: 'video', modelName: 'seedance-v2.5-text-to-video' },
    inputs: {
      prompt: { supported: true, required: true },
      startFrame: { supported: false, required: false },
      endFrame: { supported: false, required: false },
    },
    params: {
      ratio: SEEDANCE_RATIOS,
      resolution: ['480p', '720p', '1080p'],
      durationRange: { min: 4, max: 30 },
      sound: true,
      defaultSound: true,
    },
  },
  {
    id: 'seedance-2-5-image-to-video',
    label: 'Seedance 2.5 Image to Video',
    mediaType: 'video',
    provider: 'seedance',
    generationType: 'image-to-video',
    request: { endpoint: 'video', modelName: 'seedance-v2.5-image-to-video' },
    inputs: {
      prompt: { supported: true, required: true },
      startFrame: { supported: true, required: true },
      endFrame: { supported: true, required: false },
    },
    params: {
      resolution: ['480p', '720p', '1080p'],
      durationRange: { min: 4, max: 30 },
      sound: true,
      defaultSound: true,
    },
  },
  {
    id: 'seedance-2-5-reference-to-video',
    label: 'Seedance 2.5 Reference to Video',
    mediaType: 'video',
    provider: 'seedance',
    generationType: 'reference-to-video',
    request: { endpoint: 'video', modelName: 'seedance-v2.5-reference-to-video' },
    inputs: {
      prompt: { supported: true, required: true },
      image: { supported: true, required: false, multiple: true, min: 0, max: 30 },
      video: {
        supported: true,
        required: false,
        multiple: true,
        min: 0,
        max: 10,
        minDurationSeconds: 2,
        maxDurationSeconds: 30,
      },
      audio: {
        supported: true,
        required: false,
        multiple: true,
        min: 0,
        max: 10,
        minDurationSeconds: 2,
        maxDurationSeconds: 30,
      },
      startFrame: { supported: false, required: false },
      endFrame: { supported: false, required: false },
    },
    params: {
      ratio: SEEDANCE_RATIOS,
      resolution: ['480p', '720p', '1080p'],
      durationRange: { min: 4, max: 30 },
      sound: true,
      defaultSound: true,
      minReferenceSubjects: 0,
    },
  },
];
