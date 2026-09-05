'use client';

import { useTranslations } from 'next-intl';

interface AudioSupportFieldProps {
  show?: boolean;
  translationNamespace?: 'components.video-form' | 'components.image-form';
}

/**
 * Audio support indicator component (display only)
 * Shows a hint that the model supports audio
 */
export default function AudioSupportField({
  show = false,
  translationNamespace = 'components.video-form',
}: AudioSupportFieldProps) {
  const t = useTranslations(translationNamespace);

  if (!show) return null;

  return (
    <div className='border-color-b1 bg-color-c2 flex w-full flex-row items-center gap-1 rounded-xl border p-3'>
      <div className='text-color-main text-sm font-medium'>{t('audio')}</div>
      <div className='text-xs text-white/40'>{t('audio-support')}</div>
    </div>
  );
}
