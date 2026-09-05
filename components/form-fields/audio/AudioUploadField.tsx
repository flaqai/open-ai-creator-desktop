'use client';

import { forwardRef } from 'react';
import { useTranslations } from 'next-intl';

import AudioUploadWithPreview, { AudioUploadWithPreviewRef } from './AudioUploadWithPreview';

interface AudioUploadFieldProps {
  show?: boolean;
  uploadAudioTitle?: string;
  name?: string;
  translationNamespace?: 'components.video-form' | 'components.image-form';
}

export interface AudioUploadFieldRef {
  removeAudio: () => void;
  previewAudio: (file: File | null) => void;
}

const AudioUploadField = forwardRef<AudioUploadFieldRef, AudioUploadFieldProps>(
  ({ show = false, uploadAudioTitle, name = 'audioFile', translationNamespace = 'components.video-form' }, ref) => {
    const t = useTranslations(translationNamespace);

    if (!show) return null;

    return (
      <AudioUploadWithPreview
        ref={ref as React.Ref<AudioUploadWithPreviewRef>}
        name={name}
        title={uploadAudioTitle || t('audioFile')}
      />
    );
  },
);

AudioUploadField.displayName = 'AudioUploadField';

export default AudioUploadField;
