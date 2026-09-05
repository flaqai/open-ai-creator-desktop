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
    <div className='flex items-center gap-2 text-sm text-[#e1e1e1]'>
      <div>{t('title')}</div>
      {showBackToStart && onBackToStart && (
        <>
          <div className='h-4 w-px rounded-full bg-[#2a2b2f]' />
          <button type='button' onClick={onBackToStart} className='cursor-pointer text-[#e1e1e1] hover:text-[#1677ff]'>
            {t('backToStart')}
          </button>
        </>
      )}
    </div>
  );
}
