'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useImageFormDefaultStore from '@/store/form/useImageFormDefaultStore';
import useImageFormStore from '@/store/form/useImageFormStore';
import { ArrowLeftRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ALL_IMAGE_PROVIDERS } from '@/lib/constants/image';
import { validImageDraft } from '@/lib/desktop/draft-validation';
import { cn } from '@/lib/utils';
import { supportsGenerationType } from '@/lib/utils/imageModelService';
import { Form } from '@/components/ui/form';
import FormDraft from '@/components/desktop/FormDraft';
// Common form components
import {
  ModelVersionField,
  MotionField,
  PromptField,
  RadioButtonGroup,
  TemplateSelector,
  UnifiedImageUploadField,
} from '@/components/form-fields';
import type { UnifiedImageUploadFieldRef } from '@/components/form-fields';
import BottomActionArea from '@/components/form-fields/action/BottomActionArea';
import QualityField from '@/components/form-fields/input/QualityField';
import SubHeading from '@/components/form/SubHeading';

import { useFieldReset, useModelConfig, useModelSwitch } from './hooks';
import { useImageFormSubmit } from './hooks/useImageFormSubmit';
import ImageContenxtProvider from './image-context-provider';
import ImageDisplay from './ImageDisplay';
import ImageHistorySection from './ImageHistorySection';
import type { ImageFormData, ImageFormProps } from './types';
import { convertModelsToVersionConfigs } from './utils/modelConversion';
import { validateImageFile } from './utils/submitUtils';

// Re-export types for backward compatibility
export type { ImageFormData, ImageFormProps } from './types';

// ============================================
// Main component
// ============================================

