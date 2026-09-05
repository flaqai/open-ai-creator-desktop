'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { BookOpenText, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useDesktopRuntime } from '@/hooks/use-desktop-runtime';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type DesktopFeatureInfoProps = {
  children?: ReactNode;
  title?: string;
  description?: string;
};

export default function DesktopFeatureInfo({ children, title, description }: DesktopFeatureInfoProps) {
  const t = useTranslations('Desktop');
  const desktop = useDesktopRuntime();
  const [open, setOpen] = useState(false);

  if (!desktop) return children || null;

  return (
    <section className='container-centered pb-10'>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className='group flex w-full items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.035] px-5 py-4 text-left transition hover:border-white/15 hover:bg-white/[0.055]'
      >
        <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(92,36,255,.25),rgba(110,88,255,.25))] text-violet-200'>
          <BookOpenText className='size-5' />
        </span>
        <span className='min-w-0 flex-1'>
          <span className='block text-sm font-semibold text-white/85'>{t('toolGuide')}</span>
          <span className='mt-1 block text-xs text-white/55'>{t('toolGuideDescription')}</span>
        </span>
        <span className='text-xl text-white/20 transition group-hover:translate-x-0.5 group-hover:text-white/50'>
          →
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          aria-describedby={undefined}
          className='flex h-[82vh] max-h-[900px] flex-col overflow-hidden border-white/10 bg-[#111214] p-0 text-white sm:max-w-[1000px]'
        >
          <DialogHeader className='border-b border-white/8 px-6 py-4 text-left'>
            <div className='flex items-center justify-between gap-4'>
              <DialogTitle>{title || t('toolGuide')}</DialogTitle>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setOpen(false)}
                className='gap-2 text-white/55 hover:bg-white/8 hover:text-white'
              >
                <X className='size-4' />
                {t('close')}
              </Button>
            </div>
          </DialogHeader>
          <div
            className='min-h-0 flex-1 overflow-y-auto'
            onClickCapture={(event) => {
              const target = event.target;
              if (
                target instanceof Element &&
                (target.closest('a')?.getAttribute('href') === '#' || target.closest('[data-scroll-target]'))
              ) {
                event.preventDefault();
                setOpen(false);
              }
            }}
          >
            {children || (
              <div className='mx-auto flex h-full max-w-xl flex-col items-center justify-center px-8 py-16 text-center'>
                <BookOpenText className='mb-5 size-9 text-violet-200/70' />
                <h2 className='text-xl font-semibold text-white/85'>{title || t('toolGuide')}</h2>
                <p className='mt-3 text-sm leading-6 text-white/45'>{description || t('toolGuideDescription')}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
