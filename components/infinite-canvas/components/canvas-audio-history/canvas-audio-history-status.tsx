import { CircleAlert, LoaderCircle, Music2 } from 'lucide-react';
import type { InfiniteCanvasAudioHistoryItem } from '../../infinite-canvas.types';
import { useInfiniteCanvasTranslation } from '../../runtime/i18n/infinite-canvas-translation';

export function CanvasAudioHistoryStatus({ item }: { readonly item: InfiniteCanvasAudioHistoryItem }) {
  const { t } = useInfiniteCanvasTranslation();
  const failed = item.status === 'failed';
  const processing = item.status === 'processing';
  const label = t(failed ? 'music.resultFailed' : processing ? 'music.resultGenerating' : 'music.history.unavailable');
  return <div className='canvas-audio-history-status flex h-full min-w-0'>
    <div className='canvas-audio-history-status-icon flex h-full shrink-0 items-center justify-center' style={{ width: 88 }}>
      {failed ? <CircleAlert className='size-6 text-red-300/50' /> : processing ? <LoaderCircle className='size-7 animate-spin opacity-60' /> : <Music2 className='size-7 opacity-60' />}
    </div>
    <div className='flex min-w-0 flex-1 flex-col gap-1 px-2 py-2'>
      <p className='flex h-6 min-w-0 items-center text-sm font-medium'><span className='truncate'>{item.title || label}</span></p>
      {item.title && <p className='truncate text-sm opacity-60'>{label}</p>}
    </div>
  </div>;
}
