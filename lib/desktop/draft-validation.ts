import { ALL_IMAGE_MODELS, ALL_IMAGE_PROVIDERS } from '@/lib/constants/image';
import { hasReferenceMediaSource } from '@/lib/constants/unified-generator/types';
import { ALL_VIDEO_MODELS, getVersionConfig } from '@/lib/constants/video';

type Option = string | { value: string };
const valid = (value: unknown, options?: readonly Option[] | null) =>
  value === undefined ||
  value === '' ||
  value === null ||
  !!options?.some((option) => (typeof option === 'string' ? option : option.value) === String(value));

export function validImageDraft(data: Record<string, unknown>) {
  const version = ALL_IMAGE_PROVIDERS.flatMap((provider) => provider.versions).find(
    (item) => item.modelVersion === data.modelVersion,
  );
  return (
    !!version &&
    !version.isComingSoon &&
    valid(data.aspectRatio, version.options.ratio) &&
    valid(data.resolution, version.options.resolution) &&
    valid(data.quality, version.options.quality)
  );
}

export function validVideoDraft(data: Record<string, unknown>) {
  const version = getVersionConfig(String(data.modelVersion));
  if (!version || version.isComingSoon) return false;
  const duration = Number(String(data.duration).replace('s', ''));
  const range = version.options.durationRange;
  return (
    valid(data.ratio, version.options.ratio) &&
    valid(data.resolution, version.options.resolution) &&
    (range
      ? Number.isFinite(duration) && duration >= range.min && duration <= range.max
      : valid(data.duration, version.options.duration))
  );
}

export function validUnifiedDraft(data: Record<string, unknown>) {
  const image = ALL_IMAGE_MODELS.find((model) => model.model === data.imageModel);
  const params = (data.imageParameters || {}) as Record<string, unknown>;
  if (
    !image ||
    !valid(params.ratio, image.options.ratio) ||
    !valid(params.resolution, image.options.resolution) ||
    !valid(params.quality, image.options.quality)
  )
    return false;
  const videoParameters = (data.videoParameters || {}) as Record<string, Record<string, unknown>>;
  return Object.entries((data.videoModels || {}) as Record<string, string>).every(([kind, id]) => {
    const model = ALL_VIDEO_MODELS.find(
      (model) => model.model === id && !model.disabled && model.generationType === kind,
    );
    const values = videoParameters[kind] || {};
    return (
      !!model &&
      validVideoDraft({
        ...values,
        modelVersion: model.modelVersion,
        duration: values.duration == null ? undefined : `${values.duration}s`,
      })
    );
  });
}

export function sanitizeUnifiedDraft(data: Record<string, unknown>) {
  const next = { ...data };
  for (const key of ['imageInputs', 'referenceImages', 'referenceVideos', 'referenceAudios']) {
    next[key] = Array.isArray(data[key]) ? data[key].filter(hasReferenceMediaSource) : [];
  }
  for (const key of ['videoStartInput', 'videoEndInput']) {
    next[key] = hasReferenceMediaSource(data[key]) ? data[key] : null;
  }
  next.videoAudioInput = data.videoAudioInput instanceof File ? data.videoAudioInput : null;
  next.referenceFiles = Array.isArray(data.referenceFiles)
    ? data.referenceFiles.filter((value): value is File => value instanceof File)
    : [];
  return next;
}
