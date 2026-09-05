'use client';

import { useEffect, useState } from 'react';
import { Check, KeyRound, PlugZap, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { DESKTOP_ONBOARDING_KEY, isDesktopRuntime, openDesktopSettings } from '@/lib/desktop/runtime';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function DesktopOnboarding() {
  const t = useTranslations('Desktop');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isDesktopRuntime()) return;
    setOpen(localStorage.getItem(DESKTOP_ONBOARDING_KEY) !== 'true');
  }, []);

  const finish = () => {
    localStorage.setItem(DESKTOP_ONBOARDING_KEY, 'true');
    setOpen(false);
  };

  const configure = () => {
    finish();
    window.setTimeout(openDesktopSettings, 150);
  };

  const steps = [
    { icon: UserRound, label: t('stepAccount') },
    { icon: KeyRound, label: t('stepKey') },
    { icon: PlugZap, label: t('stepCreate') },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) finish();
        else setOpen(true);
      }}
    >
      <DialogContent className='overflow-hidden border-white/10 bg-[#101114] p-0 text-white sm:max-w-[610px]'>
        <div className='relative border-b border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(92,36,255,0.22),transparent_45%),linear-gradient(135deg,#18191f,#101114)] px-7 pt-8 pb-7'>
          <div className='mb-5 flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8 shadow-[0_16px_50px_rgba(92,36,255,0.18)]'>
            <img src='/images/logo.png' alt='' className='size-10' />
          </div>
          <DialogHeader className='text-left'>
            <DialogTitle className='text-2xl leading-tight'>{t('firstRunTitle')}</DialogTitle>
            <DialogDescription className='max-w-lg text-sm leading-6 text-white/55'>
              {t('firstRunDescription')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className='space-y-3 px-7 py-6'>
          {steps.map(({ icon: Icon, label }, index) => (
            <div
              key={label}
              className='group flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.035] px-4 py-3.5'
            >
              <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/8 text-white/80'>
                <Icon className='size-4' />
              </div>
              <div className='min-w-0 flex-1 text-sm font-medium text-white/82'>{label}</div>
              <div className='flex size-6 items-center justify-center rounded-full border border-white/10 text-[11px] text-white/35 group-hover:border-violet-400/30 group-hover:text-violet-300'>
                {index + 1}
              </div>
            </div>
          ))}

          <div className='flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end'>
            <Button variant='ghost' onClick={finish} className='text-white/55 hover:bg-white/8 hover:text-white'>
              {t('skip')}
            </Button>
            <Button onClick={configure} className='gap-2 bg-[#5c24ff] text-white hover:bg-[#6d3bff]'>
              <Check className='size-4' />
              {t('openSettings')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
