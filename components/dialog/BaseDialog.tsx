'use client';

import { CircleX } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';

import Spinning from '../Spinning';

function Btn({
  children,
  className,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'border-foreground h-10 flex-1 rounded-lg border text-center text-xs text-nowrap hover:opacity-80 lg:text-base',
        className,
      )}
    >
      {children}
    </button>
  );
}

export default function BaseDialog({
  open,
  setOpen,
  title,
  cancelText,
  okText,
  onClose,
  onOk,
  disabled = false,
  children,
  className,
  btnsGroupClassName,
  cancelBtnClassName,
  okBtnClassName,
  loading,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  cancelText: string;
  onClose: () => void;
  okText: string;
  onOk: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  btnsGroupClassName?: string;
  cancelBtnClassName?: string;
  okBtnClassName?: string;
  loading?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        hiddenTitle={title || 'Dialog'}
        className={cn(
          'border-main-gray bg-card-black flex min-h-[210px] w-[351px] flex-col justify-between rounded-xl! p-5 lg:min-h-[213px] lg:w-[420px] lg:p-3',
          className,
        )}
      >
        <DialogClose asChild>
          <button type='button' onClick={onClose} className='absolute top-3 right-3'>
            <CircleX className='text-foreground/70 size-5' />
          </button>
        </DialogClose>
        {title && <div className='text-center text-sm font-bold lg:text-base'>{title}</div>}
        {children}
        <div className={cn('flex items-center justify-between gap-3', btnsGroupClassName)}>
          <DialogClose asChild>
            <Btn onClick={onClose} className={cancelBtnClassName}>
              {cancelText}
            </Btn>
          </DialogClose>
          <Btn
            disabled={disabled || loading}
            onClick={onOk}
            className={cn(
              'flex-center bg-foreground text-background border-none font-bold',
              disabled && 'cursor-not-allowed opacity-70',
              okBtnClassName,
            )}
          >
            {loading ? <Spinning className='size-3.5 lg:size-4' /> : okText}
          </Btn>
        </div>
      </DialogContent>
    </Dialog>
  );
}
