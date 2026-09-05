'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

type BasePaginationProps = {
  currentPage: number;
  pageSize: number;
  onChange: (page: number) => void;
  total: number;
  className?: string;
};

function ButtonTag({
  className,
  children,
  disabled,
  onClick,
}: {
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 sm:h-9 sm:w-9',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}

function getPageNumbers(currentPage: number, totalPages: number, maxDisplay: number = 7): (number | 'ellipsis')[] {
  if (totalPages <= maxDisplay) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];

  pages.push(1);

  let startPage: number;
  let endPage: number;

  if (maxDisplay === 5) {
    if (currentPage <= 3) {
      startPage = 2;
      endPage = 3;
    } else if (currentPage >= totalPages - 2) {
      pages.push('ellipsis');
      startPage = totalPages - 2;
      endPage = totalPages - 1;
    } else {
      pages.push('ellipsis');
      startPage = currentPage;
      endPage = currentPage;
    }
  } else if (currentPage <= 4) {
    startPage = 2;
    endPage = 5;
  } else if (currentPage >= totalPages - 3) {
    pages.push('ellipsis');
    startPage = totalPages - 4;
    endPage = totalPages - 1;
  } else {
    pages.push('ellipsis');
    startPage = currentPage - 1;
    endPage = currentPage + 1;
  }

  for (let i = startPage; i <= endPage; i += 1) {
    pages.push(i);
  }

  if (endPage < totalPages - 1) {
    pages.push('ellipsis');
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

export default function StatePagination({ currentPage, pageSize, onChange, total, className }: BasePaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  const [maxDisplay, setMaxDisplay] = React.useState(7);

  React.useEffect(() => {
    const updateMaxDisplay = () => {
      setMaxDisplay(window.innerWidth < 640 ? 5 : 7);
    };

    updateMaxDisplay();
    window.addEventListener('resize', updateMaxDisplay);
    return () => window.removeEventListener('resize', updateMaxDisplay);
  }, []);

  const pageNumbers = getPageNumbers(currentPage, totalPages, maxDisplay);

  const handlePrev = () => {
    if (currentPage > 1) {
      onChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onChange(currentPage + 1);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <ButtonTag
        disabled={currentPage <= 1}
        onClick={handlePrev}
        className={cn('bg-white/10 text-white/70', currentPage <= 1 ? 'cursor-not-allowed' : 'hover:bg-white/15')}
      >
        <ChevronLeft className='size-4 sm:size-5' />
      </ButtonTag>

      {pageNumbers.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className='flex h-8 w-8 items-center justify-center text-white/40 sm:h-9 sm:w-9'
            >
              ...
            </span>
          );
        }

        const isActive = page === currentPage;
        return (
          <ButtonTag
            key={page}
            onClick={() => onChange(page)}
            className={cn(
              isActive ? 'bg-white/20 font-semibold text-white' : 'bg-white/10 text-white/70 hover:bg-white/15',
            )}
          >
            {page}
          </ButtonTag>
        );
      })}

      <ButtonTag
        disabled={currentPage >= totalPages}
        onClick={handleNext}
        className={cn(
          'bg-white/10 text-white/70',
          currentPage >= totalPages ? 'cursor-not-allowed' : 'hover:bg-white/15',
        )}
      >
        <ChevronRight className='size-4 sm:size-5' />
      </ButtonTag>
    </div>
  );
}
