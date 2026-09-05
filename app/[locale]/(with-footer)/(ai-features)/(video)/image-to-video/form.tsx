'use client';

import { useTranslations } from 'next-intl';

import VideoForm from '@/components/video-ui-form/video-form';

export default function Form() {
  const t = useTranslations('image-to-video');

  return (
    <VideoForm
      submitBtnId='image-to-video-submit-btn'
      videoType='Image-to-video'
      formTitle={t('form.title')}
      showAllVideoHistory={true}
      defaultValues={{
        modelVersion: 'seedance-v2.5-image-to-video',
        ratio: '',
        enableEndFrame: true,
      }}
    />
  );
}
