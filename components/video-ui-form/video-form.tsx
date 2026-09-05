'use client';

/* eslint-disable no-confusing-arrow */
/* eslint-disable react/jsx-wrap-multilines */
import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { VideoHistoryRequest } from '@/network/video/history';
import { ArrowLeftRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useNavigationGuard } from 'next-navigation-guard';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { getVersionConfig, selectVideoModelByGenerationType } from '@/lib/constants/video/';
import { cn } from '@/lib/utils';
import * as VideoModelService from '@/lib/utils/videoModelService';
import { Form } from '@/components/ui/form';
// Generic form components
import {
  AudioSupportField,
  AudioToggleField,
  AudioUploadField,
  BottomActionArea,
  ModelSelect,
  MultiImageUploadField,
  PromptField,
  StartEndFrameField,
  VideoModelParameterFields,
} from '@/components/form-fields';
import type { AudioUploadFieldRef, ImageUploadFieldRef, MultiImageUploadFieldRef } from '@/components/form-fields';
import SubHeading from '@/components/form/SubHeading';

import useFormSync from './hooks/useFormSync';
import useModelToggle from './hooks/useModelToggle';
// Local hooks and utils
import { useVideoFormStores } from './hooks/useVideoFormStores';
import useVideoFormSubmit from './hooks/useVideoFormSubmit';
import { useVideoModelConfig } from './hooks/useVideoModelConfig';
// Local types
import type { VideoFormData } from './types';
import VideoContenxtProvider, { videoAudioContext } from './VideoContenxtProvider';
import VideoDisplay from './VideoDisplay';
import VideoHistorySection from './VideoHistorySection';

// ============================================
// Configuration constants
// ============================================

// Note: Model selection logic has been unified and moved to lib/utils/videoModelService.ts

/**
 * VideoFormBase Props
 *
 * UI display control: Explicitly control each field's display via show* props (aligned with image-form)
 */
interface VideoFormBaseProps {
  submitBtnId: string;
  videoType: Exclude<VideoHistoryRequest['videoType'], 'Reference-to-video'>;
  defaultValues?: Partial<VideoFormData>;
  formTitle?: string;
  uploadImageTitle?: string;
  slotNode?: React.ReactNode;
  requireImageUpload?: boolean; // Whether current page requires image upload to generate
  showAllVideoHistory?: boolean; // Whether history shows all types (no filter)

  // UI display control
  showInput?: boolean;
  showVideoModelVersion?: boolean;
  modelVersionDisplayMode?: 'model' | 'label' | 'both';
  showRatio?: boolean;
  showDuration?: boolean;
  showResolution?: boolean;
  showStartFrame?: boolean;
  showEndFrame?: boolean;
  showAudio?: boolean;
  showAudioUpload?: boolean;
  allowedProviders?: string[];

  // Default value priority (aligned with image-form's defaultValuePriority)
  defaultValuePriority?: {
    ratio?: string[];
    duration?: string[];
    resolution?: string[];
  };
}

