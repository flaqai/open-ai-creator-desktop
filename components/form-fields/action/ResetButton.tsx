'use client';

import { RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ResetButtonProps {
  onReset: () => void;
  disabled?: boolean;
}

export default function ResetButton({ onReset, disabled = false }: ResetButtonProps) {
  const t = useTranslations('Common');

  return (
    <button
      type='button'
      onClick={onReset}
      disabled={disabled}
      className='text-foreground/60 hover:text-foreground/80 flex items-center gap-1 text-sm transition disabled:cursor-not-allowed disabled:opacity-40'
    >
      <RotateCcw className='size-4' />
      {t('reset')}
    </button>
  );
}
