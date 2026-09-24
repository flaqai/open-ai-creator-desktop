import { TEMPLATE_IMAGE_MODELS, TEMPLATE_VIDEO_MODELS, TEMPLATE_MODELS_BY_ID } from '@/lib/constants/template-models';
import type { InfiniteCanvasModelAdapter } from '../../infinite-canvas-model-adapter';

export type SourceModelCapability = 'image' | 'video' | 'audio' | '3d' | 'music';
export interface SourceApprovedModel {
  readonly capability: SourceModelCapability;
  readonly disabled?: boolean;
  readonly iconUrl?: string;
  readonly label: string;
  readonly name: string;
  readonly presentationKey: string;
}
export interface SourceVideoInputContext {
  readonly hasAudioSubjects?: boolean;
  readonly hasEndFrame?: boolean;
  readonly hasImage?: boolean;
  readonly hasVideoSubjects?: boolean;
  readonly videoToVideo?: boolean;
}
export interface VideoParameterOption { readonly name: string; readonly value: string; readonly disabled?: boolean; }
export interface ImageParameterConfig {
  readonly label: 'Quality' | 'Ratio' | 'Resolution' | 'Version';
  readonly name: 'ratio' | 'resolution' | 'version';
  readonly options: readonly VideoParameterOption[];
}
export interface VideoModelUiConfig {
  readonly durations: readonly VideoParameterOption[];
  readonly ratios: readonly VideoParameterOption[];
  readonly resolutions: readonly VideoParameterOption[];
  readonly audioDisabled: boolean;
  readonly requiresImage: boolean;
  readonly showAudioToggle: boolean;
  readonly showEndFrame: boolean;
  readonly showImageUpload: boolean;
  readonly showPrompt: boolean;
}
export interface SourceVideoModelConfig {
  readonly mode: 'reference-to-video' | 'text-or-image-to-video' | 'video-to-video';
  readonly model: string;
  readonly ui: VideoModelUiConfig;
  readonly version: string;
}
export interface SourceVideoParameterState extends SourceVideoModelConfig {
  readonly duration: string;
  readonly enableAudio: boolean;
  readonly ratio: string;
  readonly resolution: string;
}

// The template catalog is the only source of available models and public parameters.
export const SOURCE_APPROVED_MODELS: readonly SourceApprovedModel[] = [...TEMPLATE_IMAGE_MODELS, ...TEMPLATE_VIDEO_MODELS].map((model) => ({
  capability: model.mediaType, disabled: model.disabled, label: model.label, name: model.id, presentationKey: model.id,
}));
export const SOURCE_DEFAULT_IMAGE_MODEL = TEMPLATE_IMAGE_MODELS[0].id;
export const SOURCE_DEFAULT_VIDEO_MODEL = TEMPLATE_VIDEO_MODELS[0].id;
export const SOURCE_REFERENCE_VIDEO_MODELS = TEMPLATE_VIDEO_MODELS.filter((model) => model.generationType === 'reference-to-video' || model.inputs.image?.multiple || model.inputs.video?.multiple).map((model) => model.id);
export const SOURCE_VIDEO_TO_VIDEO_MODELS = TEMPLATE_VIDEO_MODELS.filter((model) => model.generationType === 'video-edit').map((model) => model.id);
export const SOURCE_DEFAULT_REFERENCE_VIDEO_MODEL = SOURCE_REFERENCE_VIDEO_MODELS[0] ?? '';
export const SOURCE_DEFAULT_VIDEO_TO_VIDEO_MODEL = SOURCE_VIDEO_TO_VIDEO_MODELS[0] ?? '';
export const SOURCE_DEFAULT_AUDIO_MODEL = '';
export const SOURCE_DEFAULT_AUDIO_VOICE = '';

