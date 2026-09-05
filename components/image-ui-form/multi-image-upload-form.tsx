/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */

'use client';

/* eslint-disable react/function-component-definition */
import {
  forwardRef,
  ForwardRefRenderFunction,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Upload, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import Box from '@/components/Box';

const acceptedImageTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];

type ImageItem = {
  id: string;
  file: File | null;
  url: string;
};

// eslint-disable-next-line prefer-arrow-callback
const MultiImageUploadForm: ForwardRefRenderFunction<
  {
    removeAllImages: () => void;
  },
  {
    name: string;
    afterSetImage?: () => void;
    label?: string;
    onImagePreview?: (imgSrcs: string[]) => void;
    onDelete?: (id: string) => void;
    maxImages?: number;
    acceptTypes?: string[];
    validateFileBeforeAdd?: (file: File) => Promise<boolean> | boolean;
  }
> = (
  { name, afterSetImage, label, onImagePreview, onDelete, maxImages = 5, acceptTypes, validateFileBeforeAdd },
  ref,
) => {
  const t = useTranslations('Common');
  const methods = useFormContext<{ [key: string]: File[] | null }>();

  const [images, setImages] = useState<ImageItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use useEffect to sync images state to form
  useEffect(() => {
    const files = images.map((img) => img.file).filter((file) => file !== null) as File[];
    methods.setValue(name, files);
  }, [images, name, methods]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addImages = (files: File[]) => {
    const newImages: ImageItem[] = [];
    let processed = 0;

    files.forEach((file) => {
      if (images.length + newImages.length >= maxImages) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push({
          id: generateId(),
          file,
          url: reader.result as string,
        });

        processed++;
        if (processed === Math.min(files.length, maxImages - images.length)) {
          setImages((prev) => {
            const updated = [...prev, ...newImages];
            if (onImagePreview) {
              onImagePreview(updated.map((img) => img.url));
            }
            return updated;
          });

          if (afterSetImage) {
            afterSetImage();
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      if (onImagePreview) {
        onImagePreview(updated.map((img) => img.url));
      }
      return updated;
    });

    if (onDelete) {
      onDelete(id);
    }
  };

  const removeAllImages = useCallback(() => {
    setImages([]);
    methods.setValue(name, []);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [name, methods]);

  const onRemoveButtonClick = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeImage(id);
  };

  const inputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const accepted = acceptTypes && acceptTypes.length > 0 ? acceptTypes : acceptedImageTypes;

    // 1) Type filtering (e.g., exclude webp)
    const typeFiltered = files.filter((file) => accepted.includes(file.type));
    if (typeFiltered.length === 0) return;

    // 2) External validation (e.g., aspect ratio validation)
    let validated: File[] = typeFiltered;
    if (validateFileBeforeAdd) {
      const results: File[] = [];
      for (const file of typeFiltered) {
        try {
          const ok = await validateFileBeforeAdd(file);
          if (ok) results.push(file);
        } catch (_) {
          // Ignore exceptions, consider as failed
        }
      }
      validated = results;
    }

    if (validated.length > 0) {
      addImages(validated);
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      removeAllImages,
    }),
    [removeAllImages],
  );

  const canAddMore = images.length < maxImages;

  return (
    <Box
      variant='input'
      className='flex h-auto min-h-[72px] shrink-0 flex-col border border-dashed border-[#303030] bg-[#080808] p-1'
    >
      <FormField
        control={methods.control}
        name={name}
        render={() => (
          <FormItem className='w-full space-y-2'>
            {/* Upload Area */}
            <FormLabel className='m-0 flex cursor-pointer flex-col'>
              <div className='flex w-full justify-between'>
                <div className='flex-center relative size-16 rounded bg-transparent'>
                  <Upload className='size-6 text-[#b8b8b8]' />
                </div>
                <div className='flex flex-1 flex-col items-center justify-center text-center text-sm whitespace-pre-line text-[#b8b8b8]'>
                  {label}
                  <div className='text-xs text-[#b8b8b8]'>
                    {images.length}/{maxImages} {t('images')}
                  </div>
                </div>
              </div>
            </FormLabel>

            {/* Image Grid */}
            {images.length > 0 && (
              <div className='grid grid-cols-4 gap-2'>
                {images.map((image) => (
                  <div key={image.id} className='relative'>
                    <button
                      type='button'
                      onClick={(e) => onRemoveButtonClick(e, image.id)}
                      className='absolute -top-1 -right-1 z-20 flex size-5 items-center justify-center rounded-full bg-[#1C1D20]/90'
                    >
                      <X className='size-3 text-[#b8b8b8]' />
                    </button>
                    <img src={image.url} alt='Upload' className='aspect-square w-full rounded object-cover' />
                  </div>
                ))}
              </div>
            )}

            <FormControl>
              <input
                type='file'
                disabled={!canAddMore}
                accept={(acceptTypes && acceptTypes.length > 0 ? acceptTypes : acceptedImageTypes).join(',')}
                className='hidden'
                ref={fileInputRef}
                required={false}
                multiple
                onChange={inputChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </Box>
  );
};

export default forwardRef(MultiImageUploadForm);
