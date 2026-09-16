'use client';

import { useTranslations } from 'next-intl';

export default function VideoHistoryTitle({
  showBackToStart,
  onBackToStart,
}: {
  showBackToStart?: boolean;
  onBackToStart?: () => void;
}) {
  const t = useTranslations('components.video-form.history');

  return (
    <div className='text-muted-foreground flex items-center gap-2 text-sm'>
      <div>{t('title')}</div>
      {showBackToStart && onBackToStart && (
        <>
          <div className='bg-card h-4 w-px rounded-full' />
          <button
            type='button'
            onClick={onBackToStart}
            className='text-muted-foreground hover:text-color-main cursor-pointer'
          >
            {t('backToStart')}
          </button>
        </>
      )}
    </div>
  );
}
