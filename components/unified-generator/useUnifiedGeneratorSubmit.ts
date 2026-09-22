'use client';

import { useState } from 'react';
import { getClientOpenApiConfigAsync } from '@/network/clientFetch';
import { createImageTask } from '@/network/image/client';
import { addPendingImageHistory } from '@/network/image/history';
import { startTaskPolling } from '@/network/task-polling';
import { createVideoTask } from '@/network/video/client';
import { addPendingVideoHistory } from '@/network/video/history';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import type { ImageModel } from '@/lib/constants/image';
import type {
  UnifiedGeneratorReferenceMediaAsset,
  UnifiedGeneratorReferencePromptNode,
} from '@/lib/constants/unified-generator/types';
import type { VideoGenerationType, VideoModel } from '@/lib/constants/video';
import trimAudioFile from '@/lib/utils/audioUtils';
import { isAcceptedMediaFile, type RestrictedMediaKind } from '@/lib/utils/media-upload-formats';
import { serializeReferencePrompt, validateReferencePromptReferences } from '@/lib/utils/reference-video-prompt';
import { trimVideoFile } from '@/lib/utils/videoUtils';
import useUploadFiles from '@/hooks/use-upload-files';

interface UnifiedSubmitInput {
  mediaType: 'image' | 'video';
  videoType: Exclude<VideoGenerationType, 'video-edit'>;
  imageModel?: ImageModel;
  videoModel?: VideoModel;
  prompt: string;
  promptDoc?: UnifiedGeneratorReferencePromptNode;
  images: UnifiedGeneratorReferenceMediaAsset[];
  startImage?: UnifiedGeneratorReferenceMediaAsset | null;
  endImage?: UnifiedGeneratorReferenceMediaAsset | null;
  videos: UnifiedGeneratorReferenceMediaAsset[];
  audios: UnifiedGeneratorReferenceMediaAsset[];
  files: File[];
  links: string[];
  ratio?: string;
  resolution?: string;
  duration?: number;
  quality?: string;
  sound?: boolean;
  enableEndFrame?: boolean;
  seed?: number;
  negativePrompt?: string;
  guidanceScale?: number;
}

function getImageDimensions(ratio?: string, resolution?: string) {
  const base = resolution?.toLowerCase() === '2k' ? 2048 : 1024;
  const [widthRatio, heightRatio] = (ratio || '1:1').split(':').map(Number);
  if (!widthRatio || !heightRatio) return { width: base, height: base };

  if (widthRatio >= heightRatio) {
    return { width: base, height: Math.round((base * heightRatio) / widthRatio) };
  }
  return { width: Math.round((base * widthRatio) / heightRatio), height: base };
}

function hasUnsupportedLocalMedia(
  assets: UnifiedGeneratorReferenceMediaAsset[],
  kind: RestrictedMediaKind,
  acceptedFormats?: string[],
) {
  return assets.some((asset) => {
    const file = asset.originalFile || asset.source;
    return file instanceof File && !isAcceptedMediaFile(file, kind, acceptedFormats);
  });
}

async function getMediaDuration(source: File | string) {
  return new Promise<number>((resolve, reject) => {
    const kind = source instanceof File && source.type.startsWith('audio/') ? 'audio' : 'video';
    const element = document.createElement(kind);
    const objectUrl = source instanceof File ? URL.createObjectURL(source) : source;
    element.preload = 'metadata';
    element.onloadedmetadata = () => {
      const duration = element.duration;
      if (source instanceof File) URL.revokeObjectURL(objectUrl);
      resolve(duration);
    };
    element.onerror = () => {
      if (source instanceof File) URL.revokeObjectURL(objectUrl);
      reject(new Error('media-metadata'));
    };
    element.src = objectUrl;
  });
}

