'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import Spinning from '@/components/Spinning';

export default function ConfirmDialog({
  disabled = false,
  open,
  setOpen,
  callback,
  titleText,
  cancelText,
  confirmText,
  children,
}: {
  disabled?: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  callback: Function;
  titleText?: string;
  cancelText?: string;
  confirmText?: string;
  children?: React.ReactNode;
}) {
  const t = useTranslations('components.confirmDialog');

  const [loading, setLoading] = useState(false);

  const onClose = () => {
    setOpen(false);
  };

  const onOk = async () => {
    setLoading(true);
    try {
      await callback();
      setOpen(false);
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className='bg-muted box-border flex w-[calc(100vw-32px)] max-w-[420px] flex-col items-start justify-start gap-2.5 rounded-xl border-none p-3'
        hiddenTitle={titleText || t('title')}
      >
        <div className='box-border flex w-full flex-col items-stretch justify-start'>
          <div className='flex w-full justify-end'>
            <button
              type='button'
              onClick={onClose}
              className='relative flex size-6 shrink-0 items-center justify-center'
            >
              <X className='text-foreground/40 size-6' />
            </button>
          </div>

          <div className='box-border flex w-full flex-col items-center justify-start gap-[70px]'>
            <div className='box-border flex w-full flex-col items-center justify-center gap-3'>
              <div className='box-border flex flex-row items-center justify-center gap-1'>
                <div className='relative size-5 shrink-0'>
                  <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
                    <circle cx='10' cy='10' r='9' fill='#FFA500' stroke='#FFA500' strokeWidth='2' />
                    <text x='10' y='14' textAnchor='middle' fill='white' fontSize='12' fontWeight='bold'>
                      !
                    </text>
                  </svg>
                </div>
                <div className='text-foreground text-[18px] leading-[27px] font-semibold'>
                  {titleText || t('title')}
                </div>
              </div>

              {children && (
                <div className='box-border flex w-full flex-row items-center justify-center gap-1'>
                  <div className='text-foreground/70 text-center text-[16px] leading-[24px] font-normal'>
                    {children}
                  </div>
                </div>
              )}
            </div>

            <div className='box-border flex w-full flex-row items-center justify-center gap-3'>
              <button
                type='button'
                onClick={onClose}
                disabled={loading || disabled}
                className='bg-foreground/10 text-foreground/70 box-border flex h-10 grow basis-0 flex-row items-center justify-center gap-2.5 rounded-lg p-[10px] text-sm leading-[24px] font-normal hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 lg:text-[16px]'
              >
                {cancelText || t('cancel')}
              </button>
              <button
                type='button'
                onClick={onOk}
                disabled={loading || disabled}
                className='bg-color-main text-primary-foreground box-border flex h-10 grow basis-0 flex-row items-center justify-center gap-2.5 rounded-lg p-[10px] text-sm leading-[24px] font-normal hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 lg:text-[16px]'
              >
                {loading ? <Spinning className='size-4' /> : confirmText || t('confirm')}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
