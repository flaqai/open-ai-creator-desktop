/* eslint-disable @typescript-eslint/naming-convention */

import {
  FLUX_VIDEO_MODELS,
  HAPPYHORSE_VIDEO_MODELS,
  KLING_VIDEO_MODELS,
  MINIMAX_VIDEO_MODELS,
  SEEDANCE_VIDEO_MODELS,
  VEO_VIDEO_MODELS,
  VIDU_VIDEO_MODELS,
  WAN_VIDEO_MODELS,
  type TemplateModelConfig,
} from '@/lib/constants/template-models';

import { RATIO_1_1, RATIO_2_1, RATIO_3_4, RATIO_4_3, RATIO_9_16, RATIO_9_21, RATIO_16_9, RATIO_21_9 } from './ratios';
import type {
  ModelVersionConfig,
  ModelVersionOptions,
  ProviderConfig,
  RatioConfig,
  VideoGenerationType,
  VideoModel,
} from './types';

export * from './types';
export * from './ratios';

const VIDEO_RATIO_MAP: Record<string, RatioConfig> = {
  '1:1': RATIO_1_1,
  '2:1': RATIO_2_1,
  '16:9': RATIO_16_9,
  '21:9': RATIO_21_9,
  '4:3': RATIO_4_3,
  '3:4': RATIO_3_4,
  '9:16': RATIO_9_16,
  '9:21': RATIO_9_21,
};

function toRatioOptions(values?: string[]): RatioConfig[] | null {
  if (!values?.length) return null;
  return values.map((value) => VIDEO_RATIO_MAP[value]).filter(Boolean);
}

function toGenerationType(model: TemplateModelConfig): VideoGenerationType {
  if (model.generationType && model.mediaType === 'video') {
    return model.generationType as VideoGenerationType;
  }
  if (model.inputs.startFrame?.supported || model.inputs.endFrame?.supported) {
    return 'image-to-video';
  }
  return 'text-to-video';
}

function toMultiImageOptions(model: TemplateModelConfig) {
  const input = model.inputs.image;
  if (!input?.supported || !input.multiple) return undefined;

  return {
    required: input.required,
    isSupported: true,
    minImages: input.min,
    maxImages: input.max || 1,
    minSidePx: input.minSidePx,
    maxSidePx: input.maxSidePx,
    acceptedFormats: input.acceptedFormats,
    allowAlphaChannel: input.allowAlphaChannel,
  };
}

function toMultiVideoOptions(model: TemplateModelConfig) {
  const input = model.inputs.video;
  if (!input?.supported || !input.multiple) return undefined;

  return {
    required: input.required,
    isSupported: true,
    minVideos: input.min,
    maxVideos: input.max || 1,
    minDurationSeconds: input.minDurationSeconds,
    maxDurationSeconds: input.maxDurationSeconds,
    maxTotalDurationSeconds: input.maxTotalDurationSeconds,
    minSidePx: input.minSidePx,
    maxSidePx: input.maxSidePx,
    acceptedFormats: input.acceptedFormats,
  };
}

function toMultiAudioOptions(model: TemplateModelConfig) {
  const input = model.inputs.audio;
  if (!input?.supported || !input.multiple) return undefined;

  return {
    required: input.required,
    isSupported: true,
    minAudios: input.min,
    maxAudios: input.max || 1,
    minDurationSeconds: input.minDurationSeconds,
    maxDurationSeconds: input.maxDurationSeconds,
    maxTotalDurationSeconds: input.maxTotalDurationSeconds,
    acceptedFormats: input.acceptedFormats,
  };
}

function toReferenceFileOptions(model: TemplateModelConfig) {
  const input = model.inputs.file;
  if (!input?.supported) return undefined;

  return {
    required: input.required,
    isSupported: true,
    maxFiles: input.max || 1,
    acceptedFormats: input.acceptedFormats || [],
    maxPages: input.maxPages,
  };
}