export default function ImageForm({
  // Schema & defaults
  imageFormType,
  defaultValues = {},
  moreFormSchema,
  defaultValuePriority,
  customModelList,
  customVersionList,
  formTitle,
  promptTitle,
  uploadImagesTitle,
  submitBtnId,
  onResetAll,
  formatPrompt,

  // Display control
  showPromptInput = true,
  showRatio = true,
  showModelVersion = true,
  modelVersionDisplayMode = 'model',

  // Template Selector
  showTemplateSelector = false,
  translationNamespace = 'components.image-form',
  imageTemplateList = [],

  // Image upload
  imageUploadMode = 'auto',
  requireImageUpload = false,

  showMotionField = false,
  motionFieldOptions = [],
  motionFieldLabel,
  currentMotionId,
  onMotionChange,

  // RadioButtonGroup
  showRadioButtonGroup = false,
  radioButtonGroupOptions = [],
  radioButtonGroupFieldName = 'selectedOption',
  radioButtonGroupLabel = 'RadioButtonGroup',
  radioButtonGroupTranslationNamespace = 'components.image-form',
  onRadioButtonGroupChange = () => {},

  // Custom nodes
  slotNode,
  slotNodeAfter,
  slotNodeFunc,
  slotNodeAfterModel,
  slotNodeFuncAfterInput,
  customRightContent,
  imageObjContext = 'default',

  className,
}: ImageFormProps) {
  const t = useTranslations('components.image-form');
  const [currentModelVersionDisplayMode, setCurrentModelVersionDisplayMode] = useState<'model' | 'label'>(
    modelVersionDisplayMode === 'label' ? 'label' : 'model',
  );

  const multiImageUploadFormRef = useRef<UnifiedImageUploadFieldRef>(null);

  // ============================================
  // Store states
  // ============================================
  // Select corresponding imageObj and updateImageObj based on imageObjContext
  const imageObj = useImageFormStore((state) => {
    if (imageObjContext === 'start-frame') return state.startFrameImageObj;
    if (imageObjContext === 'end-frame') return state.endFrameImageObj;
    return state.imageObj;
  });

  const updateImageObj = useImageFormStore((state) => {
    if (imageObjContext === 'start-frame') return state.updateStartFrameImageObj;
    if (imageObjContext === 'end-frame') return state.updateEndFrameImageObj;
    return state.updateImageObj;
  });

  const isPolling = useImageFormStore((state) => {
    if (imageObjContext === 'start-frame') return state.isStartFramePolling;
    if (imageObjContext === 'end-frame') return state.isEndFramePolling;
    return state.isPolling;
  });

  const setIsPolling = useImageFormStore((state) => {
    if (imageObjContext === 'start-frame') return state.setIsStartFramePolling;
    if (imageObjContext === 'end-frame') return state.setIsEndFramePolling;
    return state.setIsPolling;
  });

  const defaultPrompt = useImageFormDefaultStore((state) => state.prompt);
  const resetImageFormDefault = useImageFormDefaultStore((state) => state.resetDefault);

  // ============================================
  // Form initialization
  // ============================================
  const form = useForm<ImageFormData>({
    defaultValues: {
      prompt: '',
      images: [],
      modelVersion: '',
      aspectRatio: '',
      resolution: '',
      quality: '',
      ...defaultValues, // Prioritize default values passed from page
    },
  });

  // Listen to prompt in store and populate form
  useEffect(() => {
    if (defaultPrompt) {
      form.setValue('prompt', defaultPrompt);
      resetImageFormDefault();
    }
  }, [defaultPrompt, form, resetImageFormDefault]);

  // ============================================
  // Business logic: Model selection
  // ============================================
  const selectedModelVersion = form.watch('modelVersion');
  const imagesValue = form.watch('images');
  const subjectImageValue = form.watch('subjectImage');
  const objectImageValue = form.watch('objectImage');
  const objectImagesValue = form.watch('objectImages');

  // Check if there are images: check images array or subject/object images
  // Note: These fields only have values when user actually uploads/selects images (File or string URL)
  const hasImages =
    imagesValue?.length > 0 ||
    !!(subjectImageValue && (subjectImageValue instanceof File || typeof subjectImageValue === 'string')) ||
    !!(objectImageValue && (objectImageValue instanceof File || typeof objectImageValue === 'string')) ||
    !!(objectImagesValue && objectImagesValue.length > 0);

  // Use useModelConfig Hook to parse model configuration
  const { versionConfig, uiConfig, selectModel } = useModelConfig({
    selectedModelVersion,
    customVersionList,
  });

  // Aliases: maintain backward compatibility
  const selectedVersionConfig = versionConfig;
  const ratioOptions = uiConfig.ratioOptions;
  const resolutionOptions = uiConfig.resolutionOptions;
  const qualityOptions = uiConfig.qualityOptions;
  const supportsImageInput = uiConfig.supportsImageInput;
  const maxImagesSupported = uiConfig.maxImages;

  // ============================================
  // Image upload configuration
  // ============================================
  const shouldShowUpload = imageUploadMode !== 'none' && (imageUploadMode === 'single' || supportsImageInput);

  const actualMaxImages = imageUploadMode === 'single' ? 1 : supportsImageInput ? maxImagesSupported : 1;

  // Options for UI display (format conversion)
  const ratioOptionsForUI = useMemo(
    () =>
      ratioOptions.map((item) => ({
        name: item.name,
        value: item.value,
      })),
    [ratioOptions],
  );

  const resolutionOptionsForUI = useMemo(
    () =>
      resolutionOptions.map((res) => ({
        name: res.name,
        value: res.value,
      })),
    [resolutionOptions],
  );

  // Model for UI display (credit calculation, etc.)
  const modelForDisplay = useMemo(() => selectModel(hasImages), [selectModel, hasImages]);
  void modelForDisplay;

  // Use model switch detection Hook (returns needsReset flag)
  const { needsReset, clearResetFlag } = useModelSwitch({
    selectedModelVersion,
  });

  // Use field reset Hook (listen to needsReset and config changes)
  useFieldReset({
    form,
    needsReset,
    clearResetFlag,
    ratioOptions,
    resolutionOptions,
    qualityOptions,
    priorityRules: defaultValuePriority,
  });

  // Wrap selectModel to match hook's type requirements (null -> undefined)
  const selectModelWrapper = useCallback(
    (hasImages: boolean) => {
      const model = selectModel(hasImages);
      return model === null ? undefined : model;
    },
    [selectModel],
  );

  // Use form submission Hook
  const { handleSubmit: handleFormSubmit, isSubmitting } = useImageFormSubmit({
    imageFormType,
    selectModel: selectModelWrapper,
    showPromptInput,
    requireImageUpload,
    formatPrompt,
    submitBtnId: submitBtnId || 'image-form-submit-btn',
    t,
  });

  // ============================================
  // Event handling
  // ============================================
  const resetAll = useCallback(() => {
    form.reset();
    multiImageUploadFormRef.current?.removeAllImages();
    onResetAll?.();
  }, [form, onResetAll]);

  const validateFileBeforeAdd = async (file: File): Promise<boolean> => {
    return validateImageFile({
      file,
      errorMessages: {
        aspectRatioOutOfRange: t('errors.aspectRatioOutOfRange'),
        imageLoadFailed: t('errors.imageLoadFailed'),
      },
      onError: toast.error,
    });
  };

  // ============================================
  // Form submission
  // ============================================
  const onSubmit = async (formData: ImageFormData, event?: React.BaseSyntheticEvent) => {
    // Check if currently submitting or polling
    if (isSubmitting || isPolling) return;

    // Call hook's submission logic
    await handleFormSubmit(formData, event);
  };

  // ============================================
  // Render
  // ============================================
  return (
    <ImageContenxtProvider imageFormType={imageFormType}>
      <div
        className={cn(
          'bg-card flex h-auto w-full flex-col gap-5 rounded-xl px-2 py-5',
          'lg:h-[calc(100vh-76px)] lg:flex-row lg:rounded-[36px] lg:p-5',
          className,
        )}
      >
        <Form {...form}>
          <form
            data-testid='image-generation-form'
            onSubmit={(e) => {
              e.stopPropagation(); // Prevent React Portal event bubbling to parent form
              form.handleSubmit(onSubmit)(e);
            }}
            className='no-scrollbar bg-card relative isolate z-40 flex h-auto w-full shrink-0 flex-col gap-3 rounded-3xl p-3.5 lg:h-full lg:w-[351px]'
          >
            {imageObjContext === 'default' && (
              <FormDraft
                id={imageFormType}
                form={form}
                validate={(data) =>
                  validImageDraft(data) &&
                  (customVersionList || ALL_IMAGE_PROVIDERS.flatMap((provider) => provider.versions)).some(
                    (version) => version.modelVersion === data.modelVersion,
                  )
                }
              />
            )}
            {formTitle && (
              <div className='border-border bg-card text-foreground line-clamp-1 shrink-0 border-b pb-2.5 text-lg font-medium tracking-[0.36px]'>
                {formTitle}
              </div>
            )}

            <div className='custom-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto pb-20'>
              {/* Custom slot before default fields */}
              {slotNode}
              {slotNodeFunc?.(form)}

              {/* Motion Field */}
              {showMotionField && (
                <MotionField
                  options={motionFieldOptions}
                  show={showMotionField}
                  label={motionFieldLabel}
                  currentMotionId={currentMotionId}
                  onMotionChange={onMotionChange}
                />
              )}

              {/* Model Selection */}
              {showModelVersion && (
                <>
                  <div className='flex items-center justify-between gap-3'>
                    <SubHeading>{t('selectModel')}</SubHeading>
                    <button
                      type='button'
                      aria-label='Toggle model name display'
                      title={currentModelVersionDisplayMode === 'model' ? 'Show labels' : 'Show model names'}
                      onClick={() =>
                        setCurrentModelVersionDisplayMode((current) => (current === 'model' ? 'label' : 'model'))
                      }
                      className='text-foreground/70 hover:bg-foreground/10 hover:text-foreground flex h-7 w-7 items-center justify-center rounded-lg bg-transparent transition-colors'
                    >
                      <ArrowLeftRight className='h-3.5 w-3.5' />
                      <span className='sr-only'>
                        {currentModelVersionDisplayMode === 'model' ? 'Show labels' : 'Show model names'}
                      </span>
                    </button>
                  </div>
                  <ModelVersionField
                    hideTitle
                    name='modelVersion'
                    displayMode={currentModelVersionDisplayMode}
                    versions={
                      customVersionList ||
                      (customModelList && convertModelsToVersionConfigs(customModelList)) ||
                      ALL_IMAGE_PROVIDERS.flatMap((p) => p.versions).filter((v) => {
                        if (imageFormType === 'text-to-image') {
                          return v.models.every(
                            (m) =>
                              !(
                                supportsGenerationType(m, 'image-edit') ||
                                supportsGenerationType(m, 'multi-image-to-image')
                              ),
                          );
                        }

                        if (imageFormType === 'image-to-image' || imageFormType === 'virtual-try-on') {
                          return v.models.some(
                            (m) =>
                              supportsGenerationType(m, 'image-edit') ||
                              supportsGenerationType(m, 'multi-image-to-image'),
                          );
                        }

                        return (
                          !hasImages ||
                          v.models.some(
                            (m) =>
                              supportsGenerationType(m, 'image-edit') ||
                              supportsGenerationType(m, 'multi-image-to-image'),
                          )
                        );
                      })
                    }
                  />
                </>
              )}

              {/* Custom slot after model selection */}
              {slotNodeAfterModel}

              {/* Unified Image Upload - automatically adapts to single or multiple image mode based on maxImages config */}
              {shouldShowUpload && (
                <UnifiedImageUploadField
                  title={actualMaxImages > 1 ? uploadImagesTitle : undefined}
                  name='images'
                  maxImages={actualMaxImages}
                  ref={multiImageUploadFormRef}
                  acceptTypes={
                    selectedModelVersion?.includes('seedream')
                      ? ['image/jpg', 'image/jpeg', 'image/png', 'image/webp']
                      : ['image/jpg', 'image/jpeg', 'image/png', 'image/webp']
                  }
                  validateFileBeforeAdd={validateFileBeforeAdd}
                />
              )}

              {/* RadioButtonGroup */}
              {showRadioButtonGroup && (
                <RadioButtonGroup
                  options={radioButtonGroupOptions || []}
                  fieldName={radioButtonGroupFieldName}
                  label={radioButtonGroupLabel}
                  translationNamespace={radioButtonGroupTranslationNamespace}
                  onChange={onRadioButtonGroupChange}
                />
              )}

              {/* Template Selector */}
              {showTemplateSelector && (
                <TemplateSelector
                  templates={imageTemplateList || []}
                  translationNamespace={translationNamespace}
                  templateFieldName='template' // TODO: Consider merging several properties, pass as unified object
                  promptFieldName='prompt' // TODO: Consider merging several properties, pass as unified object
                />
              )}

              {/* Prompt Input */}
              {showPromptInput && (
                <PromptField
                  show
                  title={promptTitle || t('enterPrompt')}
                  translationNamespace='components.image-form'
                />
              )}

              {/* Quality Field */}
              <QualityField
                qualityOptions={qualityOptions.map((q) => ({ name: q.name, value: q.value }))}
                show={qualityOptions.length > 0}
                translationNamespace='components.image-form'
              />

              {/* Custom slot after input fields */}
              {slotNodeFuncAfterInput?.(form)}

              {/* Custom slot after all fields */}
              {slotNodeAfter}
            </div>

            {/* Bottom Actions */}
            <BottomActionArea
              ratioOptions={showRatio && ratioOptions.length > 0 ? ratioOptionsForUI : undefined}
              resolutionOptions={resolutionOptions.length > 0 ? resolutionOptionsForUI : undefined}
              showRatio={showRatio && ratioOptions.length > 0}
              showResolution={resolutionOptions.length > 0}
              showDuration={false}
              isSubmitting={isPolling || isSubmitting}
              submitButtonText={t('generate')}
              ratioFieldName='aspectRatio'
              resolutionFieldName='resolution'
            />
          </form>
        </Form>

        {/* Right side content */}
        {customRightContent || (
          <div className='flex h-full flex-1 flex-col gap-3 overflow-hidden'>
            <ImageDisplay />
            <ImageHistorySection />
          </div>
        )}
      </div>
    </ImageContenxtProvider>
  );
}
