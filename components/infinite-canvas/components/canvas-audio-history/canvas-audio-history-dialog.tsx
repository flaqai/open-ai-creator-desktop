import { CanvasAudioHistoryStatus } from './canvas-audio-history-status';
import { CanvasAudioHistoryColumns } from './canvas-audio-history-columns';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import type { InfiniteCanvasAudioHistory, InfiniteCanvasAudioHistoryItem } from '../../infinite-canvas.types';
import { useInfiniteCanvasTranslation } from '../../runtime/i18n/infinite-canvas-translation';
import { Modal, Button } from '../../runtime/ui/source-ui';
import { CanvasMusicPlayer } from '../canvas/canvas-music-player';
import { CanvasNodeType, type CanvasNodeData } from '../../types/canvas';

const pageSize = 42;

export function CanvasAudioHistoryDialog({ history, onClose, onSelect, onError }: {
  readonly history: InfiniteCanvasAudioHistory;
  readonly onClose: () => void;
  readonly onSelect: (item: InfiniteCanvasAudioHistoryItem) => void;
  readonly onError?: (error: unknown, operation: string) => void;
}) {
  const { t } = useInfiniteCanvasTranslation();
  const [defaultColumns, setDefaultColumns] = useState(2);
  const [desktopColumns, setDesktopColumns] = useState<number | null>(null);
  const [mobileColumns, setMobileColumns] = useState(2);
  const [mobile, setMobile] = useState(false);
  const columns = mobile ? mobileColumns : desktopColumns ?? defaultColumns;
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1536px)');
    const small = window.matchMedia('(max-width: 1023px)');
    const update = () => { setDefaultColumns(wide.matches ? 3 : 2); setMobile(small.matches); };
    update();
    wide.addEventListener('change', update);
    small.addEventListener('change', update);
    return () => { wide.removeEventListener('change', update); small.removeEventListener('change', update); };
  }, []);
  const [page, setPage] = useState(1);
  const [inputPage, setInputPage] = useState('1');
  const [attempt, setAttempt] = useState(0);
  const [items, setItems] = useState<readonly InfiniteCanvasAudioHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => { setInputPage(String(page)); }, [page]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const submitPage = () => {
    const value = Number(inputPage);
    if (!inputPage.trim() || !Number.isInteger(value)) { setInputPage(String(page)); return; }
    const target = Math.min(Math.max(value, 1), totalPages);
    setInputPage(String(target));
    setPage(target);
  };
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setFailed(false);
    void history.loadPage({ page, pageSize, signal: controller.signal }).then((result) => {
      if (controller.signal.aborted) return;
      setItems(result.items);
      setTotal(result.total);
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      setFailed(true);
      onError?.(error, 'audio-history');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [history.loadPage, page, attempt, onError]);
  return <Modal open className='canvas-audio-history-dialog' title={t('music.history.title')} onCancel={onClose} width={1200} footer={null} styles={{ header: { padding: 12 }, body: { overflow: 'hidden', padding: 12 } }}>
    <div className='flex min-h-0 flex-col gap-3'>
      <style>{`
        .canvas-audio-history-dialog { background-color: #000; }
        .canvas-audio-history-footer { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 8px; }
        .canvas-audio-history-pagination { grid-column: 2; }
        .canvas-audio-history-footer { --ui-canvas-border: #333; }
        .canvas-audio-history-pagination button, .canvas-audio-history-pagination input, .canvas-audio-history-columns { background-color: #141414; border: 1px solid #333; }
        .canvas-audio-history-pagination button { transition: background-color 150ms; }
        .canvas-audio-history-pagination button:hover:not(:disabled) { background-color: #262626; }
        .canvas-audio-history-pagination button:active:not(:disabled) { background-color: #333; }
        .canvas-audio-history-pagination input:focus { border-color: var(--ui-canvas-accent); }

        @media (max-width: 600px) {
          .canvas-audio-history-footer { display: flex; justify-content: space-between; }
          .canvas-audio-history-footer [data-slot="slider"] { width: 48px; }
          .canvas-audio-history-pagination { gap: 4px; }
          .canvas-audio-history-pagination input { width: 44px; }
        }
        .canvas-audio-history-item { container-type: inline-size; --ui-canvas-border: #333; background-color: #141414; border-color: #333; }
        .canvas-audio-history-preview > div { padding: 0; }
        .canvas-audio-history-preview > div > div { height: 100%; gap: 0; }
        .canvas-audio-history-preview > div > div > div:first-child { width: 88px !important; height: 88px !important; border-radius: 0; background: transparent !important; }
        .canvas-audio-history-preview > div > div > div:last-child { padding: 0 8px; }
        .canvas-audio-history-preview > div > div > div:first-child, .canvas-audio-history-status-icon { border-right: 1px solid var(--ui-canvas-border); }
        .canvas-audio-history-use { width: 48px; align-self: stretch; border-left: 1px solid var(--ui-canvas-border); background: transparent; transition: background-color 150ms, color 150ms; }
        .canvas-audio-history-use:hover:not(:disabled) { background: color-mix(in srgb, var(--ui-canvas-text, var(--ui-text-color)) 16%, transparent); }
        .canvas-audio-history-use:active:not(:disabled) { background: color-mix(in srgb, var(--ui-canvas-text, var(--ui-text-color)) 24%, transparent); }
        .canvas-audio-history-use:focus-visible { outline: 2px solid var(--ui-canvas-accent, var(--ui-text-color)); outline-offset: -3px; }
        .canvas-audio-history-pagination button, .canvas-audio-history-pagination input { height: 36px; box-sizing: border-box; }
        .canvas-audio-history-pagination button { width: 40px; padding: 0; }
        @container (max-width: 300px) {
          .canvas-audio-history-item > div, .canvas-audio-history-preview { height: 108px !important; }
          .canvas-audio-history-preview > div { padding: 0; }
          .canvas-audio-history-preview > div > div { gap: 0; }
          .canvas-audio-history-preview > div > div > div:first-child { width: 108px !important; height: 108px !important; }
          .canvas-audio-history-status-icon { width: 108px !important; }
          .canvas-audio-history-preview .tabular-nums { flex-wrap: wrap; gap: 2px; font-size: 10px; }
          .canvas-audio-history-use { width: 32px; font-size: 10px; }
        }
      `}</style>
      <div className='custom-scrollbar overflow-y-auto' style={{ height: '55vh', flexShrink: 0 }}>
        {loading ? <div className='flex h-full items-center justify-center' role='status' aria-label={t('music.history.loading')}><LoaderCircle className='size-6 animate-spin' /></div>
          : failed ? <div className='flex h-full flex-col items-center justify-center gap-3' role='alert'><span>{t('music.history.failed')}</span><Button onClick={() => setAttempt((value) => value + 1)}>{t('music.history.retry')}</Button></div>
          : !items.length ? <div className='flex h-full items-center justify-center opacity-60'>{t('music.history.empty')}</div>
          : <div className='grid gap-2' style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{items.map((item) => {
            const ready = item.available && Boolean(item.url);
            const preview: CanvasNodeData = { id: item.id, type: CanvasNodeType.Audio, title: item.title, width: 400, height: 128, position: { x: 0, y: 0 }, metadata: { content: ready ? item.url : '', durationMs: item.durationMs, coverUrl: item.coverUrl, coverThumbnailUrl: item.coverThumbnailUrl } };
            return <div key={item.id} className='canvas-audio-history-item min-w-0 overflow-hidden rounded-xl border border-canvas-border bg-canvas-surface'><div className='flex items-stretch' style={{ height: 88 }}>
              <div className='canvas-audio-history-preview min-w-0 flex-1' style={{ height: 88 }}>{ready ? <CanvasMusicPlayer node={preview} compact dense /> : <CanvasAudioHistoryStatus item={item} />}</div>
              <button type='button' disabled={!ready} title={t(ready ? 'music.history.use' : 'music.history.unavailable')} onClick={() => onSelect(item)} className='canvas-audio-history-use shrink-0 cursor-pointer text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40'>{t('music.history.use')}</button>
            </div></div>;
          })}</div>}
      </div>
      <div className='canvas-audio-history-footer'>
      <div className='canvas-audio-history-pagination flex items-center justify-center gap-2'>
        <Button aria-label={t('music.history.previous')} disabled={loading || page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft className='size-4' /></Button>
        <input type='number' min={1} max={totalPages} aria-label={t('music.history.page')} value={inputPage} disabled={loading}
          onChange={(event) => setInputPage(event.target.value)} onBlur={submitPage}
          onKeyDown={(event) => { if (event.key === 'Enter') { submitPage(); event.currentTarget.blur(); } }}
          className='h-9 w-16 rounded-md border border-canvas-border bg-transparent px-2 text-center text-sm outline-none focus:border-canvas-accent'
        />
        <span className='text-xs tabular-nums opacity-60'>/ {totalPages}</span>
        <Button aria-label={t('music.history.next')} disabled={loading || failed || page * pageSize >= total} onClick={() => setPage((value) => value + 1)}><ChevronRight className='size-4' /></Button>
      </div>
      <div style={{ justifySelf: 'end' }}><CanvasAudioHistoryColumns columns={columns} onChange={mobile ? setMobileColumns : setDesktopColumns} /></div>
      </div>
    </div>
  </Modal>;
}
