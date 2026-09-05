'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export default function ToolbarButton({
  active = false,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; children: ReactNode }) {
  return (
    <button
      type='button'
      className={cn(
        'group bg-color-c3 text-color-t2 hover:bg-color-c4 hover:text-color-t1 inline-flex h-9 items-center gap-1 rounded-md px-3 py-0 text-[14px] leading-[22px] transition-colors max-sm:w-full',
        active && 'border-color-main/40 text-color-t1',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
