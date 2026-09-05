'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import SubHeading from '../internal-page/sub-heading';

export interface CarouselCard {
  type: string;
  media: {
    type: 'video' | 'image';
    src: string;
    poster?: string;
  };
  href?: string;
}

export default function HomeCarousel({
  title,
  description,
  className,
  data,
}: {
  title: string;
  description: string;
  className?: string;
  data: CarouselCard[];
}) {
  const t = useTranslations('Home.carousel');
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + data.length) % data.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % data.length);
  };

  const handleCardClick = (index: number) => {
    const diff = (index - currentIndex + data.length) % data.length;

    if (diff === 0) {
      // Current card, navigate to corresponding page
      const card = data[index];
      if (card.href) {
        router.push(card.href);
      }
    } else if (diff === 1 || diff === -(data.length - 1)) {
      // Right card, switch to next
      goToNext();
    } else if (diff === data.length - 1 || diff === -1) {
      // Left card, switch to previous
      goToPrevious();
    }
  };

  const getCardStyle = (index: number) => {
    const diff = (index - currentIndex + data.length) % data.length;

    if (diff === 0) {
      // Center card
      return {
        transform: 'translateX(0%) scale(1)',
        zIndex: 30,
        opacity: 1,
      };
    } else if (diff === 1 || diff === -(data.length - 1)) {
      // Right card
      return {
        transform: 'translateX(70%) scale(0.85)',
        zIndex: 20,
        opacity: 0.6,
      };
    } else if (diff === data.length - 1 || diff === -1) {
      // Left card
      return {
        transform: 'translateX(-70%) scale(0.85)',
        zIndex: 20,
        opacity: 0.6,
      };
    } else {
      // Hidden cards
      return {
        transform: 'translateX(0%) scale(0.7)',
        zIndex: 10,
        opacity: 0,
      };
    }
  };

  return (
    <div className={cn('relative w-full overflow-hidden py-8 lg:py-12', className)}>
      <SubHeading title={title} description={description} />

      <div className='relative mx-auto w-full max-w-[1200px] px-4'>
        {/* Card container */}
        <div className='relative aspect-[16/9] w-full'>
          {data.map((card, index) => {
            const style = getCardStyle(index);
            return (
              <div
                key={index}
                style={style}
                onClick={() => handleCardClick(index)}
                className={cn(
                  'absolute top-1/2 left-1/2 aspect-[16/9] w-[95%] -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 ease-out lg:w-[85%]',
                )}
              >
                {/* Card content */}
                <div className='relative h-full w-full overflow-hidden rounded-2xl shadow-2xl lg:rounded-3xl'>
                  {/* Media content */}
                  {card.media.type === 'video' ? (
                    <video
                      className='h-full w-full object-contain select-none'
                      src={card.media.src}
                      poster={card.media.poster}
                      autoPlay
                      loop
                      muted
                      playsInline
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      onLoadedMetadata={(e) => {
                        const video = e.currentTarget;
                        video.volume = 0;
                      }}
                    />
                  ) : (
                    <Image
                      src={card.media.src}
                      alt={card.type}
                      fill
                      className='object-contain select-none'
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  )}

                  {/* Bottom gradient blur - gradually clear from bottom to top */}
                  <div
                    className='absolute inset-x-0 bottom-0 h-[15%] backdrop-blur-[8px]'
                    style={{ maskImage: 'linear-gradient(to top, black 0%, transparent 100%)' }}
                  />
                  <div className='absolute inset-x-0 bottom-0 h-[15%] bg-gradient-to-t from-black/40 via-black/15 to-transparent' />

                  {/* Top-left type label - frosted glass effect */}
                  <div className='absolute top-3 left-3 flex flex-row items-center justify-center gap-2.5 rounded-lg bg-black/20 px-4 py-2.5 backdrop-blur-[9px]'>
                    <span className='text-sm font-medium text-white lg:text-base'>{card.type}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Left and right navigation buttons */}
        <button
          onClick={goToPrevious}
          className='absolute top-1/2 left-0 z-40 -translate-y-1/2 text-white transition hover:scale-110 lg:left-[2%]'
          aria-label='Previous'
        >
          <ChevronLeft className='size-10 lg:size-12' strokeWidth={2.5} />
        </button>
        <button
          onClick={goToNext}
          className='absolute top-1/2 right-0 z-40 -translate-y-1/2 text-white transition hover:scale-110 lg:right-[2%]'
          aria-label='Next'
        >
          <ChevronRight className='size-10 lg:size-12' strokeWidth={2.5} />
        </button>

        {/* Bottom indicators */}
        <div className='absolute -bottom-4 left-1/2 z-40 flex -translate-x-1/2 gap-2'>
          {data.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'h-2 rounded-full transition-all',
                index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50',
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
