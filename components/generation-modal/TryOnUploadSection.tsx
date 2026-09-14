'use client';

import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { useFormRestoration } from '@/hooks/use-form-restoration';
import SubHeading from '@/components/form/SubHeading';
import { ObjectIcon, SubjectIcon } from '@/components/svg/form/image-upload-with-frame';

const ACCEPTED_IMAGE_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

const ACCEPTED_FORMATS_LABEL = 'jpg, png, webp';

type ImageItem = { id: string; file?: File; previewUrl: string };

export interface TryOnUploadSectionRef {
  setSubjectImage: (file: File | string) => void;
  setObjectImages: (urls: string[]) => void;
}

interface TryOnUploadSectionProps {
  title?: string;
  subjectLabel: string;
  objectLabel: string;
  maxObjectImages?: number;
  hintsSection?: React.ReactNode;
}

const TryOnUploadSection = forwardRef<TryOnUploadSectionRef, TryOnUploadSectionProps>(
  ({ title, subjectLabel, objectLabel, maxObjectImages = 4, hintsSection }, ref) => {
    const tUpload = useTranslations('components.video-image-upload-form');
    const tCommon = useTranslations('Common');
    const methods = useFormContext();

    // Subject state
    const [subjectImage, setSubjectImageState] = useState<{ url: string; file?: File } | null>(null);
    const subjectInputRef = useRef<HTMLInputElement>(null);

    // Object state
    const [objectImages, setObjectImages] = useState<ImageItem[]>([]);
    useFormRestoration((data, preview) => {
      const url = preview(data.subjectImage);
      setSubjectImageState(
        url ? { url, file: data.subjectImage instanceof File ? data.subjectImage : undefined } : null,
      );
      const values = Array.isArray(data.objectImages) ? data.objectImages : [];
      setObjectImages(
        values.flatMap((value) => {
          const url = preview(value);
          return url ? [{ id: nanoid(), file: value instanceof File ? value : undefined, previewUrl: url }] : [];
        }),
      );
    });
    const objectInputRef = useRef<HTMLInputElement>(null);

    // === Subject handlers ===
    const handleSubjectFile = useCallback(
      (file: File) => {
        const url = URL.createObjectURL(file);
        setSubjectImageState({ url, file });
        methods.setValue('subjectImage', file, { shouldValidate: true, shouldDirty: true });
      },
      [methods],
    );

    const handleSubjectUrl = useCallback(
      (urlStr: string) => {
        setSubjectImageState({ url: urlStr });
        methods.setValue('subjectImage', urlStr, { shouldValidate: true, shouldDirty: true });
      },
      [methods],
    );

    const clearSubject = useCallback(() => {
      setSubjectImageState(null);
      methods.setValue('subjectImage', null, { shouldValidate: true, shouldDirty: true });
      if (subjectInputRef.current) subjectInputRef.current.value = '';
    }, [methods]);

    const subjectDropzone = useDropzone({
      onDrop: (files) => {
        if (files[0]) handleSubjectFile(files[0]);
      },
      accept: ACCEPTED_IMAGE_TYPES,
      multiple: false,
    });

    const handleSubjectInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleSubjectFile(file);
      if (subjectInputRef.current) subjectInputRef.current.value = '';
    };

    // === Object handlers ===
    const syncObjectFormValue = (imgs: ImageItem[]) => {
      methods.setValue('objectImages', imgs.map((img) => img.file || img.previewUrl).filter(Boolean));
    };

    const addObjectFiles = async (files: File[]) => {
      const remaining = maxObjectImages - objectImages.length;
      if (remaining <= 0) {
        toast.error(`Max ${maxObjectImages} images`);
        return;
      }
      const newItems: ImageItem[] = files.slice(0, remaining).map((file) => ({
        id: nanoid(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setObjectImages((prev) => {
        const updated = [...prev, ...newItems];
        syncObjectFormValue(updated);
        return updated;
      });
    };

    const removeObjectImage = (id: string) => {
      setObjectImages((prev) => {
        const updated = prev.filter((img) => img.id !== id);
        syncObjectFormValue(updated);
        return updated;
      });
    };

    const objectDropzone = useDropzone({
      onDrop: addObjectFiles,
      accept: ACCEPTED_IMAGE_TYPES,
      multiple: true,
      disabled: objectImages.length >= maxObjectImages,
      noClick: true,
    });

    const handleObjectInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) await addObjectFiles(files);
      if (objectInputRef.current) objectInputRef.current.value = '';
    };

    useImperativeHandle(ref, () => ({
      setSubjectImage: (file: File | string) => {
        if (typeof file === 'string') handleSubjectUrl(file);
        else handleSubjectFile(file);
      },
      setObjectImages: (urls: string[]) => {
        const items: ImageItem[] = urls.map((url) => ({ id: nanoid(), previewUrl: url }));
        setObjectImages(items);
        methods.setValue('objectImages', urls);
      },
    }));

    const canAddMore = objectImages.length < maxObjectImages;

    return (
      <div className='flex flex-col gap-2.5'>
        {title && <SubHeading>{title}</SubHeading>}
        <div className='border-border bg-card flex flex-col gap-1 rounded-xl border p-1'>
          {/* Subject - single image dropzone */}
          <div className='bg-card flex items-stretch gap-1 rounded-xl p-1'>
            <div className='flex shrink-0 items-center'>
              <SubjectIcon className='text-foreground/70 size-5' />
            </div>
            <div className='border-foreground/10 w-px border-l border-dashed' />

            <div
              {...subjectDropzone.getRootProps()}
              className={cn(
                'border-foreground/10 hover:border-foreground/30 hover:bg-card relative flex h-[100px] flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed transition-all',
                subjectDropzone.isDragActive && 'border-foreground/30 bg-card',
                subjectImage && 'border-transparent hover:border-transparent hover:bg-transparent',
              )}
            >
              <input {...subjectDropzone.getInputProps()} />
              {subjectImage ? (
                <div className='group flex size-full items-center justify-center'>
                  <img
                    src={subjectImage.url}
                    alt={subjectLabel}
                    className='max-h-full max-w-full object-contain'
                    decoding='async'
                  />
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSubject();
                    }}
                    className='absolute inset-0 flex items-center justify-center bg-black/40 transition-all lg:hidden lg:group-hover:flex'
                  >
                    <Trash2 className='text-foreground size-5' />
                  </button>
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center gap-1'>
                  <Upload className='text-foreground/40 size-5' />
                  <span className='text-foreground/40 text-sm'>{subjectLabel}</span>
                </div>
              )}
            </div>
          </div>

          {/* Object - multi image dropzone */}
          <div className='bg-card flex items-stretch gap-1 rounded-xl p-1'>
            <div className='flex shrink-0 items-center'>
              <ObjectIcon className='text-foreground/70 size-5' />
            </div>
            <div className='border-foreground/10 w-px border-l border-dashed' />

            <div
              {...objectDropzone.getRootProps()}
              onClick={() => objectInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  objectInputRef.current?.click();
                }
              }}
              role='button'
              tabIndex={0}
              className={cn(
                'border-foreground/10 hover:border-foreground/30 hover:bg-card relative flex flex-1 cursor-pointer flex-col rounded-lg border border-dashed p-2 transition-all',
                objectDropzone.isDragActive && 'border-foreground/30 bg-card',
              )}
            >
              {objectImages.length === 0 ? (
                <div className='flex items-center gap-3 py-3'>
                  <div className='border-foreground/20 bg-card flex size-12 shrink-0 items-center justify-center rounded-lg border-2 border-dashed'>
                    <Plus className='text-foreground/40 size-5' />
                  </div>
                  <div className='flex flex-1 flex-col items-center gap-0.5 text-center'>
                    <span className='text-foreground/40 text-sm'>{objectLabel}</span>
                    <span className='text-foreground/30 text-xs'>
                      {tUpload('supported-formats')}: {ACCEPTED_FORMATS_LABEL}
                    </span>
                    <span className='text-foreground/30 text-xs'>
                      {objectImages.length}/{maxObjectImages} {tCommon('images')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className='flex flex-col gap-1.5'>
                  <div className='grid grid-cols-4 gap-1.5'>
                    {objectImages.map((image) => (
                      <div key={image.id} className='group bg-card relative aspect-square overflow-hidden rounded-lg'>
                        <img src={image.previewUrl} alt='Object' className='size-full object-cover' decoding='async' />
                        <button
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation();
                            removeObjectImage(image.id);
                          }}
                          className='absolute inset-0 flex items-center justify-center bg-black/40 transition-all lg:hidden lg:group-hover:flex'
                        >
                          <Trash2 className='text-foreground size-4' />
                        </button>
                      </div>
                    ))}
                    {canAddMore && (
                      <div className='border-foreground/20 bg-card flex aspect-square items-center justify-center rounded-lg border-2 border-dashed'>
                        <Plus className='text-foreground/40 size-5' />
                      </div>
                    )}
                  </div>
                  <div className='text-foreground/30 flex items-center justify-between text-xs'>
                    <span>
                      {tUpload('supported-formats')}: {ACCEPTED_FORMATS_LABEL}
                    </span>
                    <span>
                      {objectImages.length}/{maxObjectImages}
                    </span>
                  </div>
                </div>
              )}
              <input
                {...objectDropzone.getInputProps()}
                ref={objectInputRef}
                type='file'
                className='hidden'
                onChange={handleObjectInputChange}
                multiple
              />
            </div>
          </div>

          {hintsSection && (
            <>
              <div className='border-border border-t' />
              {hintsSection}
            </>
          )}
        </div>
      </div>
    );
  },
);

TryOnUploadSection.displayName = 'TryOnUploadSection';

export default TryOnUploadSection;
