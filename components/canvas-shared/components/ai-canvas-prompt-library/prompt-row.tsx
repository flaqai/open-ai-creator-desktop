'use client';

import { useTranslations } from 'next-intl';

import { useState } from 'react';
import { Check, Copy, Eye, FileText, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { PromptLibraryItem, PromptLibraryMode } from '@/components/canvas-shared/components/ai-canvas-prompt-library/ai-canvas-prompt-library.types';

export function PromptRow({
  item,
  mode,
  onAction,
}: {
  readonly item: PromptLibraryItem;
  readonly mode: PromptLibraryMode;
  readonly onAction?: (item: PromptLibraryItem) => void;
}) {
  const t = useTranslations('InfiniteCanvas.promptLibrary');
  const [copied, setCopied] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const tooltipClassName = mode === 'sidebar' ? 'border-canvas-border bg-canvas-panel text-canvas-text' : undefined;

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(item.prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article
      className={cn(
        'rounded-lg border transition-colors',
        mode === 'sidebar'
          ? 'border-transparent bg-transparent text-canvas-text hover:bg-canvas-surface'
          : 'border-border bg-card text-card-foreground hover:bg-accent/40',
      )}
    >
      <div className='flex items-center gap-2.5 p-2'>
        {item.coverUrl ? (
          <img src={item.coverUrl} alt='' className='size-12 shrink-0 rounded-md object-cover' loading='lazy' />
        ) : (
          <span
            className={cn(
              'grid size-12 shrink-0 place-items-center rounded-md',
              mode === 'sidebar' ? 'bg-canvas-panel' : 'bg-muted',
            )}
          >
            <FileText className={cn('size-4', mode === 'sidebar' ? 'text-canvas-muted' : 'text-muted-foreground')} />
          </span>
        )}
        <button
          type='button'
          className='min-w-0 flex-1 text-left'
          onClick={() => setDetailsOpen((current) => !current)}
        >
          <span className='block truncate text-sm font-medium'>{item.title}</span>
          <span
            className={cn(
              'mt-0.5 block line-clamp-2 text-xs leading-snug',
              mode === 'sidebar' ? 'text-canvas-muted' : 'text-muted-foreground',
            )}
          >
            {item.prompt}
          </span>
        </button>
        <div className='flex shrink-0 items-center gap-1'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className={cn('size-8', mode === 'sidebar' && 'hover:bg-canvas-muted-accent/10 hover:text-canvas-text')}
                onClick={() => setDetailsOpen((current) => !current)}
                aria-label={t('viewDetails')}
              >
                <Eye className='size-3.5' />
              </Button>
            </TooltipTrigger>
            <TooltipContent data-canvas-overlay={mode === 'sidebar' ? true : undefined} className={tooltipClassName}>
              {t('viewDetails')}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className={cn('size-8', mode === 'sidebar' && 'hover:bg-canvas-muted-accent/10 hover:text-canvas-text')}
                onClick={() => void copyPrompt()}
                aria-label={t('copy')}
              >
                {copied ? <Check className='size-3.5' /> : <Copy className='size-3.5' />}
              </Button>
            </TooltipTrigger>
            <TooltipContent data-canvas-overlay={mode === 'sidebar' ? true : undefined} className={tooltipClassName}>
              {copied ? t('copied') : t('copy')}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className={cn(
                  'size-8',
                  mode === 'sidebar'
                    ? 'text-canvas-accent hover:bg-canvas-muted-accent/10 hover:text-canvas-accent'
                    : 'text-primary',
                )}
                onClick={() => onAction?.(item)}
                aria-label={mode === 'sidebar' ? t('add') : t('select')}
              >
                {mode === 'sidebar' ? <Plus className='size-4' /> : <Check className='size-4' />}
              </Button>
            </TooltipTrigger>
            <TooltipContent data-canvas-overlay={mode === 'sidebar' ? true : undefined} className={tooltipClassName}>
              {mode === 'sidebar' ? t('add') : t('select')}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div
        className={cn(
          'border-t px-3 py-3',
          mode === 'sidebar' ? 'border-canvas-border' : 'border-border',
          detailsOpen ? 'block' : 'hidden',
        )}
      >
        <p className='whitespace-pre-wrap text-sm leading-6'>{item.prompt}</p>
        {item.tags.length ? (
          <div className='mt-3 flex flex-wrap gap-1.5'>
            {item.tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs',
                  mode === 'sidebar' ? 'bg-canvas-surface text-canvas-muted' : 'bg-muted text-muted-foreground',
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
