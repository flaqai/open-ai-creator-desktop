'use client';

import { useEffect, useMemo, useState } from 'react';
import type { VideoHistoryItem } from '@/network/video/history';
import { Loader2 } from 'lucide-react';

import useVideoHistoryCover from './useVideoHistoryCover';

function playVideoPreview(video: HTMLVideoElement) {
  video.play().catch((error: unknown) => {
    if (error instanceof Error && error.name === 'AbortError') return;
    console.error('Failed to play generation history preview:', error);
  });
}

export default function CreatorVideoPreview({
  item,
  noPreviewLabel,
  loadingLabel,
}: {
  item: VideoHistoryItem;
  noPreviewLabel: string;
  loadingLabel: string;
}) {
  const { coverUrl: savedFrame, cacheLoadedVideoFrame } = useVideoHistoryCover(
    item.id || item.traceId,
    item.videoUrl,
    item.localPath,
  );
  const isProcessing = item.status === 'processing' || item.status === 'pending';
  const sourceCovers = useMemo(
    () =>
      Array.from(
        new Set(
          [item.coverImage, item.videoThumbnailUrl, item.imageUrl].filter((value): value is string => Boolean(value)),
        ),
      ),
    [item.coverImage, item.imageUrl, item.videoThumbnailUrl],
  );
  const [sourceCoverIndex, setSourceCoverIndex] = useState(0);
  useEffect(() => setSourceCoverIndex(0), [item.coverImage, item.id, item.imageUrl, item.videoThumbnailUrl]);
  // Pending tasks can show their source image. Completed videos must use a frame
  // from the generated video so a reference image is not mistaken for the result.
  const cover = savedFrame || (isProcessing ? sourceCovers[sourceCoverIndex] : undefined);
  const preview = cover ? (
    <img
      src={cover}
      alt={item.prompt}
      loading='lazy'
      className='block h-auto w-full object-contain'
      onError={savedFrame ? undefined : () => setSourceCoverIndex((index) => index + 1)}
    />
  ) : item.videoUrl ? (
    <video
      src={item.videoUrl}
      muted
      playsInline
      preload='auto'
      className='block h-auto w-full object-contain'
      onLoadedData={(event) => cacheLoadedVideoFrame(event.currentTarget)}
      onMouseEnter={(event) => playVideoPreview(event.currentTarget)}
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