function toReferenceLinkOptions(model: TemplateModelConfig) {
  const input = model.inputs.link;
  if (!input?.supported) return undefined;

  return {
    required: input.required,
    isSupported: true,
    maxLinks: input.max || 1,
  };
}

function toModelOptions(
  model: TemplateModelConfig,
  familyOptions: Partial<ModelVersionOptions>,
): VideoModel['options'] {
  const duration = model.params?.duration?.[0] ?? model.params?.durationRange?.min;

  const resolution = model.params?.resolution?.[0];

  return {
    duration,
    durationRange: model.params?.durationRange,
    resolution,
    ratio: toRatioOptions(model.params?.ratio),
    startFrame: model.inputs.startFrame
      ? {
          isSupported: model.inputs.startFrame.supported,
          required: model.inputs.startFrame.required,
          minSidePx: model.inputs.startFrame.minSidePx,
          maxSidePx: model.inputs.startFrame.maxSidePx,
          acceptedFormats: model.inputs.startFrame.acceptedFormats,
          allowAlphaChannel: model.inputs.startFrame.allowAlphaChannel,
        }
      : { isSupported: false, required: false },
    endFrame: model.inputs.endFrame
      ? {
          isSupported: model.inputs.endFrame.supported,
          required: model.inputs.endFrame.required,
          minSidePx: model.inputs.endFrame.minSidePx,
          maxSidePx: model.inputs.endFrame.maxSidePx,
          acceptedFormats: model.inputs.endFrame.acceptedFormats,
          allowAlphaChannel: model.inputs.endFrame.allowAlphaChannel,
        }
      : { isSupported: false, required: false },
    multiImage: toMultiImageOptions(model),
    multiVideo: toMultiVideoOptions(model),
    multiAudio: toMultiAudioOptions(model),
    referenceFile: toReferenceFileOptions(model),
    referenceLink: toReferenceLinkOptions(model),
    minReferenceSubjects: model.params?.minReferenceSubjects,
    maxReferenceSubjects: model.params?.maxReferenceSubjects,
    independentReferenceLimits: model.params?.independentReferenceLimits,
    audio: !!familyOptions.audio,
    audioUrl: !!model.inputs.audio?.supported && !model.inputs.audio.multiple,
    sound: !!model.params?.sound,
    defaultSound: !!model.params?.defaultSound,
    bgm: !!model.params?.bgm,
    style: model.params?.style,
    videoUrl: model.inputs.video
      ? { isSupported: model.inputs.video.supported, required: model.inputs.video.required }
      : undefined,
    keepOriginalSound: !!model.params?.keepOriginalSound,
    guidanceScale: !!model.params?.guidanceScale,
    seed: model.params?.seed,
    negativePrompt: !!model.params?.negativePrompt,
  };
}

function toVideoModel(
  model: TemplateModelConfig,
  provider: string,
  familyOptions: Partial<ModelVersionOptions>,
): VideoModel {
  return {
    provider,
    modelVersion: model.request.modelName,
    model: model.request.modelName,
    name: model.label,
    platformType: 0,
    pricingType: 'video',
    credit: 0,
    isPaid: false,
    generationType: toGenerationType(model),
    options: toModelOptions(model, familyOptions),
    disabled: model.disabled,
  };
}