export function sourceModelName(value: string): string {
  const separator = value.indexOf('::');
  return (separator < 0 ? value : value.slice(separator + 2)).trim();
}
export function sourceModelPresentationKey(value: string, adapter?: InfiniteCanvasModelAdapter): string {
  return adapter?.models.find((model) => model.name === sourceModelName(value))?.presentationKey ?? sourceModelName(value);
}
export function isSourceVideoToVideoModel(value: string, adapter?: InfiniteCanvasModelAdapter): boolean {
  return (adapter?.videoToVideoModels ?? SOURCE_VIDEO_TO_VIDEO_MODELS).includes(sourceModelName(value));
}
export function resolveSourceReferenceVideoModel(value: string, adapter?: InfiniteCanvasModelAdapter): string {
  if (adapter) return adapter.resolveReferenceVideoModel(value);
  return SOURCE_REFERENCE_VIDEO_MODELS.includes(sourceModelName(value)) ? value : SOURCE_DEFAULT_REFERENCE_VIDEO_MODEL;
}
const options = (values: readonly string[] = []): VideoParameterOption[] => values.map((value) => ({ name: value, value }));
export function getSourceImageModelParameters(value: string, adapter?: InfiniteCanvasModelAdapter): readonly ImageParameterConfig[] {
  if (adapter) return adapter.getImageParameters(sourceModelName(value));
  const params = TEMPLATE_MODELS_BY_ID[sourceModelName(value)]?.params;
  const result: ImageParameterConfig[] = [];
  if (params?.resolution?.length) result.push({ name: 'resolution', label: 'Resolution', options: options(params.resolution) });
  if (params?.quality?.length) result.push({ name: 'version', label: 'Quality', options: options(params.quality) });
  if (params?.ratio?.length) result.push({ name: 'ratio', label: 'Ratio', options: options(params.ratio) });
  return result;
}
export function getSourceImageModelDefaults(value: string, adapter?: InfiniteCanvasModelAdapter) {
  if (adapter) return adapter.getImageDefaults(sourceModelName(value));
  const params = TEMPLATE_MODELS_BY_ID[sourceModelName(value)]?.params;
  return { ratio: params?.ratio?.[0] ?? '1:1', resolution: params?.resolution?.[0] ?? '', version: params?.quality?.[0] ?? '' };
}
export const SOURCE_DEFAULT_IMAGE_PARAMETERS = getSourceImageModelDefaults(SOURCE_DEFAULT_IMAGE_MODEL);
export function getSourceVideoModelConfig(value: string, values: { duration: string; enableAudio: boolean; ratio: string; resolution: string }, context: SourceVideoInputContext = {}, adapter?: InfiniteCanvasModelAdapter): SourceVideoModelConfig {
  if (adapter) return adapter.getVideoConfig(sourceModelName(value), values, context);
  const model = TEMPLATE_MODELS_BY_ID[sourceModelName(value)];
  const params = model?.params;
  const duration = params?.duration ?? (params?.durationRange ? Array.from({ length: params.durationRange.max - params.durationRange.min + 1 }, (_, index) => params.durationRange!.min + index) : []);
  return {
    model: model?.id ?? sourceModelName(value), version: '',
    mode: isSourceVideoToVideoModel(value) ? 'video-to-video' : SOURCE_REFERENCE_VIDEO_MODELS.includes(sourceModelName(value)) ? 'reference-to-video' : 'text-or-image-to-video',
    ui: {
      durations: options(duration.map((item) => `${item}s`)), ratios: options(params?.ratio), resolutions: options(params?.resolution),
      audioDisabled: !params?.sound, showAudioToggle: Boolean(params?.sound),
      requiresImage: Boolean(model?.inputs.startFrame?.required || model?.inputs.image?.required),
      showEndFrame: Boolean(model?.inputs.endFrame?.supported), showImageUpload: Boolean(model?.inputs.startFrame?.supported || model?.inputs.image?.supported),
      showPrompt: model?.inputs.prompt?.supported !== false,
    },
  };
}
function resolveNextVideoParameterValue(values: readonly VideoParameterOption[], selected: string) {
  return values.find((item) => item.value === selected && !item.disabled)?.value ?? values.find((item) => !item.disabled)?.value ?? '';
}
export function getSourceVideoModelDefaults(value: string, context: SourceVideoInputContext = {}, adapter?: InfiniteCanvasModelAdapter) {
  if (adapter) return adapter.getVideoDefaults(sourceModelName(value), context);
  const model = getSourceVideoModelConfig(value, { duration: '', ratio: '', resolution: '', enableAudio: false }, context);
  return { duration: model.ui.durations[0]?.value ?? '', ratio: model.ui.ratios[0]?.value ?? '', resolution: model.ui.resolutions[0]?.value ?? '', enableAudio: TEMPLATE_MODELS_BY_ID[sourceModelName(value)]?.params?.defaultSound ?? false };
}
export function getSourceVideoParameterState(model: string, values: { duration: string; enableAudio: boolean; ratio: string; resolution: string }, context: SourceVideoInputContext = {}, adapter?: InfiniteCanvasModelAdapter): SourceVideoParameterState {
  const config = getSourceVideoModelConfig(model, values, context, adapter);
  return { ...config, duration: resolveNextVideoParameterValue(config.ui.durations, values.duration), enableAudio: config.ui.showAudioToggle && !config.ui.audioDisabled ? values.enableAudio : false, ratio: resolveNextVideoParameterValue(config.ui.ratios, values.ratio), resolution: resolveNextVideoParameterValue(config.ui.resolutions, values.resolution) };
}
export function getSourceModelMetadataPatch(model: string, capability: SourceModelCapability | 'text' | 'lyrics', context: SourceVideoInputContext = {}, adapter?: InfiniteCanvasModelAdapter) {
  if (capability === 'music' || capability === 'lyrics') return { model, music: adapter?.music?.getDefaults(model) };
  if (capability === 'image') {
    const defaults = getSourceImageModelDefaults(model, adapter);
    return { model, imageResolution: defaults.resolution, imageVersion: defaults.version, quality: defaults.version, size: defaults.ratio };
  }
  if (capability === 'video') {
    const defaults = getSourceVideoModelDefaults(model, context, adapter);
    return { model, generateAudio: String(defaults.enableAudio), seconds: defaults.duration, size: defaults.ratio, vquality: defaults.resolution };
  }
  if (capability === 'audio') return { model, audioVoice: SOURCE_DEFAULT_AUDIO_VOICE };
  return { model };
}
