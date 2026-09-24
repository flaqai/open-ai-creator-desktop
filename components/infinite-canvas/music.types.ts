type GenerateMusicRequest = Readonly<Record<string, unknown>>;

import type { SourceGenerationAccess } from './runtime/generation/source-network-converter';
import type { AiConfig } from './stores/use-config-store';

export type CanvasMusicValues = Readonly<Record<string, string | number | boolean>>;

export interface CanvasMusicParameter {
  readonly key: string;
  readonly label: string;
  readonly type: 'text' | 'textarea' | 'number' | 'select' | 'boolean' | 'slider';
  readonly options?: readonly { readonly value: string; readonly label: string }[];
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly showNumberInput?: boolean;
  readonly formatValue?: (value: number) => string;
}

export interface CanvasMusicInput {
  readonly prompt: string;
  readonly connectedText?: string;
  readonly imageCount: number;
  readonly audioCount: number;
  readonly videoCount: number;
  readonly audioDurationSeconds?: number;
}

/** Consumer-owned music catalog, parameters and request conversion. */
export interface CanvasMusicAdapter {
  readonly label: string;
  readonly lyricsLabel: string;
  readonly defaultModel: string;
  readonly lyricsModels: readonly string[];
  readonly lyrics?: {
    readonly languageLabel: string;
    readonly defaultLanguage: string;
    readonly languages: readonly { readonly value: string; readonly label: string }[];
  };
  getDefaults(model: string): CanvasMusicValues;
  getParameters(config: AiConfig, input?: Pick<CanvasMusicInput, 'audioCount'>): readonly CanvasMusicParameter[];
  getComposerParameters?(
    config: AiConfig,
    input?: Pick<CanvasMusicInput, 'audioCount'> & { readonly hasMusicResult?: boolean },
  ): readonly CanvasMusicParameter[];
  resolveAccess(config: AiConfig, input: CanvasMusicInput): SourceGenerationAccess;
  convertRequest(
    config: AiConfig,
    input: CanvasMusicInput & {
      readonly imageUrls: readonly string[];
      readonly audioUrls: readonly string[];
    },
  ): GenerateMusicRequest;
}
