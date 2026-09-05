'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import useImageFormStore from '@/store/form/useImageFormStore';
import { Plus, Trash2, Upload } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { getFileByUrl } from '@/lib/utils/fileUtils';
import { validateImagePx } from '@/lib/utils/imageUtils';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
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
  sourceUrl?: string;
};

export interface UnifiedImageUploadFieldRef {
  removeAllImages: () => void;
  addImages: (files: File[]) => void;
  getImages: () => File[];
  updateFile?: (file: File | Blob | null | string) => Promise<void>;
  deleteFile?: () => void;
  removeImage?: () => void;
  previewImage?: (file: File | Blob | null | string) => Promise<void>;
}

interface UnifiedImageUploadFieldProps {
  title?: string;
  name: string;
  maxImages?: number;
  minWidthPx?: number;
  minHeightPx?: number;
  className?: string;
  acceptTypes?: string[];
  label?: string;
  translationNamespace?: 'components.video-image-upload-form' | 'components.image-form';
  afterSetImage?: () => void;
  afterClearImage?: () => void;
  onImagePreview?: (imgSrcs: string[]) => void;
  validateFileBeforeAdd?: (file: File) => Promise<boolean>;
}

const UnifiedImageUploadField = forwardRef<UnifiedImageUploadFieldRef, UnifiedImageUploadFieldProps>(
  (
    {
      title,
      name,
      maxImages = 1,
      minWidthPx = 300,
      minHeightPx = 300,
      className,
      acceptTypes,
      label,
      translationNamespace = 'components.video-image-upload-form',
      afterSetImage,
      afterClearImage,
      onImagePreview,
      validateFileBeforeAdd,
    },
    ref,
  ) => {
    const t = useTranslations(translationNamespace);
    const tCommon = useTranslations('Common');
    const methods = useFormContext<{ [key: string]: (File | string)[] | File | string | null }>();

    const setUploadImageObj = useImageFormStore((state) => state.setUploadImageObj);
    const imageFormSrc = useImageFormStore((state) => state.imageFormSrc);
    const setImageFormSrc = useImageFormStore((state) => state.setImageFormSrc);

    const [images, setImages] = useState<ImageItem[]>([]);
    const imgRef = useRef<HTMLImageElement>(null);
    const [imgSize, setImgSize] = useState<{ width: number | string; height: number | string }>({
      width: '100%',
      height: '100%',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const hasReadInitialValue = useRef(false);

    const isSingleMode = maxImages === 1;

    const clearInputValue = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const addImages = async (files: File[]) => {
      // Single image mode: allow replacing existing image
      const remainingSlots = isSingleMode ? maxImages : maxImages - images.length;
      const filesToAdd = files.slice(0, remainingSlots);

      const validationResults = await Promise.all(
        filesToAdd.map(async (file) => {
          if (validateFileBeforeAdd) {
            const isValid = await validateFileBeforeAdd(file);
            return { file, isValid };
          }
          if (isSingleMode) {
            return { file, isValid: true };
          }
          const isValid = await validateImagePx({ imageFile: file, minWidthPx, minHeightPx });
          return { file, isValid };
        }),
      );

      const validFiles: ImageItem[] = validationResults
        .filter(({ isValid }) => {
          if (!isValid && !validateFileBeforeAdd && !isSingleMode) {
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
        setImages((prev) => (isSingleMode ? validFiles : [...prev, ...validFiles]));
      }
    };

    const updateFile = async (file: File | Blob | null | string) => {
      if (typeof file === 'string') {
        // For URL, do not download file; use URL directly as preview
        // Create an empty File object as placeholder
        const dummyFile = new File([], 'url-placeholder.jpg', { type: 'image/jpeg' });
        setImages([{ id: nanoid(), file: dummyFile, previewUrl: file, sourceUrl: file }]);
        afterSetImage?.();
        return;
      }
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setImages([{ id: nanoid(), file: file as File, previewUrl }]);
        afterSetImage?.();
      } else {
        setImages([]);
        clearInputValue();
      }
    };

    const removeImage = (id: string) => {
      setImages((prev) => prev.filter((img) => img.id !== id));
    };

    const removeAllImages = () => {
      setImages([]);
      clearInputValue();
      if (isSingleMode) {
        setUploadImageObj(null);
      }
      afterClearImage?.();
    };

    const deleteFile = () => {
      removeAllImages();
    };

    useEffect(() => {
      // On submit, use URL strings directly; File objects also used directly
      methods.setValue(
        name,
        images.map((img) => img.sourceUrl || img.file),
      );

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
    }, [images, isSingleMode]);

    // Only read form initial value on first mount
    useEffect(() => {
      if (hasReadInitialValue.current) return;
      hasReadInitialValue.current = true;

      const initialValue = methods.getValues(name);
      if (!initialValue || (Array.isArray(initialValue) && initialValue.length === 0)) {
        return;
      }

      const values = Array.isArray(initialValue) ? initialValue : [initialValue];
      const initialImages: ImageItem[] = [];

      values.forEach((item: File | string) => {
        if (typeof item === 'string') {
          initialImages.push({
            id: nanoid(),
            file: new File([], 'remote-image', { type: 'image/png' }),
            previewUrl: item,
            sourceUrl: item,
          });
        } else if (item instanceof File) {
          initialImages.push({
            id: nanoid(),
            file: item,
            previewUrl: URL.createObjectURL(item),
          });
        }
      });

      if (initialImages.length > 0) {
        setImages(initialImages);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (imageFormSrc) {
        if (isSingleMode) {
          // Single image mode: use URL directly
          setImages([
            {
              id: nanoid(),
              file: new File([], 'remote-image', { type: 'image/png' }),
              previewUrl: imageFormSrc,
              sourceUrl: imageFormSrc,
            },
          ]);
        } else {
          // Multi-image mode: add to list (if not exceeding maxImages)
          setImages((prev) => {
            if (prev.length >= maxImages) {
              return prev;
            }
            return [
              ...prev,
              {
                id: nanoid(),
                file: new File([], 'remote-image', { type: 'image/png' }),
                previewUrl: imageFormSrc,
                sourceUrl: imageFormSrc,
              },
            ];
          });
        }
        if (afterSetImage) {
          afterSetImage();
        }
        setImageFormSrc(null);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageFormSrc]);

    useEffect(() => {
      if (isSingleMode && images.length > 0) {
        const timer = setTimeout(() => {
          if (imgRef.current) {
            setImgSize({ width: imgRef.current.clientWidth, height: imgRef.current.clientHeight });
          }
        }, 120);
        return () => clearTimeout(timer);
      }
    }, [images, isSingleMode]);

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
      multiple: !isSingleMode,
      disabled: !isSingleMode && images.length >= maxImages,
      noClick: !isSingleMode,
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
      updateFile: isSingleMode ? updateFile : undefined,
      deleteFile: isSingleMode ? deleteFile : undefined,
      removeImage: isSingleMode ? deleteFile : undefined,
      previewImage: isSingleMode ? updateFile : undefined,
    }));

    const canAddMore = images.length < maxImages;
    const acceptedFormats = Object.values(acceptObject)
      .flat()
      .map((ext) => ext.replace('.', ''))
      .filter((ext, index, arr) => {
        if (ext === 'jpeg' && arr.includes('jpg')) return false;
        return true;
      })
      .join(', ');

    if (isSingleMode) {
      return (
        <div className={cn('flex w-full flex-col gap-2', className)}>
          <SubHeading>{title || tCommon('uploadImages')}</SubHeading>
          <div
            {...getRootProps()}
            className={cn(
              'relative h-[112px] w-full rounded-xl border border-dashed border-white/10 bg-[#232528] hover:border-white/30 hover:bg-[#2a2b2f]',
              isDragActive && 'border-white/30 bg-[#2a2b2f]',
              images.length > 0 && 'border-white/10 bg-[#232528] hover:border-white/10 hover:bg-[#232528]',
            )}
          >
            <FormField
              control={methods.control}
              name={name}
              render={() => (
                <FormItem className='h-full w-full space-y-0'>
                  <div className='relative flex h-full w-full items-center gap-1'>
                    {images.length > 0 ? (
                      <div className='group absolute flex h-full w-full items-center justify-center rounded-[inherit]'>
                        <img
                          src={images[0].previewUrl}
                          alt={name}
                          ref={imgRef}
                          className='max-h-full max-w-full bg-contain'
                          decoding='async'
                        />
                        <button
                          type='button'
                          onClick={deleteFile}
                          style={{ width: imgSize.width, height: imgSize.height }}
                          className='absolute-center absolute flex items-center justify-center bg-black/40 lg:hidden lg:group-hover:flex'
                        >
                          <Trash2 className='size-5 text-white' />
                        </button>
                      </div>
                    ) : (
                      <FormLabel className='flex h-full w-full flex-col items-center justify-center gap-3 text-center text-white/40'>
                        <div className='flex size-8 items-center justify-center rounded-lg bg-white/5'>
                          <Upload className='size-6' />
                        </div>
                        <div className='text-sm'>{label || t('label')}</div>
                      </FormLabel>
                    )}
                  </div>
                  <FormControl>
                    <input {...getInputProps()} ref={fileInputRef} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      );
    }

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
                    multiple={!isSingleMode}
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

UnifiedImageUploadField.displayName = 'UnifiedImageUploadField';

export default UnifiedImageUploadField;
