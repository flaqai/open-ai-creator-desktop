'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import useImageFormDefaultStore from '@/store/form/useImageFormDefaultStore';
import { Check, ChevronLeft, ChevronRight, Copy, Volume2, VolumeOff } from 'lucide-react';

import { cn } from '@/lib/utils';

import SubHeading from '../internal-page/sub-heading';

export interface ExampleSectionProps {
  title: string;
  description: string;
  imageExamplesTitle: string;
  imageExamplesDescription: string;
  videoExamplesTitle: string;
  videoExamplesDescription: string;
  promptLabel: string;
  images: Array<{ src: string; prompt: string }>;
  videos: Array<{ src: string; prompt: string }>;
  autoPlay?: boolean;
}

export default function ExampleSection({
  title,
  description,
  imageExamplesTitle,
  imageExamplesDescription,
  videoExamplesTitle,
  videoExamplesDescription,
  promptLabel,
  images,
  videos,
  autoPlay = true,
}: ExampleSectionProps) {
  const router = useRouter();
  const setImagePrompt = useImageFormDefaultStore((state) => state.setPrompt);

  const imageScrollRef = useRef<HTMLDivElement>(null);
  const imageItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isScrollingRef = useRef(false);
  const isManualScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [videoCurrentIndex, setVideoCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Click image to navigate to AI image generation page and fill prompt
  const handleImageClick = (prompt: string) => {
    setImagePrompt(prompt);
    router.push('/image-to-image');
  };

  // Initialize scroll position to the middle group
  useEffect(() => {
    const container = imageScrollRef.current;
    if (!container || images.length === 0) return;

    // Block scroll listener from the start
    isScrollingRef.current = true;

    const initScroll = () => {
      const middleGroupStartIndex = images.length;
      const firstItem = imageItemRefs.current[middleGroupStartIndex];
      if (firstItem) {
        const containerWidth = container.clientWidth;
        const itemCenter = firstItem.offsetLeft + firstItem.offsetWidth / 2;
        container.scrollLeft = itemCenter - containerWidth / 2;
        setCurrentImageIndex(0);

        // Reset flag after initialization is complete
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 50);
      } else {
        // If element is not ready yet, keep retrying
        setTimeout(initScroll, 50);
      }
    };

    const timer = setTimeout(initScroll, 100);

    const handleResize = () => {
      clearTimeout(timer);
      setTimeout(initScroll, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [images]);

  // Image seamless loop scroll listener - improved version
  useEffect(() => {
    const container = imageScrollRef.current;
    if (!container || images.length === 0) return;

    let scrollEndTimer: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      // Skip if manual scroll or position is being adjusted
      if (isScrollingRef.current || isManualScrollRef.current) return;

      // Clear previous timer
      if (scrollEndTimer) clearTimeout(scrollEndTimer);

      // Check and jump 100ms after scroll stops
      scrollEndTimer = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const clientWidth = container.clientWidth;
        const centerPosition = scrollLeft + clientWidth / 2;

        // Find the image closest to current center position
        let currentIdx = 0;
        let currentEl: HTMLDivElement | null = null;
        let minDist = Infinity;
        for (let i = 0; i < imageItemRefs.current.length; i++) {
          const el = imageItemRefs.current[i];
          if (!el) continue;
          const elCenter = el.offsetLeft + el.offsetWidth / 2;
          const dist = Math.abs(elCenter - centerPosition);
          if (dist < minDist) {
            minDist = dist;
            currentIdx = i;
            currentEl = el;
          }
        }

        if (!currentEl) return;

        const oneSetLength = images.length;

        // Check if a jump is needed
        if (currentIdx >= oneSetLength * 2 || currentIdx < oneSetLength) {
          // Calculate relative offset within the current image
          const elCenter = currentEl.offsetLeft + currentEl.offsetWidth / 2;
          const offsetFromCenter = centerPosition - elCenter;

          // Target is the corresponding image in the second group
          const normalizedIdx = currentIdx % oneSetLength;
          const targetIdx = oneSetLength + normalizedIdx;
          const targetEl = imageItemRefs.current[targetIdx];
          if (!targetEl) return;

          // Calculate new scrollLeft, maintaining the same relative offset
          const targetCenter = targetEl.offsetLeft + targetEl.offsetWidth / 2;
          container.scrollLeft = targetCenter + offsetFromCenter - clientWidth / 2;
        }
      }, 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
    };
  }, [images]);

  // Auto scroll images
  useEffect(() => {
    if (!autoPlay) return;

    const scrollContainer = imageScrollRef.current;
    if (!scrollContainer) return;

    const autoScroll = () => {
      const scrollAmount = 1;
      scrollContainer.scrollLeft += scrollAmount;
    };

    const intervalId = setInterval(autoScroll, 30);

    return () => clearInterval(intervalId);
  }, [autoPlay]);

  // Auto switch videos
  useEffect(() => {
    if (!autoPlay) return;

    const intervalId = setInterval(() => {
      setVideoCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [videos.length, autoPlay]);

  // Auto play current video and pause others when switching
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === videoCurrentIndex) {
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [videoCurrentIndex]);

  // Image carousel control - minimal version
  const goToPreviousImage = () => {
    const container = imageScrollRef.current;
    if (!container) return;
    const firstItem = imageItemRefs.current[0];
    if (!firstItem) return;
    const itemWidth = firstItem.offsetWidth + 12;
    container.scrollBy({ left: -itemWidth, behavior: 'smooth' });
  };

  const goToNextImage = () => {
    const container = imageScrollRef.current;
    if (!container) return;
    const firstItem = imageItemRefs.current[0];
    if (!firstItem) return;
    const itemWidth = firstItem.offsetWidth + 12;
    container.scrollBy({ left: itemWidth, behavior: 'smooth' });
  };

  // Stop current playing video when switching videos
  const stopCurrentVideo = () => {
    const currentVideo = videoRefs.current[videoCurrentIndex];
    if (currentVideo) {
      currentVideo.pause();
      currentVideo.currentTime = 0;
    }
  };

  // Video carousel control
  const goToPreviousVideo = () => {
    stopCurrentVideo();
    setVideoCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const goToNextVideo = () => {
    stopCurrentVideo();
    setVideoCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  return (
    <section className='relative w-full bg-black py-15'>
      {/* Main title and description */}
      <SubHeading title={title} description={description} />

      {/* Image examples section */}
      <div className='mt-9'>
        {/* Title and navigation buttons */}
        <div className='mx-auto flex max-w-[1200px] items-start justify-between px-4'>
          <div className='mx-0 flex flex-col items-start text-left'>
            <h2 className='text-[18px] font-semibold text-white md:text-[18px] md:leading-[26px] md:tracking-[0.36px]'>
              {imageExamplesTitle}
            </h2>
            {imageExamplesDescription && (
              <p className='mt-1 text-[14px] font-normal text-[#B8B8B8]'>{imageExamplesDescription}</p>
            )}
          </div>

          {/* Navigation buttons */}
          <div className='flex items-center gap-3'>
            <button
              onClick={goToPreviousImage}
              className='flex h-12 w-12 items-center justify-center rounded-full bg-[#1C1D23] text-white transition hover:bg-[#2C2D33]'
              aria-label='Previous image'
            >
              <ChevronLeft className='h-[18px] w-[18px]' />
            </button>
            <button
              onClick={goToNextImage}
              className='flex h-12 w-12 items-center justify-center rounded-full bg-[#1C1D23] text-white transition hover:bg-[#2C2D33]'
              aria-label='Next image'
            >
              <ChevronRight className='h-[18px] w-[18px]' />
            </button>
          </div>
        </div>

        {/* Image carousel container */}
        <div
          ref={imageScrollRef}
          className='mt-3 overflow-x-scroll overflow-y-hidden [&::-webkit-scrollbar]:hidden'
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className='flex gap-3'>
            {[...images, ...images, ...images].map((item, index) => (
              <div
                key={`image-${index}`}
                ref={(el) => {
                  imageItemRefs.current[index] = el;
                }}
                className='group relative h-[200px] max-w-[85vw] flex-shrink-0 cursor-pointer md:h-[360px] md:max-w-none lg:h-[440px]'
                onClick={() => handleImageClick(item.prompt)}
              >
                <div className='relative h-full overflow-hidden rounded-xl bg-[#383838]'>
                  <img
                    src={item.src}
                    alt={`Example ${index + 1}`}
                    className='h-full w-auto object-cover transition-transform duration-500 group-hover:scale-105'
                    loading='eager'
                  />

                  {/* Bottom gradient overlay and Prompt */}
                  <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pt-20 pb-4 opacity-0 transition-all duration-300 group-hover:opacity-100'>
                    <p className='line-clamp-4 text-xs leading-relaxed text-white/90'>{item.prompt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video examples section */}
      <div className='mx-auto mt-9 max-w-[1200px] px-4'>
        {/* Title and navigation buttons */}
        <div className='flex items-start justify-between'>
          <div className='mx-0 flex flex-col items-start text-left'>
            <h3 className='text-[18px] font-semibold text-white md:text-[18px] md:leading-[26px] md:tracking-[0.36px]'>
              {videoExamplesTitle}
            </h3>
            <p className='mt-1 text-[14px] font-normal text-[#B8B8B8]'>{videoExamplesDescription}</p>
          </div>

          {/* Navigation buttons */}
          <div className='flex items-center gap-3'>
            <button
              onClick={goToPreviousVideo}
              className='flex h-12 w-12 items-center justify-center rounded-full bg-[#1C1D23] text-white transition hover:bg-[#2C2D33]'
              aria-label='Previous video'
            >
              <ChevronLeft className='h-[18px] w-[18px]' />
            </button>
            <button
              onClick={goToNextVideo}
              className='flex h-12 w-12 items-center justify-center rounded-full bg-[#1C1D23] text-white transition hover:bg-[#2C2D33]'
              aria-label='Next video'
            >
              <ChevronRight className='h-[18px] w-[18px]' />
            </button>
          </div>
        </div>

        {/* Video content area */}
        <div className='mt-3 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]'>
          {/* Video player */}
          <div className='relative aspect-video overflow-hidden rounded-xl bg-[#383838]'>
            {videos.map((video, index) => (
              <div
                key={index}
                className={cn(
                  'absolute inset-0 transition-opacity duration-300',
                  index === videoCurrentIndex ? 'z-10 opacity-100' : 'z-0 opacity-0',
                )}
              >
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  src={video.src}
                  muted={muted}
                  autoPlay={index === 0}
                  playsInline
                  onEnded={() => setVideoCurrentIndex((prev) => (prev + 1) % videos.length)}
                  className='h-full w-full object-cover'
                />
              </div>
            ))}
            <button
              type='button'
              onClick={() => setMuted((prev) => !prev)}
              className='absolute bottom-3 left-3 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25'
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <VolumeOff className='h-4 w-4' /> : <Volume2 className='h-4 w-4' />}
            </button>
          </div>

          {/* Video info and Prompt */}
          <div className='flex flex-col gap-4 rounded-xl bg-[#16171B] p-4'>
            {/* Prompt title and copy button */}
            <div className='flex items-center justify-start gap-3'>
              <p className='text-sm font-medium text-white'>{promptLabel}</p>
              <button
                type='button'
                className='flex cursor-pointer items-center gap-2 text-xs text-white/70 transition hover:text-white'
                onClick={() => {
                  navigator.clipboard.writeText(videos[videoCurrentIndex].prompt);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className='h-4 w-4 text-green-500' /> : <Copy className='h-4 w-4' />}
              </button>
            </div>

            {/* Video Prompt */}
            <p className='line-clamp-10 text-xs text-white/70'>{videos[videoCurrentIndex].prompt}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
