'use client';

import { useTranslations } from 'next-intl';

import VideoForm from '@/components/video-ui-form/video-form';

export default function Form() {
  const t = useTranslations('text-to-video.form');

  return (
    <VideoForm
      submitBtnId='text-to-video-submit-btn'
      videoType='Text-to-video'
      formTitle={t('title')}
      showAllVideoHistory={true}
      defaultValues={{
        modelVersion: 'seedance-v2.5-text-to-video',
        ratio: '16:9',
        enableEndFrame: false,
      }}
    />
  );
}
