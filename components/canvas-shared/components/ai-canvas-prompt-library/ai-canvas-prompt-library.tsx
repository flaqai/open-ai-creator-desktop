'use client';

import { useTranslations } from 'next-intl';

import { useDeferredValue, useId, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { STORE_PREFIX } from '@/lib/constants/config';
import { Input } from '@/components/ui/input';
import { TooltipProvider } from '@/components/ui/tooltip';
import type {
  AiCanvasPromptLibraryProps,
  PromptLibraryItem,
  PromptLibraryMode,
  PromptLibrarySource,
} from '@/components/canvas-shared/components/ai-canvas-prompt-library/ai-canvas-prompt-library.types';
import { PromptLibraryDialog } from '@/components/canvas-shared/components/ai-canvas-prompt-library/prompt-library-dialog';
import { PromptSourceGroup } from '@/components/canvas-shared/components/ai-canvas-prompt-library/prompt-source-group';
import { PROMPT_LIBRARY_SOURCES } from '@/components/canvas-shared/components/ai-canvas-prompt-library/prompt-source-loaders';
import { createPromptSourceStore, usePromptSourceStore } from '@/components/canvas-shared/components/ai-canvas-prompt-library/use-prompt-source-store';

const PROMPT_SOURCE_STORE_KEY = `${STORE_PREFIX}:ai-canvas-prompt-library:v1`;

export function AiCanvasPromptLibrary(props: AiCanvasPromptLibraryProps) {
  const mode = props.mode ?? 'sidebar';
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { gcTime: Number.POSITIVE_INFINITY, retry: false, staleTime: Number.POSITIVE_INFINITY },
        },
      }),
  );
  const [sourceStore] = useState(() => createPromptSourceStore({ persistKey: PROMPT_SOURCE_STORE_KEY }));
  const sourcePreferences = usePromptSourceStore(sourceStore, (state) => state.sources);
  const enabledSourceIds =
    props.enabledSourceIds ?? sourcePreferences.filter((source) => source.enabled).map((source) => source.id);
  const enabledSourceSet = useMemo(() => new Set(enabledSourceIds), [enabledSourceIds]);
  const sources = useMemo(
    () => PROMPT_LIBRARY_SOURCES.filter((source) => enabledSourceSet.has(source.id)),
    [enabledSourceSet],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {mode === 'dialog' ? (
          <DialogPromptLibrary sources={sources} onSelectPrompt={props.onSelectPrompt} />
        ) : (
          <PromptLibraryPanel mode='sidebar' sources={sources} onAction={props.onInsertPrompt} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function DialogPromptLibrary({
  onSelectPrompt,
  sources,
}: {
  readonly onSelectPrompt?: (prompt: PromptLibraryItem) => void;
  readonly sources: readonly PromptLibrarySource[];
}) {
  const [open, setOpen] = useState(false);
  const selectPrompt = (prompt: PromptLibraryItem) => {
    onSelectPrompt?.(prompt);
    setOpen(false);
  };
  return (
    <PromptLibraryDialog open={open} onOpenChange={setOpen}>
      <PromptLibraryPanel mode='dialog' sources={sources} onAction={selectPrompt} />
    </PromptLibraryDialog>
  );
}

function PromptLibraryPanel({
  mode,
  onAction,
  sources,
}: {
  readonly mode: PromptLibraryMode;
  readonly onAction?: (prompt: PromptLibraryItem) => void;
  readonly sources: readonly PromptLibrarySource[];
}) {
  const t = useTranslations('InfiniteCanvas.promptLibrary');
  const [keyword, setKeyword] = useState('');
  const searchId = useId();
  const deferredKeyword = useDeferredValue(keyword);
  const [expanded, setExpanded] = useState<Readonly<Record<string, boolean>>>({});

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col',
        mode === 'sidebar' ? 'bg-transparent text-canvas-text' : 'bg-background text-foreground',
      )}
      data-ai-canvas-prompt-library={mode}
    >
      <label htmlFor={searchId} className='relative mx-3 mb-2 block'>
        <Search
          className={cn(
            'pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2',
            mode === 'sidebar' ? 'text-canvas-muted' : 'text-muted-foreground',
          )}
        />
        <span className='sr-only'>{t('search')}</span>
        <Input
          id={searchId}
          type='search'
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder={t('search')}
          className={cn(
            'pl-9',
            mode === 'sidebar'
              ? 'border-canvas-border bg-canvas-surface text-canvas-text placeholder:text-canvas-muted'
              : 'border-border',
          )}
        />
      </label>
      <div className='min-h-0 flex-1 custom-scrollbar overflow-y-auto px-2 pb-3'>
        {sources.length ? (
          <div className='space-y-1'>
            {sources.map((source) => (
              <PromptSourceGroup
                key={source.id}
                source={source}
                keyword={deferredKeyword}
                mode={mode}
                open={expanded[source.id] === true}
                onToggle={() => setExpanded((current) => ({ ...current, [source.id]: current[source.id] !== true }))}
                onAction={onAction}
              />
            ))}
          </div>
        ) : (
          <div
            className={cn(
              'grid h-36 place-items-center text-sm',
              mode === 'sidebar' ? 'text-canvas-muted' : 'text-muted-foreground',
            )}
          >
            {t('noSources')}
          </div>
        )}
      </div>
    </div>
  );
}
