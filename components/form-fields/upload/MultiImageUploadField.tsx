'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { validateImagePx } from '@/lib/utils/imageUtils';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import SubHeading from '@/components/form/SubHeading';

const ACCEPTED_IMAGE_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

type ImageItem = {
  id: string;
  file: File;
  previewUrl: string;
};

export interface MultiImageUploadFieldWithDragRef {
  removeAllImages: () => void;
  addImages: (files: File[]) => void;
  getImages: () => File[];
}

const MultiImageUploadFieldWithDrag = forwardRef<
  MultiImageUploadFieldWithDragRef,
  {
    title?: string;
    name: string;
    maxImages?: number;
    minWidthPx?: number;
    minHeightPx?: number;
    className?: string;
    acceptTypes?: string[];
    label?: string;
    afterSetImage?: () => void;
    afterClearImage?: () => void;
    onImagePreview?: (imgSrcs: string[]) => void;
    validateFileBeforeAdd?: (file: File) => Promise<boolean>;
  }
>(
  (
    {
      title,
      name,
      maxImages = 5,
      minWidthPx = 300,
      minHeightPx = 300,
      className,
      acceptTypes,
      label,
      afterSetImage,
      afterClearImage,
      onImagePreview,
      validateFileBeforeAdd,
    },
    ref,
  ) => {
    const t = useTranslations('components.video-image-upload-form');
    const tCommon = useTranslations('Common');
    const methods = useFormContext<{ [key: string]: File[] | null }>();

    const [images, setImages] = useState<ImageItem[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const clearInputValue = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const addImages = async (files: File[]) => {
      const remainingSlots = maxImages - images.length;
      const filesToAdd = files.slice(0, remainingSlots);

      const validationResults = await Promise.all(
        filesToAdd.map(async (file) => {
          if (validateFileBeforeAdd) {
            const isValid = await validateFileBeforeAdd(file);
            return { file, isValid };
          }
          const isValid = await validateImagePx({ imageFile: file, minWidthPx, minHeightPx });
          return { file, isValid };
        }),
      );

      const validFiles: ImageItem[] = validationResults
        .filter(({ isValid }) => {
          if (!isValid && !validateFileBeforeAdd) {
            toast.error(`${t('min width')} ${minWidthPx} px ${t('or')} ${t('min height')} ${minHeightPx} px`);
          }
          return isValid;
        })
        .map(({ file }) => ({
          id: nanoid(),
          file,
          previewUrl: URL.createObjectURL(file),
        }));

      if (validFiles.length > 0) {
        setImages((prev) => [...prev, ...validFiles]);
      }
    };

    const removeImage = (id: string) => {
      setImages((prev) => prev.filter((img) => img.id !== id));
    };

    const removeAllImages = () => {
      setImages([]);
      clearInputValue();
    };

    useEffect(() => {
      const formFiles = images.map((img) => img.file);
      methods.setValue(name, formFiles);

      if (onImagePreview) {
        onImagePreview(images.map((img) => img.previewUrl));
      }

      if (images.length > 0 && afterSetImage) {
        afterSetImage();
      }

      if (images.length === 0 && afterClearImage) {
        afterClearImage();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [images]);

    useEffect(() => {
      if (images.length > maxImages) {
        setImages((prev) => prev.slice(0, maxImages));
      }
    }, [maxImages]);

    const onDrop = async (acceptedFiles: File[]) => {
      await addImages(acceptedFiles);
    };

    const accepted = acceptTypes && acceptTypes.length > 0 ? acceptTypes : ACCEPTED_IMAGE_TYPES;
    const acceptObject =
      typeof accepted === 'object' && !Array.isArray(accepted)
        ? accepted
        : Object.fromEntries(
            (Array.isArray(accepted) ? accepted : [accepted]).map((type) => [type, ACCEPTED_IMAGE_TYPES[type] || []]),
          );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: acceptObject,
      multiple: true,
      disabled: images.length >= maxImages,
      noClick: true,
    });

    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        await addImages(files);
      }
      clearInputValue();
    };

    const handleAddClick = () => {
      fileInputRef.current?.click();
    };

    useImperativeHandle(ref, () => ({
      removeAllImages,
      addImages,
      getImages: () => images.map((img) => img.file),
    }));

    const canAddMore = images.length < maxImages;
    const acceptedFormats = Object.values(acceptObject)
      .flat()
      .map((ext) => ext.replace('.', ''))
      .filter((ext, index, arr) => {
        // Deduplicate: skip jpeg if jpg is present
        if (ext === 'jpeg' && arr.includes('jpg')) return false;
        return true;
      })
      .join(', ');

    return (
      <div className={cn('flex w-full flex-col gap-2', className)}>
        <SubHeading>{title || tCommon('uploadImages')}</SubHeading>
        <FormField
          control={methods.control}
          name={name}
          render={() => (
            <FormItem className='w-full space-y-0'>
              <div
                {...getRootProps()}
                onClick={handleAddClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAddClick();
                  }
                }}
                role='button'
                tabIndex={0}
                className={cn(
                  'relative flex w-full cursor-pointer flex-col rounded-xl border border-dashed border-white/10 bg-[#232528] p-3 transition-all hover:border-white/30 hover:bg-[#2a2b2f]',
                  isDragActive && 'border-white/30 bg-[#2a2b2f]',
                  images.length > 0 && 'gap-3',
                )}
              >
                {images.length === 0 ? (
                  <div className='flex items-center gap-3'>
                    <div className='flex size-16 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-[#1c1d20]'>
                      <Plus className='size-6 text-white/40' />
                    </div>

                    <div className='flex flex-1 flex-col items-center justify-center gap-0.5 text-center'>
                      <div className='text-sm text-white/40'>{label || t('label')}</div>
                      <div className='text-xs text-white/30'>
                        {t('supported-formats')}: {acceptedFormats}
                      </div>
                      <div className='text-xs text-white/30'>
                        {images.length}/{maxImages} {tCommon('images')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className='grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5'>
                      {images.map((image) => (
                        <div
                          key={image.id}
                          className='group relative aspect-square overflow-hidden rounded-lg bg-gray-100'
                        >
                          <img
                            src={image.previewUrl}
                            alt='Upload preview'
                            className='size-full object-cover'
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
                            <Trash2 className='size-5 text-white' />
                          </button>
                        </div>
                      ))}

                      {canAddMore && (
                        <div className='flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-[#1c1d20] transition-all hover:border-white/30'>
                          <Plus className='size-6 text-white/40' />
                        </div>
                      )}
                    </div>

                    <div className='mt-1 flex items-center justify-between text-xs text-white/30'>
                      <span>
                        {t('supported-formats')}: {acceptedFormats}
                      </span>
                      <span>
                        {images.length}/{maxImages} {tCommon('images')}
                      </span>
                    </div>
                  </>
                )}

                <FormControl>
                  <input
                    {...getInputProps()}
                    ref={fileInputRef}
                    type='file'
                    className='hidden'
                    onChange={handleFileInputChange}
                    multiple
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />
      </div>
    );
  },
);

MultiImageUploadFieldWithDrag.displayName = 'MultiImageUploadFieldWithDrag';

export default MultiImageUploadFieldWithDrag;
