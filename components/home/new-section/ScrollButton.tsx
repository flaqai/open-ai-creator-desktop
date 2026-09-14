'use client';

import { cn } from '@/lib/utils';

interface ScrollButtonProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  scrollTarget?: 'top' | string;
}

export default function ScrollButton({ children, className, style, scrollTarget = 'top' }: ScrollButtonProps) {
  const handleClick = () => {
    if (scrollTarget === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.querySelector(scrollTarget);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <button
      data-scroll-target={scrollTarget}
      onClick={handleClick}
      className={cn(
        'bg-color-main hover:bg-color-main/80 text-foreground hover:text-foreground flex items-center justify-center rounded-lg px-8 py-2.5 font-semibold backdrop-blur-sm',
        className,
      )}
      style={style}
    >
      {children}
    </button>
  );
}