function buildModelVersion(model: TemplateModelConfig, provider: string): ModelVersionConfig {
  const options: ModelVersionOptions = {
    duration:
      model.params?.duration?.map((value) => `${value}s`) ??
      (model.params?.durationRange
        ? Array.from(
            { length: model.params.durationRange.max - model.params.durationRange.min + 1 },
            (_, index) => `${model.params!.durationRange!.min + index}s`,
          )
        : undefined),
    durationRange: model.params?.durationRange,
    resolution: model.params?.resolution,
    ratio: toRatioOptions(model.params?.ratio),
    startFrame: model.inputs.startFrame
      ? {
          isSupported: model.inputs.startFrame.supported,
          required: model.inputs.startFrame.required,
          minSidePx: model.inputs.startFrame.minSidePx,
          maxSidePx: model.inputs.startFrame.maxSidePx,
          acceptedFormats: model.inputs.startFrame.acceptedFormats,
          allowAlphaChannel: model.inputs.startFrame.allowAlphaChannel,
        }
      : { isSupported: false, required: false },
    endFrame: model.inputs.endFrame
      ? {
          isSupported: model.inputs.endFrame.supported,
          required: model.inputs.endFrame.required,
          minSidePx: model.inputs.endFrame.minSidePx,
          maxSidePx: model.inputs.endFrame.maxSidePx,
          acceptedFormats: model.inputs.endFrame.acceptedFormats,
          allowAlphaChannel: model.inputs.endFrame.allowAlphaChannel,
        }
      : { isSupported: false, required: false },
    multiImage: toMultiImageOptions(model),
    multiVideo: toMultiVideoOptions(model),
    multiAudio: toMultiAudioOptions(model),
    referenceFile: toReferenceFileOptions(model),
    referenceLink: toReferenceLinkOptions(model),
    minReferenceSubjects: model.params?.minReferenceSubjects,
    maxReferenceSubjects: model.params?.maxReferenceSubjects,
    independentReferenceLimits: model.params?.independentReferenceLimits,
    audio: false,
    audioUrl: !!model.inputs.audio?.supported && !model.inputs.audio.multiple,
    sound: !!model.params?.sound,
    defaultSound: !!model.params?.defaultSound,
    bgm: !!model.params?.bgm,
    style: model.params?.style,
    videoUrl: model.inputs.video
      ? { isSupported: model.inputs.video.supported, required: model.inputs.video.required }
      : undefined,
    keepOriginalSound: !!model.params?.keepOriginalSound,
    guidanceScale: !!model.params?.guidanceScale,
    seed: model.params?.seed,
    negativePrompt: !!model.params?.negativePrompt,
  };

  return {
    provider,
    modelVersion: model.request.modelName,
    name: model.label,
    baseCredit: 0,
    platformType: 0,
    isPaid: false,
    pricingType: 'video',
    options,
    models: [toVideoModel(model, provider, options)],
  };
}

const KLING_PROVIDER: ProviderConfig = {
  provider: 'kling',
  name: 'Kling',
  versions: KLING_VIDEO_MODELS.map((model) => buildModelVersion(model, 'kling')),
};

const SEEDANCE_PROVIDER: ProviderConfig = {
  provider: 'seedance',
  name: 'Seedance',
  versions: SEEDANCE_VIDEO_MODELS.map((model) => buildModelVersion(model, 'seedance')),
};

const FLUX_PROVIDER: ProviderConfig = {
  provider: 'flux',
  name: 'FLUX',
  versions: FLUX_VIDEO_MODELS.map((model) => buildModelVersion(model, 'flux')),
};

const MINIMAX_PROVIDER: ProviderConfig = {
  provider: 'minimax',
  name: 'MiniMax',
  versions: MINIMAX_VIDEO_MODELS.map((model) => buildModelVersion(model, 'minimax')),
};

const HAPPYHORSE_PROVIDER: ProviderConfig = {
  provider: 'happyhorse',
  name: 'Happy Horse',
  versions: HAPPYHORSE_VIDEO_MODELS.map((model) => buildModelVersion(model, 'happyhorse')),
};

const VIDU_PROVIDER: ProviderConfig = {
  provider: 'vidu',
  name: 'Vidu',
  versions: VIDU_VIDEO_MODELS.map((model) => buildModelVersion(model, 'vidu')),
};

const VEO_PROVIDER: ProviderConfig = {
  provider: 'veo',
  name: 'Veo',
  versions: VEO_VIDEO_MODELS.map((model) => buildModelVersion(model, 'veo')),
};

