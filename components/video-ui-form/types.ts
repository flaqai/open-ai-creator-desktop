/**
 * Video form related type definitions
 *
 * Unified management of types for all video form components, hooks, and utils
 */

/**
 * Video form data type
 *
 * Form data structure for React Hook Form
 */
export interface VideoFormData {
  prompt: string;
  ratio: string;
  disableEndFrame: boolean; // Keep this field for main component compatibility
  modelVersion: string;
  duration?: string; // Duration option (e.g. '5s', '10s')
  resolution?: string; // Resolution option (e.g. '480p', '720p', '1080p')
  startFrame?: File | string; // Can be File object or URL string
  endFrame?: File | string; // Can be File object or URL string
  multiImages?: File[] | null;
  enableEndFrame?: boolean;
  enableAudio?: boolean;
  enableBgm?: boolean;
  style?: string;
  seed?: number;
  negativePrompt?: string;
  guidanceScale?: number;
  keepOriginalSound?: boolean;
  audioFile?: File | null; // Audio file (for models that need audio like lipsync)
  audioTrimRange?: { startTime: number; endTime: number } | null; // Audio trim range
}

/**
 * Form option type
 */
export interface FormOption {
  name: string;
  value: string;
}
