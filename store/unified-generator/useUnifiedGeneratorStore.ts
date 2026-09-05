import { create } from 'zustand';

import type {
  UnifiedGeneratorReferenceMediaAsset,
  UnifiedGeneratorReferencePromptNode,
} from '@/lib/constants/unified-generator/types';
import type { VideoGenerationType } from '@/lib/constants/video';
import { EMPTY_REFERENCE_PROMPT_DOC } from '@/lib/utils/reference-video-prompt';

export type UnifiedMediaType = 'image' | 'video';
type SupportedVideoType = Exclude<VideoGenerationType, 'video-edit'>;

export interface UnifiedGeneratorParameters {
  ratio: string;
  resolution: string;
  duration?: number;
  quality: string;
  sound: boolean;
  enableEndFrame: boolean;
  seed?: number;
  negativePrompt: string;
}

interface UnifiedGeneratorState {
  mediaType: UnifiedMediaType;
  imageType: 'text-to-image' | 'image-to-image';
  videoType: Exclude<VideoGenerationType, 'video-edit'>;
  imageModel: string;
  videoModels: Partial<Record<Exclude<VideoGenerationType, 'video-edit'>, string>>;
  prompt: string;
  imagePrompt: string;
  videoPrompt: string;
  referencePromptDoc: UnifiedGeneratorReferencePromptNode;
  imageInputs: UnifiedGeneratorReferenceMediaAsset[];
  videoStartInput: UnifiedGeneratorReferenceMediaAsset | null;
  videoEndInput: UnifiedGeneratorReferenceMediaAsset | null;
  videoAudioInput: File | null;
  referenceImages: UnifiedGeneratorReferenceMediaAsset[];
  referenceVideos: UnifiedGeneratorReferenceMediaAsset[];
  referenceAudios: UnifiedGeneratorReferenceMediaAsset[];
  referenceFiles: File[];
  referenceLinks: string[];
  imageParameters: UnifiedGeneratorParameters;
  videoParameters: Record<SupportedVideoType, UnifiedGeneratorParameters>;
  pendingCreatorSubmit: boolean;
  setMediaType: (mediaType: UnifiedMediaType) => void;
  setImageType: (imageType: 'text-to-image' | 'image-to-image') => void;
  setVideoType: (videoType: Exclude<VideoGenerationType, 'video-edit'>) => void;
  setImageModel: (imageModel: string) => void;
  setVideoModel: (type: Exclude<VideoGenerationType, 'video-edit'>, model: string) => void;
  setPrompt: (prompt: string) => void;
  setImagePrompt: (imagePrompt: string) => void;
  setVideoPrompt: (videoPrompt: string) => void;
  setReferencePromptDoc: (referencePromptDoc: UnifiedGeneratorReferencePromptNode) => void;
  setImageInputs: (files: UnifiedGeneratorReferenceMediaAsset[]) => void;
  setVideoStartInput: (file: UnifiedGeneratorReferenceMediaAsset | null) => void;
  setVideoEndInput: (file: UnifiedGeneratorReferenceMediaAsset | null) => void;
  setVideoAudioInput: (file: File | null) => void;
  setReferenceImages: (files: UnifiedGeneratorReferenceMediaAsset[]) => void;
  setReferenceVideos: (files: UnifiedGeneratorReferenceMediaAsset[]) => void;
  setReferenceAudios: (files: UnifiedGeneratorReferenceMediaAsset[]) => void;
  setReferenceFiles: (files: File[]) => void;
  setReferenceLinks: (links: string[]) => void;
  setImageParameters: (patch: Partial<UnifiedGeneratorParameters>) => void;
  setVideoParameters: (type: SupportedVideoType, patch: Partial<UnifiedGeneratorParameters>) => void;
  requestCreatorSubmit: () => void;
  clearPendingCreatorSubmit: () => void;
  openReferenceDraft: () => void;
  reset: () => void;
}

