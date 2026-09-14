'use client';

import { forwardRef } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import type { VideoModel } from '@/lib/constants/video/';
import { cn } from '@/lib/utils';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import ImageUploadField from '@/components/form-fields/upload/ImageUploadField';
import type { ImageUploadFieldRef } from '@/components/form-fields/upload/ImageUploadField';

interface StartEndFrameFieldProps {
  currentModel: VideoModel | undefined;
  showStartFrame?: boolean;
  showEndFrame?: boolean;
  onEndFrameToggle: (enabled: boolean) => boolean;
  uploadImageTitle?: string;
  supportsImageInput?: boolean;
  supportsEndFrameFromConfig?: boolean;
}

const StartEndFrameField = forwardRef<ImageUploadFieldRef, StartEndFrameFieldProps>(
  (
    {
      currentModel,
      showStartFrame = false,
      showEndFrame = false,
      onEndFrameToggle,
      uploadImageTitle,
      supportsImageInput,
      supportsEndFrameFromConfig,
    },
    ref,
  ) => {
    const { control } = useFormContext();
    const t = useTranslations('components.video-form');

    // Prefer config passed in from uiConfig (version-level union); fall back to currentModel (single model)
    const supportsStartFrame = supportsImageInput ?? currentModel?.options?.startFrame?.isSupported;
    const supportsEndFrame = supportsEndFrameFromConfig ?? currentModel?.options?.endFrame?.isSupported;

    // Decide whether to show start frame and end frame
    // Show start frame if the model supports startFrame (regardless of text-to-video or image-to-video)
    // Show end frame if the model supports endFrame
    const shouldShowStartFrame = showStartFrame && supportsStartFrame;
    const shouldShowEndFrame = showEndFrame && supportsEndFrame;

    // If neither should be shown, do not render this component
    if (!shouldShowStartFrame && !shouldShowEndFrame) {
      return null;
    }

    return (
      <FormField
        control={control}
        name='enableEndFrame'
        render={({ field }) => (
          <FormItem className='flex w-full flex-col gap-2.5 space-y-0'>
            {/* Title area */}
            <div className='flex items-center justify-between'>
              <FormLabel className='cursor-pointer text-sm font-normal'>
                {/* If there is an end frame toggle, show "Start Frame / End Frame" */}
                {shouldShowEndFrame ? (
                  <>
                    {shouldShowStartFrame && (
                      <>
                        <span className='text-foreground/70'>{t('startFrame')}</span>
                        <span className='text-foreground/20 mx-2'>/</span>
                      </>
                    )}
                    <span className='text-foreground/70'>{t('endFrame')}</span>
                  </>
                ) : (
                  /* If only start frame, show custom title or default "Upload Image" */
                  <span className='text-foreground/70'>{uploadImageTitle || t('image')}</span>
                )}
              </FormLabel>
              {/* Only show toggle when end frame is displayed */}
              {shouldShowEndFrame && (
                <FormControl>
                  <Switch
                    className={cn(
                      'data-[state=checked]:border-color-main border-foreground h-[16px] w-[28px] rounded border !bg-transparent focus:ring-0',
                    )}
                    thumbClassName={cn(
                      'h-3 w-3 rounded-[2px] bg-foreground data-[state=unchecked]:translate-x-[1px] data-[state=checked]:translate-x-[12px] data-[state=checked]:bg-color-main',
                    )}
                    checked={!!field.value}
                    onCheckedChange={(checked) => {
                      const finalValue = onEndFrameToggle(checked);
                      field.onChange(finalValue);
                    }}
                  />
                </FormControl>
              )}
            </div>

            {/* Start/end frame layout */}
            <div className='flex w-full flex-col gap-2.5 lg:flex-row'>
              {/* Start frame */}
              {shouldShowStartFrame && (
                <div className='flex-1'>
                  <ImageUploadField name='startFrame' ref={ref} label={t('startFrame')} />
                </div>
              )}
              {/* End frame (only shown when toggle is on) */}
              {shouldShowEndFrame && field.value && (
                <div className='flex-1'>
                  <ImageUploadField name='endFrame' label={t('endFrame')} />
                </div>
              )}
            </div>
          </FormItem>
        )}
      />
    );
  },
);

StartEndFrameField.displayName = 'StartEndFrameField';

export default StartEndFrameField;
export type { ImageUploadFieldRef as StartEndFrameFieldRef };
