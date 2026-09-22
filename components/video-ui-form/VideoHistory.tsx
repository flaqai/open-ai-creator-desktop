'use client';

import { forwardRef, useContext, useState } from 'react';
import { deleteVideoById } from '@/network/video/client';
import useVideoHistory, { refreshVideoHistory, VideoHistoryItem, VideoHistoryRequest } from '@/network/video/history';
import useVideoFormStore from '@/store/form/useVideoFormStore';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { numberList } from '@/lib/utils/arrayUtils';
import { formatDate } from '@/lib/utils/timeUtils';
import FailurePlaceholder from '@/components/ui/failure-placeholder';

import Spinning from '../Spinning';
import Scroll, { ScrollRef } from './shared/scroll';
import { showAllVideoHistoryContext, videoTypeContenxt } from './VideoContenxtProvider';

function VideoItem({
  imgSrc,
  onClick,
  createTime,
  status,
  onDelete,
  ratio,
}: {
  imgSrc?: string;
  onClick: () => void;
  createTime: number;
  status: VideoHistoryItem['status'];
  onDelete?: () => void;
  ratio?: string;
}) {
  const calculateWidth = (ratioStr?: string) => {
    if (!ratioStr) return 130;
    const [w, h] = ratioStr.split(':').map(Number);
    if (!w || !h) return 130;
    return Math.round((130 * w) / h);
  };

  const width = calculateWidth(ratio);
  if (status === 'pending' || status === 'processing') {
    return (
      <div
        style={{ width: `${width}px` }}
        className={cn(
          'border-border bg-card relative flex h-[130px] shrink-0 items-center justify-center rounded-lg border',
        )}
      >
        <Spinning />
      </div>
    );
  }
  if (status === 'fail') {
    return (
      <div style={{ width: `${width}px` }} className='relative h-[130px] shrink-0'>
        <FailurePlaceholder className='h-full' iconSize={32} />
        {onDelete && (
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className='absolute top-1 right-1 z-20 flex size-6 items-center justify-center rounded-lg bg-black/50 text-white backdrop-blur-sm hover:bg-black/70'
          >
            <Trash2 className='size-4' />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{ width: `${width}px` }}
      className={cn(
        'group bg-card hover:bg-muted relative flex h-[130px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg transition-all duration-200',
      )}
      onClick={onClick}
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt='imgSrc'
          className='h-full w-full object-contain'
          loading='lazy'
          decoding='async'
          fetchPriority='high'
        />
      ) : (
        <>
          <img
            src='/images/cover/video-cover-light.svg'
            alt=''
            className='size-12 object-contain dark:hidden'
            loading='lazy'
            decoding='async'
          />
          <img
            src='/images/cover/video-cover.png'
            alt=''
            className='hidden h-full w-full object-contain dark:block'
            loading='lazy'
            decoding='async'
          />
        </>
      )}
      <div className='text-foreground absolute bottom-0 left-0 flex items-center justify-center rounded-tr-lg rounded-bl-lg bg-[rgba(128,128,128,0.5)] p-2.5 py-1 text-xs backdrop-blur'>
        {formatDate(createTime)}
      </div>
    </div>
  );
}

interface VideoHistoryProps {
  onClickImage?: () => void;
  onScrollChange?: (scrollLeft: number) => void;
}

const VideoHistory = forwardRef<ScrollRef, VideoHistoryProps>(({ onClickImage, onScrollChange }, ref) => {
  const videoTypeTemp = useContext(videoTypeContenxt);
  const showAllVideoHistory = useContext(showAllVideoHistoryContext);

  const videoType = showAllVideoHistory ? undefined : videoTypeTemp;

  const updateVideoObj = useVideoFormStore((state) => state.updateVideoObj);
  const [pageNum] = useState(1);
  const { data, isLoading } = useVideoHistory({
    pageNum,
    pageSize: 30,
    videoType: videoType as VideoHistoryRequest['videoType'],
  });

  const hasData = !!data && data.length > 0;

  const t = useTranslations('components.video-form.history');

  const handleClickImg = (videoData: NonNullable<typeof data>[number]) => {
    // If video failed or has no videoUrl, don't handle click
    if (videoData.status === 'fail' || !videoData.videoUrl) {
      return;
    }

    updateVideoObj({
      id: videoData.id,
      name: videoData.videoUrl.split('/').pop()!,
      videoSrc: videoData.videoUrl,
      posterSrc: videoData.videoThumbnailUrl,
      coverImg: videoData.coverImage || videoData.videoThumbnailUrl, // For detail modal/display use
      model: '', // TODO: video model
      platformName: videoData.platformName, // Detail modal's ModelTag depends on it
      ratio: videoData.ratio, // Detail modal's ratio depends on it
      duration: videoData.duration, // Detail modal's duration depends on it
      createTime: videoData.createTime, // Detail modal's generatedTime depends on it
      isAllowExtend: !!videoData.isAllowExtend,
      prompt: videoData.prompt,
      startFrame: videoData.imageUrl,
      endFrame: videoData.imageEndUrl,
    });

    if (onClickImage) {
      onClickImage();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteVideoById(id);
      if (res.code === 200) {
        toast.success(res.msg || t('deleteSuccess'));
        refreshVideoHistory();
      } else {
        toast.error(res.msg || t('deleteFailed'));
      }
    } catch {
      toast.error(t('deleteFailed'));
    }
  };

  return (
    <Scroll ref={ref} onScrollChange={onScrollChange}>
      {!isLoading && !hasData && (
        <div className='border-border bg-card flex h-[130px] w-[195px] shrink-0 items-center justify-center rounded-lg border'>
          <div className='text-muted-foreground text-sm font-normal'>{t('noHistory')}</div>
        </div>
      )}
      {isLoading &&
        numberList(8).map((num) => (
          <div key={num} className='border-border bg-card size-[130px] shrink-0 animate-pulse rounded-lg border' />
        ))}
      {!isLoading &&
        hasData &&
        data.map((el) => (
          <VideoItem
            key={el.id}
            imgSrc={el.coverImage || el.videoThumbnailUrl || el.imageUrl || undefined}
            onClick={() => handleClickImg(el)}
            createTime={el.createTime}
            status={el.status}
            ratio={el.ratio}
            onDelete={el.status === 'fail' ? () => handleDelete(el.id) : undefined}
          />
        ))}
    </Scroll>
  );
});

VideoHistory.displayName = 'VideoHistory';

export default VideoHistory;
