import { TEMPLATE_IMAGE_MODELS, TEMPLATE_MODELS_BY_ID, TEMPLATE_VIDEO_MODELS } from '@/lib/constants/template-models';
import type { TemplateMediaInputConfig, TemplateModelConfig } from '@/lib/constants/template-models';
import { getTemplateModelFamilyId, getTemplateModelFamilyLabel } from '@/lib/constants/template-models/model-family';

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
  readonly imageCount?: number;
  readonly videoCount?: number;
  readonly audioCount?: number;
  readonly hasAudioSubjects?: boolean;
  readonly hasEndFrame?: boolean;
  readonly hasImage?: boolean;
  readonly hasVideoSubjects?: boolean;
  readonly videoToVideo?: boolean;
}
export interface VideoParameterOption {
  readonly name: string;
  readonly value: string;
  readonly disabled?: boolean;
}
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
export const SOURCE_APPROVED_MODELS: readonly SourceApprovedModel[] = [
  ...TEMPLATE_IMAGE_MODELS,
  ...TEMPLATE_VIDEO_MODELS,
].map((model) => ({
  capability: model.mediaType,
  disabled: model.disabled,
  label: model.label,
  name: model.id,
  presentationKey: model.id,
}));
export const SOURCE_DEFAULT_IMAGE_MODEL = TEMPLATE_IMAGE_MODELS[0].id;
export const SOURCE_DEFAULT_VIDEO_MODEL = TEMPLATE_VIDEO_MODELS[0].id;
export const SOURCE_REFERENCE_VIDEO_MODELS = TEMPLATE_VIDEO_MODELS.filter(
  (model) =>
    model.generationType === 'reference-to-video' || model.inputs.image?.multiple || model.inputs.video?.multiple,
).map((model) => model.id);
export const SOURCE_VIDEO_TO_VIDEO_MODELS = TEMPLATE_VIDEO_MODELS.filter(
  (model) => model.generationType === 'video-edit',
).map((model) => model.id);
export const SOURCE_DEFAULT_REFERENCE_VIDEO_MODEL = SOURCE_REFERENCE_VIDEO_MODELS[0] ?? '';
export const SOURCE_DEFAULT_VIDEO_TO_VIDEO_MODEL = SOURCE_VIDEO_TO_VIDEO_MODELS[0] ?? '';
export const SOURCE_DEFAULT_AUDIO_MODEL = '';
export const SOURCE_DEFAULT_AUDIO_VOICE = '';

