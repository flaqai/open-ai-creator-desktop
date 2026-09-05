'use client';

import { useState, type CSSProperties } from 'react';
import { ImageIcon, Loader2, Music2, Plus, VideoIcon, X } from 'lucide-react';

import type {
  UnifiedGeneratorReferenceMediaAsset,
  UnifiedGeneratorReferenceMediaKind,
} from '@/lib/constants/unified-generator/types';
import { cn } from '@/lib/utils';
import { PopoverAnchor, PopoverTrigger } from '@/components/ui/popover';

import { getAddSlotStyle, getExpandedStackWidth, getMediaStackStyle } from './stack-layout';
import useReferenceAssetUrl from './useReferenceAssetUrl';

function AssetPreview({ asset }: { asset: UnifiedGeneratorReferenceMediaAsset }) {
  const url = useReferenceAssetUrl(asset.source);

  if (asset.kind === 'image') {
    return url ? (
      <img src={url} alt={asset.name || asset.id} className='size-full object-cover' decoding='async' />
    ) : null;
  }

  if (asset.kind === 'video') {
    return url ? (
      <video src={url} className='size-full object-cover' muted loop playsInline preload='metadata' autoPlay>
        <track kind='captions' />
      </video>
    ) : null;
  }

  return <Music2 className='size-5' />;
}

