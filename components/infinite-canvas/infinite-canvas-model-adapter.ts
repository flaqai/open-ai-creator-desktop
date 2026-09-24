import type { GenerateAsyncVideoRequest } from '@/components/infinite-canvas/types/generation';
import type { ImageGenerationRequest } from '@/components/infinite-canvas/types/generation';

import type { getSourceImageModelParameters as getImageModelParameters } from './runtime/generation/source-model-data';
import type { CanvasMusicAdapter } from './music.types';
import type {
  SourceApprovedModel,
  SourceVideoInputContext,
  SourceVideoModelConfig,
} from './runtime/generation/source-model-data';
import type {
  SourceGenerationAccess,
  SourceImageConversionInput,
  SourceVideoConversionInput,
} from './runtime/generation/source-network-converter';
import type { AiConfig } from './stores/use-config-store';

export interface InfiniteCanvasVideoValues {
  readonly duration: string;
  readonly enableAudio: boolean;
  readonly ratio: string;
  readonly resolution: string;
}

export interface InfiniteCanvasVideoAccessInput {
  readonly config: AiConfig;
  readonly imageCount: number;
  readonly videoCount: number;
  readonly audioCount: number;
  readonly videoToVideo?: boolean;
  readonly referenceDurationSeconds?: number;
  readonly referenceVideoDurationSeconds?: number;
  readonly referenceAudioDurationSeconds?: number;
}

export interface InfiniteCanvasAdvancedParameters {
  readonly label: string;
  readonly seed?: { readonly label: string; readonly min: number; readonly max: number };
  readonly negativePrompt?: { readonly label: string };
  readonly isTranslate?: { readonly label: string };
}

/** Pure, consumer-owned model resolution. Network submission remains inside the Editor. */
export interface InfiniteCanvasModelAdapter {
  /** Fixed consumer catalog identity. Runtime adapter switching is not supported. */
  readonly id: string;
  readonly music?: CanvasMusicAdapter;
  getUnavailableReason?(
    config: AiConfig,
    input: {
      readonly mode: 'image' | 'video' | 'music' | 'lyrics';
      readonly prompt: string;
      readonly connectedText?: string;
      readonly imageCount: number;
      readonly videoCount: number;
      readonly audioCount: number;
      readonly referenceAudioDurationSeconds?: number;
    },
  ): string | undefined;
  readonly models: readonly SourceApprovedModel[];
  readonly defaultImageModel: string;
  readonly defaultVideoModel: string;
  readonly defaultVideoToVideoModel: string;
  readonly referenceVideoModels: readonly string[];
  readonly videoToVideoModels: readonly string[];
  /** Optional basic text/single-image 3D generation; consumer owns validation and default pricing. */
  readonly threeD?: {
    readonly defaultModel: string;
    readonly label: string;
    resolveAccess(config: AiConfig, prompt: string, imageCount: number): SourceGenerationAccess;
  };
  getAdvancedParameters?(model: string, mode: 'image' | 'video'): InfiniteCanvasAdvancedParameters | undefined;
  getImageParameters(model: string): ReturnType<typeof getImageModelParameters>;
  getImageDefaults(model: string): { readonly ratio: string; readonly resolution: string; readonly version: string };
  getVideoConfig(
    model: string,
    values: InfiniteCanvasVideoValues,
    context: SourceVideoInputContext,
  ): SourceVideoModelConfig;
  getVideoDefaults(model: string, context: SourceVideoInputContext): InfiniteCanvasVideoValues;
  resolveReferenceVideoModel(model: string): string;
  resolveImageAccess(config: AiConfig, imageCount: number): SourceGenerationAccess;
  resolveVideoAccess(input: InfiniteCanvasVideoAccessInput): SourceGenerationAccess;
  convertImageRequest(input: SourceImageConversionInput): ImageGenerationRequest;
  convertVideoRequest(input: SourceVideoConversionInput): GenerateAsyncVideoRequest;
}

export function hasCanvasThreeDModels(
  adapter?: InfiniteCanvasModelAdapter,
): adapter is InfiniteCanvasModelAdapter & { threeD: NonNullable<InfiniteCanvasModelAdapter['threeD']> } {
  return Boolean(adapter?.threeD && adapter.models.some((model) => model.capability === '3d'));
}

export type { AiConfig as InfiniteCanvasGenerationConfig } from './stores/use-config-store';
export type {
  SourceApprovedModel as InfiniteCanvasModelOption,
  SourceVideoInputContext as InfiniteCanvasVideoInputContext,
  SourceVideoModelConfig as InfiniteCanvasVideoModelConfig,
} from './runtime/generation/source-model-data';

/** Apply the editor opt-in without mutating the consumer catalog. */
export function resolveEnabledCanvasModelAdapter(
  adapter: InfiniteCanvasModelAdapter | undefined,
  enableMusic = false,
): InfiniteCanvasModelAdapter | undefined {
  if (!adapter || enableMusic) return adapter;
  if (!adapter.music && !adapter.models.some((model) => model.capability === 'music')) return adapter;
  return { ...adapter, music: undefined, models: adapter.models.filter((model) => model.capability !== 'music') };
}
