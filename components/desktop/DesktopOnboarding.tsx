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
      <DialogContent className='border-foreground/10 bg-card text-foreground overflow-hidden p-0 sm:max-w-[610px]'>
        <div className='border-border from-accent to-card relative border-b bg-gradient-to-br px-7 pt-8 pb-7'>
          <div className='desktop-onboarding-mark border-foreground/10 bg-foreground/8 mb-5 flex size-12 items-center justify-center rounded-2xl border'>
            <img src='/images/logo.png' alt='' className='size-10' />
          </div>
          <DialogHeader className='text-left'>
            <DialogTitle className='text-2xl leading-tight'>{t('firstRunTitle')}</DialogTitle>
            <DialogDescription className='text-foreground/55 max-w-lg text-sm leading-6'>
              {t('firstRunDescription')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className='space-y-3 px-7 py-6'>
          {steps.map(({ icon: Icon, label }, index) => (
            <div
              key={label}
              className='group border-foreground/8 bg-foreground/[0.035] flex items-center gap-4 rounded-xl border px-4 py-3.5'
            >
              <div className='bg-foreground/8 text-foreground/80 flex size-9 shrink-0 items-center justify-center rounded-lg'>
                <Icon className='size-4' />
              </div>
              <div className='text-foreground/82 min-w-0 flex-1 text-sm font-medium'>{label}</div>
              <div className='border-foreground/10 text-foreground/35 group-hover:border-primary/30 group-hover:text-primary flex size-6 items-center justify-center rounded-full border text-[11px]'>
                {index + 1}
              </div>
            </div>
          ))}

          <div className='flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end'>
            <Button
              variant='ghost'
              onClick={finish}
              className='text-foreground/55 hover:bg-foreground/8 hover:text-foreground'
            >
              {t('skip')}
            </Button>
            <Button onClick={configure} className='bg-primary text-primary-foreground hover:bg-primary/90 gap-2'>
              <Check className='size-4' />
              {t('openSettings')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
