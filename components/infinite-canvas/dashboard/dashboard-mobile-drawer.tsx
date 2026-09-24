'use client';

import { useRef } from 'react';
import { Download, Loader2, Pencil, Trash2 } from 'lucide-react';

import type { CanvasProjectSummary } from '@/components/infinite-canvas/types/project';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { formatInfiniteCanvasProjectTime } from '@/components/infinite-canvas/project-card/infinite-canvas-project-time';
import { ProjectPreview } from '@/components/infinite-canvas/project-card/infinite-canvas-project-card';
import { useInfiniteCanvasI18n } from '../runtime/i18n/infinite-canvas-context';

interface DashboardMobileDrawerProps {
  readonly mode: 'actions' | 'rename' | 'delete' | null;
  readonly project: CanvasProjectSummary | undefined;
  readonly variant: number;
  readonly title: string;
  readonly pending: boolean;
  readonly deleteCount: number;
  readonly onTitleChange: (title: string) => void;
  readonly onClose: () => void;
  readonly onEdit: () => void;
  readonly onExport: () => void;
  readonly onDelete: () => void;
  readonly onSave: () => void;
  readonly onConfirmDelete: () => void;
  readonly onClosed: () => void;
}

const SECONDARY_BUTTON =
  'h-12 rounded-xl border-light-gray-2 bg-light-gray-1 text-text-color hover:bg-light-gray-2 hover:text-text-color';

export function DashboardMobileDrawer({
  mode,
  project,
  variant,
  title,
  pending,
  deleteCount,
  onTitleChange,
  onClose,
  onEdit,
  onExport,
  onDelete,
  onSave,
  onConfirmDelete,
  onClosed,
}: DashboardMobileDrawerProps) {
  const i18n = useInfiniteCanvasI18n();
  const labels = i18n.dashboard;
  const mobile = labels.mobile;
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Drawer
      open={mode !== null}
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
      dismissible={!pending}
      shouldScaleBackground={false}
    >
      <DrawerContent
        ref={contentRef}
        className='[&>div:first-child]:mt-3 [&>div:first-child]:h-1 [&>div:first-child]:w-10 [&>div:first-child]:bg-light-gray-2 max-h-[85dvh] rounded-t-2xl border-light-gray-2 bg-light-gray-1 text-text-color outline-none'
        onOpenAutoFocus={(event) => {
          // Focus the modal, not an input that would immediately open the mobile keyboard.
          event.preventDefault();
          contentRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onClosed();
        }}
      >
        <div className='overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4'>
          {mode === 'actions' && project ? (
            <>
              <header className='mb-5 flex min-w-0 items-center gap-3'>
                <div
                  className='size-14 shrink-0 overflow-hidden rounded-xl [&>div]:h-full [&>div]:border-0'
                  aria-hidden='true'
                >
                  <ProjectPreview variant={variant} />
                </div>
                <div className='min-w-0'>
                  <DrawerTitle className='truncate text-base leading-6'>{project.title}</DrawerTitle>
                  <DrawerDescription className='mt-1 text-xs text-gray-color'>
                    {labels.updated} {formatInfiniteCanvasProjectTime(project.updatedAt, i18n.locale)}
                  </DrawerDescription>
                </div>
              </header>
              <div className='grid gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  className={SECONDARY_BUTTON}
                  onClick={onEdit}
                  disabled={pending}
                >
                  <Pencil className='mr-2 size-4' aria-hidden='true' />
                  {mobile?.editProject ?? labels.rename}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  className={SECONDARY_BUTTON}
                  onClick={onExport}
                  disabled={pending}
                >
                  <Download className='mr-2 size-4' aria-hidden='true' />
                  {labels.exportProject}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  className='h-12 rounded-xl border-destructive-color bg-transparent text-destructive-color hover:bg-destructive-color/10 hover:text-destructive-color'
                  onClick={onDelete}
                  disabled={pending}
                >
                  <Trash2 className='mr-2 size-4' aria-hidden='true' />
                  {mobile?.delete ?? labels.delete}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  className={SECONDARY_BUTTON}
                  onClick={onClose}
                  disabled={pending}
                >
                  {i18n.common.cancel}
                </Button>
              </div>
            </>
          ) : mode === 'rename' ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onSave();
              }}
            >
              <DrawerTitle className='text-2xl leading-8'>{mobile?.renameTitle ?? labels.renameTitle}</DrawerTitle>
              <DrawerDescription className='sr-only'>{labels.renameDescription}</DrawerDescription>
              <label className='mt-4 block text-sm' htmlFor='infinite-canvas-mobile-project-title'>
                {labels.projectName}
              </label>
              <Input
                id='infinite-canvas-mobile-project-title'
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                disabled={pending}
                className='mt-3 h-12 rounded-xl border border-light-gray-2 bg-light-gray text-base text-text-color focus:border-main-color'
              />
              <div className='mt-5 grid grid-cols-2 gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  className={SECONDARY_BUTTON}
                  onClick={onClose}
                  disabled={pending}
                >
                  {i18n.common.cancel}
                </Button>
                <Button
                  type='submit'
                  className='h-12 gap-2 rounded-xl bg-color-main text-white hover:bg-color-main/90'
                  disabled={pending || title.trim().length === 0}
                  aria-busy={pending}
                >
                  {pending ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
                  {mobile?.saveChanges ?? labels.saveChanges}
                </Button>
              </div>
            </form>
          ) : mode === 'delete' ? (
            <>
              <DrawerTitle className='text-2xl leading-8'>
                {deleteCount === 1
                  ? (mobile?.deleteConfirmTitle ?? labels.deleteConfirmTitle)
                  : labels.deleteConfirmTitle}
              </DrawerTitle>
              <DrawerDescription className='mt-3 text-sm leading-[22px] text-gray-color'>
                {deleteCount === 1
                  ? (mobile?.deleteConfirmDescription ?? labels.deleteConfirmDescription)
                  : labels.deleteConfirmDescription}
              </DrawerDescription>
              <div className='mt-3 grid grid-cols-2 gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  className={SECONDARY_BUTTON}
                  onClick={onClose}
                  disabled={pending}
                >
                  {i18n.common.cancel}
                </Button>
                <Button
                  type='button'
                  variant='destructive'
                  className='h-12 gap-2 rounded-xl bg-destructive-color text-gradient-main-foreground hover:bg-destructive-color/90'
                  onClick={onConfirmDelete}
                  disabled={pending}
                  aria-busy={pending}
                >
                  {pending ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
                  {deleteCount === 1 ? labels.delete : labels.deleteSelected}
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
