import type { ImageModel, ImageModelVersionConfig } from '@/lib/constants/image/types';

/**
 * Convert ImageModel array to ImageModelVersionConfig array
 * Used to convert custom model list to version configuration format
 */
export function convertModelsToVersionConfigs(models: ImageModel[]): ImageModelVersionConfig[] {
  return models.map((model) => ({
    provider: model.provider,
    modelVersion: model.modelVersion,
    name: model.name,
    baseCredit: model.baseCredit,
    platformType: model.platformType,
    isPaid: model.isPaid,
    pricingType: model.pricingType,
    isComingSoon: model.isComingSoon,
    options: {
      resolution: model.options?.resolution,
      ratio: model.options?.ratio,
    },
    models: [model], // Wrap single model into array, preserving complete model configuration (including imageInput)
  }));
}
