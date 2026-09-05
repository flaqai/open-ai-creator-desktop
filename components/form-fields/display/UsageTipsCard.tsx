'use client';

import { useEffect, useState } from 'react';
import { Volume2, VolumeX, X } from 'lucide-react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

interface UsageTipsCardProps {
  title: string;
  description: string;
  videoUrl?: string;
  videoCover?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function UsageTipsCard({
  title,
  description,
  videoUrl,
  videoCover,
  isOpen,
  onClose,
}: UsageTipsCardProps) {
  const [mounted, setMounted] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    setMounted(true);
    setContainer(document.getElementById('video-form-container') || document.body);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const content = (
    <>
      <div className='absolute inset-0 z-40 bg-black/50' onClick={onClose} aria-hidden='true' />

      <div
        className={cn(
          'absolute top-1/2 left-[391px] z-50 h-[533px] w-[624px] -translate-y-1/2 rounded-lg bg-[#1c1d20] shadow-2xl transition-all duration-300',
          'flex flex-col gap-1 p-3',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <div className='flex items-center justify-between'>
          <h3 className='text-xl font-semibold text-white'>{title}</h3>
          <button type='button' onClick={onClose} className='rounded-lg p-1 hover:bg-white/10' aria-label='Close'>
            <X className='size-5 text-white/60' />
          </button>
        </div>

        <div className='text-sm leading-relaxed text-white/60'>{description}</div>

        {videoUrl && (
          <div className='relative flex-1 overflow-hidden rounded-lg'>
            <button
              type='button'
              onClick={() => setIsMuted(!isMuted)}
              className='absolute bottom-2 left-2 z-10 flex size-10 items-center justify-center rounded-lg bg-black/10 text-white backdrop-blur-sm hover:bg-black/20'
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className='size-5' /> : <Volume2 className='size-5' />}
            </button>
            <video
              src={videoUrl}
              poster={videoCover}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              className='size-full object-cover'
            >
              <track kind='captions' />
            </video>
          </div>
        )}
      </div>
    </>
  );

  return container ? createPortal(content, container) : null;
}
