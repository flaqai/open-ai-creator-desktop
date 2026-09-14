'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface ScrollRef {
  scrollToStart: () => void;
  getScrollLeft: () => number;
}

const Scroll = forwardRef<
  ScrollRef,
  {
    children: React.ReactNode;
    className?: string;
    onScrollToEnd?: () => void;
    onScrollChange?: (scrollLeft: number) => void;
  }
>(({ children, className, onScrollToEnd, onScrollChange }, ref) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const lastScrollWidthRef = useRef(0);
  const lastScrollLeftRef = useRef(0);
  const hasTriggeredRef = useRef(false);
  const onScrollToEndRef = useRef(onScrollToEnd);
  const onScrollChangeRef = useRef(onScrollChange);

  useEffect(() => {
    onScrollToEndRef.current = onScrollToEnd;
    onScrollChangeRef.current = onScrollChange;
  }, [onScrollToEnd, onScrollChange]);

  useImperativeHandle(ref, () => ({
    scrollToStart: () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
    },
    getScrollLeft: () => {
      return scrollRef.current?.scrollLeft || 0;
    },
  }));

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);

      if (onScrollChangeRef.current) {
        onScrollChangeRef.current(scrollLeft);
      }

      if (scrollWidth !== lastScrollWidthRef.current) {
        lastScrollWidthRef.current = scrollWidth;
        hasTriggeredRef.current = false;
      }

      if (scrollLeft < lastScrollLeftRef.current - 50) {
        hasTriggeredRef.current = false;
      }
      lastScrollLeftRef.current = scrollLeft;

      if (onScrollToEndRef.current && !hasTriggeredRef.current && scrollLeft > scrollWidth - clientWidth - 100) {
        hasTriggeredRef.current = true;
        onScrollToEndRef.current();
      }
    }
  };

  const onScroll = (type: 'left' | 'right') => {
    if (scrollRef.current) {
      const halfWidth = scrollRef.current.clientWidth / 2;
      if (type === 'left') {
        scrollRef.current.scrollBy({ left: -halfWidth, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: halfWidth, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    checkScrollability();
    const scrollElement = scrollRef.current;
    if (!scrollElement) {
      return undefined;
    }

    const handleScroll = () => checkScrollability();
    scrollElement.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkScrollability);

    const resizeObserver = new ResizeObserver(() => {
      checkScrollability();
    });
    resizeObserver.observe(scrollElement);
    const innerContent = scrollElement.firstElementChild;
    if (innerContent) {
      resizeObserver.observe(innerContent);
    }

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollability);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className='w-full max-w-full'>
      <div className={cn('border-border bg-muted flex h-[154px] w-full items-center rounded-2xl border', className)}>
        <button
          type='button'
          onClick={() => onScroll('left')}
          disabled={!canScrollLeft}
          className={cn(
            'flex h-full w-8 shrink-0 items-center justify-center rounded-l-2xl transition-opacity',
            canScrollLeft ? 'hover:bg-card opacity-100' : 'cursor-not-allowed opacity-40',
          )}
          aria-label='Scroll left'
        >
          <ChevronLeft className='text-muted-foreground h-5 w-5' />
        </button>
        <div
          ref={scrollRef}
          className={cn('scrollbar-hide flex-1 overflow-x-auto overflow-y-hidden scroll-smooth px-2')}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div className='flex w-max gap-2'>{children}</div>
        </div>
        <button
          type='button'
          onClick={() => onScroll('right')}
          disabled={!canScrollRight}
          className={cn(
            'flex h-full w-8 shrink-0 items-center justify-center rounded-r-2xl transition-opacity',
            canScrollRight ? 'hover:bg-card opacity-100' : 'cursor-not-allowed opacity-40',
          )}
          aria-label='Scroll right'
        >
          <ChevronRight className='text-muted-foreground h-5 w-5' />
        </button>
      </div>
    </div>
  );
});

Scroll.displayName = 'Scroll';

export default Scroll;
