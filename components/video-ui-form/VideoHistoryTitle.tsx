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
            className='text-muted-foreground cursor-pointer hover:text-[#1677ff]'
          >
            {t('backToStart')}
          </button>
        </>
      )}
    </div>
  );
}
