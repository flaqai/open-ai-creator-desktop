'use client';

import { useTranslations } from 'next-intl';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronRight, LoaderCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { PromptLibraryItem, PromptLibraryMode, PromptLibrarySource } from '@/components/canvas-shared/components/ai-canvas-prompt-library/ai-canvas-prompt-library.types';
import { PromptRow } from '@/components/canvas-shared/components/ai-canvas-prompt-library/prompt-row';
import { loadPromptSource } from '@/components/canvas-shared/components/ai-canvas-prompt-library/prompt-source-loaders';

export function PromptSourceGroup({
  keyword,
  mode,
  onAction,
  onToggle,
  open,
  source,
}: {
  readonly keyword: string;
  readonly mode: PromptLibraryMode;
  readonly onAction?: (item: PromptLibraryItem) => void;
  readonly onToggle: () => void;
  readonly open: boolean;
  readonly source: PromptLibrarySource;
}) {
  const t = useTranslations('InfiniteCanvas.promptLibrary');
  const normalizedKeyword = keyword.trim().toLowerCase();
  const showResults = open || normalizedKeyword.length > 0;
  const query = useQuery({
    queryKey: ['ai-canvas-prompt-library', source.id],
    queryFn: () => loadPromptSource(source.id),
    enabled: showResults,
    gcTime: Number.POSITIVE_INFINITY,
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  });
  const filtered = useMemo<readonly PromptLibraryItem[]>(() => {
    const items: readonly PromptLibraryItem[] = query.data ?? [];
    if (!normalizedKeyword) return items;
    return items.filter((item) =>
      [item.title, item.prompt, item.description, item.author, ...item.tags]
        .join(' ')
        .toLowerCase()
        .includes(normalizedKeyword),
    );
  }, [normalizedKeyword, query.data]);

  return (
    <section data-source-id={source.id}>
      <button
        type='button'
        onClick={onToggle}
        className={cn(
          'flex w-full items-center gap-1.5 rounded-md px-1.5 py-2 text-left text-xs font-semibold transition',
          mode === 'sidebar'
            ? 'text-canvas-text opacity-75 hover:bg-canvas-surface hover:opacity-100'
            : 'text-foreground/75 hover:bg-accent hover:text-foreground',
        )}
        aria-expanded={showResults}
      >
        <ChevronRight className={cn('size-3.5 transition-transform', showResults && 'rotate-90')} />
        <BookOpen className='size-3.5' />
        <span className='min-w-0 flex-1 truncate'>{source.name}</span>
        {showResults && query.isSuccess ? (
          <span className={cn(mode === 'sidebar' ? 'text-canvas-muted' : 'text-muted-foreground')}>
            {filtered.length}
          </span>
        ) : null}
      </button>
      {showResults ? (
        <div className='space-y-2 px-1 pb-3 pt-1'>
          {query.isPending ? (
            <output
              className={cn(
                'flex items-center justify-center gap-2 py-6 text-xs',
                mode === 'sidebar' ? 'text-canvas-muted' : 'text-muted-foreground',
              )}
            >
              <LoaderCircle className='size-4 animate-spin' /> {t('loading')}
            </output>
          ) : query.isError ? (
            <div className='rounded-md border border-destructive/30 bg-destructive/5 p-3 text-center text-xs text-destructive'>
              <p>{t('loadError')}</p>
              <Button type='button' variant='ghost' size='sm' className='mt-1' onClick={() => void query.refetch()}>
                {t('retry')}
              </Button>
            </div>
          ) : filtered.length ? (
            filtered.map((item) => <PromptRow key={item.id} item={item} mode={mode} onAction={onAction} />)
          ) : (
            <div
              className={cn(
                'py-5 text-center text-xs',
                mode === 'sidebar' ? 'text-canvas-muted' : 'text-muted-foreground',
              )}
            >
              {normalizedKeyword ? t('noMatches') : t('empty')}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
