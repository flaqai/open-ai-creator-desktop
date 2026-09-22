'use client';

import type { UnifiedMediaType } from '@/store/unified-generator/useUnifiedGeneratorStore';

import { cn } from '@/lib/utils';

const ITEMS: Array<{ type: UnifiedMediaType; icon: string }> = [
  { type: 'video', icon: '/images/navigation/video_ai.webp' },
  { type: 'image', icon: '/images/navigation/image_ai.webp' },
];

export default function TypeTabs({
  value,
  labels,
  onChange,
}: {
  value: UnifiedMediaType;
  labels: Record<UnifiedMediaType, string>;
  onChange: (type: UnifiedMediaType) => void;
}) {
  return (
    <div
      role='tablist'
      className='border-color-b1 bg-color-c1 relative inline-flex max-w-full items-center gap-1 overflow-visible rounded-lg border p-1'
    >
      <span
        aria-hidden='true'
        className='bg-foreground/15 pointer-events-none absolute top-1 bottom-1 left-1 z-0 w-[calc((100%_-_12px)/2)] rounded-md shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition-transform duration-[480ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none'
        style={{ transform: value === 'image' ? 'translateX(calc(100% + 4px))' : 'translateX(0)' }}
      />
      {ITEMS.map((item) => {
        const active = value === item.type;
        return (
          <button
            key={item.type}
            type='button'
            onClick={() => onChange(item.type)}
            className={cn(
              'group relative z-10 inline-flex h-9 min-w-[132px] items-center justify-start gap-0 overflow-visible rounded-md border py-0 pr-4 pl-1 text-sm font-medium transition-colors sm:h-10 sm:min-w-[164px]',
              active
                ? 'text-foreground border-transparent'
                : 'text-color-t2 hover:text-color-t1 focus-visible:text-color-t1 hover:bg-foreground/10 focus-visible:bg-foreground/10 border-transparent',
            )}
            role='tab'
            aria-selected={active}
          >
            <span
              className='relative z-10 flex size-9 shrink-0 items-center justify-center overflow-visible sm:size-10'
              aria-hidden='true'
            >
              <img
                src={item.icon}
                alt=''
                className={cn(
                  'size-full [transform-origin:50%_78%] object-contain transition-transform motion-reduce:transition-none dark:drop-shadow-[0_8px_14px_rgba(0,0,0,0.4)]',
                  active
                    ? 'translate-y-[-2px] scale-[1.46] duration-[580ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]'
                    : 'translate-y-[-6px] scale-100 duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-[-2px] group-hover:duration-[220ms] group-hover:ease-[cubic-bezier(0,0,0.2,1)] group-active:translate-y-0 group-active:scale-90 group-active:duration-[120ms]',
                )}
              />
            </span>
            <span className='relative z-10'>{labels[item.type]}</span>
          </button>
        );
      })}
    </div>
  );
}
