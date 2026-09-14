'use client';

import { useTranslations } from 'next-intl';

import FormSelect from '@/components/image-ui-form/FormSelect';

export interface LanguageOption {
  name: string;
  value: string;
}

interface LanguageSelectFieldProps {
  options: LanguageOption[];
  show?: boolean;
  label?: string;
}

export default function LanguageSelectField({ options, show = true, label }: LanguageSelectFieldProps) {
  const t = useTranslations('components.image-form');

  if (!show || !options || options.length === 0) return null;

  return (
    <div className='flex w-full flex-col gap-2'>
      <div className='text-foreground/60 text-[14px] leading-[21px] font-normal capitalize'>
        {label || t('language')}
      </div>
      <FormSelect options={options} name='language' />
    </div>
  );
}
