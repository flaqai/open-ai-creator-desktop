'use client';

import { useTranslations } from 'next-intl';

import FormSelect from '@/components/form/FormSelect';
import SubHeading from '@/components/form/SubHeading';

export interface RatioFieldProps {
  ratioOptions?: Array<{ name: string; value: string }>;
  show?: boolean;
  name?: string;
  translationNamespace?: 'components.video-form' | 'components.image-form';
}

export default function RatioField({
  ratioOptions,
  show = false,
  name = 'ratio',
  translationNamespace = 'components.video-form',
}: RatioFieldProps) {
  const t = useTranslations(translationNamespace);

  if (!show || !ratioOptions || ratioOptions.length === 0) return null;

  return (
    <>
      <SubHeading>{t('ratio')}</SubHeading>
      <FormSelect options={ratioOptions} name={name} />
    </>
  );
}
