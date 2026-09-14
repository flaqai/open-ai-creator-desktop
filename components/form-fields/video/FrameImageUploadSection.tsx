'use client';

import { cloneElement, forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { getVersionConfig } from '@/lib/constants/video';
import { cn } from '@/lib/utils';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import SubHeading from '@/components/form/SubHeading';

import UsageTipsButton from '../display/UsageTipsButton';
import FrameImageUpload, { FrameImageUploadRef } from './FrameImageUpload';

export interface FrameImageUploadSectionRef {
  deleteStartFrame: () => void;
  deleteEndFrame: () => void;
  previewStartFrame: (file: File | string) => void;
  previewEndFrame: (file: File | string) => void;
}

interface FrameImageUploadSectionProps {
  startFrameName?: string;
  endFrameName?: string;
  enableEndFrameName?: string;
  modalComponent: React.ReactElement<{ imageObjContext?: string }>;
  usageTipsTitle?: string;
  usageTipsDescription?: string;
  usageTipsVideoUrl?: string;
  usageTipsVideoCover?: string;
  usageTipsButtonText?: string;
  sampleImages?: {
    sample1: string;
    sample2: string;
  };
  hintsSection?: React.ReactNode;
  className?: string;
  forceImageToVideo?: boolean;
}

const FrameImageUploadSection = forwardRef<FrameImageUploadSectionRef, FrameImageUploadSectionProps>(
  (
    {
      startFrameName = 'startFrame',
      endFrameName = 'endFrame',
      enableEndFrameName = 'enableEndFrame',
      modalComponent,
      usageTipsTitle,
      usageTipsDescription,
      usageTipsVideoUrl,
      usageTipsVideoCover,
      usageTipsButtonText,
      sampleImages,
      hintsSection,
      className,
      forceImageToVideo = false,
    },
    ref,
  ) => {
    const t = useTranslations('components.video-form');
    const methods = useFormContext();
    const startFrameRef = useRef<FrameImageUploadRef>(null);
    const endFrameRef = useRef<FrameImageUploadRef>(null);

    const modelVersion = methods.watch('modelVersion');

    // Use version-level config to determine end frame support, independent of hasImages
    const supportsEndFrame = useMemo(
      () => !!getVersionConfig(modelVersion)?.options.endFrame?.isSupported,
      [modelVersion],
    );

    useImperativeHandle(
      ref,
      () => ({
        deleteStartFrame: () => startFrameRef.current?.deleteFile(),
        deleteEndFrame: () => endFrameRef.current?.deleteFile(),
        previewStartFrame: (file: File | string) => startFrameRef.current?.previewImage(file),
        previewEndFrame: (file: File | string) => endFrameRef.current?.previewImage(file),
      }),
      [],
    );

    return (
      <div className={cn('flex w-full flex-col gap-1', className)}>
        <div className='flex items-center justify-between p-0 pb-1.5'>
          <SubHeading>{t('product-image')}</SubHeading>
          {supportsEndFrame && (
            <FormField
              control={methods.control}
              name={enableEndFrameName}
              render={({ field }) => (
                <FormItem className='flex items-center gap-2 space-y-0'>
                  <FormLabel className='text-foreground/70 cursor-pointer text-sm font-normal'>
                    {t('end-frame')}
                  </FormLabel>
                  <FormControl>
                    <Switch
                      className={cn(
                        'data-[state=checked]:border-color-main border-foreground h-[16px] w-[28px] rounded border !bg-transparent focus:ring-0',
                      )}
                      thumbClassName={cn(
                        'h-3 w-3 rounded-[2px] bg-foreground data-[state=unchecked]:translate-x-[1px] data-[state=checked]:translate-x-[12px] data-[state=checked]:bg-color-main',
                      )}
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </div>

        <div className='text-foreground/40 px-0 pt-0 text-xs'>{t('product-image-description')}</div>

        <div className='border-border bg-card rounded-xl border'>
          <div className='flex flex-col gap-1 p-1'>
            <FrameImageUpload
              ref={startFrameRef}
              name={startFrameName}
              label={t('upload-first-frame')}
              modalComponent={cloneElement(modalComponent, { imageObjContext: 'start-frame' })}
              sampleImage={sampleImages?.sample1}
              showIcon={false}
            />

            {methods.watch(enableEndFrameName) && (
              <FrameImageUpload
                ref={endFrameRef}
                name={endFrameName}
                label={t('upload-end-frame')}
                modalComponent={cloneElement(modalComponent, { imageObjContext: 'end-frame' })}
                sampleImage={sampleImages?.sample2}
                showIcon={false}
              />
            )}
          </div>

          {usageTipsTitle && <div className='bg-card h-px' />}

          {hintsSection}

          {usageTipsTitle && (
            <div className='p-1'>
              <UsageTipsButton
                title={usageTipsTitle}
                description={usageTipsDescription || ''}
                videoUrl={usageTipsVideoUrl}
                videoCover={usageTipsVideoCover}
                buttonText={usageTipsButtonText}
                className='text-color-main bg-card w-full justify-center rounded-lg px-4 py-3'
              />
            </div>
          )}
        </div>
      </div>
    );
  },
);

FrameImageUploadSection.displayName = 'FrameImageUploadSection';

export default FrameImageUploadSection;