export function sourceModelName(value: string): string {
  const separator = value.indexOf('::');
  return (separator < 0 ? value : value.slice(separator + 2)).trim();
}
export function sourceModelFamilyKey(value: string): string {
  const model = TEMPLATE_MODELS_BY_ID[sourceModelName(value)];
  return model ? getTemplateModelFamilyId(model) : value;
}
export function sourceModelFamilyLabel(value: string): string {
  const model = TEMPLATE_MODELS_BY_ID[sourceModelName(value)];
  return model ? getTemplateModelFamilyLabel(model) : sourceModelName(value);
}
export interface SourceModelInputs {
  imageCount: number;
  videoCount?: number;
  audioCount?: number;
}
function acceptsCount(input: TemplateMediaInputConfig | undefined, count: number): boolean {
  if (!input?.supported) return count === 0 && !input?.required;
  return (
    count >= (input.required ? (input.min ?? 1) : (input.min ?? 0)) &&
    count <= (input.multiple ? (input.max ?? Infinity) : Math.min(input.max ?? 1, 1))
  );
}
function acceptsInputs(model: TemplateModelConfig, input: SourceModelInputs): boolean {
  if (model.mediaType === 'image') return acceptsCount(model.inputs.image, input.imageCount);
  if ((model.params?.minReferenceSubjects ?? 0) > input.imageCount + (input.videoCount ?? 0) + (input.audioCount ?? 0))
    return false;
  const images = model.inputs.image?.supported
    ? acceptsCount(model.inputs.image, input.imageCount)
    : acceptsCount(model.inputs.startFrame, Math.min(input.imageCount, 1)) &&
      acceptsCount(model.inputs.endFrame, Math.max(input.imageCount - 1, 0));
  return (
    images &&
    acceptsCount(model.inputs.video, input.videoCount ?? 0) &&
    acceptsCount(model.inputs.audio, input.audioCount ?? 0)
  );
}
/** Resolve only within the selected public model family; never substitute another provider. */
export function resolveSourceModelForInputs(
  value: string,
  mediaType: 'image' | 'video',
  input: SourceModelInputs,
): TemplateModelConfig | null {
  const selected = TEMPLATE_MODELS_BY_ID[sourceModelName(value)];
  if (!selected || selected.mediaType !== mediaType || selected.disabled) return null;
  if (selected.id.endsWith('-client')) return acceptsInputs(selected, input) ? selected : null;
  const family = getTemplateModelFamilyId(selected);
  const candidates = (mediaType === 'image' ? TEMPLATE_IMAGE_MODELS : TEMPLATE_VIDEO_MODELS).filter(
    (model) => !model.disabled && getTemplateModelFamilyId(model) === family && acceptsInputs(model, input),
  );
  if (!candidates.length) return null;
  if (mediaType === 'image')
    return (
      candidates.find((model) =>
        input.imageCount > 0 ? model.inputs.image?.supported : !model.inputs.image?.supported,
      ) ?? candidates[0]
    );
  const { imageCount, videoCount = 0, audioCount = 0 } = input;
  if (videoCount || audioCount || imageCount > 2)
    return (
      candidates.find(
        (model) => model.generationType === 'reference-to-video' || model.generationType === 'video-edit',
      ) ?? candidates[0]
    );
  if (imageCount === 2)
    return (
      candidates.find((model) => model.inputs.startFrame?.supported && model.inputs.endFrame?.supported) ??
      candidates[0]
    );
  if (imageCount === 1)
    return (
      candidates.find((model) => model.inputs.startFrame?.supported && !model.inputs.endFrame?.required) ??
      candidates[0]
    );
  return (
    candidates.find(
      (model) =>
        model.generationType === 'text-to-video' ||
        (!model.inputs.startFrame?.required && !model.inputs.image?.required),
    ) ?? candidates[0]
  );
}
export function sourceModelPresentationKey(value: string, adapter?: InfiniteCanvasModelAdapter): string {
  return (
    adapter?.models.find((model) => model.name === sourceModelName(value))?.presentationKey ?? sourceModelName(value)
  );
}
export function isSourceVideoToVideoModel(value: string, adapter?: InfiniteCanvasModelAdapter): boolean {
  return (adapter?.videoToVideoModels ?? SOURCE_VIDEO_TO_VIDEO_MODELS).includes(sourceModelName(value));
}
export function resolveSourceReferenceVideoModel(value: string, adapter?: InfiniteCanvasModelAdapter): string {
  if (adapter) return adapter.resolveReferenceVideoModel(value);
  const resolved = resolveSourceModelForInputs(value, 'video', { imageCount: 0, videoCount: 1 });
  if (!resolved) return value;
  const separator = value.indexOf('::');
  return separator < 0 ? resolved.id : `${value.slice(0, separator + 2)}${resolved.id}`;
}
const options = (values: readonly string[] = []): VideoParameterOption[] =>
  values.map((value) => ({ name: value, value }));