const initialState = {
  mediaType: 'video' as const,
  imageType: 'image-to-image' as const,
  videoType: 'image-to-video' as const,
  imageModel: 'gpt-image-2-edit',
  videoModels: {
    'text-to-video': 'seedance-v2.5-text-to-video',
    'image-to-video': 'seedance-v2.5-image-to-video',
    'reference-to-video': 'seedance-v2.5-reference-to-video',
  },
  prompt: '',
  imagePrompt: '',
  videoPrompt: '',
  referencePromptDoc: EMPTY_REFERENCE_PROMPT_DOC,
  imageInputs: [],
  videoStartInput: null,
  videoEndInput: null,
  videoAudioInput: null,
  referenceImages: [],
  referenceVideos: [],
  referenceAudios: [],
  referenceFiles: [],
  referenceLinks: [],
  imageParameters: {
    ratio: '',
    resolution: '',
    quality: '',
    sound: false,
    enableEndFrame: false,
    negativePrompt: '',
  },
  videoParameters: {
    'text-to-video': {
      ratio: '21:9',
      resolution: '480p',
      duration: 4,
      quality: '',
      sound: true,
      enableEndFrame: false,
      negativePrompt: '',
    },
    'image-to-video': {
      ratio: '',
      resolution: '480p',
      duration: 4,
      quality: '',
      sound: true,
      enableEndFrame: true,
      negativePrompt: '',
    },
    'reference-to-video': {
      ratio: '21:9',
      resolution: '480p',
      duration: 4,
      quality: '',
      sound: true,
      enableEndFrame: false,
      negativePrompt: '',
    },
  },
  pendingCreatorSubmit: false,
};

const useUnifiedGeneratorStore = create<UnifiedGeneratorState>((set) => ({
  ...initialState,
  setMediaType: (mediaType) => set({ mediaType }),
  setImageType: (imageType) => set({ mediaType: 'image', imageType }),
  setVideoType: (videoType) => set({ mediaType: 'video', videoType }),
  setImageModel: (imageModel) => set({ imageModel }),
  setVideoModel: (type, model) =>
    set((state) => ({
      videoModels: { ...state.videoModels, [type]: model },
    })),
  setPrompt: (prompt) => set({ prompt }),
  setImagePrompt: (imagePrompt) => set({ imagePrompt }),
  setVideoPrompt: (videoPrompt) => set({ videoPrompt }),
  setReferencePromptDoc: (referencePromptDoc) => set({ referencePromptDoc }),
  setImageInputs: (imageInputs) => set({ imageInputs }),
  setVideoStartInput: (videoStartInput) => set({ videoStartInput }),
  setVideoEndInput: (videoEndInput) => set({ videoEndInput }),
  setVideoAudioInput: (videoAudioInput) => set({ videoAudioInput }),
  setReferenceImages: (referenceImages) => set({ referenceImages }),
  setReferenceVideos: (referenceVideos) => set({ referenceVideos }),
  setReferenceAudios: (referenceAudios) => set({ referenceAudios }),
  setReferenceFiles: (referenceFiles) => set({ referenceFiles }),
  setReferenceLinks: (referenceLinks) => set({ referenceLinks }),
  setImageParameters: (patch) =>
    set((state) => ({
      imageParameters: { ...state.imageParameters, ...patch },
    })),
  setVideoParameters: (type, patch) =>
    set((state) => ({
      videoParameters: {
        ...state.videoParameters,
        [type]: { ...state.videoParameters[type], ...patch },
      },
    })),
  requestCreatorSubmit: () => set({ pendingCreatorSubmit: true }),
  clearPendingCreatorSubmit: () => set({ pendingCreatorSubmit: false }),
  openReferenceDraft: () =>
    set({
      mediaType: 'video',
      videoType: 'reference-to-video',
    }),
  reset: () => set(initialState),
}));

export default useUnifiedGeneratorStore;
