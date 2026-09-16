'use client';

import { useState } from 'react';
import { Check, Copy, Download, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import useCopyToClipboard from '@/hooks/useCopyToClipboard';
import ImageExpiredIcon from '@/components/svg/image/ImageExpiredIcon';

// Image expired placeholder component
export function ImageExpiredPlaceholder({
  className = '',
  iconClassName = 'h-6 w-6',
  textClassName = 'text-xs',
  translationKey = 'Profile.image-history.detail',
}: {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  translationKey?: string;
}) {
  const t = useTranslations(translationKey);

  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-1 px-2 ${className}`}>
      <ImageExpiredIcon className={`text-muted-foreground ${iconClassName}`} />
      <span className={`text-muted-foreground text-center ${textClassName}`}>{t('expiredImage')}</span>
    </div>
  );
}

// Metadata item type
export interface MetadataItem {
  label: string;
  value: string | number;
}

// Metadata row component
export function MetadataRow({ items }: { items: MetadataItem[] }) {
  return (
    <div className='flex flex-wrap items-center gap-2 text-sm leading-[22px]'>
      {items.map((item, index) => (
        <span key={index}>
          <span className='text-muted-foreground'>{item.label}：</span>
          <span className='text-muted-foreground'>{item.value}</span>
        </span>
      ))}
    </div>
  );
}

// Model tag component
export function ModelTag({ modelName }: { modelName?: string }) {
  if (!modelName) return null;

  return (
    <div className='border-primary/25 bg-primary/10 inline-flex w-fit items-center rounded-lg border px-3 py-1.5'>
      <span className='text-primary text-sm leading-[22px] font-medium capitalize'>{modelName}</span>
    </div>
  );
}

// Prompt section component
export function PromptSection({
  prompt,
  translationKey = 'Profile.image-history.detail',
}: {
  prompt?: string;
  translationKey?: string;
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const t = useTranslations(translationKey);

  if (!prompt) return null;

  return (
    <div className='custom-scrollbar flex flex-col gap-3'>
      <div className='flex items-center gap-2'>
        <p className='text-foreground text-base leading-6'>{t('prompt')}</p>
        <button
          type='button'
          onClick={() => copyToClipboard(prompt)}
          className='hover:bg-foreground/10 flex h-6 w-6 cursor-pointer items-center justify-center rounded transition-colors'
          title={isCopied ? t('copied') : t('copyPrompt')}
        >
          {isCopied ? (
            <Check className='text-foreground/70 h-4 w-4' />
          ) : (
            <Copy className='text-foreground/70 h-4 w-4' />
          )}
        </button>
      </div>
      <div className='border-border bg-card rounded-lg border p-2'>
        <p className='text-muted-foreground text-sm leading-[22px]'>{prompt}</p>
      </div>
    </div>
  );
}

// Copyright text component
export function CopyrightText({ translationKey = 'Profile.image-history.detail' }: { translationKey?: string }) {
  const t = useTranslations('Common.copy-right');
  return (
    <p className='text-muted-foreground text-sm leading-[22px]'>
      <span className='font-medium'>{t('title')}</span> {t('content')}
    </p>
  );
}

// Bottom action button container
export function ModalActions({ children }: { children: React.ReactNode }) {
  return <div className='border-border flex shrink-0 items-center gap-2 border-t p-3'>{children}</div>;
}

// Action button group (left side)
export function ActionButtonGroup({ children }: { children: React.ReactNode }) {
  return <div className='flex shrink-0 gap-2'>{children}</div>;
}

// Download button
export function DownloadButton({ onClick, disabled = false }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className='bg-card hover:bg-card flex aspect-square h-[42px] items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50'
    >
      <Download className='text-foreground h-5 w-5' />
    </button>
  );
}

// Delete button
export function DeleteButton({ onClick, disabled = false }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className='group bg-card flex aspect-square h-[42px] cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50'
    >
      <Trash2 className='text-foreground h-[18px] w-4 transition-colors group-hover:text-red-500' />
    </button>
  );
}

// Modal header
export function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className='border-border flex shrink-0 items-center justify-between border-b p-3'>
      <h2 className='text-foreground text-2xl leading-8 font-medium capitalize'>{title}</h2>
      <button
        type='button'
        onClick={onClose}
        className='hover:bg-foreground/10 flex h-9 w-9 items-center justify-center rounded-[3px] transition-colors'
      >
        <svg className='text-foreground h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
        </svg>
      </button>
    </div>
  );
}

// Scrollable content area
export function ScrollableContent({ children }: { children: React.ReactNode }) {
  return <div className='custom-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto p-3'>{children}</div>;
}

// Media grid component (for Images and Frames)
export function MediaGrid({
  title,
  mediaUrls,
  expiredIndices = [],
  onDownloadAll,
  downloadButtonTitle,
  columns = 5,
  itemHeight = 'h-20',
  translationKey = 'Profile.image-history.detail',
}: {
  title: string;
  mediaUrls: (string | null)[];
  expiredIndices?: number[];
  onDownloadAll?: () => void;
  downloadButtonTitle?: string;
  columns?: number;
  itemHeight?: string;
  translationKey?: string;
}) {
  const t = useTranslations(translationKey);
  const [failedIndices, setFailedIndices] = useState<number[]>([]);

  const handleImageError = (index: number) => {
    setFailedIndices((prev) => {
      if (!prev.includes(index)) {
        return [...prev, index];
      }
      return prev;
    });
  };

  if (!mediaUrls || mediaUrls.length === 0) return null;

  const getGridColsClass = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-4';
      case 5:
        return 'grid-cols-5';
      default:
        return 'grid-cols-5';
    }
  };

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <p className='text-foreground text-base leading-6'>{title}</p>
        {onDownloadAll && (
          <button
            type='button'
            onClick={onDownloadAll}
            className='hover:bg-foreground/10 flex h-6 w-6 cursor-pointer items-center justify-center rounded transition-colors'
            title={downloadButtonTitle}
          >
            <Download className='text-foreground/70 h-4 w-4' />
          </button>
        )}
      </div>
      <div className={`grid ${getGridColsClass()} gap-2`}>
        {mediaUrls.map((url, index) => {
          const isExpired = !url || expiredIndices.includes(index) || failedIndices.includes(index);
          const widthClass = itemHeight.includes('aspect-square') ? '' : 'w-full';

          return (
            <div key={index} className={`relative ${itemHeight} ${widthClass} bg-card overflow-hidden rounded`}>
              {isExpired ? (
                <ImageExpiredPlaceholder translationKey={translationKey} />
              ) : (
                <img
                  src={url!}
                  alt={`${title} ${index + 1}`}
                  className='h-full w-full object-contain'
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  onError={() => handleImageError(index)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
