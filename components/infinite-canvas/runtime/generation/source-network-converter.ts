import { TEMPLATE_MODELS_BY_ID } from '@/lib/constants/template-models';
import type { TemplateMediaInputConfig } from '@/lib/constants/template-models';
import { parseAspectRatio } from '@/components/image-ui-form/utils/submitUtils';
import type { CreateImageTaskRequest } from '@/network/image/client';
import type { CreateVideoTaskRequest } from '@/network/video/client';
import type { AiConfig } from '../../stores/use-config-store';
import { sourceModelName } from './source-model-data';
import { translateInfiniteCanvasMessage as t } from '../i18n/infinite-canvas-translation';

export class SourceNetworkConversionError extends Error {
  constructor(readonly code: 'unsupported-model' | 'text-model-unavailable' | 'non-durable-reference', message: string) {
    super(message);
    this.name = 'SourceNetworkConversionError';
  }
}
export interface SourceGenerationAccess {
  readonly model: string;
}
export interface SourceImageConversionInput {
  readonly config: AiConfig;
  readonly prompt: string;
  readonly referenceUrls?: readonly string[];
  readonly maskUrl?: string;
}
export interface SourceVideoConversionInput {
  readonly config: AiConfig;
  readonly prompt: string;
  readonly imageUrls?: readonly string[];
  readonly videoUrls?: readonly string[];
  readonly audioUrls?: readonly string[];
  readonly referenceAudioDurationSeconds?: number;
  readonly videoToVideo?: boolean;
}
function resolveModel(config: AiConfig, mediaType: 'image' | 'video') {
  const model = TEMPLATE_MODELS_BY_ID[sourceModelName(config.model || (mediaType === 'image' ? config.imageModel : config.videoModel))];
  if (!model || model.disabled || model.mediaType !== mediaType) throw new SourceNetworkConversionError('unsupported-model', t('modelAdapter.unavailable'));
  return model;
}
function validateCount(input: TemplateMediaInputConfig | undefined, count: number) {
  if ((!input?.supported && count > 0) || (input?.required && count < (input.min ?? 1)) || (input?.max !== undefined && count > input.max) || (input?.supported && !input.multiple && count > 1)) {
    throw new Error(t('modelAdapter.invalidInputs'));
  }
}
function assertDurableUrls(urls: readonly string[]) {
  if (urls.some((url) => !/^https?:\/\//i.test(url))) throw new SourceNetworkConversionError('non-durable-reference', t('modelAdapter.invalidInputs'));
}
function validateOption(value: string, values: readonly string[] | undefined) {
  if (values?.length && !values.includes(value)) throw new Error(t('modelAdapter.invalidParameters'));
}
function validateAdvanced(config: AiConfig, params: ReturnType<typeof resolveModel>['params']) {
  if (config.seed !== undefined && (!params?.seed || !Number.isInteger(config.seed) || (typeof params.seed === 'object' && (config.seed < params.seed.min || config.seed > params.seed.max)))) throw new Error(t('modelAdapter.invalidParameters'));
}
export function resolveSourceImageGenerationAccess(config: AiConfig, imageCount: number): SourceGenerationAccess {
  if (config.modelAdapter) return config.modelAdapter.resolveImageAccess(config, imageCount);
  const model = resolveModel(config, 'image');
  validateCount(model.inputs.image, imageCount);
  validateOption(config.size, model.params?.ratio);
  validateOption(config.imageResolution, model.params?.resolution);
  validateOption(config.imageVersion, model.params?.quality);
  validateAdvanced(config, model.params);
  return { model: model.id };
}
export function convertSourceImageRequest(input: SourceImageConversionInput): CreateImageTaskRequest {
  const { config, prompt, referenceUrls = [], maskUrl } = input;
  assertDurableUrls(referenceUrls);
  if (config.modelAdapter) return config.modelAdapter.convertImageRequest(input);
  resolveSourceImageGenerationAccess(config, referenceUrls.length);
  if (maskUrl) throw new Error(t('modelAdapter.invalidInputs'));
  const model = resolveModel(config, 'image');
  const { width, height } = parseAspectRatio(config.size);
  return { model_name: model.request.modelName, prompt, width: width || 1, height: height || 1,
    resolution: config.imageResolution || undefined, quality: config.imageVersion || undefined,
    image_url_list: referenceUrls.length ? [...referenceUrls] : undefined,
    seed: model.params?.seed ? config.seed : undefined, negative_prompt: model.params?.negativePrompt ? config.negativePrompt : undefined };
}
export function resolveSourceVideoGenerationAccess(input: { config: AiConfig; imageCount: number; videoCount: number; audioCount: number; videoToVideo?: boolean; referenceDurationSeconds?: number; referenceVideoDurationSeconds?: number; referenceAudioDurationSeconds?: number }): SourceGenerationAccess {
  const { config, imageCount, videoCount, audioCount } = input;
  if (config.modelAdapter) return config.modelAdapter.resolveVideoAccess(input);
  const model = resolveModel(config, 'video');
  if (model.inputs.image?.supported) validateCount(model.inputs.image, imageCount);
  else {
    validateCount(model.inputs.startFrame, Math.min(imageCount, 1));
    validateCount(model.inputs.endFrame, Math.max(imageCount - 1, 0));
  }
  validateCount(model.inputs.video, videoCount);
  validateCount(model.inputs.audio, audioCount);
  validateOption(config.size, model.params?.ratio);
  validateOption(config.vquality, model.params?.resolution);
  const seconds = Number(config.videoSeconds.replace(/s$/, ''));
  if ((model.params?.duration?.length && !model.params.duration.includes(seconds)) || (model.params?.durationRange && (seconds < model.params.durationRange.min || seconds > model.params.durationRange.max))) throw new Error(t('modelAdapter.invalidParameters'));
  validateAdvanced(config, model.params);
  return { model: model.id };
}
export function convertSourceVideoRequest(input: SourceVideoConversionInput): CreateVideoTaskRequest {
  const { config, prompt, imageUrls = [], videoUrls = [], audioUrls = [] } = input;
  assertDurableUrls([...imageUrls, ...videoUrls, ...audioUrls]);
  if (config.modelAdapter) return config.modelAdapter.convertVideoRequest(input);
  resolveSourceVideoGenerationAccess({ config, imageCount: imageUrls.length, videoCount: videoUrls.length, audioCount: audioUrls.length });
  const model = resolveModel(config, 'video');
  return { model_name: model.request.modelName, prompt,
    duration: config.videoSeconds ? Number(config.videoSeconds.replace(/s$/, '')) : undefined,
    aspect_ratio: config.size || undefined, resolution: config.vquality || undefined,
    image_url: model.inputs.startFrame?.supported ? imageUrls[0] : undefined,
    image_end_url: model.inputs.endFrame?.supported ? imageUrls[1] : undefined,
    images: model.inputs.image?.supported && imageUrls.length ? [...imageUrls] : undefined,
    video_url: model.inputs.video?.supported && !model.inputs.video.multiple ? videoUrls[0] : undefined,
    videos: model.inputs.video?.multiple && videoUrls.length ? [...videoUrls] : undefined,
    audio_url: model.inputs.audio?.supported && !model.inputs.audio.multiple ? audioUrls[0] : undefined,
    audios: model.inputs.audio?.multiple && audioUrls.length ? [...audioUrls] : undefined,
    sound: model.params?.sound ? config.videoGenerateAudio === 'true' : undefined,
    seed: model.params?.seed ? config.seed : undefined,
    negative_prompt: model.params?.negativePrompt ? config.negativePrompt : undefined };
}
export function convertSourceTextRequest(): never {
  throw new SourceNetworkConversionError('text-model-unavailable', t('modelAdapter.unavailable'));
}
