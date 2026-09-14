'use client';

import { useEffect, useMemo, useState } from 'react';
import type { VideoHistoryItem } from '@/network/video/history';
import { Loader2 } from 'lucide-react';

export default function CreatorVideoPreview({
  item,
  noPreviewLabel,
}: {
  item: VideoHistoryItem;
  noPreviewLabel: string;
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
  if (cover) {
    return (
      <img
        src={cover}
        alt={item.prompt}
        loading='lazy'
        className='h-full w-full object-cover'
        onError={() => setCoverIndex((index) => index + 1)}
      />
    );
  }

  if (item.videoUrl) {
    return (
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
    );
  }

  return (
    <div className='text-foreground/30 flex h-full items-center justify-center'>
      {item.status === 'processing' || item.status === 'pending' ? (
        <Loader2 className='animate-spin' />
      ) : (
        noPreviewLabel
      )}
    </div>
  );
}
