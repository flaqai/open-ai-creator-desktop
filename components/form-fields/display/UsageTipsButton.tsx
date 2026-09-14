'use client';

import { useState } from 'react';
import { CircleHelp } from 'lucide-react';

import UsageTipsCard from './UsageTipsCard';

interface UsageTipsButtonProps {
  title: string;
  description: string;
  videoUrl?: string;
  videoCover?: string;
  buttonText?: string;
  className?: string;
}

export default function UsageTipsButton({
  title,
  description,
  videoUrl,
  videoCover,
  buttonText = 'Usage Tips',
  className,
}: UsageTipsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type='button'
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1 text-sm font-normal hover:opacity-80 ${className || 'bg-foreground text-muted-foreground rounded-lg border border-[#d9d9d9] px-4 py-2'}`}
      >
        <CircleHelp className='size-5' />
        <div className='text-color-main text-[16px] leading-[24px] font-normal'>{buttonText}</div>
      </button>

      <UsageTipsCard
        title={title}
        description={description}
        videoUrl={videoUrl}
        videoCover={videoCover}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
