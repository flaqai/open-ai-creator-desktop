'use client';

import { useTranslations } from 'next-intl';

import Spinning from '@/components/Spinning';

interface SubmitButtonProps {
  isSubmitting?: boolean;
  submitButtonText?: string;
  translationNamespace?: 'components.video-form' | 'components.image-form';
  disabled?: boolean;
}

export default function SubmitButton({
  isSubmitting = false,
  submitButtonText,
  translationNamespace = 'components.video-form',
  disabled = false,
}: SubmitButtonProps) {
  const t = useTranslations(translationNamespace);

  return (
    <button
      type='submit'
      disabled={isSubmitting || disabled}
      className='bg-color-main text-primary-foreground flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-base font-semibold uppercase disabled:cursor-not-allowed disabled:opacity-70'
    >
      {isSubmitting ? <Spinning className='size-4' /> : <>{submitButtonText || t('generate')}</>}
    </button>
  );
}
