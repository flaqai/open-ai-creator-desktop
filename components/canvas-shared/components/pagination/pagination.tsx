'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getPaginationItems } from '@/components/canvas-shared/components/pagination/pagination-items';
import type { PaginationProps } from '@/components/canvas-shared/components/pagination/pagination.types';

export function Pagination({
  ariaLabel,
  className,
  nextLabel,
  onPageChange,
  page,
  previousLabel,
  totalPages,
}: PaginationProps) {
  const normalizedTotalPages = Math.max(1, Math.trunc(totalPages));
  const currentPage = Math.min(Math.max(1, Math.trunc(page)), normalizedTotalPages);
  const items = getPaginationItems(currentPage, normalizedTotalPages);

  return (
    <nav className={cn('flex items-center gap-1.5', className)} aria-label={ariaLabel}>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='size-8 rounded-lg text-gray-color hover:bg-light-gray-2 hover:text-text-color disabled:opacity-35'
        aria-label={previousLabel}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ArrowLeft className='size-5' aria-hidden='true' />
      </Button>

      {items.map((item) =>
        typeof item === 'number' ? (
          <Button
            key={item}
            type='button'
            variant='ghost'
            size='icon'
            className={cn(
              'size-8 rounded-lg text-base font-medium text-gray-color hover:bg-light-gray-2 hover:text-text-color',
              item === currentPage &&
                'border border-main-color bg-main-color/20 text-text-color shadow-sm shadow-main-color/10 hover:bg-main-color/25 hover:text-text-color',
            )}
            aria-current={item === currentPage ? 'page' : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ) : (
          <span key={item} className='flex size-8 items-center justify-center text-gray-color' aria-hidden='true'>
            …
          </span>
        ),
      )}

      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='size-8 rounded-lg text-gray-color hover:bg-light-gray-2 hover:text-text-color disabled:opacity-35'
        aria-label={nextLabel}
        disabled={currentPage === normalizedTotalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ArrowRight className='size-5' aria-hidden='true' />
      </Button>
    </nav>
  );
}
