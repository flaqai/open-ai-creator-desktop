'use client';

import { CircleHelp } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import ArrowDown from './svg/ArrowDown';

export default function SubHeading({ children, tips }: { children: React.ReactNode; tips?: string }) {
  return (
    <div className='text-foreground/60 flex h-3.5 items-center justify-between text-sm capitalize'>
      <div className='flex items-center gap-0.5'>
        {children}
        <ArrowDown />
      </div>
      {tips && (
        <TooltipProvider>
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button type='button'>
                <CircleHelp className='hover:text-foreground size-3.5 text-[#404142]' />
              </button>
            </TooltipTrigger>
            <TooltipContent side='right' className='border-main-gray bg-card-black isolate max-w-[206px] rounded p-2'>
              <p>{tips}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
