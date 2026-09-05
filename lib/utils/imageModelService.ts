import type { ImageGenerationType, ImageModel, RatioOption, ResolutionOption } from '@/lib/constants/image/types';

/**
 * Check if model supports a specific generation type
 */
export function supportsGenerationType(model: ImageModel, generationType: ImageGenerationType): boolean {
  return model.generationType === generationType || (model.supportedTypes?.includes(generationType) ?? false);
}

/**
 * Get resolution options
 */
export function getResolutionOptions(model: ImageModel): ResolutionOption[] {
  return model.options.resolution || [];
}

/**
 * Get ratio options
 */
export function getRatioOptions(model: ImageModel): RatioOption[] {
  return model.options.ratio || [];
}

/**
 * Get model's image input requirements
 */
export function getImageInputRequirements(model: ImageModel) {
  return model.options.imageInput || { required: false, isSupported: false };
}
