/**
 * Model switching logic Hook
 *
 * Encapsulates model switching logic for end frame toggle:
 * 1. Check if current model supports target feature
 * 2. If not supported, automatically switch to a supported model
 *
 * @example
 * ```tsx
 * const { handleEndFrameToggle } = useModelToggle({
 *   form,
 *   videoType,
 *   t,
 * });
 * ```
 */

import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

import type { VideoModel } from '@/lib/constants/video/';
import * as VideoModelService from '@/lib/utils/videoModelService';

import type { VideoFormData } from '../types';

/**
 * Parameters for useModelToggle
 */
interface UseModelToggleOptions {
  form: UseFormReturn<VideoFormData>;
  t: (key: string) => string;
}

/**
 * Model switching logic Hook
 */
export default function useModelToggle(options: UseModelToggleOptions) {
  const { form, t } = options;

  /**
   * Capability check utilities
   */
  const modelSupportsAudio = useCallback(
    (model: VideoModel | undefined) => VideoModelService.modelSupportsAudio(model),
    [],
  );

  const modelSupportsEndFrame = useCallback(
    (model: VideoModel | undefined) => VideoModelService.modelSupportsEndFrame(model),
    [],
  );

  /**
   * Find suitable model version based on audio/end frame requirements
   */
  const pickModelVersion = useCallback(
    (opts: { audio?: boolean; endFrame?: boolean }) => {
      // Determine hasImages based on whether startFrame has a value
      const startFrame = form.getValues('startFrame');
      const hasImages = !!(startFrame && (startFrame instanceof File || typeof startFrame === 'string'));

      return VideoModelService.pickModelVersion({
        ...opts,
        currentModelVersion: form.getValues('modelVersion'),
        hasImages,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * Toggle end frame
   * @returns Returns the final toggle state (true means enabled, false means disabled)
   */
  const handleEndFrameToggle = useCallback(
    (enabled: boolean): boolean => {
      const formData = form.getValues();
      const currentModelVersion = formData.modelVersion;

      // If disabling end frame, just disable it
      if (!enabled) {
        return false;
      }

      // Check if current version supports end frame (using version-level config, not specific model)
      const versionConfig = VideoModelService.getVersionConfig(currentModelVersion);
      const versionSupportsEndFrame = !!versionConfig?.options.endFrame?.isSupported;

      if (versionSupportsEndFrame) {
        // Current version supports it, enable directly
        return true;
      }

      // Current version doesn't support end frame, try to find a supported version
      const newModelVersion = pickModelVersion({ endFrame: true });

      if (newModelVersion) {
        // Found a supported version, switch to it
        form.setValue('modelVersion', newModelVersion);
        return true;
      } else {
        // Can't find a version that supports end frame, keep toggle disabled
        return false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pickModelVersion],
  );

  /**
   * Toggle audio: prioritize audio, downgrade to disable end frame if necessary
   * @deprecated Audio control feature is no longer used, this function is kept for compatibility only
   */
  const handleAudioToggle = useCallback((enabled: boolean) => {
    // Audio control is deprecated, no operation performed
    console.warn('handleAudioToggle is deprecated and should not be used');
  }, []);

  return {
    handleAudioToggle,
    handleEndFrameToggle,
    // Also export capability check utilities for use elsewhere
    modelSupportsAudio,
    modelSupportsEndFrame,
  };
}
