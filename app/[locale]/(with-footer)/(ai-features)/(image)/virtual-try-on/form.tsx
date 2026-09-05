'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { GEMINI_PROVIDER, GPT_PROVIDER, SEEDREAM_PROVIDER } from '@/lib/constants/image';
import type { ImageModelVersionConfig } from '@/lib/constants/image';
import { urlsToFiles, urlToFile } from '@/lib/utils/imageUtils';
import HintsPresets from '@/components/generation-modal/HintsPresets';
import type { HintPreset } from '@/components/generation-modal/HintsPresets';
import TryOnUploadSection, { TryOnUploadSectionRef } from '@/components/generation-modal/TryOnUploadSection';
import { useModelConfig } from '@/components/image-ui-form/hooks';
import ImageForm from '@/components/image-ui-form/image-form';

const TRY_ON_PROMPT =
  "Dress the person from the first image in the clothing from the second image. Exactly maintain the clothing's original proportions, length, and design. Preserve the character's identical pose and body shape. The outfit must flatter the figure — subtly slimming and contouring the body for a more elegant silhouette — while staying slim, lightweight, and non-bulky. No excessive volume, no puffiness, realistic fabric behavior and natural folds, photorealistic integration.";

const ALLOWED_VERSIONS = new Set([
  'gpt-image-2-edit',
  'nano-banana-pro-edit',
  'nano-banana-2-edit',
  'seedream-v5.0-edit',
  'seedream-v4.5-edit',
]);

const TRYON_VERSION_LIST: ImageModelVersionConfig[] = [
  ...GPT_PROVIDER.versions,
  ...GEMINI_PROVIDER.versions,
  ...SEEDREAM_PROVIDER.versions,
].filter((v) => ALLOWED_VERSIONS.has(v.modelVersion));

const TRYON_DEFAULT_PRIORITY = {
  aspectRatio: ['9:16', '1:1'],
  resolution: ['2k', '4k', '1k'],
  quality: ['medium', 'high', 'low'],
};

interface FormProps {
  hintsPresets?: HintPreset[];
}

function TryOnModalContent({ hintsPresets }: { hintsPresets?: HintPreset[] }) {
  const t = useTranslations('virtual-try-on.form');
  const tryOnRef = useRef<TryOnUploadSectionRef>(null);
  const methods = useFormContext();

  const selectedModelVersion = methods.watch('modelVersion');
  const { uiConfig } = useModelConfig({
    selectedModelVersion,
    customVersionList: TRYON_VERSION_LIST,
  });
  const maxObjectImages = uiConfig.maxImages || 4;

  const handlePresetClick = async (preset: HintPreset) => {
    try {
      const subjectFile = await urlToFile(preset.subject);
      tryOnRef.current?.setSubjectImage(subjectFile);

      const objectUrls = Array.isArray(preset.object) ? preset.object : [preset.object];
      const objectFiles = await urlsToFiles(objectUrls);

      const previewUrls = objectFiles.map((file) => URL.createObjectURL(file));
      tryOnRef.current?.setObjectImages(previewUrls);
      methods.setValue('objectImages', objectFiles);
      methods.setValue('prompt', TRY_ON_PROMPT);
    } catch (error) {
      console.error('Failed to load preset images:', error);
    }
  };

  return (
    <TryOnUploadSection
      ref={tryOnRef}
      title={t('upload-images-title')}
      subjectLabel={t('upload-subject-label')}
      objectLabel={t('upload-object-label')}
      maxObjectImages={maxObjectImages}
      hintsSection={
        hintsPresets ? (
          <HintsPresets
            title={t('hints-title')}
            subjectLabel={t('subject-label')}
            objectLabel={t('object-label')}
            aiGenerationLabel={t('ai-generation-label')}
            presets={hintsPresets}
            onPresetClick={handlePresetClick}
          />
        ) : undefined
      }
    />
  );
}

export default function Form({ hintsPresets }: FormProps) {
  const t = useTranslations('virtual-try-on.form');

  return (
    <ImageForm
      imageFormType='virtual-try-on'
      formTitle={t('title')}
      submitBtnId='virtual-try-on-submit-btn'
      requireImageUpload
      imageUploadMode='none'
      customVersionList={TRYON_VERSION_LIST}
      defaultValuePriority={TRYON_DEFAULT_PRIORITY}
      defaultValues={{
        prompt: '',
        images: [],
        modelVersion: 'gpt-image-2-edit',
        aspectRatio: '9:16',
        resolution: '2k',
      }}
      slotNodeAfterModel={<TryOnModalContent hintsPresets={hintsPresets} />}
    />
  );
}
