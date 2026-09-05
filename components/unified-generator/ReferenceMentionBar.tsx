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
      <div className='flex items-center gap-1.5 text-xs text-white/45'>
        <AtSign className='size-3.5' />
        {label}
      </div>
      <div className='custom-scrollbar flex gap-1.5 overflow-x-auto pb-1'>
        {mentions.map((mention) => (
          <button
            key={mention}
            type='button'
            className='shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/65 hover:bg-white/10 hover:text-white'
            onClick={() => onInsert(mention)}
          >
            {mention}
          </button>
        ))}
      </div>
    </div>
  );
}
