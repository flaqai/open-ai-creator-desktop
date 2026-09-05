'use client';

import { Check, CopyIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import useCopyToClipboard from '@/hooks/useCopyToClipboard';

export default function CopyBtn({
  content,
  className,
  delay = 2000,
}: {
  content: string;
  className?: string;
  delay?: number;
}) {
  const t = useTranslations();
  const { isCopied, copyToClipboard } = useCopyToClipboard(delay);

  function onCopy() {
    copyToClipboard(content);
  }

  return (
    <button type='button' disabled={isCopied} onClick={onCopy} className={className}>
      <span className='sr-only'>{t('Common.copy')}</span>
      {isCopied ? <Check className='size-4' /> : <CopyIcon className='size-4 hover:scale-105' />}
    </button>
  );
}
