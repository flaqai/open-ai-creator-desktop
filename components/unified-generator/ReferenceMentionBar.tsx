'use client';

import { AtSign } from 'lucide-react';

interface ReferenceMentionBarProps {
  label: string;
  imageCount: number;
  videoCount: number;
  audioCount: number;
  onInsert: (mention: string) => void;
}

export default function ReferenceMentionBar({
  label,
  imageCount,
  videoCount,
  audioCount,
  onInsert,
}: ReferenceMentionBarProps) {
  const mentions = [
    ...Array.from({ length: imageCount }, (_, index) => `@image_${index + 1}`),
    ...Array.from({ length: videoCount }, (_, index) => `@video_${index + 1}`),
    ...Array.from({ length: audioCount }, (_, index) => `@audio_${index + 1}`),
  ];

  if (!mentions.length) return null;

  return (
    <div className='space-y-2'>
      <div className='text-foreground/45 flex items-center gap-1.5 text-xs'>
        <AtSign className='size-3.5' />
        {label}
      </div>
      <div className='custom-scrollbar flex gap-1.5 overflow-x-auto pb-1'>
        {mentions.map((mention) => (
          <button
            key={mention}
            type='button'
            className='border-foreground/10 bg-foreground/5 text-foreground/65 hover:bg-foreground/10 hover:text-foreground shrink-0 rounded-full border px-2.5 py-1 text-xs'
            onClick={() => onInsert(mention)}
          >
            {mention}
          </button>
        ))}
      </div>
    </div>
  );
}
