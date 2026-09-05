/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

'use client';

import { cloneElement, forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { AiGenerationIcon } from '@/components/svg/button/common';

const acceptedImageTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];
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
        if (!acceptedImageTypes.includes(file.type)) {
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
        <div className='flex items-stretch gap-1 rounded-xl bg-[#232528] p-1'>
          {showIcon && (
            <>
              <div className='flex shrink-0 items-center'>{icon || <ImageIcon className='size-5' />}</div>
              <div className='w-px border-l border-dashed border-white/10' />
            </>
          )}

          <div className='flex flex-1 flex-col justify-center gap-1'>
            {showAiGeneration && (
              <button
                type='button'
                onClick={handleGenerateClick}
                className='flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#1c1d20] px-3 py-2 hover:opacity-80'
              >
                <AiGenerationIcon />
                <div className='text-color-main text-[14px] leading-[21px] font-normal'>{t('ai-generation')}</div>
              </button>
            )}

            <button
              type='button'
              onClick={handleUploadClick}
              className='text-center text-[14px] leading-[21px] font-normal text-white/40 underline hover:opacity-80'
              style={showAiGeneration ? { height: '21px' } : undefined}
            >
              {label}
            </button>
          </div>

          <div className='group relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-lg bg-[#1c1d20]'>
            {imageUrl && (
              <>
                <img src={imageUrl} alt={label} className='h-full w-full object-contain' />
                <div className='absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100'>
                  <button
                    type='button'
                    onClick={handleRemoveImage}
                    className='flex size-10 items-center justify-center rounded-lg bg-black/40 text-white backdrop-blur-md transition-transform hover:scale-110'
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
                    className='flex size-10 items-center justify-center rounded-lg bg-black/40 text-white backdrop-blur-md transition-transform hover:scale-110'
                  >
                    <Trash2 className='size-5' />
                  </button>
                </div>
              </>
            )}
            {!imageUrl && (!sampleImage || !showSample) && (
              <div className='flex size-full items-center justify-center'>
                <ImageIcon className='size-8 text-white/20' />
              </div>
            )}
          </div>
        </div>

        <input
          type='file'
          ref={fileInputRef}
          accept={acceptedImageTypes.join(',')}
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
