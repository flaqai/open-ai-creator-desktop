export type TemplateGenerationType =
  | 'text-to-image'
  | 'image-to-image'
  | 'text-to-video'
  | 'image-to-video'
  | 'reference-to-video'
  | 'video-edit';

export type TemplateMediaInputConfig = {
  supported: boolean;
  required: boolean;
  multiple?: boolean;
  min?: number;
  max?: number;
  minDurationSeconds?: number;
  maxDurationSeconds?: number;
  maxTotalDurationSeconds?: number;
  minSidePx?: number;
  maxSidePx?: number;
  acceptedFormats?: string[];
  allowAlphaChannel?: boolean;
};

export type TemplateModelConfig = {
  id: string;
  label: string;
  mediaType: 'image' | 'video';
  provider?: string;
  generationType?: TemplateGenerationType;
  disabled?: boolean;

  request: {
    endpoint: 'image' | 'video';
    modelName: string;
  };

  inputs: {
    prompt?: { supported: boolean; required: boolean };
    image?: TemplateMediaInputConfig;
    startFrame?: TemplateMediaInputConfig;
    endFrame?: TemplateMediaInputConfig;
    video?: TemplateMediaInputConfig;
    audio?: TemplateMediaInputConfig;
    file?: {
      supported: boolean;
      required: boolean;
      max?: number;
      acceptedFormats?: string[];
      maxPages?: number;
    };
    link?: { supported: boolean; required: boolean; max?: number };
  };

  params?: {
    ratio?: string[];
    resolution?: string[];
    duration?: number[];
    durationRange?: { min: number; max: number };
    style?: string[];
    quality?: string[];
    seed?: boolean | { min: number; max: number };
    negativePrompt?: boolean;
    guidanceScale?: boolean;
    sound?: boolean;
    defaultSound?: boolean;
    bgm?: boolean;
    keepOriginalSound?: boolean;
    minReferenceSubjects?: number;
    maxReferenceSubjects?: number;
    independentReferenceLimits?: boolean;
  };
};
