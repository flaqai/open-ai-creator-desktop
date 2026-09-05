/**
 * Form synchronization logic Hook
 *
 * Encapsulates all useEffect for automatic form field synchronization:
 * 1. Listen to model changes, automatically sync ratio (aspect ratio)
 * 2. Listen to model changes, automatically sync duration and resolution
 * 3. Listen to model changes, automatically sync enableEndFrame
 *
 * These useEffect ensure form fields automatically adapt when user switches models or uploads/deletes images
 *
 * @example
 * ```tsx
 * useFormSync({
 *   form,
 *   currentModel,
 *   currentVersionConfig,
 *   durationOptions,
 *   resolutionOptions,
 *   ratioOptions,
 *   modelVersion,
 *   hasImages,
 *   defaultValues,
 *   defaultValuePriority,
 * });
 * ```
 */

import { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { type ModelVersionConfig, type VideoModel } from '@/lib/constants/video/';

import type { FormOption, VideoFormData } from '../types';

/**
 * Parameters for useFormSync
 */
interface UseFormSyncOptions {
  form: UseFormReturn<VideoFormData>;
  currentModel: VideoModel | null | undefined;
  currentVersionConfig: ModelVersionConfig | undefined;
  durationOptions: FormOption[];
  ratioOptions: FormOption[];
  resolutionOptions: FormOption[];
  modelVersion: string;
  hasImages: boolean;
  defaultValues?: Partial<VideoFormData>;
  defaultValuePriority?: {
    ratio?: string[];
    duration?: string[];
    resolution?: string[];
  };
}

function isSupportedValue(value: string | undefined, options: Array<{ value: string }>): value is string {
  if (!value) return false;
  return options.some((opt) => opt.value === value);
}

function pickBestValue(params: {
  currentValue?: string;
  options: Array<{ value: string }>;
  priorities?: Array<string | undefined>;
}): string {
  const { currentValue, options, priorities } = params;

  if (!options || options.length === 0) return '';

  if (isSupportedValue(currentValue, options)) {
    return currentValue;
  }

  if (priorities && priorities.length > 0) {
    for (const p of priorities) {
      if (isSupportedValue(p, options)) {
        return p;
      }
    }
  }

  return options[0]?.value || '';
}

/**
 * Form synchronization logic Hook
 *
 * Integrates useEffect into one hook to make the main component cleaner
 */
export default function useFormSync(options: UseFormSyncOptions) {
  const {
    form,
    currentModel,
    currentVersionConfig,
    durationOptions,
    ratioOptions,
    resolutionOptions,
    modelVersion,
    hasImages,
    defaultValues,
    defaultValuePriority,
  } = options;

  const prevModelVersionRef = useRef<string | null>(null);

  // Detect if model has switched (calculate before all useEffect)
  const isModelSwitch = prevModelVersionRef.current !== null && prevModelVersionRef.current !== modelVersion;

  // useEffect 1: ratio
  useEffect(() => {
    if (!currentModel) return;

    if (!ratioOptions || ratioOptions.length === 0) {
      form.setValue('ratio', '');
      return;
    }

    const currentRatio = isModelSwitch ? undefined : form.getValues('ratio');

    const nextRatio = pickBestValue({
      currentValue: currentRatio,
      options: ratioOptions,
      priorities: [
        defaultValues?.ratio,
        ...(defaultValuePriority?.ratio?.length ? defaultValuePriority.ratio : ['16:9', '9:16', '1:1']),
      ],
    });

    if (nextRatio && nextRatio !== form.getValues('ratio')) {
      setTimeout(() => form.setValue('ratio', nextRatio), 0);
    }
  }, [modelVersion, currentModel, ratioOptions, defaultValues?.ratio, defaultValuePriority?.ratio, isModelSwitch]);

  // useEffect 2: duration / resolution
  useEffect(() => {
    if (!currentVersionConfig) return;

    // duration
    if (!durationOptions || durationOptions.length === 0) {
      form.setValue('duration', '');
    } else {
      const currentDuration = isModelSwitch ? undefined : form.getValues('duration');
      const modelDuration = currentModel?.options?.duration ? `${currentModel.options.duration}s` : undefined;

      const nextDuration = pickBestValue({
        currentValue: currentDuration,
        options: durationOptions,
        priorities: [
          defaultValues?.duration,
          ...(defaultValuePriority?.duration?.length ? defaultValuePriority.duration : ['5s', '6s', '10s']),
          modelDuration,
        ],
      });

      if (nextDuration && nextDuration !== form.getValues('duration')) {
        setTimeout(() => form.setValue('duration', nextDuration), 0);
      }
    }

    // resolution
    if (!resolutionOptions || resolutionOptions.length === 0) {
      form.setValue('resolution', '');
    } else {
      const currentResolution = isModelSwitch ? undefined : form.getValues('resolution');
      const modelResolution = currentModel?.options?.resolution;

      const nextResolution = pickBestValue({
        currentValue: currentResolution,
        options: resolutionOptions,
        priorities: [
          defaultValues?.resolution,
          ...(defaultValuePriority?.resolution?.length ? defaultValuePriority.resolution : ['720p', '1080p']),
          modelResolution,
        ],
      });

      if (nextResolution && nextResolution !== form.getValues('resolution')) {
        setTimeout(() => form.setValue('resolution', nextResolution), 0);
      }
    }
  }, [
    modelVersion,
    currentVersionConfig,
    durationOptions,
    resolutionOptions,
    currentModel,
    hasImages,
    defaultValues?.duration,
    defaultValues?.resolution,
    defaultValuePriority?.duration,
    defaultValuePriority?.resolution,
    isModelSwitch,
  ]);

  // useEffect 3: enableEndFrame (only on model switch)
  useEffect(() => {
    if (!isModelSwitch) return;

    const supportsEndFrame = !!currentModel?.options?.endFrame?.isSupported;

    if (!supportsEndFrame && form.getValues('enableEndFrame')) {
      form.setValue('enableEndFrame', false);
    }
  }, [modelVersion, currentModel, form, isModelSwitch]);

  // useEffect 4: clear optional model parameters when the selected model does not support them
  useEffect(() => {
    if (!currentModel) return;

    const modelOptions = currentModel.options;

    if (!modelOptions.bgm && form.getValues('enableBgm')) {
      form.setValue('enableBgm', false);
    }

    const style = form.getValues('style');
    if (!modelOptions.style?.length && style) {
      form.setValue('style', '');
    }

    if (modelOptions.style?.length && !modelOptions.style.includes(style || '')) {
      form.setValue('style', modelOptions.style[0]);
    }

    if (!modelOptions.seed && form.getValues('seed')) {
      form.setValue('seed', undefined);
    }

    if (!modelOptions.negativePrompt && form.getValues('negativePrompt')) {
      form.setValue('negativePrompt', '');
    }

    if (!modelOptions.guidanceScale && form.getValues('guidanceScale')) {
      form.setValue('guidanceScale', undefined);
    }

    if (!modelOptions.keepOriginalSound && form.getValues('keepOriginalSound')) {
      form.setValue('keepOriginalSound', false);
    }
  }, [currentModel, form, modelVersion, hasImages]);

  // Update ref uniformly (after all effects have executed)
  useEffect(() => {
    prevModelVersionRef.current = modelVersion;
  }, [modelVersion]);
}
