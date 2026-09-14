'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { deleteImageById } from '@/network/image/client';
import { refreshImageHistory } from '@/network/image/history';
import { ChevronDown, Download, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { getImageModelVersionName } from '@/lib/constants/image';
import { exportImage, type ImageType } from '@/lib/platform/image-export';
import { detectImageFormat } from '@/lib/utils/fileUtils';
import { Dialog, DialogContent, DialogPortal } from '@/components/ui/dialog';

import {
  CopyrightText,
  DeleteButton,
  MetadataRow,
  ModelTag,
  PromptSection,
  type MetadataItem,
} from './DetailModalComponents';

const ConfirmDialog = dynamic(() => import('@/components/dialog/ConfirmDialog'), { ssr: false });

interface ImageDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
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

export default function ImageDetailModal({ open, onOpenChange, onDelete, image }: ImageDetailModalProps) {
  const t = useTranslations('Profile.image-history.detail');
  const tHistory = useTranslations('Profile.image-history');

  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('WEBP');
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Detect actual image format and set as default
  useEffect(() => {
    if (!open || !image.url) return;

    detectImageFormat(image.url).then((format) => {
      if (format) setSelectedFormat(format);
    });
  }, [open, image.url]);

  const handleDownload = async () => {
    if (!image.url) return;

    try {
      await exportImage(image.url, selectedFormat.toLowerCase() as ImageType, `image-${image.id}`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
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
          className='h-[calc(100vh-24px)] max-h-[700px] w-[calc(100vw-16px)] max-w-[1453px] border-none bg-transparent p-0 shadow-none sm:max-w-[1453px]'
          showCloseButton={false}
          overlayClassName='bg-black/80'
          hiddenTitle={t('title')}
        >
          <div className='flex h-full w-full flex-col overflow-hidden rounded-lg shadow-lg lg:flex-row'>
            {/* Left: Image Section */}
            <div className='bg-card flex h-full w-full flex-1 items-center justify-center p-3 lg:h-[700px] lg:p-6'>
              <img
                src={image.url}
                alt={image.title || 'Image'}
                className='max-h-[576px] max-w-full rounded object-contain'
              />
            </div>

            {/* Right: Info Panel */}
            <div className='bg-card flex h-full w-full flex-col lg:h-[700px] lg:w-[450px] lg:shrink-0'>
              {/* Header - Fixed */}
              <div className='border-border flex shrink-0 items-center justify-between border-b p-3'>
                <h2 className='text-foreground text-2xl leading-8 font-medium capitalize'>{t('title')}</h2>
                <button
                  type='button'
                  onClick={() => onOpenChange(false)}
                  className='hover:bg-foreground/10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-[3px] transition-colors'
                >
                  <X className='text-foreground h-5 w-5' />
                </button>
              </div>

              {/* Scrollable Content Section */}
              <div className='custom-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto p-3'>
                {/* Prompt Section */}
                <PromptSection prompt={image.prompt} />

                {/* Model Version Tag */}
                <ModelTag modelName={getModelVersionName()} />

                {/* Metadata - Integrated */}
                <MetadataRow items={getMetadataItems()} />

                {/* Copyright */}
                <CopyrightText />
              </div>

              {/* Bottom Actions - Fixed */}
              <div className='border-border flex shrink-0 flex-col gap-2 border-t p-3'>
                {/* Row 1: Download + Delete */}
                <div className='flex items-center gap-2'>
                  {/* Download Button with Format Selector */}
                  <div className='bg-card hover:bg-card relative flex h-[42px] cursor-pointer rounded-lg transition-colors'>
                    {/* Download Icon Button */}
                    <button
                      type='button'
                      onClick={handleDownload}
                      className='flex cursor-pointer items-center justify-center px-3'
                    >
                      <Download className='text-foreground h-5 w-5' />
                    </button>

                    {/* Divider */}
                    <div className='bg-card w-px' />

                    {/* Format Selector */}
                    <button
                      type='button'
                      onClick={() => setShowFormatMenu(!showFormatMenu)}
                      className='flex cursor-pointer items-center gap-1 px-3'
                    >
                      <span className='text-foreground text-sm capitalize'>{selectedFormat}</span>
                      <ChevronDown className='text-foreground h-3.5 w-3.5 scale-y-[-1] rotate-180' />
                    </button>

                    {/* Format Menu */}
                    {showFormatMenu && (
                      <div className='bg-card absolute right-0 bottom-full mb-1 flex flex-col gap-1 rounded-lg p-1 shadow-lg'>
                        {['WEBP', 'PNG', 'JPG'].map((format) => (
                          <button
                            key={format}
                            type='button'
                            onClick={() => {
                              setSelectedFormat(format);
                              setShowFormatMenu(false);
                            }}
                            className='text-foreground hover:bg-foreground/10 cursor-pointer rounded px-3 py-1.5 text-sm capitalize transition-colors'
                          >
                            {format}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Delete Button */}
                  <DeleteButton onClick={handleDeleteClick} disabled={isDeleting} />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
      <ConfirmDialog open={showDeleteConfirm} setOpen={setShowDeleteConfirm} callback={handleDelete} />
    </Dialog>
  );
}
