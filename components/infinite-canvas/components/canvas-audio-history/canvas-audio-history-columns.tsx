import { ZoomIn, ZoomOut } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useInfiniteCanvasTranslation } from '../../runtime/i18n/infinite-canvas-translation';

export function CanvasAudioHistoryColumns({ columns, onChange }: { readonly columns: number; readonly onChange: (columns: number) => void }) {
  const { t } = useInfiniteCanvasTranslation();
  return <div className='canvas-audio-history-columns flex h-9 items-center gap-2 rounded-md bg-canvas-surface px-2'>
    <button type='button' aria-label={t('music.history.increaseCardSize')} disabled={columns <= 1} onClick={() => onChange(Math.max(1, columns - 1))} className='cursor-pointer transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40'><ZoomIn className='size-4' /></button>
    <Slider min={1} max={5} step={1} value={[columns]} onValueChange={([value]) => onChange(value ?? columns)} aria-label={t('music.history.cardSize')}
      className='w-20 cursor-pointer' trackClassName='h-0.5 bg-canvas-border' rangeClassName='bg-canvas-accent' thumbClassName='size-2.5 border-0 bg-canvas-accent' />
    <button type='button' aria-label={t('music.history.decreaseCardSize')} disabled={columns >= 5} onClick={() => onChange(Math.min(5, columns + 1))} className='cursor-pointer transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40'><ZoomOut className='size-4' /></button>
  </div>;
}
