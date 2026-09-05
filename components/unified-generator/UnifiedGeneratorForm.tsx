'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import useUnifiedGeneratorStore from '@/store/unified-generator/useUnifiedGeneratorStore';
import { Loader2, RefreshCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ALL_IMAGE_MODELS } from '@/lib/constants/image';
import { ALL_VIDEO_MODELS, getVersionConfig, type VideoGenerationType } from '@/lib/constants/video';
import {
  buildReferenceMentionAssets,
  EMPTY_REFERENCE_PROMPT_DOC,
  serializeReferencePrompt,
} from '@/lib/utils/reference-video-prompt';

import EndFrameToggle from './EndFrameToggle';
import GenerationTypeTabs from './GenerationTypeTabs';
import ModelPopover from './ModelPopover';
import ParameterPopover from './ParameterPopover';
import ReferenceFileLinkInputs from './reference-upload/ReferenceFileLinkInputs';
import ReferenceMediaUploads from './reference-upload/ReferenceMediaUploads';
import ReferencePromptEditor, {
  ReferenceMentionPickerPopover,
  type ReferenceMentionInsertRequest,
} from './reference-upload/ReferencePromptEditor';
import SwitchPopover from './SwitchPopover';
import TypeTabs from './TypeTabs';
import UploadSlots from './UploadSlots';
import useUnifiedGeneratorSubmit from './useUnifiedGeneratorSubmit';

type SupportedVideoType = Exclude<VideoGenerationType, 'video-edit'>;

interface UnifiedGeneratorFormProps {
  submitMode?: 'generate' | 'transfer';
}

