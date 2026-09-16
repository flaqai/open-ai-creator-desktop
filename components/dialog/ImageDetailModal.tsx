'use client';

import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import dynamic from 'next/dynamic';
import { deleteImageById } from '@/network/image/client';
import { refreshImageHistory } from '@/network/image/history';
import { ChevronDown, Crop, Download, RotateCcw, Trash2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { getImageModelVersionName } from '@/lib/constants/image';
import { exportImage, type ImageType } from '@/lib/platform/image-export';
import { fetchMedia } from '@/lib/platform/media';
import { detectImageFormat } from '@/lib/utils/fileUtils';
import type { CroppedImage } from '@/lib/utils/imageUtils';
import { Dialog, DialogContent, DialogPortal } from '@/components/ui/dialog';

import { ModelTag, type MetadataItem } from './DetailModalComponents';

const ConfirmDialog = dynamic(() => import('@/components/dialog/ConfirmDialog'), { ssr: false });
const ImageCropDialog = dynamic(() => import('@/components/image/ImageCropDialog'), { ssr: false });

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.25;

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

interface ImageDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
  onDeleteRequest?: () => Promise<void> | void;
  image: {
    id: string;
    url: string;
    title?: string;
    prompt?: string;
    createTime?: number;
    width?: number;
    height?: number;
    resolution?: string;
    modelName?: string;
    userImageUrlList?: string[];
    size?: number;
  };
}

