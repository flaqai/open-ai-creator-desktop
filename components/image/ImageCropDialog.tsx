'use client';

import { CircleX, RefreshCw } from 'lucide-react';
import ReactCrop, { centerCrop, convertToPixelCrop, Crop, makeAspectCrop, PixelCrop } from 'react-image-crop';

import 'react-image-crop/dist/ReactCrop.css';

import { ComponentProps, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { canvasPreview, CroppedImage, generateImageData } from '@/lib/utils/imageUtils';
import useDebounceEffect from '@/hooks/useDebounceEffect';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';

function NumberControl({
  title,
  onChange,
  ...props
}: { title: string; onChange: (val: number) => void } & ComponentProps<'input'>) {
  return (
    <div className='flex-1'>
      <div>{title}</div>
      <input
        {...props}
        onChange={(e) => onChange(Number(e.target.value))}
        type='number'
        className='border-color-text/10 bg-color-bg h-12 w-full rounded-lg border px-3'
      />
    </div>
  );
}

function Btn({
  children,
  className,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'border-color-text/20 text-color-text flex h-12 flex-1 items-center justify-center rounded-lg border text-nowrap hover:opacity-80',
        className,
      )}
    >
      {children}
    </button>
  );
}

export default function ImageCropDialog({
  open,
  setOpen,
  originalImage,
  onCropComplete,
  aspect = 2 / 3,
  MIN_DIMENSION,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  originalImage: string;
  onCropComplete: (croppedImage: CroppedImage) => void;
  aspect?: number;
  MIN_DIMENSION?: number;
}) {
  const t = useTranslations('components.image-crop-dialog');

  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const [crop, setCrop] = useState<Crop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height, naturalWidth } = e.currentTarget;
    let cropWidthInPercent = (naturalWidth / width) * 100;
    if (MIN_DIMENSION) {
      cropWidthInPercent = (MIN_DIMENSION / width) * 100;
    }

    const cropTemp = makeAspectCrop(
      {
        unit: '%',
        width: cropWidthInPercent,
      },
      aspect,
      width,
      height,
    );
    const centeredCrop = centerCrop(cropTemp, width, height);
    const centeredCropPx = convertToPixelCrop(centeredCrop, width, height);

    setCrop(centeredCrop);
    setCompletedCrop(centeredCropPx);
  };

  const resetFilter = () => {
    setScale(1);
    setRotate(0);
  };

  const onClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (!open) {
      setCrop(undefined);
      setCompletedCrop(undefined);
      setScale(1);
      setRotate(0);
    }
  }, [open]);

  const handleComplete = async () => {
    if (imgRef.current && previewCanvasRef.current && crop) {
      const { imageUrl, imageFile } = await generateImageData({
        image: imgRef.current,
        canvasEl: previewCanvasRef.current,
        crop: convertToPixelCrop(crop, imgRef.current.width, imgRef.current.height),
        scale,
        rotate,
      });
      onCropComplete({ imageUrl, imageFile });
      setOpen(false);
    }
  };

  useDebounceEffect(
    async () => {
      if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
        canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop, scale, rotate);
      }
    },
    150,
    [completedCrop, scale, rotate],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        closeBtnClassName='hidden'
        className={cn(
          'border-color-text/10 bg-color-bg flex w-[calc(100%-24px)] flex-col !rounded-xl border p-3 lg:h-[581px] lg:w-[739px] lg:min-w-[739px] lg:flex-row',
        )}
      >
        <DialogTitle className='sr-only'>{t('title')}</DialogTitle>
        <DialogClose asChild>
          <button type='button' onClick={onClose} className='absolute top-3 right-3'>
            <CircleX />
            <span className='sr-only'>close</span>
          </button>
        </DialogClose>
        <div className='text-xl font-semibold lg:hidden'>{t('title')}</div>
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          keepSelection
          aspect={aspect}
          minWidth={MIN_DIMENSION}
          className='my-auto h-fit max-h-full overflow-hidden rounded-lg lg:w-[383px] lg:min-w-[383px]'
        >
          <img
            ref={imgRef}
            src={originalImage}
            alt='Upload'
            style={{
              transform: `scale(${scale}) rotate(${rotate}deg)`,
            }}
            className='h-full w-full bg-black/70 lg:w-[383px] lg:min-w-[383px]'
            onLoad={onImageLoad}
          />
        </ReactCrop>
        <div className='flex flex-grow flex-col gap-4'>
          <div>
            <div className='text-xl font-semibold'>{t('title')}</div>
            <div className='text-sm'>{t('content')}</div>
          </div>
          <div className='flex items-center gap-3'>
            <NumberControl title={t('scale')} step='0.1' min={1} value={scale} onChange={setScale as any} />
            <NumberControl
              title={t('rotate')}
              step={45}
              value={rotate}
              onChange={(val) => setRotate(Math.min(360, Math.max(-360, Number(val))))}
            />
            <button
              type='button'
              onClick={resetFilter}
              className='flex-center border-color-text/10 bg-color-bg mt-auto size-12 rounded-lg border'
            >
              <RefreshCw />
              <span className='sr-only'>resetFilter</span>
            </button>
          </div>
          <div className='relative hidden flex-1 lg:block'>
            <canvas
              ref={previewCanvasRef}
              className='absolute-center absolute inset-0 max-h-full rounded-lg bg-contain'
            />
          </div>
          <div className='flex items-center gap-3'>
            <Btn onClick={onClose}>{t('cancel')}</Btn>
            <Btn
              onClick={handleComplete}
              className='text-foreground border-none bg-gradient-to-r from-purple-600 to-blue-500 font-semibold'
            >
              {t('done')}
            </Btn>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
