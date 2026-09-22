'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';

import { cn } from '@/lib/utils';
import { filterAcceptedMediaFiles, getMediaDropzoneAccept } from '@/lib/utils/media-upload-formats';

type ImageItem = {
  id: string;
  file: File | string;
  previewUrl: string;
  sourceUrl?: string;
};

export interface MultiImageUploadRef {
  removeAllImages: () => void;
  addImages: (files: File[]) => void;
  addImageUrls: (urls: string[]) => void;
  setImageUrls: (urls: string[]) => void;
  getImages: () => (File | string)[];
}

interface MultiImageUploadProps {
  maxImages?: number;
  className?: string;
  label?: string;
  onImagesChange?: (files: (File | string)[]) => void;
}

const MultiImageUpload = forwardRef<MultiImageUploadRef, MultiImageUploadProps>(
  ({ maxImages = 5, className, label, onImagesChange }, ref) => {
    const t = useTranslations('components.hero-form.image-video');
    const [images, setImages] = useState<ImageItem[]>([]);

    const addImages = (files: File[]) => {
      const remainingSlots = maxImages - images.length;
      const filesToAdd = filterAcceptedMediaFiles(files, 'image').slice(0, remainingSlots);

      const newImages: ImageItem[] = filesToAdd.map((file) => ({
        id: nanoid(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange?.(updatedImages.map((img) => img.file));
    };

    const addImageUrls = (urls: string[]) => {
      const remainingSlots = maxImages - images.length;
      const urlsToAdd = urls.slice(0, remainingSlots);

      const newImages: ImageItem[] = urlsToAdd.map((url) => ({
        id: nanoid(),
        file: url,
        previewUrl: url,
        sourceUrl: url,
      }));

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange?.(updatedImages.map((img) => img.file));
    };

    const setImageUrls = (urls: string[]) => {
      const urlsToSet = urls.slice(0, maxImages);

      const newImages: ImageItem[] = urlsToSet.map((url) => ({
        id: nanoid(),
        file: url,
        previewUrl: url,
        sourceUrl: url,
      }));

      setImages(newImages);
      onImagesChange?.(newImages.map((img) => img.file));
    };

    const removeImage = (id: string) => {
      const updatedImages = images.filter((img) => img.id !== id);
      setImages(updatedImages);
      onImagesChange?.(updatedImages.map((img) => img.file));
    };

    const removeAllImages = () => {
      setImages([]);
      onImagesChange?.([]);
    };

    const onDrop = (acceptedFiles: File[]) => {
      addImages(acceptedFiles);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: getMediaDropzoneAccept('image'),
      multiple: true,
      disabled: images.length >= maxImages,
      noClick: images.length >= maxImages,
    });

    useImperativeHandle(ref, () => ({
      removeAllImages,
      addImages,
      addImageUrls,
      setImageUrls,
      getImages: () => images.map((img) => img.file),
    }));

    const canAddMore = images.length < maxImages;
    const acceptedFormats = 'JPG, WEBP, PNG';

    return (
      <div className={cn('flex w-full flex-col', className)}>
        <div
          {...getRootProps()}
          className={cn(
            'relative flex w-full cursor-pointer flex-col rounded-xl border-2 border-dashed p-3 transition-all',
            'border-color-b1 bg-foreground/40 h-[150px]',
            isDragActive && 'border-color-b1 bg-foreground/60',
            !canAddMore && 'cursor-not-allowed opacity-60',
          )}
        >
          {images.length === 0 ? (
            <div className='flex h-full flex-col items-center justify-center gap-3 lg:flex-row lg:gap-4'>
              <div className='border-color-b1 bg-foreground/20 flex size-[80px] shrink-0 items-center justify-center rounded-xl border-2 border-dashed lg:size-[100px]'>
                <Plus className='text-foreground size-7 lg:size-9' />
              </div>

              <div className='flex flex-col gap-1 text-center'>
                <div className='text-background/60 text-xs lg:text-sm'>
                  {t('format-hint')}: {acceptedFormats}
                </div>
                <div className='text-background/40 text-xs'>
                  {images.length}/{maxImages} {t('image-count')}
                </div>
              </div>
            </div>
          ) : (
            <div className='flex h-full flex-col justify-between'>
              <div className='flex items-center gap-2 overflow-x-auto'>
                {images.map((image) => (
                  <div
                    key={image.id}
                    className='group relative size-[100px] shrink-0 overflow-hidden rounded-lg bg-gray-100'
                  >
                    <img
                      src={image.previewUrl}
                      alt='Upload preview'
                      className='size-full object-contain'
                      decoding='async'
                    />
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(image.id);
                      }}
                      className='absolute inset-0 flex items-center justify-center bg-black/40 transition-all lg:hidden lg:group-hover:flex'
                    >
                      <Trash2 className='text-foreground size-5' />
                    </button>
                  </div>
                ))}

                {canAddMore && (
                  <div className='border-color-b1 hover:border-color-b2 bg-foreground/20 flex size-[100px] shrink-0 items-center justify-center rounded-lg border-2 border-dashed transition-all'>
                    <Plus className='text-foreground size-6' />
                  </div>
                )}
              </div>

              <div className='text-background/60 flex items-center justify-between text-xs leading-4'>
                <span>
                  {t('format-hint')}: {acceptedFormats}
                </span>
                <span>
                  {images.length}/{maxImages} {t('image-count')}
                </span>
              </div>
            </div>
          )}

          <input {...getInputProps()} className='hidden' />
        </div>
      </div>
    );
  },
);

MultiImageUpload.displayName = 'MultiImageUpload';

export default MultiImageUpload;
