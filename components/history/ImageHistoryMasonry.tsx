'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Masonry } from 'react-plock';

import { cn } from '@/lib/utils';
import StatePagination from '@/components/page/StatePagination';
import Spinning from '@/components/Spinning';

interface ImageHistoryItem {
  id: number | string;
  url: string;
  thumbnailUrl?: string;
}

interface ImageHistoryMasonryProps {
  imageHistory: ImageHistoryItem[] | undefined;
  total: number;
  isLoading: boolean;
  pageNum: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onImageSelect?: (imageUrl: string) => void;
  confirmButtonText?: string;
  emptyStateConfig?: {
    message: string;
    linkHref: string;
    linkText: string;
  };
}

export default function ImageHistoryMasonry({
  imageHistory,
  total,
  isLoading,
  pageNum,
  pageSize = 30,
  onPageChange,
  onImageSelect,
  confirmButtonText,
  emptyStateConfig,
}: ImageHistoryMasonryProps) {
  const t = useTranslations('components.image-form.upload-dialog');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl((prev) => (prev === imageUrl ? null : imageUrl));
  };

  const handleConfirm = () => {
    if (selectedImageUrl && onImageSelect) {
      onImageSelect(selectedImageUrl);
      setSelectedImageUrl(null);
    }
  };

  const defaultEmpty = {
    message: t('no-images'),
    linkHref: '/text-to-image',
    linkText: t('go-generate'),
  };

  const emptyConfig = emptyStateConfig || defaultEmpty;

  return (
    <div className='bg-card flex flex-1 flex-col overflow-hidden rounded-2xl p-3 sm:rounded-3xl sm:p-3.5'>
      <div className='custom-scrollbar relative flex-1 overflow-y-auto'>
        {(() => {
          if (!imageHistory || imageHistory.length === 0) {
            if (isLoading) {
              return (
                <div className='flex h-full items-center justify-center'>
                  <div className='text-foreground/60'>{t('loading')}</div>
                </div>
              );
            }

            return (
              <div className='flex h-full flex-col items-center justify-center rounded-lg'>
                <div className='text-foreground/70 mb-6 text-base md:text-lg'>{emptyConfig.message}</div>
                <Link
                  href={emptyConfig.linkHref}
                  className='bg-color-main text-primary-foreground rounded-lg px-10 py-3 text-base font-medium transition-all hover:scale-[1.02] hover:shadow-lg md:px-12 md:py-4'
                >
                  {emptyConfig.linkText}
                </Link>
              </div>
            );
          }

          return (
            <>
              <Masonry
                items={imageHistory}
                config={{
                  columns: [2, 3, 4, 5],
                  gap: [6, 8, 10, 12],
                  media: [480, 768, 1024, 1280],
                }}
                render={(image) => (
                  <button
                    type='button'
                    key={image.id}
                    onClick={() => handleImageClick(image.url)}
                    className={cn(
                      'group relative w-full overflow-hidden rounded-lg border-2 transition-all hover:shadow-lg active:scale-95',
                      selectedImageUrl === image.url
                        ? 'border-color-main'
                        : 'hover:border-color-main/50 border-transparent',
                    )}
                  >
                    <div className='relative overflow-hidden rounded-lg'>
                      <img
                        src={image.thumbnailUrl || image.url}
                        alt='History'
                        className='h-auto w-full object-cover transition-transform group-hover:scale-105'
                        loading='lazy'
                      />
                      <div
                        className={cn(
                          'absolute inset-0 transition-colors',
                          selectedImageUrl === image.url ? 'bg-black/20' : 'bg-black/0 group-hover:bg-black/5',
                        )}
                      />
                      {selectedImageUrl === image.url && (
                        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                          <div className='text-color-main bg-foreground flex size-12 items-center justify-center rounded-full shadow-lg'>
                            <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className='size-8'>
                              <path
                                d='M20 6L9 17L4 12'
                                stroke='currentColor'
                                strokeWidth='3'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                )}
              />
              {isLoading && (
                <div className='bg-card/80 absolute inset-0 flex items-center justify-center'>
                  <Spinning className='size-8' />
                </div>
              )}
            </>
          );
        })()}
      </div>

      {total > 0 && (
        <div className='border-foreground/10 mt-3 flex shrink-0 flex-col items-center gap-3 border-t pt-3 sm:mt-4 sm:gap-4 sm:pt-4 lg:flex-row lg:gap-0'>
          <div className='flex w-full justify-center lg:flex-1'>
            <StatePagination currentPage={pageNum} pageSize={pageSize} onChange={onPageChange} total={total} />
          </div>
          {confirmButtonText && onImageSelect && (
            <div className='flex w-full justify-center lg:w-auto lg:min-w-[140px] lg:justify-end'>
              <button
                type='button'
                onClick={handleConfirm}
                disabled={!selectedImageUrl}
                className='bg-color-main text-primary-foreground w-full rounded-lg px-6 py-2.5 text-sm font-medium transition-all hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8 sm:py-3'
              >
                {confirmButtonText}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
