'use client';

import { useState } from 'react';
import useBusinessDialogStore from '@/store/useBusinessDialogStore';
import { Check, Copy, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export default function BusinessDialog() {
  const t = useTranslations('components.dialog.business');
  const { open, setOpen } = useBusinessDialogStore();
  const [isCopied, setIsCopied] = useState(false);

  const handleEmailClick = () => {
    window.location.href = `mailto:${process.env.NEXT_PUBLIC_CONTACT_US_EMAIL}`;
  };

  const handleCopyEmail = (e: React.MouseEvent<HTMLButtonElement>) => {
    navigator.clipboard.writeText(process.env.NEXT_PUBLIC_CONTACT_US_EMAIL || '');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    e.currentTarget.blur();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setIsCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className='w-[351px] rounded-xl border-white/10 bg-[#111214] p-6 text-white lg:w-[480px] lg:p-8'
        aria-describedby={undefined}
      >
        <DialogTitle className='text-center text-lg font-bold lg:text-xl'>{t('title')}</DialogTitle>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col gap-4 text-sm text-white/70 lg:text-base'>
            <p>{t('description')}</p>
            <div className='flex items-center gap-2 rounded-lg bg-white/5 p-3'>
              <Mail className='size-5 text-white/40' />
              <span className='flex-1 text-white/90'>{process.env.NEXT_PUBLIC_CONTACT_US_EMAIL}</span>
              <button
                type='button'
                onClick={handleCopyEmail}
                className='flex size-8 items-center justify-center rounded-md hover:bg-white/10'
                title='Copy email'
              >
                {isCopied ? <Check className='size-4 text-green-500' /> : <Copy className='size-4 text-white/40' />}
              </button>
            </div>
          </div>

          <button
            type='button'
            onClick={handleEmailClick}
            className='flex h-11 items-center justify-center gap-2 rounded-lg bg-white font-semibold text-black hover:opacity-90'
          >
            <Mail className='size-4' />
            {t('contactButton')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
