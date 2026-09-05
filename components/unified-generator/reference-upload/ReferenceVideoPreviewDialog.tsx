'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { UnifiedGeneratorReferenceMediaAsset } from '@/lib/constants/unified-generator/types';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import VideoFilePreviewCard from '@/components/form-fields/upload/VideoFilePreviewCard';

import useReferenceAssetUrl from './useReferenceAssetUrl';

export default function ReferenceVideoPreviewDialog({
  asset,
  minDuration,
  maxDuration,
  onOpenChange,
  onRemove,
  onConfirmTrim,
}: {
  asset: UnifiedGeneratorReferenceMediaAsset | null;
  minDuration?: number;
  maxDuration?: number;
  onOpenChange: (open: boolean) => void;
  onRemove: () => void;
  onConfirmTrim: (startTime: number, endTime: number) => Promise<boolean>;
}) {
  const t = useTranslations('components.hero-form.reference-upload');
  const editableFile = asset?.originalFile || (asset?.source instanceof File ? asset.source : null);
  const url = useReferenceAssetUrl(editableFile || asset?.source || null);
  const initialTrimStart = asset?.trimRange?.startTime;
  const initialTrimEnd = asset?.trimRange?.endTime;
  const [trimRange, setTrimRange] = useState<{ startTime: number; endTime: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTrimRange(
      initialTrimStart !== undefined && initialTrimEnd !== undefined
        ? { startTime: initialTrimStart, endTime: initialTrimEnd }
        : null,
    );
    setIsSaving(false);
  }, [asset?.id, initialTrimEnd, initialTrimStart]);

  const handleConfirm = async () => {
    if (!trimRange || isSaving) return;

    setIsSaving(true);
    try {
      if (await onConfirmTrim(trimRange.startTime, trimRange.endTime)) {
        onOpenChange(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(asset)} onOpenChange={onOpenChange}>
      <DialogContent className='border-color-b1 bg-color-c1 max-h-[90vh] max-w-[min(760px,calc(100vw-32px))] p-4'>
        <DialogTitle className='sr-only'>{t('videoPreview')}</DialogTitle>
        {editableFile && url ? (
          <div className='flex min-h-0 flex-col gap-3'>
            <VideoFilePreviewCard
              file={editableFile}
              previewUrl={url}
              initialDuration={asset?.duration}
              minDuration={minDuration}
              maxDuration={maxDuration}
              onDelete={onRemove}
              onDurationChange={(duration) =>
                setTrimRange((currentRange) => currentRange || { startTime: 0, endTime: duration })
              }
              onTrimChange={(startTime, endTime) => setTrimRange({ startTime, endTime })}
            />
            <div className='flex justify-end gap-2'>
              <button
                type='button'
                aria-label={t('cancelTrim')}
                disabled={isSaving}
                onClick={() => onOpenChange(false)}
                className='text-color-t3 hover:bg-color-c4 hover:text-color-t1 flex size-9 items-center justify-center rounded-lg disabled:pointer-events-none disabled:opacity-50'
              >
                <X className='size-4' />
              </button>
              <button
                type='button'
                aria-label={t('confirmTrim')}
                disabled={!trimRange || isSaving}
                onClick={() => void handleConfirm()}
                className='bg-color-main text-color-inverse-t1 flex size-9 items-center justify-center rounded-lg disabled:pointer-events-none disabled:opacity-70'
              >
                {isSaving ? <Loader2 className='size-4 animate-spin' /> : <Check className='size-4' />}
              </button>
            </div>
          </div>
        ) : editableFile ? (
          <div className='flex h-48 items-center justify-center'>
            <Loader2 className='text-color-main size-5 animate-spin' />
          </div>
        ) : asset && url ? (
          <video src={url} className='max-h-[78vh] w-full rounded-lg bg-black object-contain' controls playsInline>
            <track kind='captions' />
          </video>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
