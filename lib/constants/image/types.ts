/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Image generation type
 * Strictly corresponds to input/output types supported by backend models
 */
export type ImageGenerationType =
  | 'text-to-image'
  | 'image-to-image'
  | 'multi-image-to-image'
  | 'image-edit'
  | 'image-variation';

/**
 * Resolution option type
 */
export interface ResolutionOption {
  name: string;
  value: string;
  credit?: number;
}

/**
 * Ratio option type
 */
export interface RatioOption {
  name: string;
  value: string;
  iconWidth: string;
  iconHeight: string;
  credit?: number;
}

/**
 * Image model configuration
 */
export interface ImageModel {
  provider: string;
  modelVersion: string;
  model: string;
  name: string;
  platformType: number;
  baseCredit: number;
  isPaid: boolean;
  pricingType: 'image';

  // Generation type (model intrinsic property)
  generationType: ImageGenerationType;
  supportedTypes?: ImageGenerationType[];

  // Parameter configuration
  options: ImageModelOptions;

  previewUrl?: string;
  tag?: string;
  isComingSoon?: boolean;
}

/**
 * Image model parameter options
 */
export interface ImageModelOptions {
  // Image input configuration
  imageInput?: {
    required: boolean;
    isSupported: boolean;
    min?: number;
    max?: number;
  };

  // Parameter options
  resolution?: ResolutionOption[];
  ratio?: RatioOption[];
  quality?: Array<{ name: string; value: string }>;
  seed?: boolean;

  // Preset prompt
  prompt?: string;
}

/**
 * Model version configuration
 */
export interface ImageModelVersionConfig {
  provider: string;
  modelVersion: string;
  name: string;
  baseCredit: number;
  platformType: number;
  isPaid: boolean;
  pricingType: 'image';
  isComingSoon?: boolean;
  options: {
    resolution?: ResolutionOption[];
    ratio?: RatioOption[];
    quality?: Array<{ name: string; value: string }>;
    seed?: boolean;
  };
  models: ImageModel[];
}

/**
 * Provider configuration
 */
export interface ImageProviderConfig {
  provider: string;
  name: string;
  versions: ImageModelVersionConfig[];
}
