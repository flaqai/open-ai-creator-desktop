'use client';

import { contextActions } from '@/lib/desktop/context-actions';

import { Download, Ellipsis, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import { useCanvasMediaSrc } from '../runtime/persistence/use-canvas-media-src';
import CanvasProjectPlaceholder from './canvas-project-placeholder';
import type { InfiniteCanvasProjectCardProps } from './infinite-canvas-project-card.types';
import { formatInfiniteCanvasProjectTime } from './infinite-canvas-project-time';

export function InfiniteCanvasProjectCard({
  actions,
  imageUrl,
  preview,
  labels,
  locale,
  mobileActions,
  onOpen,
  onSelectedChange,
  project,
  selected = false,
  variant,
}: InfiniteCanvasProjectCardProps) {
  const selectable = onSelectedChange !== undefined;
  const defaultPreview = preview == null && !imageUrl?.trim();

  return (
    <article
      onContextMenu={contextActions(() => [
        { id: 'open', label: labels.open, run: onOpen },
        ...(actions ? [
          { id: 'rename', label: actions.renameLabel, run: actions.onRename },
          { id: 'export', label: actions.exportLabel, run: actions.onExport },
          { id: 'delete', label: actions.deleteLabel, destructive: true, separator: true, run: actions.onDelete },
        ] : []),
      ])}
      className={`group bg-color-c1 hover:border-color-main relative overflow-hidden rounded-xl border transition-colors ${defaultPreview ? 'h-[180px]' : 'h-full'} ${
        selected ? 'border-color-main shadow-color-main/10 shadow-md' : 'border-color-b1'
      }`}
    >
      <div className='relative'>
        {preview ?? <ProjectPreview variant={variant} imageUrl={imageUrl} alt={project.title} />}
        <button
          type='button'
          aria-label={`${labels.open}: ${project.title}`}
          onClick={onOpen}
          className='focus-visible:ring-main-color absolute inset-0 z-10 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset'
        />
        {selectable ? (
          <Checkbox
            aria-label={project.title}
            checked={selected}
            onCheckedChange={(checked) => onSelectedChange(checked === true)}
            className={`border-light-gray-2 bg-background-color data-[state=checked]:border-main-color data-[state=checked]:bg-main-color data-[state=checked]:text-gradient-main-foreground absolute z-20 ${mobileActions ? 'top-3 left-3 size-10 rounded-xl sm:top-4 sm:left-4 sm:size-5 sm:rounded-md' : 'top-4 left-4 size-5 rounded-md'}`}
          />
        ) : null}
        {mobileActions ? (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label={`${mobileActions.label}: ${project.title}`}
            aria-haspopup='dialog'
            className='border-light-gray-2 bg-light-gray-1 text-text-color hover:bg-light-gray-2 absolute top-3 right-3 z-20 size-10 rounded-xl border'
            onClick={mobileActions.onOpen}
          >
            <Ellipsis className='size-5' aria-hidden='true' />
          </Button>
        ) : actions !== undefined ? (
          <div className='absolute top-3 right-3 z-20 flex gap-1.5 opacity-100 shadow-lg backdrop-blur transition sm:translate-y-1 sm:opacity-0 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100 sm:group-hover:translate-y-0 sm:group-hover:opacity-100'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              aria-label={actions.renameLabel}
              className='bg-color-main hover:bg-color-main/80 size-8 rounded-lg text-white hover:text-white'
              onClick={actions.onRename}
            >
              <Pencil className='size-4' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              aria-label={actions.exportLabel}
              className='bg-color-main hover:bg-color-main/80 size-8 rounded-lg text-white hover:text-white'
              onClick={actions.onExport}
            >
              <Download className='size-4' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              aria-label={actions.deleteLabel}
              className='bg-color-main hover:bg-color-main/80 size-8 rounded-lg text-white hover:text-white'
              onClick={actions.onDelete}
            >
              <Trash2 className='size-4' />
            </Button>
          </div>
        ) : null}
      </div>
      <div
        className={
          defaultPreview
            ? 'from-color-bg0 via-color-bg0/85 pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent px-3 pt-10 pb-3'
            : `p-4 ${mobileActions ? 'h-20 sm:h-[98px]' : 'h-[98px]'}`
        }
      >
        {defaultPreview ? <div aria-hidden='true' className='border-color-b1 mb-2 border-t' /> : null}
        <h3 className='text-color-t1 mb-1 truncate text-sm font-medium'>{project.title}</h3>
        <p className='text-color-t2 truncate text-xs'>
          {project.nodeCount} {labels.nodeCount} · {project.connectionCount} {labels.connectionCount} · {labels.updated}{' '}
          {formatInfiniteCanvasProjectTime(project.updatedAt, locale)}
        </p>
      </div>
    </article>
  );
}

export function ProjectPreview({
  alt = '',
  imageUrl,
}: {
  readonly alt?: string;
  readonly imageUrl?: string;
  readonly variant: number;
}) {
  const normalizedImageUrl = imageUrl?.trim();
  const previewUrl = useCanvasMediaSrc(normalizedImageUrl);
  if (normalizedImageUrl) {
    return (
      <div className='border-light-gray-2 bg-background-color relative aspect-[16/9] overflow-hidden border-b'>
        <img src={previewUrl} alt={alt} className='size-full object-cover' loading='lazy' decoding='async' />
      </div>
    );
  }

  return (
    <div className='bg-color-c1 relative h-[124px] overflow-hidden'>
      <CanvasProjectPlaceholder />
    </div>
  );
}