const WAN_PROVIDER: ProviderConfig = {
  provider: 'wan',
  name: 'Wan',
  versions: WAN_VIDEO_MODELS.map((model) => buildModelVersion(model, 'wan')),
};

const KLING_ALL_MODELS: VideoModel[] = KLING_PROVIDER.versions.flatMap((version) => version.models);
const SEEDANCE_ALL_MODELS: VideoModel[] = SEEDANCE_PROVIDER.versions.flatMap((version) => version.models);
const FLUX_ALL_MODELS: VideoModel[] = FLUX_PROVIDER.versions.flatMap((version) => version.models);
const MINIMAX_ALL_MODELS: VideoModel[] = MINIMAX_PROVIDER.versions.flatMap((version) => version.models);
const HAPPYHORSE_ALL_MODELS: VideoModel[] = HAPPYHORSE_PROVIDER.versions.flatMap((version) => version.models);
const VIDU_ALL_MODELS: VideoModel[] = VIDU_PROVIDER.versions.flatMap((version) => version.models);
const VEO_ALL_MODELS: VideoModel[] = VEO_PROVIDER.versions.flatMap((version) => version.models);
const WAN_ALL_MODELS: VideoModel[] = WAN_PROVIDER.versions.flatMap((version) => version.models);

const ALL_PROVIDERS_INTERNAL: ProviderConfig[] = [
  KLING_PROVIDER,
  SEEDANCE_PROVIDER,
  FLUX_PROVIDER,
  MINIMAX_PROVIDER,
  HAPPYHORSE_PROVIDER,
  VEO_PROVIDER,
  VIDU_PROVIDER,
  WAN_PROVIDER,
];

const ALL_PROVIDERS: ProviderConfig[] = ALL_PROVIDERS_INTERNAL;
const VISIBLE_VIDEO_PROVIDERS_INTERNAL: ProviderConfig[] = ALL_PROVIDERS_INTERNAL;

export const ALL_VIDEO_MODELS: VideoModel[] = [
  ...KLING_ALL_MODELS,
  ...SEEDANCE_ALL_MODELS,
  ...FLUX_ALL_MODELS,
  ...MINIMAX_ALL_MODELS,
  ...HAPPYHORSE_ALL_MODELS,
  ...VEO_ALL_MODELS,
  ...VIDU_ALL_MODELS,
  ...WAN_ALL_MODELS,
];

export function getVideoProviderByModelVersion(modelVersion: string): string | null {
  const provider = ALL_PROVIDERS.find((item) => item.versions.some((version) => version.modelVersion === modelVersion));
  return provider?.provider || null;
}

export function getVideoModelVersionName(modelName: string): string | undefined {
  for (const provider of ALL_PROVIDERS) {
    const version = provider.versions.find((item) => item.modelVersion === modelName);
    if (version) return version.name;
  }

  const matchedModel = ALL_VIDEO_MODELS.find((model) => model.model === modelName);
  if (!matchedModel) return undefined;

  for (const provider of ALL_PROVIDERS) {
    const version = provider.versions.find((item) => item.modelVersion === matchedModel.modelVersion);
    if (version) return version.name;
  }

  return undefined;
}

export function versionSupportsImageToVideo(version: ModelVersionConfig): boolean {
  return version.models.some((model) => model.generationType === 'image-to-video');
}

export function versionSupportsTextToVideo(version: ModelVersionConfig): boolean {
  return version.models.some((model) => model.generationType === 'text-to-video');
}

export function versionSupportsReferenceToVideo(version: ModelVersionConfig): boolean {
  return version.models.some((model) => model.generationType === 'reference-to-video');
}

export function getVersionConfig(modelVersion: string): ModelVersionConfig | undefined {
  return ALL_PROVIDERS_INTERNAL.flatMap((provider) => provider.versions).find(
    (version) => version.modelVersion === modelVersion,
  );
}

