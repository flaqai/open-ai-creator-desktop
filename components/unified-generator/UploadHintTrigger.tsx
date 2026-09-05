'use client';

import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function UploadHintTrigger({
  hintKey,
  className = '',
}: {
  hintKey: 'video' | 'image';
  className?: string;
}) {
  const t = useTranslations('components.hero-form.unified-upload');
  const tHero = useTranslations('components.hero-form');

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type='button'
            aria-label={t(`hints.${hintKey}`)}
            className={`text-color-t2 hover:text-color-t1 inline-flex h-[14px] w-[14px] items-center justify-center transition-colors ${className}`}
          >
            <Info className='h-3.5 w-3.5' />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side='top'
          align='start'
          sideOffset={8}
          className='border-color-b1 bg-color-c1 text-color-t2 max-w-[260px] rounded-[8px] border px-3 py-2 text-[14px] leading-[22px] shadow-xl'
        >
          <div>{t(`hints.${hintKey}`)}</div>
          <div>
            {tHero('image-video.format-hint')}: {t('formats')}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
