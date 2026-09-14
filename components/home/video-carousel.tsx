'use client';

import { useEffect, useRef, useState, type ComponentProps, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import SubHeading from '@/components/internal-page/sub-heading';

const MotionDiv = motion.div as unknown as ComponentType<
  ComponentProps<'div'> & {
    initial?: object;
    animate?: object;
    exit?: object;
    transition?: object;
  }
>;

export default function VideoCarousel({
  title,
  description,
  list,
  align = 'left',
  controls = false,
}: {
  title: string;
  description: string;
  list: { id: number | string; imgSrc?: string; posterSrc?: string; videoSrc: string; prompt: string }[];
  align?: 'left' | 'center';
  controls?: boolean;
}) {
  const t = useTranslations('components.video-carousel');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const preloadVideoRef = useRef<HTMLVideoElement>(null);
  const preloadImgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % list.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + list.length) % list.length);
  };

  useEffect(() => {
    const nextIndex = (currentIndex + 1) % list.length;

    if (preloadVideoRef.current) {
      preloadVideoRef.current.src = list[nextIndex].videoSrc;
      preloadVideoRef.current.load();
    }

    if (preloadImgRef.current && list[nextIndex].imgSrc) {
      preloadImgRef.current.src = list[nextIndex].imgSrc;
    }
  }, [currentIndex, list]);

  return (
    <div className='container-centered container-py flex flex-col items-center gap-5'>
      <SubHeading
        title={title}
        description={description}
        className={cn('items-start text-left', align === 'center' && 'items-center text-center')}
      />
      <div className='flex w-full flex-col items-center gap-3 lg:gap-5'>
        <div className='relative flex w-full items-center gap-5 overflow-hidden'>
          <button
            type='button'
            onClick={handlePrev}
            className='hidden size-10 items-center justify-center rounded bg-black/10 px-2 lg:flex'
          >
            <ChevronLeft className='text-foreground/70 size-6' />
          </button>
          <AnimatePresence mode='wait'>
            <MotionDiv
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.25 }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className='flex w-full flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-5'
            >
              <div className='relative flex w-full gap-3 lg:w-[482px] lg:flex-col lg:gap-5'>
                {list[currentIndex].imgSrc && (
                  <>
                    <div className='absolute top-1 left-1 z-10 flex h-8 items-center justify-center rounded-lg bg-black/10 px-2.5 text-sm text-white backdrop-blur-sm lg:h-10'>
                      {t('original-image')}
                    </div>
                    <img
                      src={list[currentIndex].imgSrc}
                      alt={`Example ${currentIndex + 1}`}
                      className='w-[170px] rounded-xl object-contain lg:max-h-[400px] lg:w-full'
                      loading='lazy'
                      decoding='async'
                    />
                  </>
                )}
                <div className='bg-card flex flex-1 flex-col gap-3 rounded-xl p-3 lg:w-auto lg:p-5'>
                  <div className='text-foreground text-base font-semibold capitalize lg:text-[24px]'>{t('prompt')}</div>
                  <div
                    className={cn(
                      'text-foreground/70 w-full text-sm lg:text-base',
                      list[currentIndex].imgSrc ? 'lg:line-clamp-4' : 'lg:line-clamp-[8]',
                    )}
                  >
                    {list[currentIndex].prompt}
                  </div>
                </div>
              </div>
              <div className='relative aspect-video w-full overflow-hidden'>
                <div className='absolute top-1 left-1 z-10 flex h-8 items-center justify-center rounded-lg bg-black/10 px-2.5 text-sm text-white backdrop-blur-sm lg:h-10'>
                  {t('video')}
                </div>
                <button
                  type='button'
                  onClick={() => setIsMuted(!isMuted)}
                  className='absolute bottom-1 left-1 z-10 flex size-8 items-center justify-center rounded-lg bg-black/10 text-white backdrop-blur-sm hover:bg-black/20 lg:size-10'
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className='size-5' /> : <Volume2 className='size-5' />}
                </button>
                <video
                  ref={videoRef}
                  src={list[currentIndex].videoSrc}
                  poster={list[currentIndex].posterSrc || list[currentIndex].imgSrc || undefined}
                  preload='auto'
                  playsInline
                  muted={isMuted}
                  autoPlay
                  controls={controls}
                  onEnded={() => !isHovered && handleNext()}
                  controlsList='nodownload'
                  disablePictureInPicture
                  className='h-full w-full rounded-xl object-contain'
                >
                  <track kind='captions' />
                </video>
                <div className='hidden'>
                  <img ref={preloadImgRef} alt='img' />
                  <video ref={preloadVideoRef} preload='auto' muted playsInline />
                </div>
              </div>
            </MotionDiv>
          </AnimatePresence>
          <button
            type='button'
            onClick={handleNext}
            className='hidden size-10 items-center justify-center rounded bg-black/10 px-2 lg:flex'
          >
            <ChevronRight className='text-foreground/70 size-6' />
          </button>
        </div>
        <div className='flex flex-col gap-5'>
          <div className='flex gap-2'>
            {list.map((el, idx) => (
              <button
                key={el.id}
                type='button'
                onClick={() => setCurrentIndex(idx)}
                className={cn('bg-foreground/40 h-2 w-2 rounded-[2px]', idx === currentIndex && 'bg-color-main')}
              />
            ))}
          </div>
        </div>
        <div className='flex items-center gap-3 lg:hidden'>
          <button
            type='button'
            onClick={handlePrev}
            className='flex size-10 items-center justify-center rounded bg-black/10 px-2'
          >
            <ChevronLeft className='text-foreground/70 size-6' />
          </button>
          <button
            type='button'
            onClick={handleNext}
            className='flex size-10 items-center justify-center rounded bg-black/10 px-2'
          >
            <ChevronRight className='text-foreground/70 size-6' />
          </button>
        </div>
      </div>
    </div>
  );
}
