import { useMemo } from 'react';
import { createStore } from 'zustand/vanilla';
import type { InfiniteCanvasModelAdapter } from '../infinite-canvas-model-adapter';

import {
  SOURCE_APPROVED_MODELS,
  SOURCE_DEFAULT_AUDIO_MODEL,
  SOURCE_DEFAULT_AUDIO_VOICE,
  SOURCE_DEFAULT_IMAGE_MODEL,
  SOURCE_DEFAULT_IMAGE_PARAMETERS,
  SOURCE_DEFAULT_VIDEO_MODEL,
  sourceModelName,
} from '../runtime/generation/source-model-data';
import { useInfiniteCanvasStore } from './editor-store-registry';

export type ModelCapability = 'image' | 'video' | 'text' | 'audio' | '3d' | 'music' | 'lyrics';
export type ReasoningEffort = 'auto' | 'low' | 'medium' | 'high' | 'xhigh';

export type AiConfig = {
  /** Runtime-only capability, never restored from or written to local storage. */
  readonly modelAdapter?: InfiniteCanvasModelAdapter;
  readonly music?: import('../music.types').CanvasMusicValues;
  /** Runtime-only connected text; the source nodes remain the persistence authority. */
  readonly musicConnectedText?: string;
  model: string;
  imageModel: string;
  videoModel: string;
  textModel: string;
  audioModel: string;
  audioVoice: string;
  audioFormat: string;
  audioSpeed: string;
  audioInstructions: string;
  imageResolution: string;
  imageVersion: string;
  videoSeconds: string;
  vquality: string;
  videoGenerateAudio: string;
  videoWatermark: string;
  seed?: number;
  negativePrompt?: string;
  isTranslate?: boolean;
  systemPrompt: string;
  reasoningEffort: ReasoningEffort;
  models: string[];
  quality: string;
  size: string;
  background: string;
  count: string;
  canvasImageCount: string;
};

export type ConfigTabKey = 'preferences' | 'prompt-sources' | 'local-storage';

const SOURCE_MODEL_PREFIX = 'default::';

function sourceModelValue(model: string): string {
  return `${SOURCE_MODEL_PREFIX}${model}`;
}

export const defaultConfig: AiConfig = {
  model: sourceModelValue(SOURCE_DEFAULT_IMAGE_MODEL),
  imageModel: sourceModelValue(SOURCE_DEFAULT_IMAGE_MODEL),
  videoModel: sourceModelValue(SOURCE_DEFAULT_VIDEO_MODEL),
  textModel: '',
  audioModel: sourceModelValue(SOURCE_DEFAULT_AUDIO_MODEL),
  audioVoice: SOURCE_DEFAULT_AUDIO_VOICE,
  audioFormat: 'mp3',
  audioSpeed: '1',
  audioInstructions: '',
  imageResolution: SOURCE_DEFAULT_IMAGE_PARAMETERS.resolution,
  imageVersion: SOURCE_DEFAULT_IMAGE_PARAMETERS.version,
  videoSeconds: '5s',
  vquality: '720p',
  videoGenerateAudio: 'false',
  videoWatermark: 'false',
  systemPrompt: '',
  reasoningEffort: 'auto',
  models: SOURCE_APPROVED_MODELS.map((model) => sourceModelValue(model.name)),
  quality: '',
  size: SOURCE_DEFAULT_IMAGE_PARAMETERS.ratio,
  background: '',
  count: '1',
  canvasImageCount: '3',
};

export type ConfigStore = {
  config: AiConfig;
  isConfigOpen: boolean;
  configTab: ConfigTabKey;
  shouldPromptContinue: boolean;
  updateConfig: <Key extends keyof AiConfig>(key: Key, value: AiConfig[Key]) => void;
  isAiConfigReady: (config: AiConfig, model: string) => boolean;
  openConfigDialog: (shouldPromptContinue?: boolean, tab?: ConfigTabKey) => void;
  setConfigDialogOpen: (isOpen: boolean) => void;
  clearPromptContinue: () => void;
};

