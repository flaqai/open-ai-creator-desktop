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
    <div className='flex items-center gap-2 text-sm text-white'>
      <div>{t('title')}</div>
      {showBackToStart && onBackToStart && (
        <>
          <div className='h-4 w-px rounded-full bg-[#9999A3]' />
          <button type='button' onClick={onBackToStart} className='hover:text-color-main cursor-pointer text-white/80'>
            {t('backToStart')}
          </button>
        </>
      )}
    </div>
  );
}