export default function useUnifiedGeneratorSubmit() {
  const t = useTranslations('UnifiedGenerator');
  const tUpload = useTranslations('components.hero-form.reference-upload');
  const uploadFiles = useUploadFiles();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const upload = async (files: File[]) => {
    if (!files.length) return [];
    return uploadFiles(files.map((file) => ({ data: file, type: file.type || 'application/octet-stream' })));
  };

  const uploadAssets = async (assets: UnifiedGeneratorReferenceMediaAsset[], kind: 'image' | 'video' | 'audio') => {
    const preparedSources = await Promise.all(
      assets.map(async (asset) => {
        if (typeof asset.source === 'string') return asset.source;
        const sourceFile = asset.originalFile || asset.source;
        if (!asset.trimRange) return sourceFile;
        if (kind === 'video') {
          return trimVideoFile(sourceFile, asset.trimRange.startTime, asset.trimRange.endTime);
        }
        if (kind === 'audio') {
          return trimAudioFile(sourceFile, asset.trimRange.startTime, asset.trimRange.endTime);
        }
        return sourceFile;
      }),
    );
    const localFiles = preparedSources.filter((source): source is File => source instanceof File);
    const uploadedUrls = await upload(localFiles);
    let uploadedIndex = 0;
    return preparedSources
      .map((source) => {
        if (typeof source === 'string') return source;
        const url = uploadedUrls[uploadedIndex];
        uploadedIndex += 1;
        return url;
      })
      .filter(Boolean);
  };

  const validateMediaDurations = async (
    model: VideoModel,
    videos: UnifiedGeneratorReferenceMediaAsset[],
    audios: UnifiedGeneratorReferenceMediaAsset[],
  ) => {
    const validateGroup = async (
      items: UnifiedGeneratorReferenceMediaAsset[],
      constraints?: { minDurationSeconds?: number; maxDurationSeconds?: number; maxTotalDurationSeconds?: number },
    ) => {
      if (!items.length || !constraints) return;
      const durations = await Promise.all(items.map((item) => item.duration ?? getMediaDuration(item.source)));
      const invalid = durations.some(
        (duration) =>
          (constraints.minDurationSeconds !== undefined && duration < constraints.minDurationSeconds) ||
          (constraints.maxDurationSeconds !== undefined && duration > constraints.maxDurationSeconds),
      );
      if (invalid) {
        throw new Error(
          t('errors.media-duration', {
            min: constraints.minDurationSeconds ?? 0,
            max: constraints.maxDurationSeconds ?? 0,
          }),
        );
      }
      if (
        constraints.maxTotalDurationSeconds !== undefined &&
        durations.reduce((sum, duration) => sum + duration, 0) > constraints.maxTotalDurationSeconds
      ) {
        throw new Error(t('errors.total-duration', { max: constraints.maxTotalDurationSeconds }));
      }
    };

    await validateGroup(videos, model.options.multiVideo);
    await validateGroup(audios, model.options.multiAudio);
  };

  const submit = async (input: UnifiedSubmitInput) => {
    if (isSubmitting) return false;
    if (!input.prompt.trim()) {
      toast.error(t('errors.prompt'));
      return false;
    }

    setIsSubmitting(true);
    try {
      if (input.mediaType === 'image') {
        if (!input.imageModel) throw new Error(t('errors.model'));
        if (hasUnsupportedLocalMedia(input.images, 'image')) throw new Error(tUpload('unsupportedFormat'));
        const imageOptions = input.imageModel.options.imageInput;
        const minimum = imageOptions?.required ? imageOptions.min || 1 : 0;
        if (input.images.length < minimum) throw new Error(t('errors.reference-required'));

        const imageUrls = await uploadAssets(input.images, 'image');
        const dimensions = getImageDimensions(input.ratio, input.resolution);
        const response = await createImageTask(await getClientOpenApiConfigAsync(), {
          model_name: input.imageModel.model,
          prompt: input.prompt.trim(),
          width: dimensions.width,
          height: dimensions.height,
          resolution: input.resolution,
          quality: input.quality,
          image_url_list: imageUrls.length ? imageUrls : undefined,
          seed: input.seed,
          negative_prompt: input.negativePrompt || undefined,
        });
        if (response.code !== 0 || !response.data?.task_id) throw new Error(response.message);

        addPendingImageHistory({
          id: response.data.task_id,
          taskId: response.data.task_id,
          prompt: input.prompt.trim(),
          createTime: Date.now(),
          url: '',
          thumbnailUrl: imageUrls[0] || '',
          resolution: input.resolution || input.ratio || '1:1',
          modelName: input.imageModel.model,
          modelInfo: input.imageModel.name,
          userImageUrlList: imageUrls,
        });
        startTaskPolling(response.data.task_id, 'image');
        toast.success(response.message || t('submitted'));
        return true;
      }

      if (!input.videoModel) throw new Error(t('errors.model'));
      const model = input.videoModel;
      const isReferenceVideo = input.videoType === 'reference-to-video';
      const referenceImages = isReferenceVideo ? input.images : [];
      const referenceVideos = isReferenceVideo ? input.videos : [];
      const referenceAudios = isReferenceVideo ? input.audios : [];
      const standardAudio = !isReferenceVideo && model.options.audioUrl ? input.audios.slice(0, 1) : [];
      const referenceFiles = isReferenceVideo ? input.files : [];
      const referenceLinks = isReferenceVideo ? input.links : [];
      if (
        hasUnsupportedLocalMedia(referenceImages, 'image', model.options.multiImage?.acceptedFormats) ||
        hasUnsupportedLocalMedia(referenceVideos, 'video', model.options.multiVideo?.acceptedFormats) ||
        hasUnsupportedLocalMedia(
          input.startImage ? [input.startImage] : [],
          'image',
          model.options.startFrame?.acceptedFormats,
        ) ||
        hasUnsupportedLocalMedia(
          input.endImage ? [input.endImage] : [],
          'image',
          model.options.endFrame?.acceptedFormats,
        )
      ) {
        throw new Error(tUpload('unsupportedFormat'));
      }
      const requiredImages = model.options.multiImage?.required
        ? model.options.multiImage.minImages || 1
        : model.options.startFrame?.required
          ? 1
          : 0;
      const suppliedImageCount = isReferenceVideo ? referenceImages.length : input.startImage ? 1 : 0;
      if (suppliedImageCount < requiredImages) throw new Error(t('errors.reference-required'));

      const minReferenceSubjects =
        model.options.minReferenceSubjects ??
        (model.options.independentReferenceLimits ? 0 : input.videoType === 'reference-to-video' ? 1 : 0);
      const totalReferenceSubjects = referenceImages.length + referenceVideos.length;
      if (totalReferenceSubjects < minReferenceSubjects) {
        throw new Error(t('errors.reference-required'));
      }
      if (
        model.options.maxReferenceSubjects !== undefined &&
        totalReferenceSubjects > model.options.maxReferenceSubjects
      ) {
        throw new Error(t('errors.max-files'));
      }
      if (model.options.multiVideo?.required && referenceVideos.length < (model.options.multiVideo.minVideos || 1)) {
        throw new Error(t('errors.reference-required'));
      }
      if (model.options.multiAudio?.required && referenceAudios.length < (model.options.multiAudio.minAudios || 1)) {
        throw new Error(t('errors.reference-required'));
      }
      if (referenceFiles.length && referenceLinks.some(Boolean)) {
        throw new Error(t('errors.reference-source-exclusive'));
      }
      const acceptedFormats = model.options.referenceFile?.acceptedFormats.map((format) => format.toLowerCase()) || [];
      if (referenceFiles.some((file) => !acceptedFormats.includes(file.name.split('.').pop()?.toLowerCase() || ''))) {
        throw new Error(t('errors.reference-file-format'));
      }
      if (
        referenceLinks.filter(Boolean).some((link) => {
          try {
            const url = new URL(link);
            return url.protocol !== 'http:' && url.protocol !== 'https:';
          } catch {
            return true;
          }
        })
      ) {
        throw new Error(t('errors.reference-link'));
      }

      const missingReferences =
        input.videoType === 'reference-to-video' && input.promptDoc
          ? validateReferencePromptReferences(input.promptDoc, referenceImages, referenceVideos, referenceAudios)
          : [];
      const serializedPrompt =
        input.videoType === 'reference-to-video' && input.promptDoc
          ? serializeReferencePrompt(input.promptDoc, referenceImages, referenceVideos, referenceAudios)
          : input.prompt.trim();
      if (missingReferences.length) {
        throw new Error(t('errors.missing-references', { references: missingReferences.join(', ') }));
      }

      await validateMediaDurations(model, referenceVideos, referenceAudios);
      const [imageUrls, startImageUrls, endImageUrls, videoUrls, audioUrls, standardAudioUrls, fileUrls] =
        await Promise.all([
          uploadAssets(referenceImages, 'image'),
          uploadAssets(input.startImage ? [input.startImage] : [], 'image'),
          uploadAssets(input.enableEndFrame && input.endImage ? [input.endImage] : [], 'image'),
          uploadAssets(referenceVideos, 'video'),
          uploadAssets(referenceAudios, 'audio'),
          uploadAssets(standardAudio, 'audio'),
          upload(referenceFiles),
        ]);
      const response = await createVideoTask(await getClientOpenApiConfigAsync(), {
        model_name: model.model,
        prompt: serializedPrompt,
        aspect_ratio: input.ratio,
        resolution: input.resolution,
        duration: input.duration,
        image_url: input.videoType === 'image-to-video' ? startImageUrls[0] : undefined,
        image_end_url: input.videoType === 'image-to-video' && input.enableEndFrame ? endImageUrls[0] : undefined,
        images: input.videoType === 'reference-to-video' && imageUrls.length ? imageUrls : undefined,
        videos: videoUrls.length ? videoUrls : undefined,
        audios: audioUrls.length ? audioUrls : undefined,
        audio_url: standardAudioUrls[0],
        files: fileUrls.length ? fileUrls : undefined,
        links: referenceLinks.filter(Boolean).length ? referenceLinks.filter(Boolean) : undefined,
        sound: model.options.sound ? input.sound : undefined,
        seed: input.seed,
        negative_prompt: input.negativePrompt || undefined,
        guidance_scale: input.guidanceScale,
      });
      if (response.code !== 0 || !response.data?.task_id) throw new Error(response.message);

      addPendingVideoHistory({
        id: response.data.task_id,
        traceId: response.data.task_id,
        platformName: model.model,
        coverImage: startImageUrls[0] || imageUrls[0] || '',
        categoryName: '',
        createTime: Date.now(),
        duration: input.duration || 0,
        errorInfo: '',
        imageEndUrl: endImageUrls[0] || '',
        imageUrl: startImageUrls[0] || imageUrls[0] || '',
        prompt: serializedPrompt,
        videoId: response.data.task_id,
        videoThumbnailUrl: startImageUrls[0] || imageUrls[0] || '',
        videoUrl: '',
        videoType:
          input.videoType === 'reference-to-video'
            ? 'Reference-to-video'
            : input.videoType === 'image-to-video'
              ? 'Image-to-video'
              : 'Text-to-video',
        ratio: input.ratio,
      });
      startTaskPolling(response.data.task_id, 'video');
      toast.success(response.message || t('submitted'));
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error && error.message !== 'media-metadata' ? error.message : t('errors.media-metadata'),
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting };
}
