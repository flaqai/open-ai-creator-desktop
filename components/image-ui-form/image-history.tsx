'use client';

/* eslint-disable react/jsx-indent */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { deleteImageById } from '@/network/image/client';
import useUserImageHistory, { refreshImageHistory } from '@/network/image/history';
import useImageFormStore from '@/store/form/useImageFormStore';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { numberList } from '@/lib/utils/arrayUtils';
import { formatDate } from '@/lib/utils/timeUtils';
import FailurePlaceholder from '@/components/ui/failure-placeholder';

import { useImageContext } from './image-context-provider';
import Scroll, { ScrollRef } from './shared/scroll';

function LoadingPlaceholder() {
  return (
    <div className='relative flex h-[130px] w-[130px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#1c1d20]'>
      <div className='size-8 animate-spin rounded-full border-4 border-[#303030] border-t-white/60' />
    </div>
  );
}

function ImageItem({
  imgSrc,
  createTime,
  onClick,
  isFailed,
  isLoading,
  onDelete,
}: {
  imgSrc: string;
  createTime: number;
  onClick: () => void;
  isFailed?: boolean;
  isLoading?: boolean;
  onDelete?: () => void;
}) {
  if (isLoading) {
    return <LoadingPlaceholder />;
  }

  if (isFailed) {
    return (
      <div className='relative h-[130px] shrink-0'>
        <FailurePlaceholder className='h-full' iconSize={32} onClick={onClick} />
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
      className='group relative flex h-[130px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#1c1d20] hover:cursor-pointer'
      onClick={onClick}
    >
      <img
        src={imgSrc}
        alt='imgSrc'
        fetchPriority='low'
        loading='lazy'
        className='h-full w-auto transition-transform duration-200 group-hover:scale-110'
      />

      <div className='absolute bottom-0 left-0 flex items-center justify-center rounded-tr-lg rounded-bl-lg bg-[rgba(128,128,128,0.5)] p-2.5 py-1 text-xs text-white backdrop-blur'>
        {formatDate(createTime)}
      </div>
    </div>
  );
}

interface ImageHistoryProps {
  imageObjContext?: 'default' | 'start-frame' | 'end-frame';
  onScrollChange?: (scrollLeft: number) => void;
}

const ImageHistory = forwardRef<ScrollRef, ImageHistoryProps>(
  ({ imageObjContext = 'default', onScrollChange }, ref) => {
    const t = useTranslations('components.image-form.history');
    const imageType = useImageContext();

    // Select corresponding updateImageObj based on imageObjContext
    const updateImageObj = useImageFormStore((state) => {
      if (imageObjContext === 'start-frame') return state.updateStartFrameImageObj;
      if (imageObjContext === 'end-frame') return state.updateEndFrameImageObj;
      return state.updateImageObj;
    });

    const resetDefault = useImageFormStore((state) => state.resetDefault);

    const [pageNum] = useState(1);
    const { data, isLoading } = useUserImageHistory(pageNum, 30, imageType || undefined);

    const displayData = useMemo(() => data || [], [data]);

    const hasData = displayData.length > 0;

    // Reset to default preset image when imageType changes
    useEffect(() => {
      resetDefault();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageType]);

    const handleClickImg = (imgData: NonNullable<typeof data>[number]) => {
      const ratio = imgData.resolution;
      updateImageObj({
        id: imgData.id,
        src: imgData.url,
        name: imgData.url.split('/').pop()!,
        resolution: ratio,
        prompt: imgData.prompt,
        modelName: imgData.modelInfo || imgData.modelName,
        createTime: imgData.createTime,
        size: imgData.size,
        userImageUrlList: imgData.userImageUrlList,
        type: 'display-one',
      });
    };

    const handleDelete = async (id: string) => {
      try {
        const res = await deleteImageById(id);
        if (res.code === 200) {
          toast.success(res.msg || t('deleteSuccess'));
          refreshImageHistory();
        } else {
          toast.error(res.msg || t('deleteFailed'));
        }
      } catch (error) {
        toast.error(t('deleteFailed'));
      }
    };

    return (
      <Scroll ref={ref} onScrollChange={onScrollChange}>
        {!isLoading && !hasData && (
          <div className='flex h-[130px] w-[195px] shrink-0 items-center justify-center rounded-lg border border-[#303030] bg-[#2a2b2f]'>
            <div className='text-sm font-normal text-[#b8b8b8]'>{t('noImage')}</div>
          </div>
        )}
        {isLoading && (
          <div className='flex shrink-0 flex-nowrap gap-2 overflow-x-auto'>
            {numberList(8).map((num) => (
              <div key={num} className='size-[130px] animate-pulse rounded bg-[#1c1d20]' />
            ))}
          </div>
        )}
        {hasData &&
          displayData.map((el) => {
            const isProcessing = el.status === 'processing';
            const isFailed = el.status === 'fail';
            return (
              <ImageItem
                key={el.id}
                imgSrc={el.thumbnailUrl || el.url}
                createTime={el.createTime}
                onClick={() => {
                  if (!isProcessing) {
                    handleClickImg(el as NonNullable<typeof data>[number]);
                  }
                }}
                isFailed={isFailed}
                isLoading={isProcessing}
                onDelete={isFailed && !isProcessing ? () => handleDelete(el.id) : undefined}
              />
            );
          })}
      </Scroll>
    );
  },
);

ImageHistory.displayName = 'ImageHistory';

export default ImageHistory;