export default function ImageDetailModal({
  open,
  onOpenChange,
  onDelete,
  onDeleteRequest,
  image,
}: ImageDetailModalProps) {
  const t = useTranslations('Profile.image-history.detail');
  const tHistory = useTranslations('Profile.image-history');
  const tCommon = useTranslations('Common');
  const tCrop = useTranslations('components.video-image-upload-form');

  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('WEBP');
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [displayUrl, setDisplayUrl] = useState(image.url);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [cropSource, setCropSource] = useState('');
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isPreparingCrop, setIsPreparingCrop] = useState(false);
  const dragRef = useRef<null | {
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>(null);
  const ownedObjectUrlsRef = useRef(new Set<string>());

  const resetView = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const updateZoom = (nextZoom: number) => {
    const clampedZoom = clampZoom(nextZoom);
    setZoom(clampedZoom);
    if (clampedZoom <= 1) setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    updateZoom(zoom + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setPosition({
      x: drag.originX + event.clientX - drag.startX,
      y: drag.originY + event.clientY - drag.startY,
    });
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  // Detect actual image format and set as default
  useEffect(() => {
    if (!open || !image.url) return undefined;

    setDisplayUrl(image.url);
    setZoom(1);
    setPosition({ x: 0, y: 0 });

    detectImageFormat(image.url).then((format) => {
      if (format) setSelectedFormat(format);
    });

    const ownedObjectUrls = ownedObjectUrlsRef.current;
    return () => {
      ownedObjectUrls.forEach((url) => URL.revokeObjectURL(url));
      ownedObjectUrls.clear();
    };
  }, [open, image.url]);

  const handleDownload = async () => {
    if (!displayUrl) return;

    try {
      await exportImage(displayUrl, selectedFormat.toLowerCase() as ImageType, `image-${image.id}`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
  };

  const handleOpenCrop = async () => {
    if (!displayUrl || isPreparingCrop) return;
    setIsPreparingCrop(true);

    try {
      let source = displayUrl;
      if (/^https?:\/\//i.test(source)) {
        const blob = await (await fetchMedia(source)).blob();
        source = URL.createObjectURL(blob);
        ownedObjectUrlsRef.current.add(source);
      }
      setCropSource(source);
      setIsCropOpen(true);
    } catch {
      toast.error(t('cropLoadFailed'));
    } finally {
      setIsPreparingCrop(false);
    }
  };

  const handleCropComplete = ({ imageUrl }: CroppedImage) => {
    ownedObjectUrlsRef.current.add(imageUrl);
    setDisplayUrl(imageUrl);
    setSelectedFormat('PNG');
    resetView();
  };

  const getResolution = () => {
    if (image.resolution) {
      return image.resolution;
    }
    if (image.width && image.height) {
      return `${image.width}x${image.height}`;
    }
    return '';
  };

  const getAspectRatio = () => {
    const resolution = getResolution();
    if (!resolution) return '';

    const [width, height] = resolution.split('x').map(Number);
    if (!width || !height) return '';

    const aspectRatio = width / height;

    // Define common ratios and their tolerance
    const commonRatios = [
      { ratio: 16 / 9, display: '16:9' },
      { ratio: 4 / 3, display: '4:3' },
      { ratio: 3 / 2, display: '3:2' },
      { ratio: 1 / 1, display: '1:1' },
      { ratio: 21 / 9, display: '21:9' },
      { ratio: 9 / 16, display: '9:16' },
      { ratio: 3 / 4, display: '3:4' },
      { ratio: 2 / 3, display: '2:3' },
      { ratio: 9 / 21, display: '9:21' },
    ];

    // Find closest common ratio (3% tolerance)
    const tolerance = 0.03;
    for (const { ratio, display } of commonRatios) {
      if (Math.abs(aspectRatio - ratio) / ratio < tolerance) {
        return display;
      }
    }

    // If no common ratio matches, simplify using GCD
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(width, height);
    const ratioW = width / divisor;
    const ratioH = height / divisor;

    // If simplified ratio numbers are still large, don't display ratio
    if (ratioW > 50 || ratioH > 50) {
      return '';
    }

    return `${ratioW}:${ratioH}`;
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      if (onDeleteRequest) {
        await onDeleteRequest();
        toast.success(tHistory('delete-success'));
        onDelete?.();
        onOpenChange(false);
        return;
      }

      const res = await deleteImageById(image.id);
      if (res.code === 200) {
        refreshImageHistory();
        toast.success(res.msg || tHistory('delete-success'));
        onDelete?.();
        onOpenChange(false);
      } else {
        toast.error(res.msg || tHistory('delete-fail'));
      }
    } catch (error: any) {
      toast.error(error.message || tHistory('delete-fail'));
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes <= 0) return '';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }
    const fixed = unitIndex === 0 ? 0 : value < 10 ? 1 : 0;
    return `${value.toFixed(fixed)} ${units[unitIndex]}`;
  };

  // Build metadata items (build order determines parameter display order)
  const getMetadataItems = (): MetadataItem[] => {
    const items: MetadataItem[] = [];

    const resolution = getResolution();
    if (resolution) {
      items.push({ label: t('resolution'), value: resolution });
    }

    const aspectRatio = getAspectRatio();
    if (aspectRatio) {
      items.push({ label: t('ratio'), value: aspectRatio });
    }

    const sizeText = formatBytes(image.size);
    if (sizeText) {
      items.push({ label: t('size'), value: sizeText });
    }

    if (image.createTime) {
      items.push({ label: t('generatedTime'), value: formatDate(image.createTime) });
    }

    return items;
  };

  // Get model version name
  const getModelVersionName = () => {
    if (!image.modelName) return undefined;
    return getImageModelVersionName(image.modelName) || image.modelName;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent
          className='h-screen max-h-none w-screen max-w-none overflow-hidden border-none bg-black p-0 shadow-none sm:max-w-none'
          showCloseButton={false}
          overlayClassName='bg-black/95 backdrop-blur-sm'
          hiddenTitle={t('title')}
        >
          <div
            className={`relative flex size-full touch-none items-center justify-center overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onDoubleClick={resetView}
          >
            <img
              src={displayUrl}
              alt={image.title || 'Image'}
              draggable={false}
              className='max-h-[calc(100vh-128px)] max-w-[calc(100vw-48px)] object-contain will-change-transform'
              style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 160ms ease-out',
              }}
            />

            <div className='pointer-events-none absolute top-5 left-5 z-20 max-w-[min(420px,calc(100vw-104px))] rounded-xl border border-white/10 bg-black/55 p-3 text-white shadow-xl backdrop-blur-md'>
              <div className='flex flex-wrap items-center gap-2'>
                <p className='truncate text-sm font-semibold'>{image.title || t('title')}</p>
                <ModelTag modelName={getModelVersionName()} />
              </div>
              {image.prompt && <p className='mt-2 line-clamp-2 text-xs leading-5 text-white/65'>{image.prompt}</p>}
              {getMetadataItems().length > 0 && (
                <div className='mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/50'>
                  {getMetadataItems().map((item) => (
                    <span key={item.label}>
                      {item.label}: {item.value}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type='button'
              onClick={() => onOpenChange(false)}
              onPointerDown={(event) => event.stopPropagation()}
              className='absolute top-5 right-5 z-30 flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white/75 shadow-lg backdrop-blur-md transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none'
              aria-label='Close'
            >
              <X className='size-5' />
            </button>

            <div
              className='absolute bottom-5 left-1/2 z-30 flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-1 rounded-2xl border border-white/12 bg-black/65 p-1.5 text-white shadow-2xl backdrop-blur-xl'
              onPointerDown={(event) => event.stopPropagation()}
              onWheel={(event) => event.stopPropagation()}
            >
              <button
                type='button'
                onClick={() => updateZoom(zoom - ZOOM_STEP)}
                disabled={zoom <= MIN_ZOOM}
                className='flex size-10 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-30'
                aria-label='Zoom out'
                title='Zoom out'
              >
                <ZoomOut className='size-5' />
              </button>
              <span className='w-14 text-center text-xs font-medium text-white/70 tabular-nums'>
                {Math.round(zoom * 100)}%
              </span>
              <button
                type='button'
                onClick={() => updateZoom(zoom + ZOOM_STEP)}
                disabled={zoom >= MAX_ZOOM}
                className='flex size-10 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-30'
                aria-label='Zoom in'
                title='Zoom in'
              >
                <ZoomIn className='size-5' />
              </button>
              <div className='mx-1 h-6 w-px bg-white/12' />
              <button
                type='button'
                onClick={resetView}
                className='flex size-10 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white'
                aria-label={tCommon('reset')}
                title={tCommon('reset')}
              >
                <RotateCcw className='size-5' />
              </button>
              <button
                type='button'
                onClick={handleOpenCrop}
                disabled={isPreparingCrop}
                className='flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40'
                title={tCrop('crop')}
              >
                <Crop className='size-5' />
                <span className='hidden sm:inline'>{tCrop('crop')}</span>
              </button>
              <div className='mx-1 h-6 w-px bg-white/12' />
              <button
                type='button'
                onClick={handleDownload}
                className='flex size-10 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white'
                aria-label={t('download')}
                title={t('download')}
              >
                <Download className='size-5' />
              </button>
              <div className='relative'>
                <button
                  type='button'
                  onClick={() => setShowFormatMenu(!showFormatMenu)}
                  className='flex h-10 items-center gap-1 rounded-xl px-2 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white'
                >
                  {selectedFormat}
                  <ChevronDown className='size-3.5' />
                </button>
                {showFormatMenu && (
                  <div className='absolute right-0 bottom-full mb-2 flex min-w-24 flex-col rounded-xl border border-white/12 bg-black/85 p-1 shadow-xl backdrop-blur-xl'>
                    {['WEBP', 'PNG', 'JPG'].map((format) => (
                      <button
                        key={format}
                        type='button'
                        onClick={() => {
                          setSelectedFormat(format);
                          setShowFormatMenu(false);
                        }}
                        className='rounded-lg px-3 py-2 text-left text-xs text-white/70 transition hover:bg-white/10 hover:text-white'
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type='button'
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className='flex size-10 items-center justify-center rounded-xl text-white/55 transition hover:bg-red-500/15 hover:text-red-300 disabled:opacity-40'
                aria-label={t('delete')}
                title={t('delete')}
              >
                <Trash2 className='size-4' />
              </button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
      <ConfirmDialog open={showDeleteConfirm} setOpen={setShowDeleteConfirm} callback={handleDelete} />
      {cropSource && (
        <ImageCropDialog
          open={isCropOpen}
          setOpen={setIsCropOpen}
          originalImage={cropSource}
          onCropComplete={handleCropComplete}
          aspect={image.width && image.height ? image.width / image.height : 1}
        />
      )}
    </Dialog>
  );
}
