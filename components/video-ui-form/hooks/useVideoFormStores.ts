/**
 * Video form state management Hook
 *
 * Centrally manages all Zustand stores required for video form
 * Reduces hooks calls in main component, improves maintainability
 *
 * @example
 * ```tsx
 * const stores = useVideoFormStores();
 * // Use stores.uploadFilesToStorageThroughBackEnd etc.
 * ```
 */

import useVideoFormDefaultStore from '@/store/form/useVideoFormDefaultStore';
import useVideoFormStore from '@/store/form/useVideoFormStore';
import usePricingDialogStore from '@/store/usePricingDialogStore';

import useUploadFiles from '@/hooks/use-upload-files';
import useUpdateUserInfo from '@/hooks/useUpdateUserInfo';

/**
 * Video form state management
 *
 * Consolidates 17 scattered hooks calls into one hook
 * Improves code readability and maintainability
 */
export function useVideoFormStores() {
  // ============================================
  // Dialog control
  // ============================================
  const setOpenPricingDialogStore = usePricingDialogStore((state) => state.setOpen);

  // ============================================
  // Form state
  // ============================================
  const resetDefault = useVideoFormStore((state) => state.resetDefault);
  const defaultPrompt = useVideoFormDefaultStore((state) => state.prompt);

  // ============================================
  // Utility functions
  // ============================================
  const uploadFilesToStorageThroughBackEnd = useUploadFiles();
  const { updateUserInfoWithDelay } = useUpdateUserInfo();

  return {
    // Backward compatible empty placeholder, avoid core form flow continuing to depend on login state
    userInfo: null,
    isPaidUser: true,

    // Dialog
    setOpenPricingDialogStore,

    // Form state
    resetDefault,
    defaultPrompt,
    // Utility functions
    uploadFilesToStorageThroughBackEnd,
    updateUserInfoWithDelay,
  };
}

/**
 * Type export for convenient use elsewhere
 */
export type VideoFormStores = ReturnType<typeof useVideoFormStores>;
