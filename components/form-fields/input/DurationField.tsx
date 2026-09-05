'use client';

import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

import FormSelect from '@/components/form/FormSelect';
import SubHeading from '@/components/form/SubHeading';

export interface DurationFieldProps {
  name?: string;
  durationOptions?: { name: string; value: string }[];
  show?: boolean;
  translationNamespace?: 'components.video-form' | 'components.image-form';
}

export default function DurationField({
  name = 'duration',
  durationOptions,
  show = false,
  translationNamespace = 'components.video-form',
}: DurationFieldProps) {
  const t = useTranslations(translationNamespace);

  if (!show || !durationOptions || durationOptions.length === 0) return null;

  const optionsWithIcon = durationOptions.map((opt) => ({
    ...opt,
    leftIcon: <Clock className='size-4 text-[#777777]' />,
  }));

  return (
    <>
      <SubHeading>{t('duration')}</SubHeading>
      <FormSelect options={optionsWithIcon} name={name} />
    </>
  );
}
