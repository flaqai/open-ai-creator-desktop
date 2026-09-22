'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';

import { cn } from '@/lib/utils';
import { getMediaDropzoneAccept, isAcceptedMediaFile } from '@/lib/utils/media-upload-formats';

export interface SingleImageUploadRef {
  removeImage: () => void;
  setImage: (file: File) => void;
  setImageUrl: (url: string) => void;
  getImage: () => File | string | null;
}

interface SingleImageUploadProps {
  className?: string;
  label?: string;
  onImageChange?: (file: File | string | null) => void;
}

const SingleImageUpload = forwardRef<SingleImageUploadRef, SingleImageUploadProps>(
  ({ className, label, onImageChange }, ref) => {
    const t = useTranslations('components.hero-form.image');
    const [image, setImageState] = useState<{ file: File | string; previewUrl: string; sourceUrl?: string } | null>(
      null,
    );

    const setImage = (file: File) => {
      if (!isAcceptedMediaFile(file, 'image')) return;
      const previewUrl = URL.createObjectURL(file);
      setImageState({ file, previewUrl });
      onImageChange?.(file);
    };

    const setImageUrl = (url: string) => {
      setImageState({ file: url, previewUrl: url, sourceUrl: url });
      onImageChange?.(url);
    };

    const removeImage = () => {
      if (image && image.file instanceof File) {
        URL.revokeObjectURL(image.previewUrl);
      }
      setImageState(null);
      onImageChange?.(null);
    };

    const onDrop = (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setImage(acceptedFiles[0]);
      }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: getMediaDropzoneAccept('image'),
      maxFiles: 1,
      disabled: !!image,
    });

    useImperativeHandle(ref, () => ({
      removeImage,
      setImage,
      setImageUrl,
      getImage: () => image?.file || null,
    }));

    const acceptedFormats = 'JPG, WEBP, PNG';

    return (
      <div className={cn('flex w-full flex-col', className)}>
        <div
          {...getRootProps()}
          className={cn(
            'relative flex h-full w-full cursor-pointer items-center justify-center gap-4 rounded-xl border-2 border-dashed p-3 transition-all',
            'border-color-b1 bg-foreground/40',
            isDragActive && 'border-color-b1 bg-color-c2',
            image && 'cursor-default',
          )}
        >
          {image ? (
            <div className='group relative flex h-full w-full items-center justify-center'>
              <img
                src={image.previewUrl}
                alt='Upload preview'
                className='max-h-full max-w-full rounded-lg object-contain'
                decoding='async'
              />
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                className='absolute inset-0 flex items-center justify-center bg-black/40 lg:hidden lg:group-hover:flex'
              >
                <Trash2 className='text-foreground size-6' />
              </button>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center gap-3 lg:flex-row lg:gap-4'>
              <div className='border-color-b1 bg-foreground/20 flex size-[80px] shrink-0 items-center justify-center rounded-xl border-2 border-dashed lg:size-[100px]'>
                <Plus className='text-foreground size-7 lg:size-9' />
              </div>
              <div className='flex max-w-[220px] flex-col gap-1 text-center'>
                <p className='text-background/60 text-xs break-words lg:text-sm'>{label || t('upload-hint')}</p>
                <p className='text-background/40 text-xs break-words'>
                  {t('format-hint')}: {acceptedFormats}
                </p>
              </div>
            </div>
          )}

          <input {...getInputProps()} className='hidden' />
        </div>
      </div>
    );
  },
);

SingleImageUpload.displayName = 'SingleImageUpload';

export default SingleImageUpload;