function StackTile({
  children,
  isStacked,
  expandOnHover = true,
  style,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  isStacked?: boolean;
  expandOnHover?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        'group/item border-color-b1 bg-color-c3 text-color-t3 hover:text-color-t1 relative flex h-[68px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed shadow-[0_10px_28px_rgba(0,0,0,0.18)] transition-[border-color,color,transform] duration-300 hover:border-white/50',
        isStacked && 'absolute top-0 left-0 [transform:var(--stack-transform)]',
        isStacked && expandOnHover && 'lg:group-hover/stack:[transform:var(--spread-transform)]',
        className,
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

export default function ReferenceStackPreview({
  kind,
  assets,
  uploadingItems = [],
  canAdd,
  disabled,
  isDragActive,
  isPanelHovered = false,
  emptyLabel,
  addLabel,
  removeLabel,
  collapseRevision = 0,
  onOpenPicker,
  onPreview,
  onRemove,
}: {
  kind: UnifiedGeneratorReferenceMediaKind;
  assets: UnifiedGeneratorReferenceMediaAsset[];
  uploadingItems?: Array<{ id: string }>;
  canAdd: boolean;
  disabled: boolean;
  isDragActive: boolean;
  isPanelHovered?: boolean;
  emptyLabel: string;
  addLabel: string;
  removeLabel: string;
  collapseRevision?: number;
  onOpenPicker: () => void;
  onPreview: (index: number) => void;
  onRemove: (index: number) => void;
}) {
  const totalItems = assets.length + uploadingItems.length;
  const shouldStack = totalItems > 1 || (totalItems > 0 && canAdd);
  const previewCount = totalItems + (totalItems > 0 && canAdd ? 1 : 0);
  const expandedWidth = getExpandedStackWidth(previewCount);
  const EmptyIcon = kind === 'image' ? ImageIcon : kind === 'video' ? VideoIcon : Music2;
  const [releasedCollapseRevision, setReleasedCollapseRevision] = useState(collapseRevision);
  const [isPointerInside, setIsPointerInside] = useState(false);
  const isExpansionSuppressed = isPointerInside && releasedCollapseRevision !== collapseRevision;
  const isPanelExpansionActive = isPanelHovered && !isExpansionSuppressed;

  const handleOpenPicker = () => {
    setReleasedCollapseRevision(collapseRevision);
    onOpenPicker();
  };

  if (totalItems === 0) {
    return (
      <PopoverTrigger asChild>
        <button
          type='button'
          aria-label={emptyLabel}
          disabled={disabled}
          className={cn(
            'border-color-b1 bg-color-c3 text-color-t3 hover:text-color-t1 flex h-[68px] w-[52px] shrink-0 items-center justify-center rounded-xl border border-dashed transition-colors hover:border-white/50 disabled:pointer-events-none disabled:opacity-50',
            isDragActive && 'text-color-t1 border-white/40',
          )}
        >
          <EmptyIcon className='size-5' />
        </button>
      </PopoverTrigger>
    );
  }

  return (
    <PopoverAnchor asChild>
      <div
        onPointerEnter={() => {
          setReleasedCollapseRevision(collapseRevision);
          setIsPointerInside(true);
        }}
        onPointerLeave={() => {
          setIsPointerInside(false);
          setReleasedCollapseRevision(collapseRevision);
        }}
        className={cn(
          'relative flex h-[68px] min-w-0 items-center overflow-visible',
          shouldStack && 'z-40 hover:z-[200]',
        )}
      >
        <div
          className={cn('relative h-[68px] w-[52px] overflow-visible', shouldStack && 'group/stack')}
          style={{ '--expanded-width': `${expandedWidth}px` } as CSSProperties}
        >
          {shouldStack ? (
            <span
              className={cn(
                'pointer-events-auto absolute top-0 left-0 z-0 hidden h-full w-[var(--expanded-width)]',
                !isExpansionSuppressed && 'lg:group-hover/stack:block',
                isPanelExpansionActive && 'lg:block',
              )}
            />
          ) : null}
          {assets.map((asset, index) => (
            <StackTile
              key={asset.id}
              isStacked={shouldStack}
              expandOnHover={!isExpansionSuppressed}
              style={shouldStack ? getMediaStackStyle(index, totalItems) : undefined}
              className={isPanelExpansionActive ? 'lg:[transform:var(--spread-transform)]' : undefined}
              role='button'
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onPreview(index);
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                onPreview(index);
              }}
            >
              <AssetPreview asset={asset} />
              <span className='absolute inset-0 hidden rounded-[inherit] bg-black/10 group-hover/item:block' />
              <button
                type='button'
                aria-label={removeLabel}
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove(index);
                }}
                className='absolute top-1 right-1 z-10 hidden size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity lg:flex lg:group-hover/item:opacity-100'
              >
                <X className='size-3.5' />
              </button>
            </StackTile>
          ))}
          {uploadingItems.map((item, index) => {
            const visualIndex = assets.length + index;

            return (
              <StackTile
                key={item.id}
                isStacked={shouldStack}
                expandOnHover={!isExpansionSuppressed}
                style={shouldStack ? getMediaStackStyle(visualIndex, totalItems) : undefined}
                className={isPanelExpansionActive ? 'lg:[transform:var(--spread-transform)]' : undefined}
              >
                <Loader2 className='text-color-main size-5 animate-spin' />
              </StackTile>
            );
          })}
          {canAdd ? (
            <>
              <PopoverTrigger asChild>
                <button
                  type='button'
                  aria-label={addLabel}
                  disabled={disabled}
                  onClick={handleOpenPicker}
                  style={shouldStack ? getAddSlotStyle(totalItems) : undefined}
                  className={cn(
                    'border-color-b1 bg-color-c3 text-color-t3 hover:text-color-t1 flex h-[68px] w-[52px] shrink-0 items-center justify-center rounded-xl border border-dashed transition-[border-color,color,opacity,transform] duration-300 hover:border-white/50 disabled:pointer-events-none disabled:opacity-50',
                    shouldStack &&
                      'pointer-events-none absolute top-0 left-0 z-0 [transform:var(--stack-transform)] opacity-0',
                    shouldStack &&
                      !isExpansionSuppressed &&
                      'lg:group-hover/stack:pointer-events-auto lg:group-hover/stack:z-[80] lg:group-hover/stack:[transform:var(--spread-transform)] lg:group-hover/stack:opacity-100',
                    shouldStack &&
                      isPanelExpansionActive &&
                      'lg:pointer-events-auto lg:z-[80] lg:[transform:var(--spread-transform)] lg:opacity-100',
                  )}
                >
                  <Plus className='size-5' />
                </button>
              </PopoverTrigger>
              {shouldStack ? (
                <PopoverTrigger asChild>
                  <button
                    type='button'
                    aria-label={addLabel}
                    disabled={disabled}
                    onClick={handleOpenPicker}
                    className={cn(
                      'border-color-b1 bg-color-c3 text-color-t2 hover:text-color-t1 absolute -right-1 -bottom-1 z-[90] flex size-6 items-center justify-center rounded-full border shadow-[0_8px_18px_rgba(0,0,0,0.35)] transition-[border-color,color,opacity] hover:border-white/50 disabled:pointer-events-none disabled:opacity-50',
                      !isExpansionSuppressed &&
                        'lg:group-hover/stack:pointer-events-none lg:group-hover/stack:opacity-0',
                      isPanelExpansionActive && 'lg:pointer-events-none lg:opacity-0',
                    )}
                  >
                    <Plus className='size-4' />
                  </button>
                </PopoverTrigger>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </PopoverAnchor>
  );
}
