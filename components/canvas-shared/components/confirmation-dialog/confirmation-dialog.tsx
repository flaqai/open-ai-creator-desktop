'use client';

import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ConfirmationDialogProps } from '@/components/canvas-shared/components/confirmation-dialog/confirmation-dialog.types';

export function ConfirmationDialog({
  cancelLabel,
  confirmLabel,
  confirmVariant = 'default',
  description,
  onCancel,
  onConfirm,
  open,
  pending = false,
  title,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen && !pending ? onCancel() : undefined)}>
      <DialogContent
        closeBtnClassName='hidden'
        className='w-[calc(100%-2rem)] max-w-lg gap-0 rounded-xl border-light-gray-2 bg-light-gray p-6 text-text-color shadow-2xl'
      >
        <DialogHeader>
          <DialogTitle className='text-base font-semibold'>{title}</DialogTitle>
          <DialogDescription className='pt-3 text-sm leading-6 text-gray-color'>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className='mt-7 gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={pending}
            className='border-light-gray-2 bg-light-gray-1 text-text-color hover:bg-light-gray-2 hover:text-text-color'
          >
            {cancelLabel}
          </Button>
          <Button
            type='button'
            variant={confirmVariant === 'destructive' ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={pending}
            aria-label={confirmLabel}
            aria-busy={pending}
            className={`relative ${
              confirmVariant === 'destructive'
                ? 'bg-destructive-color text-on-media-color hover:bg-destructive-color/90'
                : 'bg-gradient-main text-gradient-main-foreground hover:opacity-90'
            }`}
          >
            <span className={pending ? 'invisible' : undefined}>{confirmLabel}</span>
            {pending ? <Loader2 className='absolute size-4 animate-spin' aria-hidden='true' /> : null}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
