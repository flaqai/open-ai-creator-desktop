import { useCallback } from 'react';

import type { RatioOption, ResolutionOption } from '@/lib/constants/image/types';

/**
 * Field default value calculation Hook
 *
 * Responsibilities:
 * 1. Select the best default value based on available options and priority list
 * 2. Pure function, no side effects
 */
export function useFieldDefaults() {
  /**
   * Select the best option
   *
   * Logic: Find the first available option according to the priority list
   * If no available option in the priority list, return the first available option
   */
  const selectBestOption = useCallback(
    (availableOptions: Array<{ value: string; name: string }>, priorityList?: string[]): string | undefined => {
      if (!availableOptions || availableOptions.length === 0) {
        return undefined;
      }

      // Find the first available value according to the priority list
      if (priorityList && priorityList.length > 0) {
        for (const priority of priorityList) {
          const found = availableOptions.find((opt) => opt.value === priority);
          if (found) {
            return found.value;
          }
        }
      }

      // If none found, return the first option
      return availableOptions[0]?.value;
    },
    [],
  );

  /**
   * Calculate field default values
   */
  const calculateDefaults = useCallback(
    (params: {
      ratioOptions: RatioOption[];
      resolutionOptions: ResolutionOption[];
      priorityRules?: {
        aspectRatio?: string[];
        resolution?: string[];
      };
    }) => {
      const { ratioOptions, resolutionOptions, priorityRules } = params;

      const aspectRatio = selectBestOption(ratioOptions, priorityRules?.aspectRatio || ['16:9', '1:1']);

      const resolution = selectBestOption(resolutionOptions, priorityRules?.resolution || ['2k', '4k', '1k']);

      console.log('[useFieldDefaults] calculateDefaults:', {
        ratioOptions: ratioOptions.map((r) => r.value),
        resolutionOptions: resolutionOptions.map((r) => r.value),
        selectedRatio: aspectRatio,
        selectedResolution: resolution,
      });

      return {
        aspectRatio: aspectRatio || '',
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