export function createConfigStore(modelAdapter?: InfiniteCanvasModelAdapter) {
  return createStore<ConfigStore>()((set) => ({
    config: modelAdapter ? normalizeConfig({}, modelAdapter) : defaultConfig,
    isConfigOpen: false,
    configTab: 'preferences',
    shouldPromptContinue: false,
    updateConfig: (key, value) =>
      set((state) => ({
        config: normalizeConfig({ ...state.config, [key]: value }, state.config.modelAdapter),
      })),
    isAiConfigReady: (config, model) => isApprovedModel(config, model),
    openConfigDialog: (shouldPromptContinue = false, configTab = 'preferences') =>
      set({ isConfigOpen: true, shouldPromptContinue, configTab }),
    setConfigDialogOpen: (isConfigOpen) => set({ isConfigOpen }),
    clearPromptContinue: () => set({ shouldPromptContinue: false }),
  }));
}

export function useConfigStore<Selected>(selector: (state: ConfigStore) => Selected): Selected {
  return useInfiniteCanvasStore('config', selector);
}

export function useEffectiveConfig(): AiConfig {
  const config = useConfigStore((state) => state.config);
  return useMemo(() => normalizeConfig(config), [config]);
}

export function persistedConfig(config: AiConfig): Omit<AiConfig, 'modelAdapter'> {
  const { modelAdapter: _modelAdapter, musicConnectedText: _musicConnectedText, ...preferences } = config;
  return preferences;
}

export function decodeChannelModel(value: string): { channelId: string; model: string } | null {
  const separator = value.indexOf('::');
  if (separator < 0) return null;
  return { channelId: value.slice(0, separator), model: value.slice(separator + 2) };
}

export function modelOptionName(value: string): string {
  return sourceModelName(value);
}

export function modelOptionLabel(config: AiConfig, value: string): string {
  const name = modelOptionName(value);
  return (config.modelAdapter?.models ?? SOURCE_APPROVED_MODELS).find((model) => model.name === name)?.label ?? name;
}

export function modelCapabilityOf(config: AiConfig, value: string): ModelCapability | undefined {
  return (config.modelAdapter?.models ?? SOURCE_APPROVED_MODELS).find((model) => model.name === modelOptionName(value))?.capability;
}

export function modelMatchesCapability(config: AiConfig, value: string, capability?: ModelCapability): boolean {
  if (capability === undefined) return isApprovedModel(config, value);
  return modelCapabilityOf(config, value) === capability;
}

export function selectableModelsByCapability(config: AiConfig, capability?: ModelCapability): string[] {
  return (config.modelAdapter?.models ?? SOURCE_APPROVED_MODELS).filter((model) => capability === undefined || model.capability === capability).map(
    (model) => sourceModelValue(model.name),
  );
}

export function resolveModelForCapability(
  config: AiConfig,
  currentModel: string | undefined,
  capability: ModelCapability,
): string {
  if (capability === 'music' || capability === 'lyrics') {
    if (currentModel) return normalizeModelValue(currentModel);
    const music = config.modelAdapter?.music;
    return music ? sourceModelValue(capability === 'lyrics' ? music.lyricsModels[0] || music.defaultModel : music.defaultModel) : '';
  }
  if (capability === '3d') {
    if (currentModel && modelMatchesCapability(config, currentModel, '3d')) return currentModel;
    return config.modelAdapter?.threeD ? sourceModelValue(config.modelAdapter.threeD.defaultModel) : '';
  }
  const configured =
    capability === 'image'
      ? config.imageModel
      : capability === 'video'
        ? config.videoModel
        : capability === 'audio'
          ? config.audioModel
          : config.textModel;
  const fallback =
    config.modelAdapter
      ? capability === 'image'
        ? sourceModelValue(config.modelAdapter.defaultImageModel)
        : capability === 'video'
          ? sourceModelValue(config.modelAdapter.defaultVideoModel)
          : ''
      :
    capability === 'image'
      ? defaultConfig.imageModel
      : capability === 'video'
        ? defaultConfig.videoModel
        : capability === 'audio'
          ? defaultConfig.audioModel
          : '';
  // Preserve an unavailable saved model until the user explicitly chooses a replacement.
  if (currentModel && config.modelAdapter && (modelCapabilityOf(config, currentModel) === undefined || modelMatchesCapability(config, currentModel, capability))) return normalizeModelValue(currentModel);
  if (currentModel && modelMatchesCapability(config, currentModel, capability)) return normalizeModelValue(currentModel);
  if (configured && modelMatchesCapability(config, configured, capability)) return normalizeModelValue(configured);
  return fallback;
}

