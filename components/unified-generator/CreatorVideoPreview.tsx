'use client';

import { useEffect, useMemo, useState } from 'react';
import type { VideoHistoryItem } from '@/network/video/history';
import { Loader2 } from 'lucide-react';

export default function CreatorVideoPreview({
  item,
  noPreviewLabel,
  loadingLabel,
}: {
  item: VideoHistoryItem;
  noPreviewLabel: string;
  loadingLabel: string;
}) {
  const covers = useMemo(
    () =>
      Array.from(
        new Set(
          [item.coverImage, item.videoThumbnailUrl, item.imageUrl].filter((value): value is string => Boolean(value)),
        ),
      ),
    [item.coverImage, item.imageUrl, item.videoThumbnailUrl],
  );
  const [coverIndex, setCoverIndex] = useState(0);

  useEffect(() => {
    setCoverIndex(0);
  }, [item.coverImage, item.id, item.imageUrl, item.videoThumbnailUrl]);

  const cover = covers[coverIndex];
  const isProcessing = item.status === 'processing' || item.status === 'pending';
  const preview = cover ? (
    <img
      src={cover}
      alt={item.prompt}
      loading='lazy'
      className='h-full w-full object-cover'
      onError={() => setCoverIndex((index) => index + 1)}
    />
  ) : item.videoUrl ? (
    <video
      src={item.videoUrl}
      muted
      playsInline
      preload='metadata'
      className='h-full w-full object-cover'
      onMouseEnter={(event) => void event.currentTarget.play()}
      onMouseLeave={(event) => {
        event.currentTarget.pause();
        event.currentTarget.currentTime = 0;
      }}
    >
      <track kind='captions' />
    </video>
  ) : (
    <div className='text-foreground/30 flex h-full items-center justify-center'>{noPreviewLabel}</div>
  );

  return (
    <>
      {preview}
      {isProcessing && (
        <div
          className='absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[1px]'
          role='status'
          aria-live='polite'
          aria-label={loadingLabel}
        >
          <Loader2 className='size-7 animate-spin motion-reduce:animate-none' aria-hidden='true' />
          <span className='sr-only'>{loadingLabel}</span>
        </div>
      )}
    </>
  );
}
