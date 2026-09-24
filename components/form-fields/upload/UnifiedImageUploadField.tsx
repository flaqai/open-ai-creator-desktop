'use client';

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import useImageHistory from '@/network/image/history';
import useImageFormStore from '@/store/form/useImageFormStore';
import { Plus, Trash2, Upload } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useLocale, useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { Eye, FolderOpen, History, Trash2 as TrashIcon } from 'lucide-react';
import { contextActions } from '@/lib/desktop/context-actions';

import type { UnifiedGeneratorReferenceMediaAsset } from '@/lib/constants/unified-generator/types';
import { cn } from '@/lib/utils';
import { validateImagePx } from '@/lib/utils/imageUtils';
import {
  filterAcceptedMediaFiles,
  getMediaDropzoneAccept,
  isAcceptedMediaFile,
} from '@/lib/utils/media-upload-formats';
import { useFormRestoration } from '@/hooks/use-form-restoration';
import { useHistoryImageDrop } from '@/hooks/use-history-image-drop';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { PopoverAnchor } from '@/components/ui/popover';
import SubHeading from '@/components/form/SubHeading';
import ReferenceMediaPicker from '@/components/unified-generator/reference-upload/ReferenceMediaPicker';

const ACCEPTED_IMAGE_TYPES = getMediaDropzoneAccept('image');

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
    const locale = useLocale();
    const zh = locale === 'zh' || locale === 'tw';
    const tCommon = useTranslations('Common');
    const methods = useFormContext<{ [key: string]: (File | string)[] | File | string | null }>();

    const setUploadImageObj = useImageFormStore((state) => state.setUploadImageObj);
    const imageFormSrc = useImageFormStore((state) => state.imageFormSrc);
    const setImageFormSrc = useImageFormStore((state) => state.setImageFormSrc);

    const [images, setImages] = useState<ImageItem[]>([]);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
    const [replaceFromHistory, setReplaceFromHistory] = useState(false);
    const [historyRequest, setHistoryRequest] = useState(0);
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
    useFormRestoration((data, preview) => {
      const raw = data[name];
      const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
      setImages(
        values.flatMap((value) => {
          const url = preview(value);
          if (!url) return [];
          return [
            {
              id: nanoid(),
              file: value instanceof File ? value : new File([], 'remote-image'),
              previewUrl: url,
              ...(typeof value === 'string' ? { sourceUrl: value } : {}),
            },
          ];
        }),
      );
    });
    const imgRef = useRef<HTMLImageElement>(null);
    const [imgSize, setImgSize] = useState<{ width: number | string; height: number | string }>({
      width: '100%',
      height: '100%',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const hasReadInitialValue = useRef(false);

    const isSingleMode = maxImages === 1;
    const acceptedExtensions = acceptTypes?.length
      ? acceptTypes.flatMap((type) => ACCEPTED_IMAGE_TYPES[type] || [type])
      : Object.values(ACCEPTED_IMAGE_TYPES).flat();

    const clearInputValue = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const addImages = async (files: File[]) => {
      // Single image mode: allow replacing existing image
      const remainingSlots = replaceIndex !== null ? 1 : isSingleMode ? maxImages : maxImages - images.length;
      const filesToAdd = filterAcceptedMediaFiles(files, 'image', acceptedExtensions).slice(0, remainingSlots);

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
        setImages((prev) => replaceIndex !== null && prev[replaceIndex] ? prev.map((item, index) => index === replaceIndex ? validFiles[0]! : item) : isSingleMode ? validFiles : [...prev, ...validFiles]);
        setReplaceIndex(null);
        setReplaceFromHistory(false);
      }
    };

    const updateFile = async (file: File | Blob | null | string) => {
      if (file instanceof File && !isAcceptedMediaFile(file, 'image', acceptedExtensions)) return;
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
      if (!hasReadInitialValue.current) return;
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
    }, [images.length, maxImages]);

    const onDrop = async (acceptedFiles: File[]) => {
      await addImages(acceptedFiles);
    };

    const { isHistoryDragActive, historyDropProps } = useHistoryImageDrop(
      (payload) => {
        setImages((previous) => {
          if (!isSingleMode && previous.length >= maxImages) return previous;
          const item: ImageItem = {
            id: nanoid(),
            file: new File([], payload.name || 'history-image', { type: 'image/jpeg' }),
            previewUrl: payload.url,
            sourceUrl: payload.url,
          };
          return isSingleMode ? [item] : [...previous, item];
        });
      },
      isSingleMode || images.length < maxImages,
    );

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
      noClick: true,
    });
    const uploadRootProps = getRootProps(historyDropProps);

    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        await addImages(files);
      }
      clearInputValue();
    };

    const handleAddClick = () => {
      setReplaceIndex(null);
      setReplaceFromHistory(false);
      setPickerOpen(true);
    };

    const addHistoryImages = (assets: UnifiedGeneratorReferenceMediaAsset[]) => {
      const remainingSlots = replaceIndex !== null ? 1 : isSingleMode ? 1 : Math.max(maxImages - images.length, 0);
      const nextItems = assets.slice(0, remainingSlots).map((asset) => ({
        id: nanoid(),
        file: new File([], asset.name || 'history-image', { type: 'image/jpeg' }),
        previewUrl: String(asset.source),
        sourceUrl: String(asset.source),
      }));
      if (!nextItems.length) return;
      setImages((current) => replaceIndex !== null && current[replaceIndex] ? current.map((item, index) => index === replaceIndex ? nextItems[0]! : item) : isSingleMode ? nextItems : [...current, ...nextItems].slice(0, maxImages));
      setReplaceIndex(null);
      setReplaceFromHistory(false);
    };

    const renderSourcePicker = (trigger: React.ReactNode) => (
      <ReferenceMediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        kind='image'
        canAdd={isSingleMode || replaceIndex !== null || images.length < maxImages}
        historyRequested={replaceFromHistory ? historyRequest : 0}
        isHistoryLoading={imageHistory.isLoading}
        historyAssets={historyAssets}
        acceptedFormats={Object.values(acceptObject).flat()}
        historySelectionLimit={replaceIndex !== null ? 1 : Math.max(isSingleMode ? 1 : maxImages - images.length, 1)}
        onUploadFromDevice={() => fileInputRef.current?.click()}
        onSelectHistory={addHistoryImages}
        trigger={trigger}
      />
    );

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
          {renderSourcePicker(
            <PopoverAnchor asChild>
              <div
                {...uploadRootProps}
                onClick={() => {
                  if (images.length === 0) setPickerOpen(true);
                }}
                className={cn(
                  'border-foreground/10 bg-card hover:border-foreground/30 hover:bg-card relative h-[112px] w-full rounded-xl border border-dashed',
                  images.length > 0 && 'border-foreground/10 bg-card hover:border-foreground/10 hover:bg-card',
                  (isDragActive || isHistoryDragActive) && 'border-primary bg-primary/5',
                )}
              >
                <FormField
                  control={methods.control}
                  name={name}
                  render={() => (
                    <FormItem className='h-full w-full space-y-0'>
                      <div className='relative flex h-full w-full items-center gap-1'>
                        {images.length > 0 ? (
                          <div className='group absolute flex h-full w-full items-center justify-center rounded-[inherit]'
                            onContextMenu={contextActions(() => [
                              { id: 'preview', label: zh ? '预览' : 'Preview', icon: Eye, run: () => onImagePreview?.([images[0].previewUrl]) },
                              { id: 'replace-local', label: zh ? '选择本地文件' : 'Choose local file', icon: FolderOpen, run: () => { setReplaceIndex(0); setReplaceFromHistory(false); fileInputRef.current?.click(); } },
                              { id: 'replace-history', label: zh ? '选择历史记录' : 'Choose from history', icon: History, run: () => { setReplaceIndex(0); setReplaceFromHistory(true); setHistoryRequest((value) => value + 1); setPickerOpen(true); } },
                              { id: 'remove', label: zh ? '移除素材' : 'Remove reference', icon: TrashIcon, destructive: true, separator: true, run: deleteFile },
                            ])}>
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
            </PopoverAnchor>,
          )}
        </div>
      );
    }

    return (
      <div className={cn('flex w-full flex-col gap-2', className)}>
        <SubHeading>{title || tCommon('uploadImages')}</SubHeading>
        {renderSourcePicker(
          <PopoverAnchor asChild>
            <div>
              <FormField
                control={methods.control}
                name={name}
                render={() => (
                  <FormItem className='w-full space-y-0'>
                    <div
                      {...uploadRootProps}
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
                        'border-foreground/10 bg-card hover:border-foreground/30 hover:bg-card relative flex w-full cursor-pointer flex-col rounded-xl border border-dashed p-3 transition-all',
                        (isDragActive || isHistoryDragActive) && 'border-primary bg-primary/5',
                        images.length > 0 && 'gap-3',
                      )}
                    >
                      {images.length === 0 ? (
                        <div className='flex items-center gap-3'>
                          <div className='border-foreground/20 bg-card flex size-16 shrink-0 items-center justify-center rounded-lg border-2 border-dashed'>
                            <Plus className='text-foreground/40 size-6' />
                          </div>

                          <div className='flex flex-1 flex-col items-center justify-center gap-0.5 text-center'>
                            <div className='text-foreground/40 text-sm'>{label || t('label')}</div>
                            <div className='text-foreground/30 text-xs'>
                              {t('supported-formats')}: {acceptedFormats}
                            </div>
                            <div className='text-foreground/30 text-xs'>
                              {images.length}/{maxImages} {tCommon('images')}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className='grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5'>
                            {images.map((image, index) => (
                              <div
                                key={image.id}
                                onContextMenu={contextActions(() => [
                                  { id: 'preview', label: zh ? '预览' : 'Preview', icon: Eye, run: () => onImagePreview?.([image.previewUrl]) },
                                  { id: 'replace-local', label: zh ? '选择本地文件' : 'Choose local file', icon: FolderOpen, run: () => { setReplaceIndex(index); setReplaceFromHistory(false); fileInputRef.current?.click(); } },
                                  { id: 'replace-history', label: zh ? '选择历史记录' : 'Choose from history', icon: History, run: () => { setReplaceIndex(index); setReplaceFromHistory(true); setHistoryRequest((value) => value + 1); setPickerOpen(true); } },
                                  { id: 'remove', label: zh ? '移除素材' : 'Remove reference', icon: TrashIcon, destructive: true, separator: true, run: () => removeImage(image.id) },
                                ])}
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
                                  <Trash2 className='text-foreground size-5' />
                                </button>
                              </div>
                            ))}

                            {canAddMore && (
                              <div className='border-foreground/20 bg-card hover:border-foreground/30 flex aspect-square items-center justify-center rounded-lg border-2 border-dashed transition-all'>
                                <Plus className='text-foreground/40 size-6' />
                              </div>
                            )}
                          </div>

                          <div className='text-foreground/30 mt-1 flex items-center justify-between text-xs'>
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
          </PopoverAnchor>,
        )}
      </div>
    );
  },
);

UnifiedImageUploadField.displayName = 'UnifiedImageUploadField';

export default UnifiedImageUploadField;
