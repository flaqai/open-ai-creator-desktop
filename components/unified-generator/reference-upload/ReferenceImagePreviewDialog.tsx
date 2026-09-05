'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, CropIcon, Loader2, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import { toast } from 'sonner';

import type { UnifiedGeneratorReferenceMediaAsset } from '@/lib/constants/unified-generator/types';
import { cn } from '@/lib/utils';
import { generateImageData } from '@/lib/utils/imageUtils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

import useReferenceAssetUrl from './useReferenceAssetUrl';

function Thumbnail({ asset }: { asset: UnifiedGeneratorReferenceMediaAsset }) {
  const url = useReferenceAssetUrl(asset.source);
  return <img src={url} alt={asset.name || asset.id} className='size-full object-cover' />;
}

export default function ReferenceImagePreviewDialog({
  assets,
  selectedIndex,
  onSelectedIndexChange,
  onOpenChange,
  onRemove,
  onReplace,
}: {
  assets: UnifiedGeneratorReferenceMediaAsset[];
  selectedIndex: number | null;
  onSelectedIndexChange: (index: number | null) => void;
  onOpenChange: (open: boolean) => void;
  onRemove: (index: number) => void;
  onReplace: (index: number, file: File) => Promise<boolean>;
}) {
  const t = useTranslations('components.hero-form.reference-upload');
  const selectedAsset = selectedIndex === null ? null : assets[selectedIndex] || null;
  const selectedUrl = useReferenceAssetUrl(selectedAsset?.source || null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [pixelCrop, setPixelCrop] = useState<PixelCrop>();

  useEffect(() => {
    setIsCropping(false);
    setIsReplacing(false);
    setCrop(undefined);
    setPixelCrop(undefined);
  }, [selectedAsset?.id]);

  useEffect(() => {
    if (selectedIndex === null) return;
    if (assets.length === 0) {
      onOpenChange(false);
      return;
    }
    if (selectedIndex >= assets.length) {
      onSelectedIndexChange(assets.length - 1);
    }
  }, [assets.length, onOpenChange, onSelectedIndexChange, selectedIndex]);

  const handleRemove = () => {
    if (selectedIndex === null) return;
    const nextIndex = assets.length <= 1 ? null : Math.min(selectedIndex, assets.length - 2);
    onRemove(selectedIndex);
    onSelectedIndexChange(nextIndex);
  };

  const handleConfirmCrop = async () => {
    if (selectedIndex === null || !selectedAsset || !imageRef.current || !pixelCrop?.width || !pixelCrop.height) {
      return;
    }

    try {
      const result = await generateImageData({ image: imageRef.current, crop: pixelCrop });
      const originalName =
        selectedAsset.name ||
        (selectedAsset.source instanceof File ? selectedAsset.source.name : 'reference-image.png');
      const file = new File([result.imageFile], originalName.replace(/\.[^/.]+$/, '') + '-cropped.png', {
        type: 'image/png',
      });
      setIsReplacing(true);
      const didReplace = await onReplace(selectedIndex, file);
      if (didReplace) {
        setIsCropping(false);
      }
    } catch {
      toast.error(t('cropFailed'));
    } finally {
      setIsReplacing(false);
    }
  };

  return (
    <Dialog open={Boolean(selectedAsset)} onOpenChange={onOpenChange}>
      <DialogContent
        className='border-color-b1 bg-color-c1 text-color-t1 !flex h-dvh w-dvw max-w-none flex-col gap-0 overflow-hidden rounded-none p-4 shadow-2xl lg:h-[680px] lg:w-[680px] lg:max-w-[680px] lg:rounded-[20px] lg:p-5'
        closeBtnClassName='text-color-t3 hover:text-color-t1'
      >
        <div className='flex h-8 shrink-0 items-center pr-8'>
          <DialogTitle className='text-color-t2 text-xs font-medium'>
            {t(isCropping ? 'imageCropCount' : 'imagePreviewCount', {
              current: selectedIndex === null ? 0 : selectedIndex + 1,
              total: assets.length,
            })}
          </DialogTitle>
        </div>

        {selectedAsset ? (
          <div className='mt-4 flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:gap-5'>
            <div className='custom-scrollbar flex h-[58px] shrink-0 gap-2 overflow-x-auto overflow-y-hidden lg:h-full lg:w-[58px] lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto'>
              {assets.map((asset, index) => (
                <button
                  key={asset.id}
                  type='button'
                  aria-label={t('selectImage', { index: index + 1 })}
                  onClick={() => onSelectedIndexChange(index)}
                  className={cn(
                    'bg-color-c3 flex size-[58px] shrink-0 items-center justify-center overflow-hidden rounded-md border transition-colors',
                    index === selectedIndex ? 'border-color-main' : 'border-transparent hover:border-white/35',
                  )}
                >
                  <Thumbnail asset={asset} />
                </button>
              ))}
            </div>

            <div className='flex min-h-0 flex-1 flex-col gap-3'>
              <div className='border-color-b1 flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-lg border bg-black'>
                {isCropping ? (
                  <ReactCrop crop={crop} onChange={setCrop} onComplete={setPixelCrop} keepSelection>
                    <img
                      ref={imageRef}
                      src={selectedUrl}
                      alt={selectedAsset.name || selectedAsset.id}
                      crossOrigin='anonymous'
                      onLoad={() => setCrop({ unit: '%', x: 5, y: 5, width: 90, height: 90 })}
                      className='max-h-[520px] max-w-full object-contain'
                    />
                  </ReactCrop>
                ) : (
                  <img
                    src={selectedUrl}
                    alt={selectedAsset.name || selectedAsset.id}
                    className='max-h-full max-w-full object-contain'
                  />
                )}
              </div>

              <div className='mt-auto flex h-9 shrink-0 items-center justify-end gap-2'>
                {isCropping ? (
                  <>
                    <button
                      type='button'
                      disabled={isReplacing}
                      onClick={() => setIsCropping(false)}
                      className='text-color-t3 hover:bg-color-c4 hover:text-color-t1 flex size-9 items-center justify-center rounded-lg disabled:pointer-events-none disabled:opacity-50'
                    >
                      <X className='size-4' />
                    </button>
                    <button
                      type='button'
                      disabled={isReplacing}
                      onClick={() => void handleConfirmCrop()}
                      className='bg-color-main text-color-inverse-t1 flex size-9 items-center justify-center rounded-lg disabled:pointer-events-none disabled:opacity-70'
                    >
                      {isReplacing ? <Loader2 className='size-4 animate-spin' /> : <Check className='size-4' />}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type='button'
                      aria-label={t('deleteImage')}
                      onClick={handleRemove}
                      className='text-color-t3 hover:bg-color-c4 hover:text-color-t1 flex size-9 items-center justify-center rounded-lg'
                    >
                      <Trash2 className='size-4' />
                    </button>
                    <button
                      type='button'
                      aria-label={t('cropImage')}
                      onClick={() => setIsCropping(true)}
                      className='text-color-t3 hover:bg-color-c4 hover:text-color-t1 flex size-9 items-center justify-center rounded-lg'
                    >
                      <CropIcon className='size-4' />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
