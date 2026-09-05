import { useCallback } from 'react';

/**
 * Field default value calculation Hook (Video version)
 *
 * Responsibilities:
 * 1. Select best default value based on available options and priority list
 * 2. Pure function, no side effects
 */
export function useFieldDefaults() {
  /**
   * Select best option
   *
   * Logic: Find the first available option according to priority list
   * If no available option in priority list, return the first available option
   */
  const selectBestOption = useCallback(
    (availableOptions: Array<{ value: string; name: string }>, priorityList?: string[]): string | undefined => {
      if (!availableOptions || availableOptions.length === 0) {
        return undefined;
      }

      // Find the first available value according to priority list
      if (priorityList && priorityList.length > 0) {
        for (const priority of priorityList) {
          const found = availableOptions.find((opt) => opt.value === priority);
          if (found) {
            return found.value;
          }
        }
      }

      // None found, return the first option
      return availableOptions[0]?.value;
    },
    [],
  );

  /**
   * Calculate field default values
   */
  const calculateDefaults = useCallback(
    (params: {
      ratioOptions: Array<{ value: string; name: string }>;
      durationOptions: Array<{ value: string; name: string }>;
      resolutionOptions: Array<{ value: string; name: string }>;
      priorityRules?: {
        ratio?: string[];
        duration?: string[];
        resolution?: string[];
      };
    }) => {
      const { ratioOptions, durationOptions, resolutionOptions, priorityRules } = params;

      const ratio = selectBestOption(ratioOptions, priorityRules?.ratio || ['16:9', '9:16', '1:1']);

      const duration = selectBestOption(durationOptions, priorityRules?.duration || ['5s', '6s', '10s']);

      const resolution = selectBestOption(resolutionOptions, priorityRules?.resolution || ['720p', '1080p']);

      return {
        ratio: ratio || '',
        duration: duration || '',
        resolution: resolution || '',
      };
    },
    [selectBestOption],
  );

  return {
    selectBestOption,
    calculateDefaults,
  };
}
