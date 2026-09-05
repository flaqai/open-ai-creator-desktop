import type { UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

import type { ImageModel, ImageModelVersionConfig } from '@/lib/constants/image/types';
import type { MotionOption } from '@/components/form-fields/display/MotionField';
import type { RadioButtonOption } from '@/components/form-fields/display/RadioButtonGroup';

import type { ImageFormType } from '../image-context-provider';

/**
 * Image form data type
 */
export interface ImageFormData {
  prompt?: string;
  images: (File | string)[];
  modelVersion?: string;
  aspectRatio?: string;
  resolution?: string;
  quality?: string;
  [key: string]: any;
}

/**
 * Image form Props
 */
export interface ImageFormProps {
  className?: string;

  formTitle?: string;
  submitBtnId: string;
  promptTitle?: string;
  uploadImagesTitle?: string;

  // Custom model list
  customModelList?: ImageModel[];
  customVersionList?: ImageModelVersionConfig[];

  // Display control
  showPromptInput?: boolean;
  showRatio?: boolean;
  showModelVersion?: boolean;
  modelVersionDisplayMode?: 'model' | 'label' | 'both';

  // Template Selector
  showTemplateSelector?: boolean;
  imageTemplateList?: {
    key: string;
    imageUrl: string;
    prompt: string;
  }[];
  translationNamespace?: string;

  /**
   * Image upload mode
   * - `'none'` - Do not show upload component
   * - `'single'` - Force single image upload (maxImages=1)
   * - `'auto'` - Automatically decide based on model configuration (default)
   */
  imageUploadMode?: 'none' | 'single' | 'auto';

  /**
   * Whether image upload is required for generation
   * When set to true, validates if images are uploaded before form submission
   */
  requireImageUpload?: boolean;

  // Motion Field
  showMotionField?: boolean;
  motionFieldOptions?: MotionOption[];
  motionFieldLabel?: string;
  currentMotionId?: string;
  onMotionChange?: (value: string) => void;

  // RadioButtonGroup
  showRadioButtonGroup?: boolean;
  radioButtonGroupOptions?: RadioButtonOption[];
  radioButtonGroupFieldName?: string;
  radioButtonGroupLabel?: string;
  radioButtonGroupTranslationNamespace?: string;
  onRadioButtonGroupChange?: (value: string) => void;

  // Form value priority configuration
  defaultValuePriority?: {
    aspectRatio?: string[];
    resolution?: string[];
    quality?: string[];
  };

  // Custom nodes
  slotNode?: React.ReactNode;
  slotNodeFunc?: (form: UseFormReturn<any>) => React.ReactNode;
  slotNodeAfterModel?: React.ReactNode;
  slotNodeFuncAfterInput?: (form: UseFormReturn<any>) => React.ReactNode;
  slotNodeAfter?: React.ReactNode;
  customRightContent?: React.ReactNode;

  // Support independent polling status for start and end frames
  imageObjContext?: 'default' | 'start-frame' | 'end-frame';

  // Schema & defaults
  imageFormType: ImageFormType;
  moreFormSchema?: z.ZodObject<any>;
  defaultValues?: Partial<ImageFormData>;

  // Callbacks
  onResetAll?: () => void;
  formatPrompt?: (prompt: string) => string;
  styleName?: string;
}

/**
 * Form validation result
 */
export interface FormValidationResult {
  valid: boolean;
  error?: 'noPromptInput' | 'noImageUpload';
}

/**
 * Aspect ratio parse result
 */
export interface AspectRatioParseResult {
  width: number;
  height: number;
  isAutoRatio: boolean;
}
