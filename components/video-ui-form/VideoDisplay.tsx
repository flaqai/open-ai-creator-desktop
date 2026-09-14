/* eslint-disable no-nested-ternary */

'use client';

import { useContext, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { deleteVideoById } from '@/network/video/client';
import { refreshVideoHistory } from '@/network/video/history';
import useVideoFormStore from '@/store/form/useVideoFormStore';
import { ChevronDown, Download, Trash2, VideoIcon, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { downloadFile } from '@/lib/utils/fileUtils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import CopyBtn from '../CopyBtn';
import ConfirmDialog from '../dialog/ConfirmDialog';
import { videoTypeContenxt } from './VideoContenxtProvider';

const VideoDetailModal = dynamic(() => import('@/components/dialog/VideoDetailModal'), { ssr: false });

export default function VideoDisplay() {
  const t = useTranslations('components.video-form.display');
  const videoType = useContext(videoTypeContenxt);

  const videoObj = useVideoFormStore((state) => state.videoObj);
  const updateVideoObj = useVideoFormStore((state) => state.updateVideoObj);

  const [showVideoInfo, setShowVideoInfo] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const onDownload = () => {
    if (videoObj?.videoSrc) {
      downloadFile(videoObj.videoSrc, `video-${videoObj.id}.mp4`);
    }
  };

  const onDelete = async () => {
    if (!videoObj || !videoObj.id) return;
    const res = await deleteVideoById(videoObj.id);
    if (res.code === 200) {
      toast.success(res.msg);
      refreshVideoHistory();
      updateVideoObj(null);
    } else {
      toast.error(res.msg);
    }
  };

  const onCloseFallback = () => {
    updateVideoObj(null);
  };

  const onShowDetail = () => {
    if (videoObj && videoObj.id) {
      setIsDetailModalOpen(true);
    }
  };

  let previewVideoSrc = '';
  let previewPosterSrc;
  let mode: 'fallback' | 'preview' | '' = '';

  if (videoObj?.mediaList) {
    const fallbackMedia = videoObj.mediaList.find((item) => item.formType === videoType);

    if (fallbackMedia) {
      mode = 'fallback';
      previewVideoSrc = fallbackMedia.videoSrc;
      previewPosterSrc = fallbackMedia.imgSrc;
    }
  }

  if (videoObj?.videoSrc) {
    mode = 'preview';
    previewVideoSrc = videoObj.videoSrc;
  }

  // Disable all action buttons when preset video (fallback) or no videoObj
  const btnDisabled = !videoObj || mode === 'fallback';

  return (
    <>
      <div id='ImageDisplay' className={cn('flex h-full flex-1 flex-col gap-px px-3 pt-3 contain-strict lg:px-0')}>
        <div className='from-muted to-card relative flex h-auto max-h-[calc(100%-48px)] flex-1 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-t p-3 lg:p-5'>
          {mode && (
            <button
              type='button'
              onClick={onCloseFallback}
              className='absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-lg bg-black/20 text-white/70 backdrop-blur'
            >
              <X className='size-4' />
            </button>
          )}
          {previewVideoSrc ? (
            <>
              <video
                src={previewVideoSrc}
                poster={previewPosterSrc}
                muted
                autoPlay
                loop
                playsInline
                controls
                className={cn(
                  'video h-full w-auto rounded hover:cursor-pointer',
                  mode === 'fallback' && 'w-full object-contain',
                )}
              />
            </>
          ) : previewPosterSrc ? (
            <Image
              src={previewPosterSrc}
              className='h-full w-auto object-contain'
              alt='preview poster'
              width={1196}
              height={520}
            />
          ) : (
            <div className='text-muted-foreground flex flex-1 flex-col items-center justify-center gap-3'>
              <VideoIcon className='size-10' />
              {t('noVideo')}
            </div>
          )}
        </div>
        {!btnDisabled && (
          <div className='bg-card relative flex flex-none items-center justify-end gap-1 rounded-b-xl p-2'>
            {/* Prompt */}
            {videoObj?.prompt && (
              <div className='border-border bg-card flex h-9 items-center gap-1 rounded-xl border px-2 lg:h-10'>
                <CopyBtn content={videoObj.prompt} />
                <Popover open={showVideoInfo} onOpenChange={setShowVideoInfo}>
                  <PopoverTrigger asChild>
                    <button
                      type='button'
                      onClick={() => setShowVideoInfo(!showVideoInfo)}
                      className='text-muted-foreground flex cursor-pointer items-center gap-1 text-xs lg:text-sm'
                    >
                      {t('prompt')}
                      <ChevronDown
                        className={cn('size-3.5 rotate-0 transition duration-200', showVideoInfo && '-rotate-180')}
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side='top'
                    className='border-border bg-card text-foreground max-h-60 overflow-auto p-3 shadow-md'
                    sideOffset={15}
                  >
                    {videoObj.prompt}
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Video detail */}
            <button
              type='button'
              onClick={onShowDetail}
              className='border-border bg-card text-muted-foreground hover:bg-card flex h-9 cursor-pointer items-center rounded-xl border px-3 text-xs lg:h-10 lg:text-sm'
            >
              {t('videoDetail')}
            </button>

            {/* Download */}
            <button
              type='button'
              onClick={onDownload}
              disabled={!videoObj?.videoSrc}
              className='border-border bg-card hover:bg-card flex size-9 cursor-pointer items-center justify-center rounded-xl border disabled:cursor-not-allowed disabled:opacity-50 lg:size-10'
            >
              <Download className='text-foreground size-4 lg:size-5' />
            </button>

            {/* Delete */}
            <button
              type='button'
              onClick={() => setOpenDeleteDialog(true)}
              className='border-border bg-card text-muted-foreground flex size-9 cursor-pointer items-center justify-center rounded-xl border hover:text-red-500 lg:size-10'
            >
              <Trash2 className='size-4 lg:size-5' strokeWidth={1} />
            </button>
          </div>
        )}
      </div>
      <ConfirmDialog open={openDeleteDialog} setOpen={setOpenDeleteDialog} callback={onDelete} />
      {isDetailModalOpen && videoObj && videoObj.id && (
        <VideoDetailModal
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          onDelete={() => updateVideoObj(null)}
          video={
            {
              id: videoObj.id,
              videoUrl: videoObj.videoSrc || '',
              coverImage: videoObj.coverImg,
              imageUrl: videoObj.startFrame || videoObj.originalImg || null,
              imageEndUrl: videoObj.endFrame || null,
              prompt: videoObj.prompt || '',
              createTime: videoObj.createTime || Date.now(),
              duration: videoObj.duration,
              platformName: videoObj.platformName || videoObj.model || '',
              ratio: videoObj.ratio,
            } as any
          }
        />
      )}
    </>
  );
}
