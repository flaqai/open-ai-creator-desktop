import {
  getFilteredProviders,
  getFilteredVisibleProviders,
  getVideoProviderByModelVersion,
  selectVideoModelByGenerationType,
  versionSupportsImageToVideo,
  versionSupportsTextToVideo,
} from '@/lib/constants/video/';
import type { VideoGenerationType, VideoModel } from '@/lib/constants/video/types';

/**
 * Check if the model supports a specific generation type
 */
export function supportsGenerationType(model: VideoModel, generationType: VideoGenerationType): boolean {
  return model.generationType === generationType;
}

/**
 * Calculate the actual credit required based on model configuration and user-selected parameters
 */
export function calculateVideoCredit(
  model: VideoModel,
  _params: {
    generationType?: VideoGenerationType;
    duration?: number;
    resolution?: string;
  },
): number {
  // Video models currently use fixed credit
  // Can be extended here if dynamic credit is needed in the future
  return model.credit;
}

/**
 * Get the start frame configuration of the model
 */
export function getStartFrameConfig(model: VideoModel) {
  return model.options.startFrame;
}

/**
 * Get the end frame configuration of the model
 */
export function getEndFrameConfig(model: VideoModel) {
  return model.options.endFrame;
}

/**
 * Check if the model requires image input
 */
export function requiresImageInput(model: VideoModel): boolean {
  return model.options.startFrame?.required === true;
}

/**
 * Check if the model supports image input
 */
export function supportsImageInput(model: VideoModel): boolean {
  return model.options.startFrame?.isSupported === true || model.options.endFrame?.isSupported === true;
}

/**
 * Get model version configuration
 */
export function getVersionConfig(modelVersionStr?: string) {
  if (!modelVersionStr) return undefined;
  const providers = getFilteredProviders(true);

  return providers.flatMap((provider) => provider.versions).find((v) => v.modelVersion === modelVersionStr);
}

/**
 * Get matching model based on model version and parameters
 */
export function getCurrentModel(
  modelVersionStr?: string,
  duration?: string,
  resolution?: string,
  hasImages?: boolean,
  enableAudio?: boolean,
): VideoModel | undefined {
  const filteredProviders = getFilteredProviders(true);

  if (!filteredProviders || filteredProviders.length === 0) {
    return undefined;
  }

  const foundVersion = filteredProviders
    .flatMap((provider) => provider.versions)
    .find((v) => v.modelVersion === modelVersionStr);

  if (!foundVersion) {
    const fallbackVersion = filteredProviders[0]?.versions[0];
    return (
      selectVideoModelByGenerationType(fallbackVersion, !!hasImages, duration, resolution, enableAudio) ?? undefined
    );
  }

  return selectVideoModelByGenerationType(foundVersion, !!hasImages, duration, resolution, enableAudio) ?? undefined;
}

/**
 * Get default model version
 */
export function getDefaultModel(): string {
  const preferredModel = 'seedance-v2.5-text-to-video';
  const providers = getFilteredProviders(true);
  const preferredVersion = providers
    .flatMap((provider) => provider.versions)
    .find((version) => version.modelVersion === preferredModel);

  if (preferredVersion) {
    return preferredVersion.modelVersion;
  }

  if (providers && providers.length > 0 && providers[0].versions.length > 0) {
    return providers[0].versions[0].modelVersion;
  }
  return '';
}

/**
 * Check if the model supports audio
 */
export function modelSupportsAudio(model: VideoModel | undefined): boolean {
  return !!(model && model.options.audio);
}

/**
 * Check if the model supports end frame
 */
export function modelSupportsEndFrame(model: VideoModel | undefined): boolean {
  return !!model?.options.endFrame?.isSupported;
}

/**
 * Find suitable model version based on audio/end frame requirements
 */
export function pickModelVersion(options: {
  audio?: boolean;
  endFrame?: boolean;
  currentModelVersion: string;
  hasImages?: boolean;
}): string | undefined {
  const { audio, endFrame, currentModelVersion, hasImages } = options;

  const versions = getFilteredVisibleProviders(true)
    .flatMap((provider) => provider.versions)
    .filter((version) => {
      if (hasImages) {
        return versionSupportsImageToVideo(version);
      }
      return versionSupportsTextToVideo(version);
    });

  const versionMatchesRequirements = (version: (typeof versions)[0]) => {
    if (audio && !version.options.audio) return false;
    if (endFrame && !version.options.endFrame?.isSupported) return false;
    return true;
  };

  const currentProvider = getVideoProviderByModelVersion(currentModelVersion);

  if (currentProvider) {
    const sameBrandVersion = versions.find((v) => v.provider === currentProvider && versionMatchesRequirements(v));
    if (sameBrandVersion) {
      return sameBrandVersion.modelVersion;
    }
  }

  const foundVersion = versions.find(versionMatchesRequirements);

  return foundVersion?.modelVersion;
}