export default function VideoFormBase({
  submitBtnId,
  videoType,
  defaultValues,
  formTitle,
  uploadImageTitle,
  slotNode,
  requireImageUpload = false, // Default: no forced image upload required
  showAllVideoHistory = false, // Default: don't show all history

  // UI display control props
  showInput = true,
  showVideoModelVersion = true,
  modelVersionDisplayMode = 'model',
  showRatio = true,
  showDuration = true,
  showResolution = true,
  showStartFrame = true,
  showEndFrame = true,
  showAudio = true,
  showAudioUpload = true,

  // Default value priority props
  defaultValuePriority,
  allowedProviders,
}: VideoFormBaseProps) {
  const t = useTranslations('components.video-form');
  const [currentModelVersionDisplayMode, setCurrentModelVersionDisplayMode] = useState<'model' | 'label'>(
    modelVersionDisplayMode === 'label' ? 'label' : 'model',
  );
  const pathname = usePathname();
  const { audioDuration: _audioDuration } = useContext(videoAudioContext);
  void _audioDuration; // Reserved for future use

  // ============================================
  // Unified state management (replaces original 17 hooks)
  // ============================================
  const stores = useVideoFormStores();
  const { setOpenPricingDialogStore, resetDefault, defaultPrompt } = stores;

  // ============================================
  // Refs
  // ============================================
  const startFrameUploadRef = useRef<ImageUploadFieldRef>(null);
  const multiImageUploadRef = useRef<MultiImageUploadFieldRef>(null);
  const audioUploadRef = useRef<AudioUploadFieldRef>(null);

  useNavigationGuard({
    enabled: true,
    confirm: () => {
      resetDefault();
      return true;
    },
  });

  // ============================================
  // Form initialization
  // ============================================
  // Calculate initial default values (only executed once on component mount)
  const getInitialDefaultValues = (): Partial<VideoFormData> => {
    const initialModelVersion = defaultValues?.modelVersion || VideoModelService.getDefaultModel();

    // Get initial model config to extract default duration and resolution
    // Initial state has no images, so use text-to-video mode with audio disabled by default
    const versionConfig = getVersionConfig(initialModelVersion);
    const initialModel = selectVideoModelByGenerationType(versionConfig, false, undefined, undefined, false);

    // Extract initial duration and resolution default values
    const initialDuration = initialModel?.options?.duration ? `${initialModel.options.duration}s` : undefined;
    const initialResolution = initialModel?.options?.resolution;

    return {
      prompt: defaultPrompt,
      ratio: '16:9',
      modelVersion: initialModelVersion,
      enableEndFrame: false,
      enableAudio: false,
      enableBgm: false,
      keepOriginalSound: false,
      guidanceScale: 0.5,
      style: 'general',
      negativePrompt: '',
      duration: initialDuration,
      resolution: initialResolution,
      ...defaultValues,
    };
  };

  // Use useRef to save initial default values, ensuring they remain unchanged throughout component lifecycle
  const initialDefaultValuesRef = useRef<Partial<VideoFormData>>(getInitialDefaultValues());

  const form = useForm<VideoFormData>({
    progressive: true,
    defaultValues: initialDefaultValuesRef.current,
  });

  const modelVersion = form.watch('modelVersion');
  const selectedDuration = form.watch('duration');
  const selectedResolution = form.watch('resolution');
  const startFrame = form.watch('startFrame');
  const endFrame = form.watch('endFrame');
  const multiImages = form.watch('multiImages');
  const enableAudio = form.watch('enableAudio');

  // Check if user has uploaded images (for auto-determining generation type)
  const hasImages = useMemo(() => {
    if (requireImageUpload) return true;
    const hasStartFrame = !!(startFrame && (startFrame instanceof File || typeof startFrame === 'string'));
    const hasEndFrame = !!(endFrame && (endFrame instanceof File || typeof endFrame === 'string'));
    const hasMultiImages = (multiImages?.length ?? 0) > 0;
    return hasStartFrame || hasEndFrame || hasMultiImages;
  }, [startFrame, endFrame, multiImages, requireImageUpload]);

  // ============================================
  // Business logic: Use new useVideoModelConfig hook
  // ============================================
  const {
    versionConfig: currentVersionConfig,
    uiConfig,
    selectModel,
  } = useVideoModelConfig({
    selectedModelVersion: modelVersion,
    hasImages,
  });

  const {
    durationOptions,
    resolutionOptions,
    ratioOptions,
    supportsImageInput,
    supportsEndFrame,
    supportsAudio,
    supportsAudioUrl,
    supportsOptionalAudio,
    multiImageMaxImages,
  } = uiConfig;

  // Get current model (for displaying credit and other info)
  const currentModel = useMemo(() => {
    return selectModel(hasImages, selectedDuration, selectedResolution, enableAudio) ?? undefined;
  }, [selectModel, hasImages, selectedDuration, selectedResolution, enableAudio]);

  // ============================================
  // Form sync logic (extracted to useFormSync hook)
  // ============================================
  useFormSync({
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
  });

  // ============================================
  // Model toggle logic (extracted to useModelToggle hook)
  // ============================================
  const { handleEndFrameToggle } = useModelToggle({
    form,
    t,
  });

  // ============================================
  // Form submit logic (extracted to useVideoFormSubmit hook)
  // ============================================
  const { handleSubmit: submitForm, isSubmitting } = useVideoFormSubmit({
    videoType,
    stores,
    pathname,
    t,
    submitBtnId,
  });

  const onSubmit = async (formData: VideoFormData) => {
    // Validate if image upload is required
    if (requireImageUpload) {
      const hasUploadedImage = !!(
        formData.startFrame &&
        (formData.startFrame instanceof File || typeof formData.startFrame === 'string')
      );

      if (!hasUploadedImage) {
        toast.error(t('error.image-required')); // Need to add translation
        return;
      }
    }

    // Check if there are images at submit time (for auto-selecting model)
    const hasImagesAtSubmit = !!(
      formData.startFrame &&
      (formData.startFrame instanceof File || typeof formData.startFrame === 'string')
    );

    // Use new selectModel function to auto-select model
    const formSubmitVideoModel = selectModel(
      hasImagesAtSubmit,
      formData.duration,
      formData.resolution,
      formData.enableAudio,
    );

    if (!formSubmitVideoModel) {
      toast.error('Model not found');
      return;
    }

    // Call extracted form submit logic
    await submitForm(formData, formSubmitVideoModel);
  };

  return (
    <VideoContenxtProvider videoType={videoType} showAllVideoHistory={showAllVideoHistory}>
      <div
        id='video-form-container'
        className='relative flex h-auto w-full flex-col items-stretch gap-5 overflow-hidden rounded-[36px] bg-[#232528] lg:h-[calc(100vh-76px)] lg:flex-row lg:p-5'
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            id='VideoForm'
            className='no-scrollbar relative isolate z-40 flex h-[600px] w-full shrink-0 flex-col gap-2.5 overflow-y-auto rounded-3xl border border-[#303030] bg-[#1c1d20] p-3 lg:h-full lg:w-[351px]'
          >
            {formTitle && (
              <div className='line-clamp-1 shrink-0 border-b border-white/10 bg-[#1c1d20] pb-2.5 text-lg font-medium tracking-[0.36px] text-white'>
                {formTitle}
              </div>
            )}
            <div className='custom-scrollbar flex flex-1 flex-col gap-2.5 overflow-y-auto pb-20 lg:items-stretch'>
              {/* Model version selection */}
              {showVideoModelVersion && (
                <>
                  <div className='flex items-center justify-between gap-3'>
                    <SubHeading>{t('modelVersion')}</SubHeading>
                    <button
                      type='button'
                      aria-label='Toggle model name display'
                      title={currentModelVersionDisplayMode === 'model' ? 'Show labels' : 'Show model names'}
                      onClick={() =>
                        setCurrentModelVersionDisplayMode((current) => (current === 'model' ? 'label' : 'model'))
                      }
                      className='flex h-7 w-7 items-center justify-center rounded-lg bg-transparent text-white/70 transition-colors hover:bg-white/10 hover:text-white'
                    >
                      <ArrowLeftRight className='h-3.5 w-3.5' />
                      <span className='sr-only'>
                        {currentModelVersionDisplayMode === 'model' ? 'Show labels' : 'Show model names'}
                      </span>
                    </button>
                  </div>
                  <ModelSelect
                    name='modelVersion'
                    hasImages={hasImages}
                    allowedProviders={allowedProviders}
                    videoType={videoType}
                    displayMode={currentModelVersionDisplayMode}
                  />
                </>
              )}

              {/* Audio support hint (display only, for models with uncontrollable audio like Veo) */}
              <AudioSupportField show={showAudio && supportsAudio && !supportsOptionalAudio} />

              {/* Audio option: whether to enable generated audio (for models with optional audio like Seedance 1.5, Kling) */}
              <AudioToggleField show={showAudio && supportsOptionalAudio} />

              {/* Audio upload field (display based on model's audioUrl config) */}
              <AudioUploadField show={showAudioUpload && supportsAudioUrl} ref={audioUploadRef} />

              {/* Multi-image upload area */}
              {multiImageMaxImages > 0 && (
                <MultiImageUploadField name='multiImages' maxImages={multiImageMaxImages} ref={multiImageUploadRef} />
              )}

              {/* Start/end frame merged area, right switch controls whether to enable end frame */}
              <StartEndFrameField
                currentModel={currentModel} // TODO: product page needs separate handling for start/end frame recognition and passing, use separate product upload component
                showStartFrame={showStartFrame}
                showEndFrame={showEndFrame}
                onEndFrameToggle={handleEndFrameToggle}
                ref={startFrameUploadRef}
                uploadImageTitle={uploadImageTitle}
                supportsImageInput={supportsImageInput}
                supportsEndFrameFromConfig={supportsEndFrame}
              />

              {/* Custom slot node */}
              {slotNode}

              {/* Prompt input */}
              <PromptField show={showInput} />

              <VideoModelParameterFields currentModel={currentModel} />
            </div>

            {/* Bottom action area */}
            <BottomActionArea
              durationOptions={durationOptions}
              ratioOptions={ratioOptions}
              resolutionOptions={resolutionOptions}
              showDuration={showDuration}
              showRatio={showRatio}
              showResolution={showResolution}
              isSubmitting={isSubmitting}
              submitButtonText={t('generate')}
            />
          </form>
        </Form>

        {/* Right side content: Display + History */}
        <div className='flex flex-1 flex-col items-start justify-start gap-3'>
          <div className='h-[360px] w-full rounded-2xl border border-[#2a2b2f] bg-[#1c1d20] contain-strict lg:h-auto lg:flex-1'>
            <VideoDisplay />
          </div>

          <div className='flex w-full flex-col gap-3 contain-inline-size'>
            <VideoHistorySection />
          </div>
        </div>
      </div>
    </VideoContenxtProvider>
  );
}
