'use client';

import { useMemo, useRef, useState } from 'react';
import useImageHistory from '@/network/image/history';
import { nanoid } from 'nanoid';
import { useTranslations } from 'next-intl';
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone';
import { toast } from 'sonner';

import type { UnifiedGeneratorReferenceMediaAsset } from '@/lib/constants/unified-generator/types';

import ReferenceImagePreviewDialog from './ReferenceImagePreviewDialog';
import ReferenceMediaPicker from './ReferenceMediaPicker';
import ReferenceStackPreview from './ReferenceStackPreview';

function getImageDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: image.naturalWidth || image.width, height: image.naturalHeight || image.height });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('metadata-error'));
    };
    image.src = objectUrl;
  });
}

function getAccept(acceptedFormats?: string[]): Accept {
  const formats = acceptedFormats?.map((item) => item.toLowerCase().replace(/^\./, '')) || [
    'jpg',
    'jpeg',
    'png',
    'webp',
  ];
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };

  return formats.reduce<Accept>((result, format) => {
    const mimeType = mimeTypes[format] || 'image/*';
    result[mimeType] = [...(result[mimeType] || []), `.${format}`];
    return result;
  }, {});
}

export default function UnifiedImageStackUpload({
  values,
  maxImages,
  label,
  acceptedFormats,
  minSidePx = 300,
  maxSidePx,
  onChange,
}: {
  values: UnifiedGeneratorReferenceMediaAsset[];
  maxImages: number;
  label: string;
  acceptedFormats?: string[];
  minSidePx?: number;
  maxSidePx?: number;
  onChange: (values: UnifiedGeneratorReferenceMediaAsset[]) => void;
}) {
  const t = useTranslations('components.hero-form.reference-upload');
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isPickerPanelHovered, setIsPickerPanelHovered] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [collapseRevision, setCollapseRevision] = useState(0);
  const imageHistory = useImageHistory(1, 20);
  const historyAssets = useMemo<UnifiedGeneratorReferenceMediaAsset[]>(
    () =>
      imageHistory.data
        .filter(
          (item) => item.status !== 'processing' && item.status !== 'fail' && Boolean(item.url || item.thumbnailUrl),
        )
        .map((item) => ({
          id: `history-image-${item.id}`,
          kind: 'image',
          source: item.url || item.thumbnailUrl,
          name: item.prompt || item.modelInfo,
        })),
    [imageHistory.data],
  );
  const canAdd = values.length < maxImages;

  const validateImage = async (file: File) => {
    const formats = acceptedFormats?.map((item) => item.toLowerCase().replace(/^\./, '')) || [];
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!file.type.startsWith('image/') || (formats.length > 0 && !formats.includes(extension))) {
      toast.error(t('unsupportedFormat'));
      return false;
    }

    try {
      const dimensions = await getImageDimensions(file);
      if (dimensions.width < minSidePx || dimensions.height < minSidePx) {
        toast.error(t('imageDimensionMin', { value: minSidePx }));
        return false;
      }
      if (maxSidePx && (dimensions.width > maxSidePx || dimensions.height > maxSidePx)) {
        toast.error(t('imageDimensionMax', { value: maxSidePx }));
        return false;
      }
    } catch {
      toast.error(t('metadataError'));
      return false;
    }

    return true;
  };

  const addFiles = async (files: File[]) => {
    if (!files.length) return;
    if (values.length + files.length > maxImages) {
      toast.error(t('maxFiles', { count: maxImages }));
      return;
    }

    for (const file of files) {
      if (!(await validateImage(file))) return;
    }

    onChange(
      [
        ...values,
        ...files.map((file) => ({
          id: `image-${nanoid()}`,
          kind: 'image' as const,
          source: file,
          originalFile: file,
          name: file.name,
        })),
      ].slice(0, maxImages),
    );
    setPickerOpen(false);
    setIsPickerPanelHovered(false);
    setCollapseRevision((revision) => revision + 1);
  };

  const handleDropRejected = (rejections: FileRejection[]) => {
    const hasTooManyFiles = rejections.some((rejection) =>
      rejection.errors.some((error) => error.code === 'too-many-files'),
    );
    toast.error(hasTooManyFiles ? t('maxFiles', { count: maxImages }) : t('unsupportedFormat'));
  };

  const dropzone = useDropzone({
    accept: getAccept(acceptedFormats),
    multiple: maxImages > 1,
    maxFiles: Math.max(maxImages - values.length, 1),
    noClick: true,
    disabled: !canAdd,
    onDrop: (files) => void addFiles(files),
    onDropRejected: handleDropRejected,
  });

  return (
    <>
      <div
        {...dropzone.getRootProps()}
        className='relative z-20 flex h-[68px] w-fit shrink-0 items-center overflow-visible bg-transparent focus-within:z-[1000] hover:z-[1000]'
      >
        <input
          {...dropzone.getInputProps({
            onClick: (event) => {
              event.currentTarget.value = '';
            },
          })}
          ref={inputRef}
        />
        <ReferenceMediaPicker
          open={pickerOpen}
          onOpenChange={(open) => {
            setPickerOpen(open);
            if (!open) setIsPickerPanelHovered(false);
          }}
          onPanelHoverChange={setIsPickerPanelHovered}
          kind='image'
          canAdd={canAdd}
          isHistoryLoading={imageHistory.isLoading}
          historyAssets={historyAssets}
          onUploadFromDevice={() => {
            if (inputRef.current) inputRef.current.value = '';
            dropzone.open();
          }}
          onSelectHistory={(asset) => {
            onChange([...values, { ...asset, id: `image-${nanoid()}` }].slice(0, maxImages));
            setPickerOpen(false);
            setIsPickerPanelHovered(false);
            setCollapseRevision((revision) => revision + 1);
          }}
          trigger={
            <ReferenceStackPreview
              kind='image'
              assets={values}
              canAdd={canAdd}
              disabled={!canAdd}
              isDragActive={dropzone.isDragActive}
              isPanelHovered={isPickerPanelHovered}
              emptyLabel={label}
              addLabel={t('addImage')}
              removeLabel={t('remove')}
              collapseRevision={collapseRevision}
              onOpenPicker={() => setPickerOpen(true)}
              onPreview={setPreviewIndex}
              onRemove={(index) => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
            />
          }
        />
      </div>

      <ReferenceImagePreviewDialog
        assets={values}
        selectedIndex={previewIndex}
        onSelectedIndexChange={setPreviewIndex}
        onOpenChange={(open) => {
          if (!open) setPreviewIndex(null);
        }}
        onRemove={(index) => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
        onReplace={async (index, file) => {
          if (!(await validateImage(file))) return false;
          onChange(
            values.map((asset, itemIndex) =>
              itemIndex === index ? { ...asset, source: file, originalFile: file, name: file.name } : asset,
            ),
          );
          return true;
        }}
      />
    </>
  );
}
