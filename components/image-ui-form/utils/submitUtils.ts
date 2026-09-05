import type { CreateImageTaskRequest } from '@/network/image/client';

import type { ImageModel } from '@/lib/constants/image/types';
import { removeEmptyProperties } from '@/lib/utils/objectUtils';

import type { AspectRatioParseResult, FormValidationResult, ImageFormData } from '../types';

/**
 * Validate image form
 */
export function validateImageForm(params: {
  formData: ImageFormData;
  showPromptInput: boolean;
  requireImageUpload?: boolean;
}): FormValidationResult {
  const { formData, showPromptInput, requireImageUpload } = params;

  if (showPromptInput && !formData.prompt) {
    return { valid: false, error: 'noPromptInput' };
  }

  if (requireImageUpload) {
    // Check if using product mode (subjectImage + objectImage/objectImages)
    const isProductMode = 'subjectImage' in formData || 'objectImage' in formData || 'objectImages' in formData;

    if (isProductMode) {
      // Product mode requires both subject and object
      const hasObjectImage = formData.objectImage || (formData.objectImages && formData.objectImages.length > 0);
      if (!formData.subjectImage || !hasObjectImage) {
        return { valid: false, error: 'noImageUpload' };
      }
    } else {
      // Normal mode only requires images to have value
      if (!formData.images || formData.images.length === 0) {
        return { valid: false, error: 'noImageUpload' };
      }
    }
  }

  return { valid: true };
}

/**
 * Parse aspect ratio
 */
export function parseAspectRatio(aspectRatio?: string): AspectRatioParseResult {
  if (!aspectRatio) {
    return { width: 0, height: 0, isAutoRatio: true };
  }

  const isAutoRatio = aspectRatio === '-';

  if (isAutoRatio) {
    return { width: 0, height: 0, isAutoRatio: true };
  }

  const [w, h] = aspectRatio.split(':').map(Number);
  return {
    width: w || 1,
    height: h || 1,
    isAutoRatio: false,
  };
}

/**
 * Build image generation request data
 *
 * Note: Uses removeEmptyProperties to filter out empty value fields ('', undefined, null)
 * Avoids sending invalid fields to backend causing integration issues
 */
export function buildImageGenerationRequest(params: {
  formData: ImageFormData;
  modelToUse: ImageModel;
  uploadedUrls: string[];
  finalPrompt: string;
  defaultImageFormType?: string;
}) {
  const { formData, modelToUse, uploadedUrls, finalPrompt, defaultImageFormType } = params;
  const { width, height, isAutoRatio } = parseAspectRatio(formData.aspectRatio);

  void defaultImageFormType;

  const rawRequest: CreateImageTaskRequest = {
    model_name: modelToUse.model,
    prompt: finalPrompt,
    width: isAutoRatio ? 1 : width || 1,
    height: isAutoRatio ? 1 : height || 1,
    image_url_list: uploadedUrls.length > 0 ? uploadedUrls : undefined,
    resolution: formData.resolution || undefined,
    quality: formData.quality || undefined,
  };

  // Filter out empty value fields ('', undefined, null)
  return removeEmptyProperties<CreateImageTaskRequest>(rawRequest);
}

/**
 * Validate image file
 *
 * Checks:
 * 1. Aspect ratio range (0.33 - 3.0)
 * 2. Whether image can be loaded
 */
export async function validateImageFile(params: {
  file: File;
  errorMessages: {
    aspectRatioOutOfRange: string;
    imageLoadFailed: string;
  };
  onError: (message: string) => void;
}): Promise<boolean> {
  const { file, errorMessages, onError } = params;

  // Check aspect ratio
  const ok = await new Promise<boolean>((resolve) => {
    const img = new Image();

    img.onload = () => {
      const aspectRatio = img.width / img.height;

      if (aspectRatio < 0.33 || aspectRatio > 3.0) {
        onError(`${errorMessages.aspectRatioOutOfRange} ${aspectRatio.toFixed(2)}`);
        resolve(false);
      } else {
        resolve(true);
      }

      // Clean up URL
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      onError(errorMessages.imageLoadFailed);
      URL.revokeObjectURL(img.src);
      resolve(false);
    };

    img.src = URL.createObjectURL(file);
  });

  return ok;
}
