'use client';

import { useTranslations } from 'next-intl';

import FormSelect from '@/components/form/FormSelect';
import SubHeading from '@/components/form/SubHeading';

interface ResolutionFieldProps {
  resolutionOptions: Array<{ name: string; value: string }>;
  show?: boolean;
  translationNamespace?: 'components.video-form' | 'components.image-form';
}

export default function ResolutionField({
  resolutionOptions,
  show = false,
  translationNamespace = 'components.video-form',
}: ResolutionFieldProps) {
  const t = useTranslations(translationNamespace);

  if (!show || !resolutionOptions || resolutionOptions.length === 0) return null;

  return (
    <>
      <SubHeading>{t('resolution')}</SubHeading>
      <FormSelect options={resolutionOptions} name='resolution' />
    </>
  );
}
