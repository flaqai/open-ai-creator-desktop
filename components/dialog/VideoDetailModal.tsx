'use client';

import { useState } from 'react';
import { deleteVideoById } from '@/network/video/client';
import type { VideoHistoryItem } from '@/network/video/history';
import { refreshVideoHistory } from '@/network/video/history';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { getVideoModelVersionName } from '@/lib/constants/video';
import { Dialog, DialogContent, DialogPortal } from '@/components/ui/dialog';

import {
  CopyrightText,
  DeleteButton,
  DownloadButton,
  MetadataRow,
  ModelTag,
  PromptSection,
  type MetadataItem,
} from './DetailModalComponents';

interface VideoDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
  video: VideoHistoryItem & { imageUrl?: string | null; imageEndUrl?: string | null };
}

export default function VideoDetailModal({ open, onOpenChange, onDelete, video }: VideoDetailModalProps) {
  const t = useTranslations('Profile.video-history.detail');
  const tHistory = useTranslations('Profile.video-history');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = async () => {
    if (!video.videoUrl) return;
    const { downloadFile } = await import('@/lib/utils/fileUtils');
    downloadFile(video.videoUrl, `video-${video.id}.mp4`);
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteVideoById(video.id);
      refreshVideoHistory();
      toast.success(tHistory('delete-success'));
      onDelete?.();
      onOpenChange(false);
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

  const getDuration = () => {
    if (video.duration) {
      const minutes = Math.floor(video.duration / 60);
      const seconds = video.duration % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return '00:05';
  };

  // Build metadata items
  const getMetadataItems = (): MetadataItem[] => {
    const items: MetadataItem[] = [];

    if (video.ratio) {
      items.push({ label: t('ratio'), value: video.ratio });
    }

    if (video.duration) {
      items.push({ label: t('duration'), value: getDuration() });
    }

    if (video.createTime) {
      items.push({ label: t('generatedTime'), value: formatDate(video.createTime) });
    }

    return items;
  };

  // Get model version name
  const getModelVersionName = () => {
    if (!video.platformName) return undefined;
    return getVideoModelVersionName(video.platformName) || video.platformName;
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
            {/* Left: Video Section */}
            <div className='bg-card flex h-full w-full flex-1 items-center justify-center p-3 lg:h-[700px] lg:p-6'>
              {video.videoUrl ? (
                <video
                  src={video.videoUrl}
                  poster={video.coverImage || video.imageUrl}
                  className='max-h-[576px] max-w-full rounded object-contain outline-none'
                  muted
                  autoPlay
                  loop
                  controls
                />
              ) : (
                <img
                  src={video.coverImage || video.imageUrl}
                  alt={video.prompt}
                  className='max-h-[576px] max-w-full rounded object-contain'
                />
              )}
            </div>

            {/* Right: Info Panel */}
            <div className='bg-card flex h-full w-full flex-col lg:h-[700px] lg:w-[450px] lg:shrink-0'>
              {/* Header - Fixed */}
              <div className='border-border flex shrink-0 items-center justify-between border-b p-3'>
                <h2 className='text-foreground text-2xl leading-8 font-medium capitalize'>{t('title')}</h2>
                <button
                  type='button'
                  onClick={() => onOpenChange(false)}
                  className='hover:bg-foreground/10 flex h-9 w-9 items-center justify-center rounded-[3px] transition-colors'
                >
                  <X className='text-foreground h-5 w-5' />
                </button>
              </div>

              {/* Scrollable Content Section */}
              <div className='custom-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto p-3'>
                {/* Prompt Section */}
                <PromptSection prompt={video.prompt} translationKey='Profile.video-history.detail' />

                {/* Model Name Tag */}
                <ModelTag modelName={getModelVersionName()} />

                {/* Metadata - Integrated */}
                <MetadataRow items={getMetadataItems()} />

                {/* Copyright */}
                <CopyrightText translationKey='Profile.video-history.detail' />
              </div>

              {/* Bottom Actions - Fixed */}
              <div className='border-border flex shrink-0 items-center gap-2 border-t p-3'>
                <div className='flex shrink-0 gap-2'>
                  {/* Download Button */}
                  <DownloadButton onClick={handleDownload} disabled={!video.videoUrl} />

                  {/* Delete Button */}
                  <DeleteButton onClick={handleDelete} disabled={isDeleting} />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
