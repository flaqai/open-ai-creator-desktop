'use client';

import type { ImageHistoryItem } from '@/network/image/history';
import { Loader2 } from 'lucide-react';

export default function CreatorImagePreview({
  item,
  noPreviewLabel,
  loadingLabel,
}: {
  item: ImageHistoryItem;
  noPreviewLabel: string;
  loadingLabel: string;
}) {
  const src = item.thumbnailUrl || item.url;
  const isProcessing = item.status === 'processing';

  return (
    <>
      {src ? (
        <img src={src} alt={item.prompt} loading='lazy' draggable={false} className='h-full w-full object-cover' />
      ) : (
        <div className='text-foreground/30 flex h-full items-center justify-center'>{noPreviewLabel}</div>
      )}
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
