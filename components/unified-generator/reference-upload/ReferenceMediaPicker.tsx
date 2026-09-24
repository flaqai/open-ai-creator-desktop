'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Clock3, FolderOpen, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { contextActions } from '@/lib/desktop/context-actions';
import { MEDIA_REUSE_EVENT, takeMediaReuse } from '@/lib/desktop/media-context-actions';

import type {
  UnifiedGeneratorReferenceMediaAsset,
  UnifiedGeneratorReferenceMediaKind,
} from '@/lib/constants/unified-generator/types';
import { hasReferenceMediaSource } from '@/lib/constants/unified-generator/types';
import { cn } from '@/lib/utils';
import { filterCompatibleHistoryAssets } from '@/lib/utils/history-media-selection';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Popover, PopoverContent } from '@/components/ui/popover';

import useReferenceAssetUrl from './useReferenceAssetUrl';

function HistoryAssetCard({
  asset,
  selected,
  disabled,
  onToggle,
}: {
  asset: UnifiedGeneratorReferenceMediaAsset;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const url = useReferenceAssetUrl(asset.source);
  const displayName = asset.name || asset.id;

  return (
    <button
      type='button'
      aria-pressed={selected}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        'group relative min-w-0 overflow-hidden rounded-xl border text-left transition-[border-color,box-shadow,opacity] duration-200',
        selected ? 'border-color-main ring-color-main/20 ring-2' : 'border-color-b1 hover:border-color-main/50',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      <div className='bg-color-c4 aspect-video overflow-hidden'>
        {asset.kind === 'image' ? (
          <img
            src={url}
            alt={displayName}
            className='size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]'
          />
        ) : (
          <video src={url} className='size-full bg-black object-cover' muted preload='metadata' playsInline>
            <track kind='captions' />
          </video>
        )}
      </div>
      <div className='text-color-t2 truncate px-3 py-2 text-xs'>{displayName}</div>
      <span
        className={cn(
          'absolute top-2 right-2 flex size-6 items-center justify-center rounded-full border shadow-sm transition-colors',
          selected
            ? 'border-color-main bg-color-main text-white'
            : 'border-white/80 bg-black/35 text-transparent backdrop-blur-sm',
        )}
      >
        <Check className='size-3.5' strokeWidth={3} />
      </span>
    </button>
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
  acceptedFormats,
  historySelectionLimit = 1,
  onUploadFromDevice,
  onSelectHistory,
  historyRequested = 0,
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
  acceptedFormats?: string[];
  historySelectionLimit?: number;
  onUploadFromDevice: () => void;
  onSelectHistory: (assets: UnifiedGeneratorReferenceMediaAsset[]) => void | Promise<void>;
  historyRequested?: number;
}) {
  const t = useTranslations('components.hero-form.reference-upload');
  const locale = useLocale();
  const zh = locale === 'zh' || locale === 'tw';
  const [reusedAsset, setReusedAsset] = useState<UnifiedGeneratorReferenceMediaAsset | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  useEffect(() => {
    if (historyRequested > 0) { onOpenChange(false); setSelectedHistoryIds([]); setHistoryOpen(true); }
    // The request is edge-triggered by its parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyRequested]);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);
  const supportsHistory = kind !== 'audio';
  const visibleHistoryAssets = useMemo(
    () => filterCompatibleHistoryAssets((reusedAsset ? [reusedAsset, ...historyAssets.filter((asset) => asset.source !== reusedAsset.source)] : historyAssets).filter(hasReferenceMediaSource), kind, acceptedFormats),
    [acceptedFormats, historyAssets, kind, reusedAsset],
  );

  useEffect(() => {
    const receive = () => {
      const media = takeMediaReuse(kind);
      if (!media) return;
      const asset: UnifiedGeneratorReferenceMediaAsset = { id: `reuse-${Date.now()}`, kind, source: media.url, name: media.name || media.url.split('/').pop() };
      if (!canAdd || isUploading || historySelectionLimit < 1) {
        toast.error(zh ? '当前素材数量已达上限或正在上传，请腾出位置后重试' : 'No available reference slot, or an upload is in progress.');
      } else if (!filterCompatibleHistoryAssets([asset], kind, acceptedFormats).length) {
        toast.error(zh ? '当前模型不支持此素材格式，请切换模型后重试' : 'This model does not support the reference format.');
      } else {
        setReusedAsset(asset);
        setSelectedHistoryIds([asset.id]);
        setHistoryOpen(true);
      }
    };
    receive();
    window.addEventListener(MEDIA_REUSE_EVENT, receive);
    return () => window.removeEventListener(MEDIA_REUSE_EVENT, receive);
  }, [acceptedFormats, canAdd, historySelectionLimit, isUploading, kind, zh]);

  const handlePickerOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onPanelHoverChange?.(false);
    onOpenChange(nextOpen);
  };

  const openHistory = () => {
    setSelectedHistoryIds([]);
    handlePickerOpenChange(false);
    setHistoryOpen(true);
  };

  const handleHistoryOpenChange = (nextOpen: boolean) => {
    setHistoryOpen(nextOpen);
    if (!nextOpen) {
      setSelectedHistoryIds([]);
      setReusedAsset(null);
    }
  };

  const handleConfirmHistory = async () => {
    const selectedIds = new Set(selectedHistoryIds);
    const selectedAssets = visibleHistoryAssets.filter((asset) => selectedIds.has(asset.id));
    if (!selectedAssets.length) return;
    await onSelectHistory(selectedAssets);
    handleHistoryOpenChange(false);
  };

  return (
    <>
      <Popover modal open={open} onOpenChange={handlePickerOpenChange}>
        <span className='contents' onContextMenu={contextActions([
          { id: 'local', label: t('uploadFromDevice'), icon: FolderOpen, disabled: !canAdd || isUploading, run: () => { handlePickerOpenChange(false); onUploadFromDevice(); } },
          ...(supportsHistory ? [{ id: 'history', label: t('selectFromHistory'), icon: Clock3, disabled: !canAdd || isUploading, run: openHistory }] : []),
        ])}>{trigger}</span>
        <PopoverContent
          align='start'
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
              onPanelHoverChange?.(true);
            }
          }}
          onPointerLeave={() => onPanelHoverChange?.(false)}
          className='border-color-b1 bg-color-c1 text-color-t1 w-[min(400px,calc(100vw-32px))] rounded-[20px] border p-3 shadow-2xl'
        >
          <div className='mb-3 px-1'>
            <p className='text-sm font-medium'>{t('chooseSource')}</p>
          </div>
          <div className={cn('grid gap-2', supportsHistory ? 'grid-cols-2' : 'grid-cols-1')}>
            <button
              type='button'
              disabled={!canAdd || isUploading}
              onClick={() => {
                handlePickerOpenChange(false);
                onUploadFromDevice();
              }}
              className='border-color-b1 bg-color-bg0 hover:border-color-main/50 hover:bg-color-c4 flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border px-4 text-center transition-[background-color,border-color,transform] hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50'
            >
              <span className='bg-color-c4 text-color-main flex size-10 items-center justify-center rounded-xl'>
                <FolderOpen className='size-5' />
              </span>
              <span className='text-sm font-medium'>{t('uploadFromDevice')}</span>
            </button>
            {supportsHistory ? (
              <button
                type='button'
                disabled={!canAdd || isUploading}
                onClick={openHistory}
                className='border-color-b1 bg-color-bg0 hover:border-color-main/50 hover:bg-color-c4 flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border px-4 text-center transition-[background-color,border-color,transform] hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50'
              >
                <span className='bg-color-c4 text-color-main flex size-10 items-center justify-center rounded-xl'>
                  <Clock3 className='size-5' />
                </span>
                <span className='text-sm font-medium'>{t('selectFromHistory')}</span>
              </button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={historyOpen} onOpenChange={handleHistoryOpenChange}>
        <DialogContent className='border-color-b1 bg-color-c1 text-color-t1 flex max-h-[min(720px,calc(100dvh-32px))] w-[min(760px,calc(100vw-32px))] max-w-none grid-rows-none flex-col gap-0 overflow-hidden rounded-[24px] border p-0'>
          <DialogHeader className='border-color-b1 shrink-0 border-b px-6 py-5 pr-14'>
            <DialogTitle>{t('historySelectionTitle')}</DialogTitle>
            <DialogDescription className='text-color-t3'>
              {t('historySelectionDescription', { count: historySelectionLimit })}
            </DialogDescription>
          </DialogHeader>

          <div className='custom-scrollbar min-h-0 flex-1 overflow-y-auto p-5 sm:p-6'>
            {isHistoryLoading ? (
              <div className='flex min-h-64 items-center justify-center'>
                <Loader2 className='text-color-main size-6 animate-spin' />
              </div>
            ) : visibleHistoryAssets.length > 0 ? (
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                {visibleHistoryAssets.map((asset) => {
                  const selected = selectedHistoryIds.includes(asset.id);
                  const disabled = !selected && selectedHistoryIds.length >= historySelectionLimit;
                  return (
                    <HistoryAssetCard
                      key={asset.id}
                      asset={asset}
                      selected={selected}
                      disabled={disabled}
                      onToggle={() =>
                        setSelectedHistoryIds((current) =>
                          current.includes(asset.id)
                            ? current.filter((id) => id !== asset.id)
                            : [...current, asset.id].slice(0, historySelectionLimit),
                        )
                      }
                    />
                  );
                })}
              </div>
            ) : (
              <div className='text-color-t3 flex min-h-64 items-center justify-center text-center text-sm'>
                {t('noCompatibleHistory')}
              </div>
            )}
          </div>

          <DialogFooter className='border-color-b1 bg-color-bg0 shrink-0 flex-row items-center justify-between border-t px-6 py-4'>
            <span className='text-color-t3 text-sm'>
              {t('selectedCount', { selected: selectedHistoryIds.length, count: historySelectionLimit })}
            </span>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => handleHistoryOpenChange(false)}
                className='border-color-b1 text-color-t2 hover:bg-color-c4 h-9 rounded-lg border px-4 text-sm transition-colors'
              >
                {t('cancel')}
              </button>
              <button
                type='button'
                disabled={selectedHistoryIds.length === 0}
                onClick={() => void handleConfirmHistory()}
                className='bg-color-main h-9 rounded-lg px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40'
              >
                {t('confirm')}
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
