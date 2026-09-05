'use client';

import { cn } from '@/lib/utils';

function BarItem({ className }: { className: string }) {
  return (
    <span
      className={cn(
        'absolute top-1/2 -mt-[2px] block h-[2px] w-[18px] bg-current bg-white transition duration-300 ease-in-out',
        className,
      )}
    />
  );
}

export default function MenuBtn({
  open,
  onClick,
  className,
}: {
  open: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}) {
  return (
    <button type='button' className={cn('relative ml-3 h-7 w-6', className)} onClick={onClick}>
      <div className='absolute top-0 left-0 block h-full w-full'>
        <BarItem className={open ? 'rotate-45' : '-translate-y-1.5'} />
        <BarItem className={open ? 'opacity-0' : ''} />
        <BarItem className={open ? '-rotate-45' : 'translate-y-1.5'} />
      </div>
      <span className='sr-only'>menu</span>
    </button>
  );
}
