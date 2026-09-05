/* eslint-disable @typescript-eslint/naming-convention */

export interface RatioConfig {
  name: string;
  value: string;
  iconWidth: string;
  iconHeight: string;
}

export interface FrameConfig {
  required: boolean;
  isSupported: boolean;
  minSidePx?: number;
  maxSidePx?: number;
  acceptedFormats?: string[];
  allowAlphaChannel?: boolean;
}

export interface MultiImageConfig {
  required: boolean;
  isSupported?: boolean;
  minImages?: number;
  maxImages: number;
  minSidePx?: number;
  maxSidePx?: number;
  acceptedFormats?: string[];
  allowAlphaChannel?: boolean;
}

export interface MultiVideoConfig {
  required: boolean;
  isSupported?: boolean;
  minVideos?: number;
  maxVideos: number;
  minDurationSeconds?: number;
  maxDurationSeconds?: number;
  maxTotalDurationSeconds?: number;
  minSidePx?: number;
  maxSidePx?: number;
  acceptedFormats?: string[];
}

export interface MultiAudioConfig {
  required: boolean;
  isSupported?: boolean;
  minAudios?: number;
  maxAudios: number;
  minDurationSeconds?: number;
  maxDurationSeconds?: number;
  maxTotalDurationSeconds?: number;
  acceptedFormats?: string[];
}

export interface SeedConfig {
  min: number;
  max: number;
}

export interface ReferenceFileConfig extends FrameConfig {
  maxFiles: number;
  acceptedFormats: string[];
  maxPages?: number;
}

export interface ReferenceLinkConfig extends FrameConfig {
  maxLinks: number;
}

export interface ModelOptions {
  duration?: number;
  durationRange?: { min: number; max: number };
  resolution?: string;
  ratio?: RatioConfig[] | null;
  startFrame?: FrameConfig;
  endFrame?: FrameConfig;
  multiImage?: MultiImageConfig;
  multiVideo?: MultiVideoConfig;
  multiAudio?: MultiAudioConfig;
  referenceFile?: ReferenceFileConfig;
  referenceLink?: ReferenceLinkConfig;
  minReferenceSubjects?: number;
  maxReferenceSubjects?: number;
  independentReferenceLimits?: boolean;
  audio?: boolean;
  audioUrl?: boolean;
  sound?: boolean;
  defaultSound?: boolean;
  bgm?: boolean;
  style?: string[];
  videoUrl?: FrameConfig;
  audioSetting?: boolean;
  keepOriginalSound?: boolean;
  multiPrompt?: boolean;
  guidanceScale?: boolean;
  cameraFixed?: boolean;
  seed?: boolean | SeedConfig;
  negativePrompt?: boolean;
}

export interface ModelVersionOptions {
  duration?: string[];
  durationRange?: { min: number; max: number };
  resolution?: string[];
  ratio?: RatioConfig[] | null;
  startFrame?: FrameConfig;
  endFrame?: FrameConfig;
  multiImage?: MultiImageConfig;
  multiVideo?: MultiVideoConfig;
  multiAudio?: MultiAudioConfig;
  referenceFile?: ReferenceFileConfig;
  referenceLink?: ReferenceLinkConfig;
  minReferenceSubjects?: number;
  maxReferenceSubjects?: number;
  independentReferenceLimits?: boolean;
  audio?: boolean;
  audioUrl?: boolean;
  sound?: boolean;
  defaultSound?: boolean;
  bgm?: boolean;
  style?: string[];
  videoUrl?: FrameConfig;
  keepOriginalSound?: boolean;
  guidanceScale?: boolean;
  seed?: boolean | SeedConfig;
  negativePrompt?: boolean;
}

export type VideoGenerationType = 'text-to-video' | 'image-to-video' | 'reference-to-video' | 'video-edit';

export interface VideoModel {
  provider: string;
  modelVersion: string;
  model: string;
  name: string;
  platformType: number;
  pricingType: 'video';
  credit: number;
  isPaid: boolean;
  generationType?: VideoGenerationType;
  options: ModelOptions;
  previewUrl?: string;
  prompt?: string;
  disabled?: boolean;
}

export interface ModelVersionConfig {
  provider: string;
  modelVersion: string;
  name: string;
  baseCredit: number;
  platformType: number;
  isPaid: boolean;
  pricingType: 'video';
  isComingSoon?: boolean;
  options: ModelVersionOptions;
  models: VideoModel[];
}

export interface ProviderConfig {
  provider: string;
  name: string;
  versions: ModelVersionConfig[];
}
