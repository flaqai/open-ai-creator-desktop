'use client';

import type { ReactNode } from 'react';
import { CircleHelp } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ReferenceInputHeading({ children, tips }: { children: ReactNode; tips?: string }) {
  return (
    <div className='text-color-t2 flex h-4 items-center justify-between text-xs font-medium'>
      <span>{children}</span>
      {tips ? (
        <TooltipProvider>
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button type='button' className='text-color-t3 hover:text-color-t1 transition-colors'>
                <CircleHelp className='size-3.5' />
              </button>
            </TooltipTrigger>
            <TooltipContent side='right' className='border-color-b1 bg-color-c1 max-w-[240px] rounded-lg p-2'>
              <p>{tips}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
    </div>
  );
}
