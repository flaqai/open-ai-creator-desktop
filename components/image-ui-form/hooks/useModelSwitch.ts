import { useCallback, useEffect, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

/**
 * Model switch handling Hook (improved version)
 *
 * Responsibilities:
 * 1. Detect model version switch
 * 2. Return flag indicating whether fields need to be reset
 *
 * Design notes:
 * - No longer directly calls callback, but returns needsReset flag
 * - Outer layer executes reset after ratioOptions change
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
 * Field reset handling Hook (improved version)
 *
 * Responsibilities:
 * 1. Listen to needsReset flag
 * 2. When needsReset is true and configuration is ready, reset fields to default values
 *
 * Design notes:
 * - Directly receives ratioOptions/resolutionOptions as dependencies
 * - Ensures reset is executed after new configuration is calculated
 * - Solves the problem of closure capturing old values
 */
export function useFieldReset(params: {
  form: UseFormReturn<any>;
  needsReset: boolean;
  clearResetFlag: () => void;
  ratioOptions: Array<{ value: string; name: string }>;
  resolutionOptions: Array<{ value: string; name: string }>;
  qualityOptions?: Array<{ value: string; name: string }>;
  priorityRules?: {
    aspectRatio?: string[];
    resolution?: string[];
    quality?: string[];
  };
}) {
  const {
    form,
    needsReset,
    clearResetFlag,
    ratioOptions,
    resolutionOptions,
    qualityOptions = [],
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

    const newAspectRatio = selectBestOption(ratioOptions, priorityRules?.aspectRatio || ['1:1']);

    const newResolution = selectBestOption(resolutionOptions, priorityRules?.resolution || ['2k', '4k', '1k']);

    const currentAspectRatio = form.getValues('aspectRatio');
    const currentResolution = form.getValues('resolution');

    const canKeepCurrentAspectRatio =
      !!currentAspectRatio && ratioOptions.some((option) => option.value === currentAspectRatio);

    const canKeepCurrentResolution =
      !!currentResolution && resolutionOptions.some((option) => option.value === currentResolution);

    if (canKeepCurrentAspectRatio) {
      form.setValue('aspectRatio', currentAspectRatio);
    } else if (newAspectRatio) {
      form.setValue('aspectRatio', newAspectRatio);
    }

    if (canKeepCurrentResolution) {
      form.setValue('resolution', currentResolution);
    } else if (newResolution) {
      form.setValue('resolution', newResolution);
    } else if (resolutionOptions.length === 0) {
      // When model has no resolution configuration, clear the field
      form.setValue('resolution', '');
    }

    const newQuality = selectBestOption(qualityOptions, priorityRules?.quality || ['medium', 'high', 'low']);

    const currentQuality = form.getValues('quality');

    const canKeepCurrentQuality = !!currentQuality && qualityOptions.some((option) => option.value === currentQuality);

    if (canKeepCurrentQuality) {
      form.setValue('quality', currentQuality);
    } else if (newQuality) {
      form.setValue('quality', newQuality);
    } else if (qualityOptions.length === 0) {
      form.setValue('quality', '');
    }

    // Clear reset flag
    clearResetFlag();
  }, [needsReset, ratioOptions, resolutionOptions, qualityOptions, priorityRules, form, clearResetFlag]);
}
