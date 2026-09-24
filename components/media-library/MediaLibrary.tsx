'use client';

import { contextActions } from '@/lib/desktop/context-actions';
import { mediaContextActions } from '@/lib/desktop/media-context-actions';

import { useDeferredValue, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Cloud,
  FileText,
  FolderOpen,
  HardDrive,
  Image as ImageIcon,
  LibraryBig,
  Music2,
  Play,
  Search,
  Sparkles,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

import { beginHistoryImageDrag, endHistoryImageDrag } from '@/lib/desktop/image-history-drag';
import { removeMediaCatalogItem, type MediaLibraryItem } from '@/lib/desktop/media-library';
import { cn } from '@/lib/utils';
import useMediaCatalog from '@/hooks/use-media-library';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogPortal } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import useVideoHistoryCover from '@/components/unified-generator/useVideoHistoryCover';

const ImageDetailModal = dynamic(() => import('@/components/dialog/ImageDetailModal'), { ssr: false });

type KindFilter = 'all' | 'image' | 'video' | 'other';
type OriginFilter = 'all' | 'upload' | 'generated';

function formatDate(value: number, locale: string) {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(value);
}

function formatDuration(value?: number) {
  if (!value) return '';
  const minutes = Math.floor(value / 60);
  const seconds = Math.round(value % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function MediaTypeIcon({ kind }: { kind: MediaLibraryItem['kind'] }) {
  if (kind === 'image') return <ImageIcon className='size-5' />;
  if (kind === 'video') return <Video className='size-5' />;
  if (kind === 'audio') return <Music2 className='size-5' />;
  return <FileText className='size-5' />;
}

function AssetPreview({ item, name }: { item: MediaLibraryItem; name: string }) {
  const generatedVideo = item.kind === 'video' && item.origin === 'generated';
  const { coverUrl } = useVideoHistoryCover(
    generatedVideo ? item.historyId || '' : '',
    generatedVideo ? item.url : '',
    generatedVideo ? item.localPath : undefined,
  );
  if (item.kind === 'image') {
    return <img src={item.previewUrl || item.url} alt={name} className='size-full object-cover' loading='lazy' />;
  }
  if (item.kind === 'video') {
    return (
      <>
        <video
          src={item.url}
          poster={generatedVideo ? coverUrl : item.previewUrl === item.url ? undefined : item.previewUrl}
          className='size-full bg-black object-cover'
          muted
          preload='metadata'
        >
          <track kind='captions' />
        </video>
        <span className='absolute inset-0 flex items-center justify-center'>
          <span className='flex size-11 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white shadow-lg backdrop-blur-md'>
            <Play className='ms-0.5 size-5 fill-current' />
          </span>
        </span>
      </>
    );
  }
  return (
    <div className='from-primary/12 via-primary/5 flex size-full items-center justify-center bg-gradient-to-br to-transparent'>
      <span className='bg-background/80 text-primary flex size-16 items-center justify-center rounded-2xl border shadow-sm'>
        <MediaTypeIcon kind={item.kind} />
      </span>
    </div>
  );
}

function MediaPreviewDialog({
  item,
  onClose,
  onDelete,
  zh,
}: {
  item: MediaLibraryItem;
  onClose: () => void;
  onDelete: () => void;
  zh: boolean;
}) {
  const generatedVideo = item.kind === 'video' && item.origin === 'generated';
  const { coverUrl } = useVideoHistoryCover(
    generatedVideo ? item.historyId || '' : '',
    generatedVideo ? item.url : '',
    generatedVideo ? item.localPath : undefined,
  );
  const download = async () => {
    const { downloadFile } = await import('@/lib/utils/fileUtils');
    await downloadFile(item.url, item.name || `flaq-${item.kind}`);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogContent
          showCloseButton={false}
          hiddenTitle={item.name}
          aria-describedby={undefined}
          overlayClassName='bg-black/80'
          className='bg-card text-foreground flex max-h-[calc(100vh-32px)] w-[calc(100vw-32px)] max-w-5xl flex-col overflow-hidden rounded-3xl border p-0 shadow-2xl sm:max-w-5xl'
        >
          <div className='border-border flex items-center justify-between border-b px-5 py-4'>
            <div className='min-w-0'>
              <p className='truncate font-semibold'>{item.name}</p>
              <p className='text-muted-foreground mt-0.5 text-xs'>
                {item.origin === 'generated' ? (zh ? 'AI 生成' : 'AI generated') : zh ? '上传素材' : 'Uploaded'}
                {' · '}
                {formatDate(item.createdAt, zh ? 'zh-CN' : 'en-US')}
              </p>
            </div>
            <button
              type='button'
              onClick={onClose}
              aria-label={zh ? '关闭' : 'Close'}
              className='hover:bg-muted flex size-9 shrink-0 items-center justify-center rounded-full'
            >
              <X className='size-5' />
            </button>
          </div>
          <div className='bg-muted/30 flex min-h-0 flex-1 items-center justify-center overflow-auto p-4 md:p-8'>
            {item.kind === 'image' ? (
              <img src={item.url} alt={item.name} className='max-h-[68vh] max-w-full rounded-xl object-contain' />
            ) : item.kind === 'video' ? (
              <video
                src={item.url}
                poster={generatedVideo ? coverUrl : item.previewUrl}
                controls
                autoPlay
                className='max-h-[68vh] max-w-full rounded-xl bg-black object-contain'
              >
                <track kind='captions' />
              </video>
            ) : item.kind === 'audio' ? (
              <div className='bg-card w-full max-w-xl rounded-3xl border p-8 shadow-sm'>
                <Music2 className='text-primary mx-auto mb-6 size-12' />
                <audio src={item.url} controls className='w-full' />
              </div>
            ) : (
              <div className='text-muted-foreground flex flex-col items-center gap-4 py-16'>
                <FileText className='text-primary size-16' />
                <p>{zh ? '此文件可下载后查看' : 'Download this file to view it'}</p>
              </div>
            )}
          </div>
          <div className='border-border flex flex-wrap items-center gap-3 border-t px-5 py-4'>
            <div className='min-w-0 flex-1'>
              {item.prompt ? <p className='line-clamp-2 text-sm'>{item.prompt}</p> : null}
              <p className='text-muted-foreground mt-1 text-xs'>
                {[
                  item.availability === 'saved-locally'
                    ? zh
                      ? '已保存本地'
                      : 'Saved locally'
                    : zh
                      ? '仅云端'
                      : 'Cloud only',
                  item.modelName,
                  item.resolution,
                  formatDuration(item.duration),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <Button
              type='button'
              variant='outline'
              onClick={onDelete}
              className='text-destructive hover:text-destructive'
            >
              <Trash2 aria-hidden='true' className='size-4' />
              {zh ? '移除记录' : 'Remove record'}
            </Button>
            <Button type='button' onClick={() => void download()}>
              {zh ? '下载素材' : 'Download'}
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

export default function MediaLibrary({ embedded = false }: { embedded?: boolean }) {
  const locale = useLocale();
  const zh = locale === 'zh' || locale === 'tw';
  const items = useMediaCatalog();
  const [kind, setKind] = useState<KindFilter>('all');
  const [origin, setOrigin] = useState<OriginFilter>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<MediaLibraryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaLibraryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());

  const confirmDelete = () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      removeMediaCatalogItem(deleteTarget);
      setSelected(null);
      setDeleteTarget(null);
      toast.success(zh ? '已从本机历史记录移除' : 'Removed from this device’s history');
    } catch {
      toast.error(zh ? '移除失败，请重试' : 'Could not remove the record. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        const kindMatches =
          kind === 'all' || item.kind === kind || (kind === 'other' && item.kind !== 'image' && item.kind !== 'video');
        const originMatches = origin === 'all' || item.origin === origin;
        const queryMatches =
          !deferredQuery ||
          `${item.name} ${item.prompt || ''} ${item.modelName || ''}`.toLocaleLowerCase().includes(deferredQuery);
        return kindMatches && originMatches && queryMatches;
      }),
    [deferredQuery, items, kind, origin],
  );

  const kindOptions: Array<{ id: KindFilter; label: string }> = [
    { id: 'all', label: zh ? '全部' : 'All' },
    { id: 'image', label: zh ? '图片' : 'Images' },
    { id: 'video', label: zh ? '视频' : 'Videos' },
    { id: 'other', label: zh ? '其他' : 'Other' },
  ];
  const originOptions: Array<{ id: OriginFilter; label: string }> = [
    { id: 'all', label: zh ? '全部来源' : 'All sources' },
    { id: 'upload', label: zh ? '我的上传' : 'Uploads' },
    { id: 'generated', label: zh ? 'AI 生成' : 'Generated' },
  ];

  return (
    <div className={embedded ? 'w-full' : 'min-h-[calc(100vh-64px)] w-full px-5 py-6 md:px-8 lg:px-10'}>
      <div className={embedded ? 'w-full' : 'mx-auto max-w-[1500px]'}>
        {embedded ? (
          <header className='border-border bg-card mb-5 rounded-2xl border p-5'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <div className='text-primary mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase'>
                  <LibraryBig className='size-4' />
                  {zh ? '历史记录' : 'History'}
                </div>
                <h2 className='text-xl font-semibold'>{zh ? '我的素材与作品' : 'My assets and creations'}</h2>
                <p className='text-muted-foreground mt-2 text-sm leading-6'>
                  {zh
                    ? '查看上传过的参考素材和已生成的图片、视频。'
                    : 'Browse uploaded references and generated images or videos stored by this app.'}
                </p>
              </div>
              <span className='bg-primary/10 text-primary shrink-0 rounded-full px-3 py-1 text-xs font-semibold'>
                {zh ? `${items.length} 项` : `${items.length} items`}
              </span>
            </div>
          </header>
        ) : (
          <header className='border-border relative overflow-hidden rounded-[28px] border bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.16),transparent_38%)] p-6 md:p-8'>
            <div className='relative z-10 max-w-2xl'>
              <div className='text-primary mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase'>
                <LibraryBig className='size-4' />
                {zh ? '本机创作资产' : 'On-device creative assets'}
              </div>
              <h1 className='text-foreground text-3xl font-semibold tracking-tight md:text-4xl'>
                {zh ? '素材库' : 'Media library'}
              </h1>
              <p className='text-muted-foreground mt-3 max-w-xl text-sm leading-6 md:text-base'>
                {zh
                  ? '集中查看您上传过的参考素材和已经生成的作品。图片可以直接拖回创作区继续使用。'
                  : 'Find your uploaded references and generated work in one place. Drag images back into a creation form to reuse them.'}
              </p>
            </div>
            <div className='text-muted-foreground relative z-10 mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm'>
              <span>{zh ? `共 ${items.length} 项素材` : `${items.length} assets`}</span>
              <span>
                {zh
                  ? `${items.filter((item) => item.origin === 'upload').length} 项上传`
                  : `${items.filter((item) => item.origin === 'upload').length} uploads`}
              </span>
              <span>
                {zh
                  ? `${items.filter((item) => item.origin === 'generated').length} 项生成`
                  : `${items.filter((item) => item.origin === 'generated').length} generated`}
              </span>
            </div>
            <div className='border-primary/15 pointer-events-none absolute -top-20 -right-10 size-64 rounded-full border' />
            <div className='border-primary/10 pointer-events-none absolute top-10 right-28 size-36 rounded-full border' />
          </header>
        )}

        <section className={embedded ? 'space-y-4' : 'mt-6 space-y-4'}>
          <div className='flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'>
            <div className='flex flex-wrap gap-2'>
              <div className='bg-muted/70 flex rounded-xl p-1'>
                {kindOptions.map((option) => (
                  <button
                    key={option.id}
                    type='button'
                    aria-pressed={kind === option.id}
                    onClick={() => setKind(option.id)}
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm transition-colors',
                      kind === option.id
                        ? 'bg-background text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className='bg-muted/70 flex rounded-xl p-1'>
                {originOptions.map((option) => (
                  <button
                    key={option.id}
                    type='button'
                    aria-pressed={origin === option.id}
                    onClick={() => setOrigin(option.id)}
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm transition-colors',
                      origin === option.id
                        ? 'bg-background text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <label className='relative block w-full xl:w-72'>
              <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={zh ? '搜索名称、提示词或模型' : 'Search name, prompt, or model'}
                className='bg-card h-11 rounded-xl ps-10'
              />
            </label>
          </div>

          {visibleItems.length ? (
            <div
              className={
                embedded
                  ? 'grid grid-cols-1 gap-3 sm:grid-cols-2'
                  : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
              }
            >
              {visibleItems.map((item) => {
                const displayName = item.name || (zh ? '未命名素材' : 'Untitled asset');
                return (
                  <button
                    key={item.id}
                    type='button'
                    draggable={item.kind === 'image'}
                    onDragStart={(event) => {
                      if (item.kind !== 'image') return;
                      beginHistoryImageDrag(event.dataTransfer, { url: item.url, name: item.name });
                    }}
                    onDragEnd={endHistoryImageDrag}
                    onClick={() => setSelected(item)}
                    onContextMenu={contextActions(() => mediaContextActions(item, zh, { view: () => setSelected(item), remove: () => setDeleteTarget(item) }))}
                    className='group border-border bg-card focus-visible:ring-primary hover:border-primary/35 overflow-hidden rounded-2xl border text-left shadow-sm transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:outline-none'
                    style={{ contentVisibility: 'auto', containIntrinsicSize: '280px' }}
                  >
                    <div className='bg-muted relative aspect-[4/3] overflow-hidden'>
                      <AssetPreview item={item} name={displayName} />
                      <span className='absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md'>
                        {item.origin === 'generated' ? <Sparkles className='size-3' /> : <Upload className='size-3' />}
                        {item.origin === 'generated' ? (zh ? 'AI 生成' : 'Generated') : zh ? '已上传' : 'Uploaded'}
                      </span>
                      <span className='absolute top-3 right-3 flex size-8 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md'>
                        <MediaTypeIcon kind={item.kind} />
                      </span>
                      <span className='absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md'>
                        {item.availability === 'saved-locally' ? (
                          <HardDrive aria-hidden='true' className='size-3' />
                        ) : (
                          <Cloud aria-hidden='true' className='size-3' />
                        )}
                        {item.availability === 'saved-locally' ? (zh ? '已存本地' : 'Local') : zh ? '仅云端' : 'Cloud'}
                      </span>
                    </div>
                    <div className='p-4'>
                      <p className='text-foreground truncate text-sm font-medium'>{displayName}</p>
                      <div className='text-muted-foreground mt-2 flex items-center justify-between gap-3 text-xs'>
                        <span>{formatDate(item.createdAt, zh ? 'zh-CN' : 'en-US')}</span>
                        <span className='truncate'>{item.resolution || formatDuration(item.duration)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className='border-border bg-card flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed px-6 text-center'>
              <span className='bg-primary/10 text-primary mb-4 flex size-14 items-center justify-center rounded-2xl'>
                <FolderOpen className='size-7' />
              </span>
              <h2 className='font-semibold'>{zh ? '这里还没有匹配的素材' : 'No matching assets yet'}</h2>
              <p className='text-muted-foreground mt-2 max-w-md text-sm leading-6'>
                {items.length
                  ? zh
                    ? '调整类型、来源或搜索条件即可继续浏览。'
                    : 'Adjust the type, source, or search filters to keep browsing.'
                  : zh
                    ? '上传参考素材或完成一次图片、视频生成后，它们会自动出现在这里。'
                    : 'Upload a reference or complete an image or video generation and it will appear here automatically.'}
              </p>
            </div>
          )}
        </section>
      </div>

      {selected?.kind === 'image' && selected.origin === 'generated' ? (
        <ImageDetailModal
          open
          onOpenChange={(open) => !open && setSelected(null)}
          onDelete={() => setSelected(null)}
          onDeleteRequest={() => removeMediaCatalogItem(selected)}
          image={{
            id: selected.historyId || selected.id,
            url: selected.url,
            title: selected.name,
            prompt: selected.prompt,
            createTime: selected.createdAt,
            resolution: selected.resolution,
            modelName: selected.modelName,
          }}
        />
      ) : selected ? (
        <MediaPreviewDialog
          item={selected}
          onClose={() => setSelected(null)}
          onDelete={() => setDeleteTarget(selected)}
          zh={zh}
        />
      ) : null}

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{zh ? '移除这条历史记录？' : 'Remove this history record?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {zh
                ? '它将不再出现在本机历史记录中。云端对象和已归档的本地文件不会被删除。'
                : 'It will disappear from this device’s history. The remote object and any local archive will remain untouched.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{zh ? '取消' : 'Cancel'}</AlertDialogCancel>
            <Button type='button' variant='destructive' disabled={isDeleting} onClick={confirmDelete}>
              {zh ? '移除记录' : 'Remove record'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
