'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import useImageFormStore from '@/store/form/useImageFormStore';
import { Trash2, Upload } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { getFileByUrl } from '@/lib/utils/fileUtils';
import { validateImagePx } from '@/lib/utils/imageUtils';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

const ImageCropDialog = dynamic(() => import('@/components/image/ImageCropDialog'), { ssr: false });

const ACCEPTED_IMAGE_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export interface VideoImageUploadFormRef {
  updateFile: (file: File | Blob | null | string) => Promise<void>;
  deleteFile: () => void;
}

const VideoImageUploadForm = forwardRef<
  VideoImageUploadFormRef,
  {
    name: string;
    label?: string;
    minWidthPx?: number;
    minHeightPx?: number;
    shouldCrop?: boolean;
    className?: string;
    afterSetImage?: () => void;
    afterClearImage?: () => void;
  }
>(
  (
    { name, label, minWidthPx = 300, minHeightPx = 300, shouldCrop = true, className, afterSetImage, afterClearImage },
    ref,
  ) => {
    const t = useTranslations('components.video-image-upload-form');
    const methods = useFormContext<{ [key: string]: File | null | string }>();

    const setUploadImageObj = useImageFormStore((state) => state.setUploadImageObj);
    const videoFormImageSrc = useImageFormStore((state) => state.videoFormImageSrc);
    const setVideoFormImageSrc = useImageFormStore((state) => state.setVideoFormImageSrc);

    const imgRef = useRef<HTMLImageElement>(null);
    const [imgSize, setImgSize] = useState<{ width: number | string; height: number | string }>({
      width: '100%',
      height: '100%',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [openImageCropDialog, setOpenImageCropDialog] = useState(false);
    const [originalImageUrl, setOriginalImageUrl] = useState<{ id: string; previewUrl: string; file: File } | null>(
      null,
    );
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [pendingImageUrl, setPendingImageUrl] = useState<{ previewUrl: string; file: File } | null>(null);

    const clearInputValue = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const updateFile = async (file: File | Blob | null | string) => {
      if (typeof file === 'string') {
        // Use URL directly, skip File conversion (avoids CORS issues)
        setFileUrl(file);
        setOriginalImageUrl({
          id: nanoid(),
          previewUrl: file,
          file: new File([], 'remote-image', { type: 'image/png' }),
        });
        methods.setValue(name, file);
        afterSetImage?.();
        return;
      }
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setFileUrl(previewUrl);
        methods.setValue(name, file as File);
      } else {
        methods.setValue(name, null);
        setOriginalImageUrl(null);
        setFileUrl(null);
        clearInputValue();
      }
      afterSetImage?.();
    };

    const handleCropComplete = ({ imageFile }: { imageFile: Blob }) => {
      const previewUrl = URL.createObjectURL(imageFile);
      setFileUrl(previewUrl);
      methods.setValue(name, imageFile as File);
      setPendingImageUrl(null);
      afterSetImage?.();
    };

    const handleCropCancel = () => {
      setPendingImageUrl(null);
      clearInputValue();
    };

    const handleReCrop = () => {
      setOpenImageCropDialog(true);
    };

    const onDrop = async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const isValid = await validateImagePx({ imageFile: file, minWidthPx, minHeightPx });
      if (!isValid) {
        toast.error(`${t('min width')} ${minWidthPx} px ${t('or')} ${t('min height')} ${minHeightPx} px`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setOriginalImageUrl({ id: nanoid(), previewUrl, file });

      if (shouldCrop) {
        setPendingImageUrl({ previewUrl, file });
        setOpenImageCropDialog(true);
      } else {
        setFileUrl(previewUrl);
        methods.setValue(name, file);
        afterSetImage?.();
      }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: ACCEPTED_IMAGE_TYPES,
      maxFiles: 1,
      disabled: !!fileUrl,
    });

    const deleteFile = () => {
      updateFile(null);
      clearInputValue();
      setUploadImageObj(null);
      afterClearImage?.();
    };

    useImperativeHandle(ref, () => ({
      updateFile,
      deleteFile,
    }));

    useEffect(() => {
      const timer = setTimeout(() => {
        if (imgRef.current) {
          setImgSize({ width: imgRef.current.clientWidth, height: imgRef.current.clientHeight });
        }
      }, 120);
      return () => clearTimeout(timer);
    }, [fileUrl]);

    useEffect(() => {
      if (videoFormImageSrc) {
        // Use URL directly, skip File conversion (avoids CORS issues)
        setFileUrl(videoFormImageSrc);
        setOriginalImageUrl({
          id: nanoid(),
          previewUrl: videoFormImageSrc,
          file: new File([], 'remote-image', { type: 'image/png' }),
        });
        // Set as URL string; backend will handle it on submit
        methods.setValue(name, videoFormImageSrc);
        if (afterSetImage) {
          afterSetImage();
        }
        setVideoFormImageSrc(null);
      }

      return () => {};
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, afterSetImage, videoFormImageSrc, setVideoFormImageSrc]);

    return (
      <>
        <div className={cn('flex w-full flex-col gap-2', className)}>
          <div
            {...getRootProps()}
            className={cn(
              'relative h-[112px] w-full rounded-xl border border-dashed border-white/10 bg-[#232528] hover:border-white/30 hover:bg-[#1c1d20]',
              isDragActive && 'border-white/30 bg-[#1c1d20]',
              fileUrl && 'border-white/10 bg-[#232528] hover:border-white/10 hover:bg-[#232528]',
            )}
          >
            <FormField
              control={methods.control}
              name={name}
              render={() => (
                <FormItem className='h-full w-full space-y-0'>
                  <div className='relative flex h-full w-full items-center gap-1'>
                    {fileUrl ? (
                      <div className='group absolute flex h-full w-full items-center justify-center rounded-[inherit]'>
                        <img
                          src={fileUrl}
                          alt={name}
                          ref={imgRef}
                          className='max-h-full max-w-full bg-contain'
                          decoding='async'
                        />
                        <button
                          type='button'
                          onClick={deleteFile}
                          style={{ width: imgSize.width, height: imgSize.height }}
                          className='absolute-center absolute hidden items-center justify-center bg-black/40 group-hover:flex'
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
          {shouldCrop && fileUrl && (
            <button
              disabled={!fileUrl}
              type='button'
              onClick={handleReCrop}
              className={cn(
                'flex h-[29px] w-full items-center justify-center rounded-lg bg-[#1c1d20] text-sm text-white/70 hover:bg-white/5',
                fileUrl ? '' : 'cursor-not-allowed',
              )}
            >
              {t('crop')}
            </button>
          )}
        </div>
        {originalImageUrl && (
          <ImageCropDialog
            key={`${name}-${originalImageUrl.id}`}
            originalImage={originalImageUrl.previewUrl}
            onCropComplete={pendingImageUrl ? handleCropComplete : ({ imageFile }) => updateFile(imageFile)}
            open={openImageCropDialog}
            setOpen={(open) => {
              setOpenImageCropDialog(open);
              if (!open && pendingImageUrl) {
                handleCropCancel();
              }
            }}
          />
        )}
      </>
    );
  },
);

VideoImageUploadForm.displayName = 'VideoImageUploadForm';

export default VideoImageUploadForm;
