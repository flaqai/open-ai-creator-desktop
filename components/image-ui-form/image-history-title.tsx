'use client';

import { useTranslations } from 'next-intl';

export default function ImageHistoryTitle({
  showBackToStart,
  onBackToStart,
}: {
  showBackToStart?: boolean;
  onBackToStart?: () => void;
}) {
  const t = useTranslations('components.image-form.history');

  return (
    <div className='text-foreground flex items-center gap-2 text-sm'>
      <div>{t('title')}</div>
      {showBackToStart && onBackToStart && (
        <>
          <div className='h-4 w-px rounded-full bg-[#9999A3]' />
          <button
            type='button'
            onClick={onBackToStart}
            className='hover:text-color-main text-foreground/80 cursor-pointer'
          >
            {t('backToStart')}
          </button>
        </>
      )}
    </div>
  );
}
