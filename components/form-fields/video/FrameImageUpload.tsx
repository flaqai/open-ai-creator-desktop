/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

'use client';

import { cloneElement, forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { getMediaInputAccept, isAcceptedMediaFile } from '@/lib/utils/media-upload-formats';
import { AiGenerationIcon } from '@/components/svg/button/common';

const maxFileSize = 10 * 1024 * 1024;

export interface FrameImageUploadRef {
  deleteFile: () => void;
  previewImage: (file: File | string) => void;
}

interface FrameImageUploadProps {
  name: string;
  label: string;
  icon?: React.ReactNode;
  modalComponent: React.ReactElement<Record<string, unknown>>;
  sampleImage?: string;
  showAiGeneration?: boolean;
  showIcon?: boolean;
  className?: string;
}

const FrameImageUpload = forwardRef<FrameImageUploadRef, FrameImageUploadProps>(
  ({ name, label, icon, modalComponent, sampleImage, showAiGeneration = true, showIcon = true, className }, ref) => {
    const tUpload = useTranslations('components.image-form.upload-dialog');
    const t = useTranslations('components.video-form');
    const methods = useFormContext();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [showSample, setShowSample] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const previewImage = useCallback(
      async (file: File | string) => {
        if (file instanceof File && !isAcceptedMediaFile(file, 'image')) return;
        if (file) {
          setShowSample(false);

          if (typeof file === 'string') {
            setImageUrl(file);
            methods.setValue(name, file, { shouldValidate: true, shouldDirty: true });
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
            setImageUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
          methods.setValue(name, file, { shouldValidate: true, shouldDirty: true });
        } else {
          setImageUrl(null);
          methods.setValue(name, null, { shouldValidate: true, shouldDirty: true });
        }
      },
      [methods, name],
    );

    const deleteFile = useCallback(() => {
      setImageUrl(null);
      methods.setValue(name, null, { shouldValidate: true, shouldDirty: true });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, [methods, name]);

    const handleRemoveSample = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setShowSample(false);
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (!isAcceptedMediaFile(file, 'image')) {
          toast.error(tUpload('unsupported-format'));
          e.target.value = '';
          return;
        }

        if (file.size > maxFileSize) {
          toast.error(tUpload('file-too-large'));
          e.target.value = '';
          return;
        }

        previewImage(file);
      }
    };

    const handleUploadClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      fileInputRef.current?.click();
    };

    const handleGenerateClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsModalOpen(true);
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteFile();
    };

    useImperativeHandle(
      ref,
      () => ({
        deleteFile,
        previewImage,
      }),
      [deleteFile, previewImage],
    );

    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <div className='bg-card flex items-stretch gap-1 rounded-xl p-1'>
          {showIcon && (
            <>
              <div className='flex shrink-0 items-center'>{icon || <ImageIcon className='size-5' />}</div>
              <div className='border-foreground/10 w-px border-l border-dashed' />
            </>
          )}

          <div className='flex flex-1 flex-col justify-center gap-1'>
            {showAiGeneration && (
              <button
                type='button'
                onClick={handleGenerateClick}
                className='bg-card flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 hover:opacity-80'
              >
                <AiGenerationIcon />
                <div className='text-color-main text-[14px] leading-[21px] font-normal'>{t('ai-generation')}</div>
              </button>
            )}

            <button
              type='button'
              onClick={handleUploadClick}
              className='text-foreground/40 text-center text-[14px] leading-[21px] font-normal underline hover:opacity-80'
              style={showAiGeneration ? { height: '21px' } : undefined}
            >
              {label}
            </button>
          </div>

          <div className='group bg-card relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-lg'>
            {imageUrl && (
              <>
                <img src={imageUrl} alt={label} className='h-full w-full object-contain' />
                <div className='absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100'>
                  <button
                    type='button'
                    onClick={handleRemoveImage}
                    className='text-foreground flex size-10 items-center justify-center rounded-lg bg-black/40 backdrop-blur-md transition-transform hover:scale-110'
                  >
                    <Trash2 className='size-5' />
                  </button>
                </div>
              </>
            )}
            {!imageUrl && showSample && sampleImage && (
              <>
                <img src={sampleImage} alt={label} className='h-full w-full object-contain' />
                <div className='absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100'>
                  <button
                    type='button'
                    onClick={handleRemoveSample}
                    className='text-foreground flex size-10 items-center justify-center rounded-lg bg-black/40 backdrop-blur-md transition-transform hover:scale-110'
                  >
                    <Trash2 className='size-5' />
                  </button>
                </div>
              </>
            )}
            {!imageUrl && (!sampleImage || !showSample) && (
              <div className='flex size-full items-center justify-center'>
                <ImageIcon className='text-foreground/20 size-8' />
              </div>
            )}
          </div>
        </div>

        <input
          type='file'
          ref={fileInputRef}
          accept={getMediaInputAccept('image')}
          onChange={handleFileSelect}
          className='hidden'
        />

        {cloneElement(modalComponent, {
          open: isModalOpen,
          onOpenChange: setIsModalOpen,
          onImageSelect: (url: string) => {
            previewImage(url);
            setIsModalOpen(false);
          },
        })}
      </div>
    );
  },
);

FrameImageUpload.displayName = 'FrameImageUpload';

export default FrameImageUpload;
