/**
 * Video model configuration parsing Hook
 *
 * Corresponds to image-form's useModelConfig, responsibilities:
 * 1. Get version configuration based on modelVersion
 * 2. Dynamically calculate UI configuration based on hasImages (ratio/resolution/duration options)
 * 3. Provide model selection function (for use during submission)
 *
 * @example
 * ```tsx
 * const { versionConfig, uiConfig, selectModel } = useVideoModelConfig({
 *   selectedModelVersion: 'wan-v2-5',
 *   hasImages: false,
 * });
 * ```
 */

import { useMemo } from 'react';

import {
  computeUIOptionsForVersion,
  getVersionConfig,
  selectVideoModelByGenerationType,
  versionSupportsImageToVideo,
  versionSupportsTextToVideo,
  type ModelVersionConfig,
  type RatioConfig,
  type VideoModel,
} from '@/lib/constants/video';

export interface VideoModelConfigParams {
  selectedModelVersion?: string;
  hasImages: boolean;
}

export interface VideoUIConfig {
  durationOptions: { name: string; value: string }[];
  resolutionOptions: { name: string; value: string }[];
  ratioOptions: RatioConfig[];
  supportsImageInput: boolean;
  supportsEndFrame: boolean;
  supportsAudio: boolean;
  supportsAudioUrl: boolean;
  supportsOptionalAudio: boolean;
  multiImageMaxImages: number;
}

export interface UseVideoModelConfigResult {
  versionConfig: ModelVersionConfig | undefined;
  uiConfig: VideoUIConfig;
  selectModel: (
    hasImagesAtSubmit: boolean,
    duration?: string,
    resolution?: string,
    enableAudio?: boolean,
  ) => VideoModel | null;
  supportedTypes: ('text-to-video' | 'image-to-video')[];
}

/**
 * Video model configuration parsing Hook
 */
export function useVideoModelConfig(params: VideoModelConfigParams): UseVideoModelConfigResult {
  const { selectedModelVersion, hasImages } = params;

  // 1. Get version configuration
  const versionConfig = useMemo(() => {
    if (!selectedModelVersion) return undefined;
    return getVersionConfig(selectedModelVersion);
  }, [selectedModelVersion]);

  // 2. Calculate supported generation types
  const supportedTypes = useMemo(() => {
    if (!versionConfig) return [];
    const types: ('text-to-video' | 'image-to-video')[] = [];
    if (versionSupportsTextToVideo(versionConfig)) {
      types.push('text-to-video');
    }
    if (versionSupportsImageToVideo(versionConfig)) {
      types.push('image-to-video');
    }
    return types;
  }, [versionConfig]);

  // 3. UI configuration (dynamically calculated based on hasImages)
  const uiConfig = useMemo(() => {
    return computeUIOptionsForVersion(versionConfig, hasImages);
  }, [versionConfig, hasImages]);

  // 4. Model selection function (for use during submission)
  const selectModel = useMemo(() => {
    return (
      hasImagesAtSubmit: boolean,
      duration?: string,
      resolution?: string,
      enableAudio?: boolean,
    ): VideoModel | null => {
      return selectVideoModelByGenerationType(versionConfig, hasImagesAtSubmit, duration, resolution, enableAudio);
    };
  }, [versionConfig]);

  return {
    versionConfig,
    uiConfig,
    selectModel,
    supportedTypes,
  };
}

export default useVideoModelConfig;
