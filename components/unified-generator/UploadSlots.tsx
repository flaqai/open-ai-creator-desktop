'use client';

import { useTranslations } from 'next-intl';

import type { ImageModel } from '@/lib/constants/image';
import type { UnifiedGeneratorReferenceMediaAsset } from '@/lib/constants/unified-generator/types';
import type { VideoModel } from '@/lib/constants/video';
import { cn } from '@/lib/utils';

import UnifiedImageStackUpload from './reference-upload/UnifiedImageStackUpload';
import UnifiedUploadSlot from './UnifiedUploadSlot';
import UploadHintTrigger from './UploadHintTrigger';

function UploadHint({
  hintKey,
  countText,
  className,
}: {
  hintKey: 'video' | 'image';
  countText?: string;
  className?: string;
}) {
  return (
    <div className={cn('text-color-t3 flex w-fit items-end text-sm', className)}>
      {countText ? (
        <div className='text-color-t2 inline-flex items-center gap-2'>
          <UploadHintTrigger hintKey={hintKey} />
          <span>{countText}</span>
        </div>
      ) : (
        <UploadHintTrigger hintKey={hintKey} />
      )}
    </div>
  );
}

export default function UploadSlots({
  mediaType,
  imageModel,
  videoModel,
  enableEndFrame,
  imageInputs,
  startFrame,
  endFrame,
  audioFile,
  onImageInputsChange,
  onStartFrameChange,
  onEndFrameChange,
  onAudioFileChange,
}: {
  mediaType: 'image' | 'video';
  imageModel?: ImageModel;
  videoModel?: VideoModel;
  enableEndFrame: boolean;
  imageInputs: UnifiedGeneratorReferenceMediaAsset[];
  startFrame: UnifiedGeneratorReferenceMediaAsset | null;
  endFrame: UnifiedGeneratorReferenceMediaAsset | null;
  audioFile: File | null;
  onImageInputsChange: (values: UnifiedGeneratorReferenceMediaAsset[]) => void;
  onStartFrameChange: (value: UnifiedGeneratorReferenceMediaAsset | null) => void;
  onEndFrameChange: (value: UnifiedGeneratorReferenceMediaAsset | null) => void;
  onAudioFileChange: (file: File | null) => void;
}) {
  const t = useTranslations('components.hero-form.unified-upload.slots');

  if (mediaType === 'image' && imageModel) {
    const imageInput = imageModel.options.imageInput;
    const maxImages = imageInput?.isSupported ? imageInput.max || 1 : 0;
    if (maxImages <= 0) return null;

    return (
      <div className='inline-flex flex-col items-start gap-3'>
        <div className='flex h-[68px] flex-wrap items-center gap-2'>
          <UnifiedImageStackUpload
            values={imageInputs}
            maxImages={maxImages}
            label={t('image')}
            onChange={onImageInputsChange}
          />
        </div>
        <UploadHint hintKey='image' countText={`${imageInputs.length}/${maxImages}`} className='translate-y-[3px]' />
      </div>
    );
  }

  if (mediaType === 'video' && videoModel) {
    const supportsImageInput = Boolean(
      videoModel.options.startFrame?.isSupported || videoModel.options.multiImage?.isSupported,
    );
    if (!supportsImageInput && !videoModel.options.audioUrl) return null;

    return (
      <div className='inline-flex flex-col items-start gap-3'>
        <div className='flex h-[68px] flex-wrap items-center gap-2'>
          {supportsImageInput ? (
            <UnifiedImageStackUpload
              values={startFrame ? [startFrame] : []}
              maxImages={1}
              label={t('firstFrame')}
              acceptedFormats={videoModel.options.startFrame?.acceptedFormats}
              minSidePx={videoModel.options.startFrame?.minSidePx}
              maxSidePx={videoModel.options.startFrame?.maxSidePx}
              onChange={(values) => onStartFrameChange(values[0] || null)}
            />
          ) : null}
          {supportsImageInput && videoModel.options.endFrame?.isSupported && enableEndFrame ? (
            <UnifiedImageStackUpload
              values={endFrame ? [endFrame] : []}
              maxImages={1}
              label={t('endFrame')}
              acceptedFormats={videoModel.options.endFrame.acceptedFormats}
              minSidePx={videoModel.options.endFrame.minSidePx}
              maxSidePx={videoModel.options.endFrame.maxSidePx}
              onChange={(values) => onEndFrameChange(values[0] || null)}
            />
          ) : null}
          {videoModel.options.audioUrl ? (
            <>
              <div className='border-color-b1 hidden h-[68px] w-px sm:block' />
              <UnifiedUploadSlot title={t('audio')} file={audioFile} onFileChange={onAudioFileChange} />
            </>
          ) : null}
        </div>
        <UploadHint hintKey='video' />
      </div>
    );
  }

  return null;
}