function parseDurationToNumber(duration?: string): number | undefined {
  if (!duration) return undefined;
  const parsed = parseInt(duration.replace(/\D/g, ''), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function selectVideoModelByGenerationType(
  version: ModelVersionConfig | undefined,
  hasImages: boolean,
  duration?: string,
  resolution?: string,
  _enableAudio?: boolean,
  requestedType?: VideoGenerationType,
): VideoModel | null {
  if (!version) return null;

  let targetType: VideoGenerationType = requestedType || (hasImages ? 'image-to-video' : 'text-to-video');

  const supportsT2V = versionSupportsTextToVideo(version);
  const supportsI2V = versionSupportsImageToVideo(version);

  if (!requestedType) {
    if (supportsI2V && !supportsT2V) targetType = 'image-to-video';
    if (supportsT2V && !supportsI2V) targetType = 'text-to-video';
  }

  const matchedModel = version.models.find((model) => model.generationType === targetType) || version.models[0];
  if (!matchedModel) return null;

  return {
    ...matchedModel,
    options: {
      ...matchedModel.options,
      duration: parseDurationToNumber(duration) ?? matchedModel.options.duration,
      resolution: resolution || matchedModel.options.resolution,
    },
  };
}

export function computeUIOptionsForVersion(
  version: ModelVersionConfig | undefined,
  hasImages: boolean,
): {
  durationOptions: { name: string; value: string }[];
  resolutionOptions: { name: string; value: string }[];
  ratioOptions: RatioConfig[];
  supportsImageInput: boolean;
  supportsEndFrame: boolean;
  supportsAudio: boolean;
  supportsAudioUrl: boolean;
  supportsOptionalAudio: boolean;
  multiImageMaxImages: number;
} {
  const emptyResult = {
    durationOptions: [],
    resolutionOptions: [],
    ratioOptions: [],
    supportsImageInput: false,
    supportsEndFrame: false,
    supportsAudio: false,
    supportsAudioUrl: false,
    supportsOptionalAudio: false,
    multiImageMaxImages: 0,
  };

  if (!version) return emptyResult;

  const currentModel = selectVideoModelByGenerationType(version, hasImages);
  const durationSource =
    version.options.duration ||
    (version.options.durationRange
      ? Array.from(
          { length: version.options.durationRange.max - version.options.durationRange.min + 1 },
          (_, index) => `${version.options.durationRange!.min + index}s`,
        )
      : []);

  return {
    durationOptions: durationSource.map((value) => ({ name: value, value })),
    resolutionOptions: (version.options.resolution || []).map((value) => ({ name: value, value })),
    ratioOptions: currentModel?.options.ratio || version.options.ratio || [],
    supportsImageInput: !!version.options.startFrame?.isSupported,
    supportsEndFrame: !!version.options.endFrame?.isSupported,
    supportsAudio: !!(version.options.audio || version.options.sound),
    supportsAudioUrl: !!version.options.audioUrl,
    supportsOptionalAudio: !!version.options.sound,
    multiImageMaxImages: version.options.multiImage?.maxImages || 0,
  };
}

const RESTRICTED_PROVIDERS: string[] = [];
const RESTRICTED_MODEL_VERSIONS: string[] = [];

function filterRestricted(providers: ProviderConfig[]): ProviderConfig[] {
  return providers
    .filter((provider) => !RESTRICTED_PROVIDERS.includes(provider.provider))
    .map((provider) => ({
      ...provider,
      versions: provider.versions.filter((version) => !RESTRICTED_MODEL_VERSIONS.includes(version.modelVersion)),
    }));
}

export function getFilteredProviders(isAllowed: boolean): ProviderConfig[] {
  if (isAllowed) return ALL_PROVIDERS_INTERNAL;
  return filterRestricted(ALL_PROVIDERS_INTERNAL);
}

export function getFilteredVisibleProviders(isAllowed: boolean): ProviderConfig[] {
  if (isAllowed) return VISIBLE_VIDEO_PROVIDERS_INTERNAL;
  return filterRestricted(VISIBLE_VIDEO_PROVIDERS_INTERNAL);
}
