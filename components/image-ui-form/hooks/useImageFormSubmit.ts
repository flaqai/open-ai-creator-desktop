/**
 * Image form submission logic Hook
 *
 * Encapsulates the complete form submission process:
 * 1. Form validation (required fields)
 * 2. File upload handling
 * 3. API call
 * 4. Success/failure handling
 *
 * @example
 * ```tsx
 * const { handleSubmit, isSubmitting } = useImageFormSubmit({
 *   imageFormType: 'ai-image-generator',
 *   selectModel,
 *   showPromptInput: true,
 *   requireImageUpload: false,
 *   formatPrompt,
 *   submitBtnId: 'submit-btn',
 *   t,
 * });
 * ```
 */

import { useCallback, useState } from 'react';
import { getClientOpenApiConfigAsync } from '@/network/clientFetch';
import { createImageTask } from '@/network/image/client';
import { addPendingImageHistory } from '@/network/image/history';
import { startTaskPolling } from '@/network/task-polling';
import useGenerationPollingStore from '@/store/useGenerationPollingStore';
import { toast } from 'sonner';

import type { ImageModel } from '@/lib/constants/image/types';
import { sendGAEventBtnClicked } from '@/lib/utils/analyticsUtils';
import { FileType } from '@/lib/utils/fileUtils';
import { showConfettiFireworks } from '@/lib/utils/uiUtils';
import useUploadFiles from '@/hooks/use-upload-files';

import type { ImageFormData } from '../types';
import { buildImageGenerationRequest } from '../utils/submitUtils';

/**
 * Parameters for useImageFormSubmit
 */
interface UseImageFormSubmitOptions {
  imageFormType: string;
  selectModel: (hasImages: boolean) => ImageModel | undefined;
  showPromptInput?: boolean;
  requireImageUpload?: boolean;
  formatPrompt?: (prompt: string) => string;
  submitBtnId?: string;
  t: (key: string) => string;
}

/**
 * Image form submission Hook
 */
export function useImageFormSubmit(options: UseImageFormSubmitOptions) {
  const {
    imageFormType,
    selectModel,
    showPromptInput = true,
    requireImageUpload = false,
    formatPrompt,
    submitBtnId = 'image-form-submit-btn',
    t,
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addProcessingTask = useGenerationPollingStore((state) => state.add);
  const removeProcessingTask = useGenerationPollingStore((state) => state.remove);
  const uploadFilesToStorageThroughBackEnd = useUploadFiles();

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (formData: ImageFormData, event?: React.BaseSyntheticEvent) => {
      if (isSubmitting) return;

      event?.stopPropagation();
      sendGAEventBtnClicked(submitBtnId);

      // Select specific model based on form data (with or without images)
      const hasImagesInForm =
        (formData.images && formData.images.length > 0) ||
        formData.subjectImage ||
        formData.objectImage ||
        (formData.objectImages && formData.objectImages.length > 0);
      const modelToUse = selectModel(hasImagesInForm);

      if (!modelToUse) {
        toast.error('Please select a model');
        return;
      }

      if (showPromptInput && !formData.prompt) {
        toast.error(t('noPromptInput'));
        return;
      }

      if (requireImageUpload) {
        const isProductMode = 'subjectImage' in formData || 'objectImage' in formData || 'objectImages' in formData;
        if (isProductMode) {
          const hasObjectImage = formData.objectImage || (formData.objectImages && formData.objectImages.length > 0);
          if (!formData.subjectImage || !hasObjectImage) {
            toast.error(t('noImageUpload'));
            return;
          }
        } else if (!formData.images || formData.images.length === 0) {
          toast.error(t('noImageUpload'));
          return;
        }
      }

      // Declare res to access in catch block
      let res;

      setIsSubmitting(true);

      try {
        // Upload images - supports mixed File and URL
        const filesToUpload: FileType[] = [];
        const existingImageUrls: string[] = [];

        (formData.images || []).forEach((image: File | string) => {
          if (typeof image === 'string') {
            existingImageUrls.push(image);
          } else if (image instanceof File) {
            filesToUpload.push({
              data: image,
              type: image.type,
            });
          }
        });

        // Handle subjectImage and objectImage (for product-to-video scenarios)
        if (formData.subjectImage) {
          if (typeof formData.subjectImage === 'string') {
            existingImageUrls.push(formData.subjectImage);
          } else if (formData.subjectImage instanceof File) {
            filesToUpload.push({
              data: formData.subjectImage,
              type: formData.subjectImage.type,
            });
          }
        }
        if (formData.objectImage) {
          if (typeof formData.objectImage === 'string') {
            existingImageUrls.push(formData.objectImage);
          } else if (formData.objectImage instanceof File) {
            filesToUpload.push({ data: formData.objectImage, type: formData.objectImage.type });
          }
        }

        // Handle objectImages array (for virtual-try-on multi-image scenarios)
        if (formData.objectImages && formData.objectImages.length > 0) {
          formData.objectImages.forEach((img: File | string) => {
            if (typeof img === 'string') {
              existingImageUrls.push(img);
            } else if (img instanceof File) {
              filesToUpload.push({ data: img, type: img.type });
            }
          });
        }

        const uploadedUrls = filesToUpload.length > 0 ? await uploadFilesToStorageThroughBackEnd(filesToUpload) : [];
        const allImageUrls = [...uploadedUrls, ...existingImageUrls];

        // Format prompt
        const finalPrompt = formatPrompt ? formatPrompt(formData.prompt || '') : formData.prompt || '';

        // Build request data using utility function
        const reqData = buildImageGenerationRequest({
          formData,
          modelToUse,
          uploadedUrls: allImageUrls,
          finalPrompt,
          defaultImageFormType: imageFormType,
        });

        res = await createImageTask(await getClientOpenApiConfigAsync(), reqData);

        const { code, message, data } = res;

        // Flaq API returns business code 0 on success
        if (code !== 0 || !data?.task_id) {
          throw new Error(message);
        }

        addPendingImageHistory({
          id: data.task_id,
          taskId: data.task_id,
          prompt: finalPrompt,
          createTime: Date.now(),
          url: '',
          thumbnailUrl: '',
          resolution: formData.resolution || formData.aspectRatio || '1:1',
          modelName: modelToUse.model,
          modelInfo: modelToUse.name,
          userImageUrlList: allImageUrls,
        });

        // Compatible with existing state storage, and directly start polling to avoid relying on global UI component triggers.
        addProcessingTask(data.task_id, 'image', imageFormType);
        startTaskPolling(data.task_id, 'image');

        // Show success message and effects
        showConfettiFireworks(3000);
        toast.success(message || 'Image task submitted.');
      } catch (error: any) {
        // Remove global polling task on submission failure
        if (res?.data?.task_id) {
          removeProcessingTask(res.data.task_id);
        }
        toast.error(error?.message || String(error));
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      submitBtnId,
      selectModel,
      showPromptInput,
      requireImageUpload,
      formatPrompt,
      imageFormType,
      t,
      addProcessingTask,
      removeProcessingTask,
      uploadFilesToStorageThroughBackEnd,
    ],
  );

  return {
    handleSubmit,
    isSubmitting,
  };
}
