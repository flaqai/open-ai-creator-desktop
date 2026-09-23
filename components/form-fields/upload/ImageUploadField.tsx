'use client';

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import useImageHistory from '@/network/image/history';
import useImageFormStore from '@/store/form/useImageFormStore';
import { Trash2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { getFileByUrl } from '@/lib/utils/fileUtils';
import { getMediaDropzoneAccept, isAcceptedMediaFile } from '@/lib/utils/media-upload-formats';
import { useFormRestoration } from '@/hooks/use-form-restoration';
import { useHistoryImageDrop } from '@/hooks/use-history-image-drop';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { PopoverAnchor } from '@/components/ui/popover';
import ReferenceMediaPicker from '@/components/unified-generator/reference-upload/ReferenceMediaPicker';

export interface ImageUploadFieldRef {
  updateFile: (file: File | Blob | null | string) => Promise<void>;
  deleteFile: () => void;
  removeImage: () => void;
  previewImage: (file: File | Blob | null | string) => Promise<void>;
}

interface ImageUploadFieldProps {
  name: string;
  label?: string;
  className?: string;
  translationNamespace?: 'components.video-image-upload-form' | 'components.image-form';
  afterSetImage?: () => void;
  afterClearImage?: () => void;
}

const ImageUploadField = forwardRef<ImageUploadFieldRef, ImageUploadFieldProps>(
  (
    {
      name,
      label,
      className,
      translationNamespace = 'components.video-image-upload-form',
      afterSetImage,
      afterClearImage,
    },
    ref,
  ) => {
    const t = useTranslations(translationNamespace);
    const methods = useFormContext<{ [key: string]: File | null | string }>();

    const setUploadImageObj = useImageFormStore((state) => state.setUploadImageObj);
    const imageFormSrc = useImageFormStore((state) => state.imageFormSrc);
    const setImageFormSrc = useImageFormStore((state) => state.setImageFormSrc);
    const videoFormImageSrc = useImageFormStore((state) => state.videoFormImageSrc);
    const setVideoFormImageSrc = useImageFormStore((state) => state.setVideoFormImageSrc);

    const imgRef = useRef<HTMLImageElement>(null);
    const [imgSize, setImgSize] = useState<{ width: number | string; height: number | string }>({
      width: '100%',
      height: '100%',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const imageHistory = useImageHistory(1, Number.MAX_SAFE_INTEGER);
    const historyAssets = useMemo(
      () =>
        imageHistory.data
          .filter(
            (item) => item.status !== 'processing' && item.status !== 'fail' && Boolean(item.url || item.thumbnailUrl),
          )
          .map((item) => ({
            id: `history-image-${item.id}`,
            kind: 'image' as const,
            source: item.url || item.thumbnailUrl,
            name: item.prompt || item.modelInfo,
          })),
      [imageHistory.data],
    );
    useFormRestoration((data, preview) => setFileUrl(preview(data[name])));

    const clearInputValue = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const updateFile = async (file: File | Blob | null | string) => {
      if (file instanceof File && !isAcceptedMediaFile(file, 'image')) return;
      if (typeof file === 'string') {
        // Use URL directly, skip File conversion (avoids CORS issues)
        setFileUrl(file);
        methods.setValue(name, file);
        afterSetImage?.();
        return;
      }
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setFileUrl(previewUrl);
        methods.setValue(name, file as File);
        afterSetImage?.();
      } else {
        methods.setValue(name, null);
        setFileUrl(null);
        clearInputValue();
      }
    };

    const onDrop = async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const previewUrl = URL.createObjectURL(file);
      setFileUrl(previewUrl);
      methods.setValue(name, file);
      afterSetImage?.();
    };

    const { isHistoryDragActive, historyDropProps } = useHistoryImageDrop((image) => {
      void updateFile(image.url);
    });

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: getMediaDropzoneAccept('image'),
      maxFiles: 1,
      noClick: true,
    });
    const uploadRootProps = getRootProps(historyDropProps);

    const deleteFile = () => {
      updateFile(null);
      clearInputValue();
      setUploadImageObj(null);
      afterClearImage?.();
    };

    useImperativeHandle(ref, () => ({
      updateFile,
      deleteFile,
      removeImage: deleteFile,
      previewImage: updateFile,
    }));

    useEffect(() => {
      const timer = setTimeout(() => {
        if (imgRef.current) {
          setImgSize({ width: imgRef.current.clientWidth, height: imgRef.current.clientHeight });
        }
      }, 120);
      return () => clearTimeout(timer);
    }, [fileUrl]);

    // Monitor videoFormImageSrc for video forms (avoids CORS issues by using URL strings directly)
    useEffect(() => {
      if (videoFormImageSrc) {
        // Use URL directly, skip File conversion (avoids CORS issues)
        setFileUrl(videoFormImageSrc);
        // Set as URL string; backend will handle it on submit
        methods.setValue(name, videoFormImageSrc);
        if (afterSetImage) {
          afterSetImage();
        }
        setVideoFormImageSrc(null);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoFormImageSrc]);

    // Monitor imageFormSrc for image forms (legacy approach)
    useEffect(() => {
      if (imageFormSrc) {
        (async () => {
          setFileUrl(imageFormSrc);
          const imageFile = await getFileByUrl(imageFormSrc);
          methods.setValue(name, imageFile);
          if (afterSetImage) {
            afterSetImage();
          }

          if (imageFormSrc) {
            setImageFormSrc(null);
          }
        })();
      }

      return () => {};
    }, [name, afterSetImage, imageFormSrc, setImageFormSrc, methods]);

    return (
      <div className={cn('flex w-full flex-col gap-2', className)}>
        <ReferenceMediaPicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          kind='image'
          canAdd={!fileUrl}
          isHistoryLoading={imageHistory.isLoading}
          historyAssets={historyAssets}
          acceptedFormats={['jpg', 'jpeg', 'png', 'webp']}
          historySelectionLimit={1}
          onUploadFromDevice={() => fileInputRef.current?.click()}
          onSelectHistory={(assets) => updateFile(String(assets[0]?.source || ''))}
          trigger={
            <PopoverAnchor asChild>
              <div
                {...uploadRootProps}
                onClick={() => {
                  if (!fileUrl) setPickerOpen(true);
                }}
                className={cn(
                  'border-foreground/10 bg-card hover:border-foreground/30 hover:bg-card relative h-[112px] w-full rounded-xl border border-dashed',
                  fileUrl && 'border-foreground/10 bg-card hover:border-foreground/10 hover:bg-card',
                  (isDragActive || isHistoryDragActive) && 'border-primary bg-primary/5',
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
                              className='absolute-center absolute flex items-center justify-center bg-black/40 lg:hidden lg:group-hover:flex'
                            >
                              <Trash2 className='text-foreground size-5' />
                            </button>
                          </div>
                        ) : (
                          <FormLabel className='text-foreground/40 flex h-full w-full flex-col items-center justify-center gap-3 text-center'>
                            <div className='bg-foreground/5 flex size-8 items-center justify-center rounded-lg'>
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
            </PopoverAnchor>
          }
        />
      </div>
    );
  },
);

ImageUploadField.displayName = 'ImageUploadField';

export default ImageUploadField;