export default function UnifiedGeneratorForm({ submitMode = 'generate' }: UnifiedGeneratorFormProps) {
  const t = useTranslations('UnifiedGenerator');
  const store = useUnifiedGeneratorStore();
  const { submit, isSubmitting } = useUnifiedGeneratorSubmit();
  const [openPopover, setOpenPopover] = useState<'parameters' | 'panel' | null>(null);
  const mentionInsertRequestKeyRef = useRef(0);
  const pendingSubmitHandledRef = useRef(false);
  const [mentionInsertRequest, setMentionInsertRequest] = useState<ReferenceMentionInsertRequest | null>(null);

  const mediaType = store.mediaType;
  const videoType = store.videoType;
  const availableImageModels = useMemo(
    () =>
      ALL_IMAGE_MODELS.filter((model) =>
        store.imageType === 'image-to-image'
          ? !!model.options.imageInput?.isSupported
          : !model.options.imageInput?.isSupported,
      ),
    [store.imageType],
  );
  const availableVideoModels = useMemo(
    () => ALL_VIDEO_MODELS.filter((model) => model.generationType === videoType && !model.disabled),
    [videoType],
  );
  const selectedImageModel =
    availableImageModels.find((model) => model.model === store.imageModel) || availableImageModels[0];
  const selectedVideoModel =
    availableVideoModels.find((model) => model.model === store.videoModels[videoType]) || availableVideoModels[0];
  const videoVersion = selectedVideoModel ? getVersionConfig(selectedVideoModel.modelVersion) : undefined;
  const videoModelsForPopover = useMemo(
    () =>
      availableVideoModels.map((model) => ({
        ...model,
        options: {
          ...model.options,
          resolution:
            getVersionConfig(model.modelVersion)?.options.resolution ||
            (model.options.resolution ? [model.options.resolution] : []),
        },
      })),
    [availableVideoModels],
  );
  const selectedVideoPopoverModel = videoModelsForPopover.find((model) => model.model === selectedVideoModel?.model);
  const parameters = mediaType === 'image' ? store.imageParameters : store.videoParameters[videoType];

  useEffect(() => {
    if (selectedImageModel && selectedImageModel.model !== store.imageModel) {
      store.setImageModel(selectedImageModel.model);
      store.setImageParameters({
        ratio:
          selectedImageModel.options.ratio?.find((item) => item.value === '-')?.value ||
          selectedImageModel.options.ratio?.[0]?.value ||
          '',
        resolution:
          selectedImageModel.options.resolution?.find((item) => item.value === '2k')?.value ||
          selectedImageModel.options.resolution?.[0]?.value ||
          '',
        quality: selectedImageModel.options.quality?.[0]?.value || '',
      });
    }
  }, [selectedImageModel, store.imageModel, store.setImageModel, store.setImageParameters]);

  useEffect(() => {
    if (selectedVideoModel && selectedVideoModel.model !== store.videoModels[videoType]) {
      store.setVideoModel(videoType, selectedVideoModel.model);
      store.setVideoParameters(videoType, {
        ratio: selectedVideoModel.options.ratio?.[0]?.value || '',
        resolution: videoVersion?.options.resolution?.[0] || '',
        duration: videoVersion?.options.duration?.[0]
          ? Number(videoVersion.options.duration[0].replace('s', ''))
          : selectedVideoModel.options.duration,
        sound: Boolean(selectedVideoModel.options.defaultSound),
        enableEndFrame: Boolean(selectedVideoModel.options.endFrame?.isSupported),
        seed: undefined,
        negativePrompt: '',
      });
    }
  }, [selectedVideoModel, store.setVideoModel, store.setVideoParameters, store.videoModels, videoType, videoVersion]);

  useEffect(() => {
    const ratios =
      mediaType === 'image'
        ? selectedImageModel?.options.ratio?.map((item) => item.value)
        : selectedVideoModel?.options.ratio?.map((item) => item.value);
    const resolutions =
      mediaType === 'image'
        ? selectedImageModel?.options.resolution?.map((item) => item.value)
        : videoVersion?.options.resolution;
    const durations = videoVersion?.options.duration?.map((value) => Number(value.replace('s', '')));
    const qualities = selectedImageModel?.options.quality?.map((item) => item.value) || [];
    if (ratios?.length && !ratios.includes(parameters.ratio)) {
      const ratio = mediaType === 'image' && ratios.includes('-') ? '-' : ratios[0];
      if (mediaType === 'image') store.setImageParameters({ ratio });
      else store.setVideoParameters(videoType, { ratio });
    }
    if (resolutions?.length && !resolutions.includes(parameters.resolution)) {
      const resolution = mediaType === 'image' && resolutions.includes('2k') ? '2k' : resolutions[0];
      if (mediaType === 'image') store.setImageParameters({ resolution });
      else store.setVideoParameters(videoType, { resolution });
    }
    if (durations?.length && (parameters.duration === undefined || !durations.includes(parameters.duration))) {
      store.setVideoParameters(videoType, { duration: durations[0] });
    }
    if (qualities.length && !qualities.includes(parameters.quality)) {
      store.setImageParameters({ quality: qualities[0] });
    }
  }, [
    mediaType,
    parameters.duration,
    parameters.quality,
    parameters.ratio,
    parameters.resolution,
    selectedImageModel?.model,
    selectedVideoModel?.model,
    store.setImageParameters,
    store.setVideoParameters,
    videoType,
    videoVersion,
  ]);

  const ratioOptions =
    mediaType === 'image'
      ? selectedImageModel?.options.ratio?.map((item) => item.value) || []
      : selectedVideoModel?.options.ratio?.map((item) => item.value) || [];
  const resolutionOptions =
    mediaType === 'image'
      ? selectedImageModel?.options.resolution?.map((item) => item.value) || []
      : videoVersion?.options.resolution || [];
  const durationOptions = videoVersion?.options.duration?.map((value) => Number(value.replace('s', ''))) || [];
  const seedConfig = mediaType === 'image' ? selectedImageModel?.options.seed : selectedVideoModel?.options.seed;
  const isReferenceVideo = mediaType === 'video' && videoType === 'reference-to-video';
  const seedRange = isReferenceVideo
    ? typeof seedConfig === 'object'
      ? seedConfig
      : seedConfig
        ? { min: 0, max: 2147483647 }
        : undefined
    : undefined;
  const supportsSeed = Boolean(seedRange);
  const standardPrompt = mediaType === 'image' ? store.imagePrompt : store.videoPrompt;
  const referenceAssets = useMemo(
    () => buildReferenceMentionAssets(store.referenceImages, store.referenceVideos, store.referenceAudios),
    [store.referenceAudios, store.referenceImages, store.referenceVideos],
  );

  const handleSubmit = async () => {
    await submit({
      mediaType,
      videoType,
      imageModel: selectedImageModel,
      videoModel: selectedVideoModel,
      prompt: isReferenceVideo
        ? serializeReferencePrompt(
            store.referencePromptDoc,
            store.referenceImages,
            store.referenceVideos,
            store.referenceAudios,
          )
        : standardPrompt,
      promptDoc: isReferenceVideo ? store.referencePromptDoc : undefined,
      images: isReferenceVideo ? store.referenceImages : mediaType === 'image' ? store.imageInputs : [],
      startImage: !isReferenceVideo && mediaType === 'video' ? store.videoStartInput : null,
      endImage: !isReferenceVideo && mediaType === 'video' ? store.videoEndInput : null,
      videos: store.referenceVideos,
      audios: isReferenceVideo
        ? store.referenceAudios
        : store.videoAudioInput
          ? [
              {
                id: `audio-${store.videoAudioInput.name}-${store.videoAudioInput.lastModified}`,
                kind: 'audio',
                source: store.videoAudioInput,
                originalFile: store.videoAudioInput,
                name: store.videoAudioInput.name,
              },
            ]
          : [],
      files: store.referenceFiles,
      links: store.referenceLinks,
      ratio: parameters.ratio || undefined,
      resolution: parameters.resolution || undefined,
      duration: parameters.duration,
      quality: parameters.quality || undefined,
      sound: parameters.sound,
      enableEndFrame: parameters.enableEndFrame,
      seed: parameters.seed,
      negativePrompt: parameters.negativePrompt,
    });
  };

  useEffect(() => {
    if (submitMode !== 'generate' || !store.pendingCreatorSubmit || pendingSubmitHandledRef.current) return;
    pendingSubmitHandledRef.current = true;
    store.clearPendingCreatorSubmit();
    void handleSubmit();
  }, [store.pendingCreatorSubmit, submitMode]);

  const handleReset = () => {
    if (isReferenceVideo) {
      store.setPrompt('');
      store.setReferencePromptDoc(EMPTY_REFERENCE_PROMPT_DOC);
      store.setReferenceImages([]);
      store.setReferenceVideos([]);
      store.setReferenceAudios([]);
      store.setReferenceFiles([]);
      store.setReferenceLinks([]);
      store.setVideoParameters('reference-to-video', {
        ratio: selectedVideoModel?.options.ratio?.[0]?.value || '',
        resolution: videoVersion?.options.resolution?.[0] || '',
        duration: videoVersion?.options.duration?.[0]
          ? Number(videoVersion.options.duration[0].replace('s', ''))
          : selectedVideoModel?.options.duration,
        sound: Boolean(selectedVideoModel?.options.defaultSound),
        seed: undefined,
        negativePrompt: '',
      });
      setOpenPopover(null);
      return;
    }
    if (mediaType === 'image') {
      const defaultModel = ALL_IMAGE_MODELS.find((model) => model.model === 'gpt-image-2-edit');
      store.setImageType('image-to-image');
      store.setImageModel('gpt-image-2-edit');
      store.setImagePrompt('');
      store.setImageInputs([]);
      store.setImageParameters({
        ratio:
          defaultModel?.options.ratio?.find((item) => item.value === '-')?.value ||
          defaultModel?.options.ratio?.[0]?.value ||
          '',
        resolution:
          defaultModel?.options.resolution?.find((item) => item.value === '2k')?.value ||
          defaultModel?.options.resolution?.[0]?.value ||
          '',
        quality: defaultModel?.options.quality?.[0]?.value || '',
        seed: undefined,
        negativePrompt: '',
      });
      setOpenPopover(null);
      return;
    }
    const defaultModel = ALL_VIDEO_MODELS.find((model) => model.model === 'seedance-v2.5-image-to-video');
    const defaultVersion = defaultModel ? getVersionConfig(defaultModel.modelVersion) : undefined;
    store.setVideoType('image-to-video');
    store.setVideoModel('image-to-video', 'seedance-v2.5-image-to-video');
    store.setVideoPrompt('');
    store.setVideoStartInput(null);
    store.setVideoEndInput(null);
    store.setVideoAudioInput(null);
    store.setVideoParameters('image-to-video', {
      enableEndFrame: true,
      ratio: defaultModel?.options.ratio?.[0]?.value || '',
      resolution: defaultVersion?.options.resolution?.[0] || '',
      duration: defaultVersion?.options.duration?.[0]
        ? Number(defaultVersion.options.duration[0].replace('s', ''))
        : defaultModel?.options.duration,
      sound: Boolean(defaultModel?.options.defaultSound),
      seed: undefined,
      negativePrompt: '',
    });
    setOpenPopover(null);
  };
  const handleReferencePromptChange = (promptDoc: typeof store.referencePromptDoc) => {
    store.setReferencePromptDoc(promptDoc);
    store.setPrompt(
      serializeReferencePrompt(promptDoc, store.referenceImages, store.referenceVideos, store.referenceAudios),
    );
  };
  const handleSelectMentionAsset = (asset: ReferenceMentionInsertRequest['asset']) => {
    mentionInsertRequestKeyRef.current += 1;
    setMentionInsertRequest({ asset, key: mentionInsertRequestKeyRef.current });
  };
  const handleVideoModelChange = (model: string) => {
    const nextModel = availableVideoModels.find((item) => item.model === model);
    if (!nextModel) return;
    const nextVersion = getVersionConfig(nextModel.modelVersion);
    store.setVideoModel(videoType, model);
    store.setVideoParameters(videoType, {
      ratio: nextModel.options.ratio?.[0]?.value || '',
      resolution: nextVersion?.options.resolution?.[0] || '',
      duration: nextVersion?.options.duration?.[0]
        ? Number(nextVersion.options.duration[0].replace('s', ''))
        : nextModel.options.duration,
      sound: Boolean(nextModel.options.defaultSound),
      enableEndFrame: Boolean(nextModel.options.endFrame?.isSupported),
      seed: undefined,
      negativePrompt: '',
    });
    if (videoType === 'reference-to-video') {
      const imageMax = nextModel.options.multiImage?.isSupported ? nextModel.options.multiImage.maxImages : 0;
      const videoMax = nextModel.options.multiVideo?.isSupported
        ? nextModel.options.multiVideo.maxVideos
        : nextModel.options.videoUrl?.isSupported
          ? 1
          : 0;
      const audioMax = nextModel.options.multiAudio?.isSupported
        ? nextModel.options.multiAudio.maxAudios
        : nextModel.options.audioUrl
          ? 1
          : 0;
      const referenceFileMax = nextModel.options.referenceFile?.isSupported
        ? nextModel.options.referenceFile.maxFiles
        : 0;
      const referenceLinkMax = nextModel.options.referenceLink?.isSupported
        ? nextModel.options.referenceLink.maxLinks
        : 0;
      let referenceImages = store.referenceImages.slice(0, imageMax);
      let referenceVideos = store.referenceVideos.slice(0, videoMax);
      const referenceFiles = store.referenceFiles.slice(0, referenceFileMax);
      const referenceLinks = referenceFiles.length > 0 ? [] : store.referenceLinks.slice(0, referenceLinkMax);

      if (nextModel.options.maxReferenceSubjects !== undefined) {
        referenceImages = referenceImages.slice(0, nextModel.options.maxReferenceSubjects);
        referenceVideos = referenceVideos.slice(
          0,
          Math.max(nextModel.options.maxReferenceSubjects - referenceImages.length, 0),
        );
      }

      store.setReferenceImages(referenceImages);
      store.setReferenceVideos(referenceVideos);
      store.setReferenceAudios(store.referenceAudios.slice(0, audioMax));
      store.setReferenceFiles(referenceFiles);
      store.setReferenceLinks(referenceLinks);
    } else {
      if (videoType !== 'image-to-video') {
        store.setVideoStartInput(null);
        store.setVideoEndInput(null);
      } else if (!nextModel.options.endFrame?.isSupported) {
        store.setVideoEndInput(null);
      }
      if (!nextModel.options.audioUrl) store.setVideoAudioInput(null);
    }
    setOpenPopover(null);
  };
  const handleImageModelChange = (model: string) => {
    const nextModel = availableImageModels.find((item) => item.model === model);
    if (!nextModel) return;
    store.setImageModel(model);
    store.setImageParameters({
      ratio:
        nextModel.options.ratio?.find((item) => item.value === '-')?.value || nextModel.options.ratio?.[0]?.value || '',
      resolution:
        nextModel.options.resolution?.find((item) => item.value === '2k')?.value ||
        nextModel.options.resolution?.[0]?.value ||
        '',
      quality: nextModel.options.quality?.[0]?.value || '',
      seed: undefined,
    });
    store.setImageInputs(store.imageInputs.slice(0, nextModel.options.imageInput?.max || 0));
    setOpenPopover(null);
  };
  const handleVideoTypeChange = (nextType: SupportedVideoType) => {
    const currentFamily = selectedVideoModel?.model.replace(/-(?:text|image|reference)-to-video$/, '');
    const nextModel =
      ALL_VIDEO_MODELS.find(
        (model) =>
          !model.disabled &&
          model.generationType === nextType &&
          model.model.replace(/-(?:text|image|reference)-to-video$/, '') === currentFamily,
      ) || ALL_VIDEO_MODELS.find((model) => !model.disabled && model.generationType === nextType);
    store.setVideoType(nextType);
    if (!nextModel) return;
    const nextVersion = getVersionConfig(nextModel.modelVersion);
    store.setVideoModel(nextType, nextModel.model);
    store.setVideoParameters(nextType, {
      ratio: nextModel.options.ratio?.[0]?.value || '',
      resolution: nextVersion?.options.resolution?.[0] || '',
      duration: nextVersion?.options.duration?.[0]
        ? Number(nextVersion.options.duration[0].replace('s', ''))
        : nextModel.options.duration,
      sound: Boolean(nextModel.options.defaultSound),
      enableEndFrame: Boolean(nextModel.options.endFrame?.isSupported),
      seed: undefined,
      negativePrompt: '',
    });
    setOpenPopover(null);
  };
  const handleImageTypeChange = (nextType: 'text-to-image' | 'image-to-image') => {
    const nextModels = ALL_IMAGE_MODELS.filter((model) =>
      nextType === 'image-to-image'
        ? Boolean(model.options.imageInput?.isSupported)
        : !model.options.imageInput?.isSupported,
    );
    const currentFamily = selectedImageModel?.model.replace(/-edit(?:-client)?$/, '').replace(/-client$/, '');
    const nextModel =
      nextModels.find(
        (model) => model.model.replace(/-edit(?:-client)?$/, '').replace(/-client$/, '') === currentFamily,
      ) || nextModels[0];
    store.setImageType(nextType);
    if (!nextModel) return;
    store.setImageModel(nextModel.model);
    store.setImageParameters({
      ratio:
        nextModel.options.ratio?.find((item) => item.value === '-')?.value || nextModel.options.ratio?.[0]?.value || '',
      resolution:
        nextModel.options.resolution?.find((item) => item.value === '2k')?.value ||
        nextModel.options.resolution?.[0]?.value ||
        '',
      quality: nextModel.options.quality?.[0]?.value || '',
    });
    store.setImageInputs(store.imageInputs.slice(0, nextModel.options.imageInput?.max || 0));
    setOpenPopover(null);
  };

  return (
    <section className='flex w-full flex-col gap-3'>
      <div className='flex w-full justify-center'>
        <TypeTabs
          value={mediaType}
          labels={{ image: t('media-type.image'), video: t('media-type.video') }}
          onChange={store.setMediaType}
        />
      </div>

      <div className='border-color-b1 bg-color-bg overflow-hidden rounded-xl border'>
        <div className='bg-color-c1 flex min-h-12 shrink-0 items-center justify-between gap-2 px-3'>
          <GenerationTypeTabs
            mediaType={mediaType}
            imageType={store.imageType}
            videoType={videoType}
            labels={{
              'text-to-image': t('image-type.text-to-image'),
              'image-to-image': t('image-type.image-to-image'),
              'text-to-video': t('video-type.text-to-video'),
              'image-to-video': t('video-type.image-to-video'),
              'reference-to-video': t('video-type.reference-to-video'),
            }}
            onImageTypeChange={handleImageTypeChange}
            onVideoTypeChange={handleVideoTypeChange}
          />
          <button
            type='button'
            onClick={handleReset}
            className='text-color-t2 hover:text-color-t1 inline-flex shrink-0 items-center gap-2 text-sm whitespace-nowrap transition-colors'
          >
            <RefreshCcw className='size-4' />
            {t('reset')}
          </button>
        </div>

        <div className='bg-color-bg0 flex h-[clamp(360px,calc(100dvh-200px),470px)] flex-col gap-2 p-3 sm:h-[400px] sm:gap-3 lg:h-[355px]'>
          <div className='flex min-h-[140px] flex-1 flex-col gap-3 sm:min-h-[190px] sm:flex-row'>
            <div className='empty:hidden sm:w-fit sm:max-w-[240px] sm:shrink-0'>
              {isReferenceVideo && selectedVideoModel ? (
                <div className='custom-scrollbar flex max-h-full w-full flex-col gap-3 overflow-y-auto pr-1 sm:w-[240px]'>
                  <ReferenceMediaUploads
                    model={selectedVideoModel}
                    images={store.referenceImages}
                    videos={store.referenceVideos}
                    audios={store.referenceAudios}
                    onImagesChange={store.setReferenceImages}
                    onVideosChange={store.setReferenceVideos}
                    onAudiosChange={store.setReferenceAudios}
                  />
                  <ReferenceFileLinkInputs
                    model={selectedVideoModel}
                    files={store.referenceFiles}
                    links={store.referenceLinks}
                    onFilesChange={store.setReferenceFiles}
                    onLinksChange={store.setReferenceLinks}
                  />
                </div>
              ) : (
                <UploadSlots
                  mediaType={mediaType}
                  imageModel={selectedImageModel}
                  videoModel={selectedVideoModel}
                  enableEndFrame={parameters.enableEndFrame}
                  imageInputs={store.imageInputs}
                  startFrame={store.videoStartInput}
                  endFrame={store.videoEndInput}
                  audioFile={store.videoAudioInput}
                  onImageInputsChange={store.setImageInputs}
                  onStartFrameChange={store.setVideoStartInput}
                  onEndFrameChange={store.setVideoEndInput}
                  onAudioFileChange={store.setVideoAudioInput}
                />
              )}
            </div>

            <div className='relative flex min-h-[140px] min-w-0 flex-1 flex-col overflow-hidden rounded-md bg-transparent sm:min-h-[190px]'>
              {isReferenceVideo ? (
                <ReferencePromptEditor
                  value={store.referencePromptDoc}
                  assets={referenceAssets}
                  insertMentionRequest={mentionInsertRequest}
                  maxLength={2000}
                  onChange={handleReferencePromptChange}
                />
              ) : (
                <>
                  <textarea
                    value={standardPrompt}
                    maxLength={2000}
                    onChange={(event) => {
                      if (mediaType === 'image') store.setImagePrompt(event.target.value);
                      else store.setVideoPrompt(event.target.value);
                    }}
                    placeholder={t('prompt-placeholder')}
                    className='custom-scrollbar text-color-t1 placeholder:text-color-t3 min-h-0 w-full flex-1 resize-none overflow-y-auto bg-transparent px-0 py-0 pr-24 text-[15px] leading-7 outline-none'
                  />
                  <div className='text-color-t3 pointer-events-none absolute right-3 bottom-3 text-sm'>
                    {standardPrompt.length} / 2000
                  </div>
                </>
              )}
            </div>
          </div>

          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center'>
              <ParameterPopover
                resolutions={resolutionOptions}
                ratios={ratioOptions}
                durations={mediaType === 'video' ? durationOptions : []}
                durationRange={mediaType === 'video' ? videoVersion?.options.durationRange : undefined}
                qualityOptions={mediaType === 'image' ? selectedImageModel?.options.quality || [] : []}
                resolution={parameters.resolution}
                ratio={parameters.ratio}
                duration={parameters.duration}
                quality={parameters.quality}
                seed={parameters.seed}
                seedRange={seedRange}
                supportsSeed={supportsSeed}
                negativePrompt={parameters.negativePrompt}
                supportsNegativePrompt={isReferenceVideo && !!selectedVideoModel?.options.negativePrompt}
                labels={{
                  resolution: t('resolution'),
                  ratio: t('ratio'),
                  duration: t('duration'),
                  quality: t('quality'),
                  seed: t('seed'),
                  negativePrompt: t('negative-prompt'),
                  optional: t('optional'),
                }}
                open={openPopover === 'parameters'}
                onOpenChange={(open) => setOpenPopover(open ? 'parameters' : null)}
                onResolutionChange={(resolution) => {
                  if (mediaType === 'image') store.setImageParameters({ resolution });
                  else store.setVideoParameters(videoType, { resolution });
                }}
                onRatioChange={(ratio) => {
                  if (mediaType === 'image') store.setImageParameters({ ratio });
                  else store.setVideoParameters(videoType, { ratio });
                }}
                onDurationChange={(duration) => store.setVideoParameters(videoType, { duration })}
                onQualityChange={(quality) => store.setImageParameters({ quality })}
                onSeedChange={(seed) => store.setVideoParameters(videoType, { seed })}
                onNegativePromptChange={(negativePrompt) => store.setVideoParameters(videoType, { negativePrompt })}
              />
              {mediaType === 'image' && selectedImageModel ? (
                <ModelPopover
                  models={availableImageModels}
                  selectedModel={selectedImageModel}
                  label={t('model')}
                  onChange={handleImageModelChange}
                />
              ) : null}
              {mediaType === 'video' && selectedVideoModel && selectedVideoPopoverModel ? (
                <ModelPopover
                  models={videoModelsForPopover}
                  selectedModel={selectedVideoPopoverModel}
                  label={t('model')}
                  onChange={handleVideoModelChange}
                />
              ) : null}
              {mediaType === 'video' &&
              videoType === 'image-to-video' &&
              selectedVideoModel?.options.endFrame?.isSupported ? (
                <EndFrameToggle
                  checked={parameters.enableEndFrame}
                  label={t('end-frame')}
                  onCheckedChange={(checked) => {
                    store.setVideoParameters(videoType, { enableEndFrame: checked });
                    if (!checked) store.setVideoEndInput(null);
                  }}
                />
              ) : null}
              {mediaType === 'video' && selectedVideoModel?.options.sound ? (
                <SwitchPopover
                  items={[{ key: 'enableAudio', label: t('sound'), checked: parameters.sound }]}
                  open={openPopover === 'panel'}
                  onOpenChange={(open) => setOpenPopover(open ? 'panel' : null)}
                  onToggle={(_, checked) => store.setVideoParameters(videoType, { sound: checked })}
                />
              ) : null}
              {isReferenceVideo ? (
                <ReferenceMentionPickerPopover
                  assets={referenceAssets}
                  disabled={referenceAssets.length === 0}
                  onSelect={handleSelectMentionAsset}
                />
              ) : null}
            </div>

            {submitMode === 'transfer' ? (
              <Link
                href='/ai-media-creator'
                onClick={store.requestCreatorSubmit}
                className='bg-color-main inline-flex h-9 w-full min-w-[120px] shrink-0 items-center justify-center gap-2 rounded-md px-4 py-0 text-base leading-none font-medium whitespace-nowrap text-white transition-opacity hover:text-white hover:opacity-90 sm:w-auto'
              >
                {t('generate')}
              </Link>
            ) : (
              <button
                type='button'
                onClick={() => void handleSubmit()}
                disabled={isSubmitting || (mediaType === 'video' && !selectedVideoModel)}
                className='bg-color-main inline-flex h-9 w-full min-w-[120px] shrink-0 items-center justify-center gap-2 rounded-md px-4 py-0 text-base leading-none font-medium whitespace-nowrap text-white transition-opacity hover:text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto'
              >
                {t('generate')}
                {isSubmitting ? <Loader2 className='size-4 animate-spin' /> : null}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
