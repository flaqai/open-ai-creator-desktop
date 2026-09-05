/* eslint-disable @typescript-eslint/naming-convention */

import {
  GEMINI_IMAGE_MODELS,
  GPT_IMAGE_MODELS,
  QWEN_IMAGE_MODELS,
  SEEDREAM_IMAGE_MODELS,
  type TemplateModelConfig,
} from '@/lib/constants/template-models';

import type {
  ImageGenerationType,
  ImageModel,
  ImageModelOptions,
  ImageModelVersionConfig,
  ImageProviderConfig,
  RatioOption,
  ResolutionOption,
} from './types';

export * from './types';

const RATIO_ICON_MAP: Record<string, { iconWidth: string; iconHeight: string }> = {
  '21:9': { iconWidth: '21px', iconHeight: '9px' },
  '16:9': { iconWidth: '22px', iconHeight: '12px' },
  '9:16': { iconWidth: '12px', iconHeight: '22px' },
  '9:21': { iconWidth: '9px', iconHeight: '21px' },
  '4:3': { iconWidth: '16px', iconHeight: '12px' },
  '3:4': { iconWidth: '12px', iconHeight: '16px' },
  '3:2': { iconWidth: '16px', iconHeight: '13px' },
  '2:3': { iconWidth: '13px', iconHeight: '16px' },
  '1:1': { iconWidth: '14px', iconHeight: '14px' },
  '4:5': { iconWidth: '14px', iconHeight: '17px' },
  '5:4': { iconWidth: '17px', iconHeight: '14px' },
};

function toRatioOptions(ratios?: string[]): RatioOption[] | undefined {
  if (!ratios?.length) return undefined;

  return ratios.map((value) => ({
    name: value,
    value,
    ...(RATIO_ICON_MAP[value] || { iconWidth: '14px', iconHeight: '14px' }),
  }));
}

function toResolutionOptions(resolutions?: string[]): ResolutionOption[] | undefined {
  if (!resolutions?.length) return undefined;

  return resolutions.map((value) => ({
    name: value.toUpperCase(),
    value,
  }));
}

function toQualityOptions(qualities?: string[]): Array<{ name: string; value: string }> | undefined {
  if (!qualities?.length) return undefined;

  return qualities.map((value) => ({
    name: value.charAt(0).toUpperCase() + value.slice(1),
    value,
  }));
}

function toImageGenerationType(model: TemplateModelConfig): ImageGenerationType {
  const imageInput = model.inputs.image;
  if (imageInput?.supported) {
    return 'image-edit';
  }
  return 'text-to-image';
}

function toSupportedTypes(model: TemplateModelConfig): ImageGenerationType[] | undefined {
  const imageInput = model.inputs.image;
  if (!imageInput?.supported) return undefined;
  if (imageInput.multiple || (imageInput.max || 0) > 1) {
    return ['image-to-image', 'multi-image-to-image'];
  }
  return ['image-to-image'];
}

function toImageModel(model: TemplateModelConfig): ImageModel {
  const imageInput = model.inputs.image;
  const options: ImageModelOptions = {
    ratio: toRatioOptions(model.params?.ratio),
    resolution: toResolutionOptions(model.params?.resolution),
    quality: toQualityOptions(model.params?.quality),
    seed: !!model.params?.seed,
    imageInput: imageInput?.supported
      ? {
          required: imageInput.required,
          isSupported: true,
          min: imageInput.min,
          max: imageInput.max,
        }
      : {
          required: false,
          isSupported: false,
        },
  };

  return {
    provider: model.provider || 'unknown',
    modelVersion: model.request.modelName,
    model: model.request.modelName,
    name: model.label,
    platformType: 0,
    baseCredit: 0,
    isPaid: false,
    pricingType: 'image',
    generationType: toImageGenerationType(model),
    supportedTypes: toSupportedTypes(model),
    options,
  };
}

function toVersionConfig(model: TemplateModelConfig): ImageModelVersionConfig {
  const mappedModel = toImageModel(model);

  return {
    provider: mappedModel.provider,
    modelVersion: mappedModel.modelVersion,
    name: mappedModel.name,
    baseCredit: 0,
    platformType: 0,
    isPaid: false,
    pricingType: 'image',
    options: {
      resolution: mappedModel.options.resolution,
      ratio: mappedModel.options.ratio,
      quality: mappedModel.options.quality,
      seed: mappedModel.options.seed,
    },
    models: [mappedModel],
  };
}

const GEMINI_VERSION_CONFIGS: ImageModelVersionConfig[] = GEMINI_IMAGE_MODELS.map(toVersionConfig);
const SEEDREAM_VERSION_CONFIGS: ImageModelVersionConfig[] = SEEDREAM_IMAGE_MODELS.map(toVersionConfig);
const GPT_VERSION_CONFIGS: ImageModelVersionConfig[] = GPT_IMAGE_MODELS.map(toVersionConfig);
const QWEN_VERSION_CONFIGS: ImageModelVersionConfig[] = QWEN_IMAGE_MODELS.map(toVersionConfig);

export const GEMINI_PROVIDER: ImageProviderConfig = {
  provider: 'gemini',
  name: 'Gemini',
  versions: GEMINI_VERSION_CONFIGS,
};

export const NANO_BANANA_PROVIDER: ImageProviderConfig = GEMINI_PROVIDER;

export const SEEDREAM_PROVIDER: ImageProviderConfig = {
  provider: 'seedream',
  name: 'Seedream',
  versions: SEEDREAM_VERSION_CONFIGS,
};

export const GPT_PROVIDER: ImageProviderConfig = {
  provider: 'openai',
  name: 'OpenAI',
  versions: GPT_VERSION_CONFIGS,
};

export const QWEN_PROVIDER: ImageProviderConfig = {
  provider: 'qwen',
  name: 'Qwen',
  versions: QWEN_VERSION_CONFIGS,
};

export const ALL_IMAGE_PROVIDERS: ImageProviderConfig[] = [
  SEEDREAM_PROVIDER,
  GEMINI_PROVIDER,
  GPT_PROVIDER,
  QWEN_PROVIDER,
];

const GEMINI_ALL_MODELS: ImageModel[] = GEMINI_PROVIDER.versions.flatMap((version) => version.models);
const SEEDREAM_ALL_MODELS: ImageModel[] = SEEDREAM_PROVIDER.versions.flatMap((version) => version.models);
const GPT_ALL_MODELS: ImageModel[] = GPT_PROVIDER.versions.flatMap((version) => version.models);
const QWEN_ALL_MODELS: ImageModel[] = QWEN_PROVIDER.versions.flatMap((version) => version.models);
export const ALL_IMAGE_MODELS: ImageModel[] = [
  ...SEEDREAM_ALL_MODELS,
  ...GEMINI_ALL_MODELS,
  ...GPT_ALL_MODELS,
  ...QWEN_ALL_MODELS,
];

export function getImageModelVersionName(modelName: string): string | undefined {
  const imageModel = ALL_IMAGE_MODELS.find((model) => model.model === modelName);
  if (!imageModel) return undefined;

  for (const provider of ALL_IMAGE_PROVIDERS) {
    const version = provider.versions.find((item) => item.modelVersion === imageModel.modelVersion);
    if (version) {
      return version.name;
    }
  }

  return undefined;
}
