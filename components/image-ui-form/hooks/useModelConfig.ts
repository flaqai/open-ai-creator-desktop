import { useMemo } from 'react';

import { ALL_IMAGE_PROVIDERS } from '@/lib/constants/image';
import type { ImageModel, ImageModelVersionConfig } from '@/lib/constants/image/types';
import { supportsGenerationType } from '@/lib/utils/imageModelService';

/**
 * Model configuration parsing Hook
 *
 * Responsibilities:
 * 1. Get version configuration based on modelVersion
 * 2. Provide UI configuration (ratio/resolution options)
 * 3. Provide model selection function (for use during submission)
 */
export function useModelConfig(params: {
  selectedModelVersion?: string;
  customVersionList?: ImageModelVersionConfig[];
}) {
  const { selectedModelVersion, customVersionList } = params;

  // 1. Get version configuration
  const versionConfig = useMemo(() => {
    if (!selectedModelVersion) return null;

    // Prioritize searching from customVersionList
    if (customVersionList) {
      const config = customVersionList.find((v) => v.modelVersion === selectedModelVersion);
      return config || null;
    }

    // Otherwise search from ALL_IMAGE_PROVIDERS
    const config = ALL_IMAGE_PROVIDERS.flatMap((p) => p.versions).find((v) => v.modelVersion === selectedModelVersion);

    return config || null;
  }, [selectedModelVersion, customVersionList]);

  // 2. UI configuration (from version level, not affected by internal model switching)
  const uiConfig = useMemo(() => {
    if (!versionConfig) {
      return {
        ratioOptions: [],
        resolutionOptions: [],
        qualityOptions: [],
        supportsImageInput: false,
        maxImages: 0,
      };
    }

    const supportsImageInput = versionConfig.models.some((m) => m.options?.imageInput?.isSupported);

    const editModel = versionConfig.models.find((m) => m.options?.imageInput?.isSupported);
    const maxImages = editModel?.options?.imageInput?.max || 5;

    const config = {
      ratioOptions: versionConfig.options?.ratio || [],
      resolutionOptions: versionConfig.options?.resolution || [],
      qualityOptions: versionConfig.options?.quality || [],
      supportsImageInput,
      maxImages,
    };

    return config;
  }, [versionConfig]);

  // 3. Model selection function (select specific model based on whether there are images)
  const selectModel = useMemo(() => {
    return (hasImages: boolean): ImageModel | null => {
      if (!versionConfig) return null;

      if (hasImages) {
        return (
          versionConfig.models.find(
            (m) => supportsGenerationType(m, 'image-edit') || supportsGenerationType(m, 'multi-image-to-image'),
          ) || versionConfig.models[0]
        );
      } else {
        return versionConfig.models.find((m) => m.generationType === 'text-to-image') || versionConfig.models[0];
      }
    };
  }, [versionConfig]);

  return {
    versionConfig,
    uiConfig,
    selectModel,
  };
}
