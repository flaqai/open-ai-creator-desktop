import { useCallback, useEffect, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

/**
 * Model switch handling Hook (Video version)
 *
 * Responsibilities:
 * 1. Detect model version switch
 * 2. Return flag indicating whether fields need to be reset
 *
 * Design notes:
 * - No longer directly calls callback, but returns needsReset flag
 * - Outer layer executes reset after options change
 * - Solves timing issue of closure capturing old values
 */
export function useModelSwitch(params: {
  selectedModelVersion?: string;
  onModelSwitch?: (from: string | null, to: string) => void;
}): { needsReset: boolean; clearResetFlag: () => void } {
  const { selectedModelVersion, onModelSwitch } = params;
  const prevModelVersionRef = useRef<string | null>(null);
  const [needsReset, setNeedsReset] = useState(false);

  useEffect(() => {
    if (!selectedModelVersion) return;

    // Detect if it's a model version switch
    // When first loading, prevModelVersionRef.current is null, don't trigger
    const isModelSwitch = prevModelVersionRef.current !== null && prevModelVersionRef.current !== selectedModelVersion;

    if (isModelSwitch) {
      // Set flag indicating reset is needed, instead of directly calling callback
      setNeedsReset(true);

      // Optional: still call callback for logging or other purposes
      onModelSwitch?.(prevModelVersionRef.current, selectedModelVersion);
    }

    // Update ref (record current model version)
    prevModelVersionRef.current = selectedModelVersion;
  }, [selectedModelVersion, onModelSwitch]);

  const clearResetFlag = useCallback(() => {
    setNeedsReset(false);
  }, []);

  return { needsReset, clearResetFlag };
}

/**
 * Field reset handling Hook (Video version)
 *
 * Responsibilities:
 * 1. Listen to needsReset flag
 * 2. When needsReset is true and configuration is ready, reset fields to default values
 *
 * Design notes:
 * - Directly receives ratioOptions/durationOptions/resolutionOptions as dependencies
 * - Ensures reset is executed after new configuration is calculated
 * - Solves the problem of closure capturing old values
 */
export function useFieldReset(params: {
  form: UseFormReturn<any>;
  needsReset: boolean;
  clearResetFlag: () => void;
  ratioOptions: Array<{ value: string; name: string }>;
  durationOptions: Array<{ value: string; name: string }>;
  resolutionOptions: Array<{ value: string; name: string }>;
  hasImages: boolean;
  priorityRules?: {
    ratio?: string[];
    duration?: string[];
    resolution?: string[];
  };
}) {
  const {
    form,
    needsReset,
    clearResetFlag,
    ratioOptions,
    durationOptions,
    resolutionOptions,
    hasImages,
    priorityRules,
  } = params;

  // Listen to needsReset and configuration changes, execute reset when configuration is ready
  useEffect(() => {
    if (!needsReset) return;

    // Helper function to select the best option
    const selectBestOption = (
      availableOptions: Array<{ value: string; name: string }>,
      priorities?: string[],
    ): string | undefined => {
      if (!availableOptions || availableOptions.length === 0) {
        return undefined;
      }

      // Find the first available value according to the priority list
      if (priorities && priorities.length > 0) {
        for (const priority of priorities) {
          const found = availableOptions.find((opt) => opt.value === priority);
          if (found) {
            return found.value;
          }
        }
      }

      // If none found, return the first option
      return availableOptions[0]?.value;
    };

    // For image-to-video, ratio is determined by the image, clear it
    const newRatio = hasImages ? '' : selectBestOption(ratioOptions, priorityRules?.ratio || ['16:9', '9:16', '1:1']);

    const newDuration = selectBestOption(durationOptions, priorityRules?.duration || ['5s', '10s']);

    const newResolution = selectBestOption(resolutionOptions, priorityRules?.resolution || ['1080p', '720p', '4k']);

    if (newRatio !== undefined) {
      form.setValue('ratio', newRatio);
    }

    if (newDuration) {
      form.setValue('duration', newDuration);
    } else if (durationOptions.length === 0) {
      // When model has no duration configuration, clear the field
      form.setValue('duration', '');
    }

    if (newResolution) {
      form.setValue('resolution', newResolution);
    } else if (resolutionOptions.length === 0) {
      // When model has no resolution configuration, clear the field
      form.setValue('resolution', '');
    }

    // Clear reset flag
    clearResetFlag();
  }, [needsReset, ratioOptions, durationOptions, resolutionOptions, hasImages, priorityRules, form, clearResetFlag]);
}