export function getSourceImageModelParameters(
  value: string,
  adapter?: InfiniteCanvasModelAdapter,
): readonly ImageParameterConfig[] {
  if (adapter) return adapter.getImageParameters(sourceModelName(value));
  const params = TEMPLATE_MODELS_BY_ID[sourceModelName(value)]?.params;
  const result: ImageParameterConfig[] = [];
  if (params?.resolution?.length)
    result.push({ name: 'resolution', label: 'Resolution', options: options(params.resolution) });
  if (params?.quality?.length) result.push({ name: 'version', label: 'Quality', options: options(params.quality) });
  if (params?.ratio?.length) result.push({ name: 'ratio', label: 'Ratio', options: options(params.ratio) });
  return result;
}
export function getSourceImageModelDefaults(value: string, adapter?: InfiniteCanvasModelAdapter) {
  if (adapter) return adapter.getImageDefaults(sourceModelName(value));
  const params = TEMPLATE_MODELS_BY_ID[sourceModelName(value)]?.params;
  return {
    ratio: params?.ratio?.[0] ?? '1:1',
    resolution: params?.resolution?.[0] ?? '',
    version: params?.quality?.[0] ?? '',
  };
}
export const SOURCE_DEFAULT_IMAGE_PARAMETERS = getSourceImageModelDefaults(SOURCE_DEFAULT_IMAGE_MODEL);
export function getSourceVideoModelConfig(
  value: string,
  values: { duration: string; enableAudio: boolean; ratio: string; resolution: string },
  context: SourceVideoInputContext = {},
  adapter?: InfiniteCanvasModelAdapter,
): SourceVideoModelConfig {
  if (adapter) return adapter.getVideoConfig(sourceModelName(value), values, context);
  const model =
    resolveSourceModelForInputs(value, 'video', {
      imageCount: context.imageCount ?? (context.hasEndFrame ? 2 : context.hasImage ? 1 : 0),
      videoCount: context.videoCount ?? (context.hasVideoSubjects ? 1 : 0),
      audioCount: context.audioCount ?? (context.hasAudioSubjects ? 1 : 0),
    }) ?? TEMPLATE_MODELS_BY_ID[sourceModelName(value)];
  const params = model?.params;
  const duration =
    params?.duration ??
    (params?.durationRange
      ? Array.from(
          { length: params.durationRange.max - params.durationRange.min + 1 },
          (_, index) => params.durationRange!.min + index,
        )
      : []);
  return {
    model: model?.id ?? sourceModelName(value),
    version: '',
    mode: isSourceVideoToVideoModel(model?.id ?? value)
      ? 'video-to-video'
      : SOURCE_REFERENCE_VIDEO_MODELS.includes(model?.id ?? sourceModelName(value))
        ? 'reference-to-video'
        : 'text-or-image-to-video',
    ui: {
      durations: options(duration.map((item) => `${item}s`)),
      ratios: options(params?.ratio),
      resolutions: options(params?.resolution),
      audioDisabled: !params?.sound,
      showAudioToggle: Boolean(params?.sound),
      requiresImage: Boolean(model?.inputs.startFrame?.required || model?.inputs.image?.required),
      showEndFrame: Boolean(model?.inputs.endFrame?.supported),
      showImageUpload: Boolean(model?.inputs.startFrame?.supported || model?.inputs.image?.supported),
      showPrompt: model?.inputs.prompt?.supported !== false,
    },
  };
}
function resolveNextVideoParameterValue(values: readonly VideoParameterOption[], selected: string) {
  return (
    values.find((item) => item.value === selected && !item.disabled)?.value ??
    values.find((item) => !item.disabled)?.value ??
    ''
  );
}
export function getSourceVideoModelDefaults(
  value: string,
  context: SourceVideoInputContext = {},
  adapter?: InfiniteCanvasModelAdapter,
) {
  if (adapter) return adapter.getVideoDefaults(sourceModelName(value), context);
  const model = getSourceVideoModelConfig(
    value,
    { duration: '', ratio: '', resolution: '', enableAudio: false },
    context,
  );
  return {
    duration: model.ui.durations[0]?.value ?? '',
    ratio: model.ui.ratios[0]?.value ?? '',
    resolution: model.ui.resolutions[0]?.value ?? '',
    enableAudio: TEMPLATE_MODELS_BY_ID[model.model]?.params?.defaultSound ?? false,
  };
}
export function getSourceVideoParameterState(
  model: string,
  values: { duration: string; enableAudio: boolean; ratio: string; resolution: string },
  context: SourceVideoInputContext = {},
  adapter?: InfiniteCanvasModelAdapter,
): SourceVideoParameterState {
  const config = getSourceVideoModelConfig(model, values, context, adapter);
  return {
    ...config,
    duration: resolveNextVideoParameterValue(config.ui.durations, values.duration),
    enableAudio: config.ui.showAudioToggle && !config.ui.audioDisabled ? values.enableAudio : false,
    ratio: resolveNextVideoParameterValue(config.ui.ratios, values.ratio),
    resolution: resolveNextVideoParameterValue(config.ui.resolutions, values.resolution),
  };
}
export function getSourceModelMetadataPatch(
  model: string,
  capability: SourceModelCapability | 'text' | 'lyrics',
  context: SourceVideoInputContext = {},
  adapter?: InfiniteCanvasModelAdapter,
) {
  if (capability === 'music' || capability === 'lyrics') return { model, music: adapter?.music?.getDefaults(model) };
  if (capability === 'image') {
    const defaults = getSourceImageModelDefaults(model, adapter);
    return {
      model,
      imageResolution: defaults.resolution,
      imageVersion: defaults.version,
      quality: defaults.version,
      size: defaults.ratio,
    };
  }
  if (capability === 'video') {
    const defaults = getSourceVideoModelDefaults(model, context, adapter);
    return {
      model,
      generateAudio: String(defaults.enableAudio),
      seconds: defaults.duration,
      size: defaults.ratio,
      vquality: defaults.resolution,
    };
  }
  if (capability === 'audio') return { model, audioVoice: SOURCE_DEFAULT_AUDIO_VOICE };
  return { model };
}
