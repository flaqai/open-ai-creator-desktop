'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export default function NavPopover({
  label,
  isHighLight = false,
  navDataList,
  className,
  renderIcon = true,
  columnNumber = 2,
  align = 'start',
}: {
  label: string;
  isHighLight?: boolean;
  navDataList: {
    label: string;
    description: string;
    href: string;
    code: string;
    target?: string;
    isNew?: boolean;
    isHot?: boolean;
  }[];
  className?: string;
  renderIcon?: boolean;
  columnNumber?: number;
  align?: React.ComponentProps<typeof PopoverContent>['align'];
}) {
  const t = useTranslations('Navigation');
  const [openToolsNav, setOpenToolsNav] = useState(false);

  return (
    <Popover open={openToolsNav} onOpenChange={setOpenToolsNav}>
      <PopoverTrigger asChild>
        <button
          type='button'
          className={cn(
            'flex h-10 min-h-10 items-center gap-1 rounded-lg px-1 hover:bg-white/15',
            isHighLight ? 'bg-white/15' : 'text-white/70',
            className,
          )}
        >
          <span className='text-base font-semibold'>
            {isHighLight && '🔥 '}
            {label}
          </span>
          <ChevronDown
            className={cn(
              'size-5 rotate-0 text-white/40 transition-transform duration-150',
              openToolsNav && '-rotate-180',
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn(
          'z-50 flex flex-col gap-3 rounded-lg border-none bg-[#202020] p-5 text-center text-base leading-4 font-normal text-white shadow-lg backdrop-blur-lg',
          columnNumber === 2 && 'w-[750px]',
          columnNumber === 3 && 'w-[1123px]',
          columnNumber === 4 && 'w-[1234px]',
        )}
      >
        <PopoverPrimitive.Arrow className='fill-black/70' />
        <ul
          className={cn(
            'grid gap-5',
            columnNumber === 2 && 'grid-cols-2',
            columnNumber === 3 && 'grid-cols-3',
            columnNumber === 4 && 'grid-cols-4',
          )}
        >
          {navDataList.map((child) => (
            <li key={child.href}>
              <Link
                key={child.code}
                href={child.href as string}
                target={child?.target}
                onClick={() => setOpenToolsNav(false)}
                className={cn(
                  'relative flex h-[60px] w-full items-center gap-3 rounded-lg p-2 hover:bg-white/15',
                  columnNumber === 3 && 'h-[82px]',
                  columnNumber === 4 && 'h-[92px]',
                )}
              >
                {renderIcon && (
                  <div className='relative shrink-0'>
                    {/* <span>{renderHeaderIcon(child.code)}</span> */}
                    {child.isNew && (
                      <div className='bg-color-main text-xxs absolute -top-1/2 left-1/2 -translate-x-1/2 rounded-full px-1.5 py-px font-bold text-white uppercase'>
                        {t('new')}
                        <div className='border-t-color-main absolute -bottom-1 left-1/2 h-0 w-0 -translate-x-1/2 border-t-4 border-r-4 border-l-4 border-r-transparent border-l-transparent' />
                      </div>
                    )}
                    {child.isHot && (
                      <div className='bg-color-main text-xxs absolute -top-1/2 left-1/2 -translate-x-1/2 rounded-full px-1.5 py-px font-bold text-white uppercase'>
                        🔥
                        <div className='border-t-color-main absolute -bottom-1 left-1/2 h-0 w-0 -translate-x-1/2 border-t-4 border-r-4 border-l-4 border-r-transparent border-l-transparent' />
                      </div>
                    )}
                  </div>
                )}
                <div className='flex-grow'>
                  <div className='line-clamp-1 text-left leading-tight font-semibold text-white'>{child.label}</div>
                  <p className='line-clamp-2 text-left text-sm text-white/60'>{child.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