export function normalizeConfig(value: Partial<AiConfig>, modelAdapter = value.modelAdapter): AiConfig {
  if (modelAdapter) {
    const image = modelAdapter.getImageDefaults(modelAdapter.defaultImageModel);
    const video = modelAdapter.getVideoDefaults(modelAdapter.defaultVideoModel, {});
    return {
      ...defaultConfig,
      imageModel: sourceModelValue(modelAdapter.defaultImageModel),
      videoModel: sourceModelValue(modelAdapter.defaultVideoModel),
      model: sourceModelValue(modelAdapter.defaultImageModel),
      audioModel: '',
      imageResolution: image.resolution,
      imageVersion: image.version,
      size: image.ratio,
      videoSeconds: video.duration,
      vquality: video.resolution,
      videoGenerateAudio: String(video.enableAudio),
      ...value,
      modelAdapter,
      models: modelAdapter.models.map((model) => sourceModelValue(model.name)),
    };
  }
  const input = value as Readonly<Record<string, unknown>>;
  const config = Object.fromEntries(
    Object.entries(defaultConfig).map(([key, fallback]) => [key, input[key] ?? fallback]),
  ) as AiConfig;
  return {
    ...config,
    model: approvedAnyModelValue(config.model),
    imageModel: approvedModelValue(config.imageModel || config.model, 'image'),
    videoModel: approvedModelValue(config.videoModel, 'video'),
    textModel: '',
    audioModel: approvedModelValue(config.audioModel, 'audio'),
    models: defaultConfig.models,
    reasoningEffort: normalizeReasoningEffort(config.reasoningEffort),
    videoSeconds: normalizeDurationValue(config.videoSeconds),
    vquality: normalizeResolutionValue(config.vquality),
  };
}

function isApprovedModel(config: AiConfig, value: string): boolean {
  const capability = modelCapabilityOf(config, value);
  const disabled = config.modelAdapter?.models.find((model) => model.name === modelOptionName(value))?.disabled;
  return capability !== undefined && capability !== 'text' && !disabled;
}

function approvedModelValue(value: string | undefined, capability: Exclude<ModelCapability, 'text'>): string {
  const name = modelOptionName(value || '');
  const approved = SOURCE_APPROVED_MODELS.find((model) => model.name === name && model.capability === capability);
  if (approved !== undefined) return sourceModelValue(approved.name);
  if (capability === 'image') return defaultConfig.imageModel;
  if (capability === 'video') return defaultConfig.videoModel;
  return defaultConfig.audioModel;
}

function approvedAnyModelValue(value: string | undefined): string {
  const name = modelOptionName(value || '');
  return SOURCE_APPROVED_MODELS.some((model) => model.name === name) ? sourceModelValue(name) : defaultConfig.model;
}

function normalizeModelValue(value: string): string {
  return sourceModelValue(modelOptionName(value));
}

function normalizeReasoningEffort(value: unknown): ReasoningEffort {
  return value === 'low' || value === 'medium' || value === 'high' || value === 'xhigh' ? value : 'auto';
}

function normalizeDurationValue(value: string): string {
  const normalized = value.trim().toLowerCase();
  return /^\d+$/.test(normalized) ? `${normalized}s` : normalized;
}

function normalizeResolutionValue(value: string): string {
  const normalized = value.trim().toLowerCase();
  return /^\d+$/.test(normalized) ? `${normalized}p` : normalized;
}
