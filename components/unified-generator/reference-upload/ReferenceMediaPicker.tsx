'use client';

import { useState } from 'react';
import { Clock3, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type {
  UnifiedGeneratorReferenceMediaAsset,
  UnifiedGeneratorReferenceMediaKind,
} from '@/lib/constants/unified-generator/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import useReferenceAssetUrl from './useReferenceAssetUrl';

type PickerTab = 'upload' | 'history';

interface LocalMediaUploadItem {
  id: string;
  url: string;
  name?: string;
}

function PickerRow({
  asset,
  disabled,
  onDelete,
  onSelect,
}: {
  asset: UnifiedGeneratorReferenceMediaAsset;
  disabled?: boolean;
  onDelete?: () => void;
  onSelect: (asset: UnifiedGeneratorReferenceMediaAsset) => void;
}) {
  const t = useTranslations('components.hero-form.reference-upload');
  const [previewOpen, setPreviewOpen] = useState(false);
  const url = useReferenceAssetUrl(asset.source);
  const displayName = asset.name || asset.id;

  return (
    <Popover open={previewOpen} onOpenChange={setPreviewOpen}>
      <PopoverTrigger asChild>
        <div
          onPointerEnter={() => setPreviewOpen(true)}
          onPointerLeave={() => setPreviewOpen(false)}
          onFocus={() => setPreviewOpen(true)}
          onBlur={() => setPreviewOpen(false)}
          className='group/row text-color-t3 hover:bg-color-c4 hover:text-color-t1 flex h-12 w-full items-center gap-2 rounded-xl px-3 transition-colors'
        >
          <button
            type='button'
            disabled={disabled}
            onClick={() => onSelect(asset)}
            className='flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-50'
          >
            {asset.kind === 'image' ? (
              <img src={url} alt={displayName} className='bg-color-c4 size-9 shrink-0 rounded-md object-cover' />
            ) : (
              <video src={url} className='size-9 shrink-0 rounded-md bg-black object-cover' muted preload='metadata'>
                <track kind='captions' />
              </video>
            )}
            <span className='min-w-0 flex-1 truncate text-xs'>{displayName}</span>
          </button>
          {onDelete ? (
            <button
              type='button'
              aria-label={t('deleteLocalImage')}
              disabled={disabled}
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                setPreviewOpen(false);
                onDelete();
              }}
              className='text-color-t3 hover:bg-color-c4 hover:text-color-t1 flex size-8 shrink-0 items-center justify-center rounded-lg opacity-0 transition-colors group-hover/row:opacity-100 focus:opacity-100 disabled:cursor-not-allowed disabled:opacity-0'
            >
              <Trash2 className='size-4' />
            </button>
          ) : null}
        </div>
      </PopoverTrigger>
      <PopoverContent
        side='right'
        align='start'
        sideOffset={12}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        className='border-color-b1 bg-color-c1 w-[220px] rounded-2xl border p-1.5 shadow-2xl'
      >
        {asset.kind === 'image' ? (
          <img src={url} alt={displayName} className='max-h-[260px] w-full rounded-xl object-contain' />
        ) : (
          <video
            src={url}
            className='max-h-[260px] w-full rounded-xl bg-black object-contain'
            autoPlay
            muted
            loop
            playsInline
          >
            <track kind='captions' />
          </video>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default function ReferenceMediaPicker({
  open,
  onOpenChange,
  onPanelHoverChange,
  trigger,
  kind,
  canAdd,
  isUploading = false,
  isHistoryLoading,
  historyAssets,
  localMediaAssets = [],
  onUploadFromDevice,
  onDeleteLocalMedia,
  onSelectLocalMedia,
  onSelectHistory,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPanelHoverChange?: (hovered: boolean) => void;
  trigger: React.ReactNode;
  kind: UnifiedGeneratorReferenceMediaKind;
  canAdd: boolean;
  isUploading?: boolean;
  isHistoryLoading: boolean;
  historyAssets: UnifiedGeneratorReferenceMediaAsset[];
  localMediaAssets?: LocalMediaUploadItem[];
  onUploadFromDevice: () => void;
  onDeleteLocalMedia?: (id: string) => void;
  onSelectLocalMedia?: (url: string, name?: string) => void;
  onSelectHistory: (asset: UnifiedGeneratorReferenceMediaAsset) => void;
}) {
  const t = useTranslations('components.hero-form.reference-upload');
  const [tab, setTab] = useState<PickerTab>('upload');
  const supportsHistory = kind !== 'audio';
  const visibleLocalMediaAssets = localMediaAssets.filter((item) => item.url.trim().length > 0);
  const visibleHistoryAssets = historyAssets.filter(
    (asset) => asset.source instanceof File || asset.source.trim().length > 0,
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onPanelHoverChange?.(false);
    onOpenChange(nextOpen);
  };

  return (
    <Popover modal open={open} onOpenChange={handleOpenChange}>
      {trigger}
      <PopoverContent
        align='start'
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            onPanelHoverChange?.(true);
          }
        }}
        onPointerLeave={() => onPanelHoverChange?.(false)}
        className='border-color-b1 bg-color-c1 text-color-t1 w-[min(360px,calc(100vw-32px))] rounded-[20px] border p-3 shadow-2xl'
      >
        {supportsHistory ? (
          <div className='bg-color-bg0 flex rounded-full p-1'>
            <button
              type='button'
              onClick={() => setTab('upload')}
              className={cn(
                'flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-sm transition-colors',
                tab === 'upload' ? 'bg-color-c4 text-color-t1' : 'text-color-t3 hover:text-color-t1',
              )}
            >
              <Upload className='size-4' />
              {t('upload')}
            </button>
            <button
              type='button'
              onClick={() => setTab('history')}
              className={cn(
                'flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-sm transition-colors',
                tab === 'history' ? 'bg-color-c4 text-color-t1' : 'text-color-t3 hover:text-color-t1',
              )}
            >
              <Clock3 className='size-4' />
              {t('history')}
            </button>
          </div>
        ) : null}

        <div className='custom-scrollbar mt-3 max-h-[260px] overflow-y-auto'>
          {tab === 'upload' || !supportsHistory ? (
            <div className='flex flex-col gap-1'>
              <button
                type='button'
                onClick={onUploadFromDevice}
                disabled={!canAdd || isUploading}
                className='bg-color-c3 text-color-t2 hover:bg-color-c4 hover:text-color-t1 flex h-11 w-full items-center gap-2 rounded-xl px-3 text-sm transition-colors disabled:pointer-events-none disabled:opacity-50'
              >
                <Plus className='size-4' />
                {t('uploadFromDevice')}
              </button>
              {kind !== 'audio' && onSelectLocalMedia ? (
                visibleLocalMediaAssets.length > 0 ? (
                  visibleLocalMediaAssets.map((item) => (
                    <PickerRow
                      key={item.id}
                      disabled={isUploading || !canAdd}
                      asset={{ id: item.id, kind, source: item.url, name: item.name }}
                      onDelete={onDeleteLocalMedia ? () => onDeleteLocalMedia(item.id) : undefined}
                      onSelect={(asset) => onSelectLocalMedia(String(asset.source), asset.name)}
                    />
                  ))
                ) : (
                  <div className='text-color-t3 px-3 py-6 text-center text-sm'>{t('noLocalUploads')}</div>
                )
              ) : null}
            </div>
          ) : isHistoryLoading ? (
            <div className='flex h-28 items-center justify-center'>
              <Loader2 className='text-color-main size-5 animate-spin' />
            </div>
          ) : visibleHistoryAssets.length > 0 ? (
            <div className='flex flex-col gap-1'>
              {visibleHistoryAssets.map((asset) => (
                <PickerRow key={asset.id} asset={asset} disabled={isUploading || !canAdd} onSelect={onSelectHistory} />
              ))}
            </div>
          ) : (
            <div className='text-color-t3 px-3 py-6 text-center text-sm'>{t('noCompletedHistory')}</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
