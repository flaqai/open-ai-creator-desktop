import { Circle, CircleCheck, LoaderCircle, Music2 } from 'lucide-react';
import type { CanvasNodeData } from '../../types/canvas';
import { selectedMusicResult } from '../../lib/canvas/canvas-music-results';
import { useInfiniteCanvasTranslation } from '../../runtime/i18n/infinite-canvas-translation';
import { CanvasMusicPlayer } from './canvas-music-player';

export function CanvasMusicResultList({ source, results, onSelect, onDurationChange }: {
  readonly source: CanvasNodeData;
  readonly results: readonly CanvasNodeData[];
  readonly onSelect: (resultId: string) => void;
  readonly onDurationChange: (nodeId: string, url: string, durationMs: number) => void;
}) {
  const { t } = useInfiniteCanvasTranslation();
  const selected = selectedMusicResult(source, results);
  return <div className='flex h-full w-full min-h-0 flex-col'>
    {selected && <div className='h-32 shrink-0'><CanvasMusicPlayer node={selected} compact onDurationChange={onDurationChange} /></div>}
    <div className='flex shrink-0 items-center gap-2 px-4 py-2 text-xs text-canvas-text-muted'>
      <span>{t('music.results')}</span><span className='inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-canvas-accent/10 text-[10px] font-medium tabular-nums'>{results.length}</span>
    </div>
    {results.length ? <div data-canvas-no-zoom role='radiogroup' aria-label={t('music.results')} className='custom-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-3'
      onWheel={(event) => event.stopPropagation()} onMouseDown={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()}>
      {results.map((result) => {
        const ready = result.metadata?.status === 'success' && Boolean(result.metadata.content);
        const cover = result.metadata?.coverThumbnailUrl || result.metadata?.coverUrl;
        return <button key={result.id} type='button' role='radio' aria-checked={selected?.id === result.id} disabled={!ready}
          onClick={() => onSelect(result.id)}
          className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-canvas-accent/10 active:bg-canvas-accent/20 focus-visible:outline-2 focus-visible:outline-canvas-accent disabled:cursor-not-allowed ${selected?.id === result.id ? 'bg-canvas-accent/10' : ''}`}>
          {cover ? <img src={cover} alt='' draggable={false} className='size-8 shrink-0 rounded object-cover' /> : <Music2 className='size-8 shrink-0 p-1.5 opacity-50' />}
          <span className='min-w-0 flex-1'><span className='block truncate text-sm'>{result.title || t('canvas.node.audio')}</span>
            <span className='block text-xs opacity-60'>{ready ? (selected?.id === result.id ? t('music.currentAudio') : t('music.ready')) : result.metadata?.status === 'error' ? t('music.resultFailed') : t('music.resultGenerating')}</span>
          </span>
          {ready ? selected?.id === result.id ? <CircleCheck className='size-4 shrink-0' /> : <Circle className='size-4 shrink-0 opacity-50' />
            : result.metadata?.status === 'error' ? null : <LoaderCircle className='size-4 shrink-0 animate-spin' />}
        </button>;
      })}
    </div> : <div className='flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-sm opacity-50'><Music2 className='size-7' />{t('canvas.node.emptyAudio')}</div>}
  </div>;
}
