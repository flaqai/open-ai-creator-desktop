import type { CSSProperties, ReactNode } from 'react';

import type { CanvasTaskSubmission, CanvasTaskState, ImageGenerationRequest } from '@/components/infinite-canvas/types/generation';
import type { CanvasProject, CanvasProjectSummary, CanvasNodeData, CanvasNodeImage } from '@/components/infinite-canvas/types/project';
import type { GenerateAsyncVideoRequest } from '@/components/infinite-canvas/types/generation';

import type { UploadHandler } from '@/components/infinite-canvas/types/upload';
import type { InfiniteCanvasModelAdapter, InfiniteCanvasVideoAccessInput } from './infinite-canvas-model-adapter';
import type { InfiniteCanvasOssEditorI18n } from './runtime/i18n/infinite-canvas-message-keys';

interface InfiniteCanvasProductI18n {
  readonly locale: string;
  readonly locales: readonly InfiniteCanvasLocaleOption[];
  readonly common: {
    readonly cancel: string;
    readonly confirm: string;
    readonly close: string;
    readonly retry: string;
    readonly loading: string;
  };
  readonly dashboard: {
    /** Optional mobile-specific copy; existing consumers can keep their current dashboard labels. */
    readonly mobile?: {
      readonly title: string;
      readonly docs: string;
      readonly create: string;
      readonly importProject: string;
      readonly recentTitle: string;
      readonly emptyTitle: string;
      readonly emptyDescription: string;
      readonly editProject: string;
      readonly renameTitle: string;
      readonly saveChanges: string;
      readonly delete: string;
      readonly deleteConfirmTitle: string;
      readonly deleteConfirmDescription: string;
      /** Uses a literal {count} placeholder. */
      readonly selectedCount: string;
      readonly exportStarted: string;
    };
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly create: string;
    readonly creating: string;
    readonly untitled: string;
    readonly emptyTitle: string;
    readonly emptyDescription: string;
    readonly loadError: string;
    readonly open: string;
    readonly rename: string;
    readonly delete: string;
    readonly deleteSelected: string;
    readonly exportSelected: string;
    readonly cancelSelection: string;
    readonly selectedLabel: string;
    readonly deleteConfirmTitle: string;
    readonly deleteConfirmDescription: string;
    readonly importProject: string;
    readonly exportProject: string;
    readonly nodeCount: string;
    readonly connectionCount: string;
    readonly updated: string;
    readonly totalProjects: string;
    readonly showingProjects: string;
    readonly renameTitle: string;
    readonly renameDescription: string;
    readonly projectName: string;
    readonly saveChanges: string;
    readonly previousPage: string;
    readonly nextPage: string;
  };
  readonly editor: {
    readonly loading: string;
    readonly loadError: string;
    readonly missingProject: string;
    readonly backToDashboard: string;
    readonly moveTool: string;
    readonly selectTool: string;
    readonly undo: string;
    readonly redo: string;
    readonly zoomIn: string;
    readonly zoomOut: string;
    readonly fitView: string;
    readonly addNode: string;
    readonly saveNow: string;
    readonly saved: string;
    readonly saving: string;
    /** Optional while consumers adopt the full-screen leave-save status copy. */
    readonly savingBeforeLeaving?: string;
    readonly unsavedChanges: string;
    readonly saveFailed: string;
    readonly saveRecovered: string;
    readonly unsavedTitle: string;
    readonly unsavedDescription: string;
    readonly leaveAnyway: string;
  };
  readonly nodes: {
    readonly image: string;
    readonly text: string;
    readonly config: string;
    readonly video: string;
    readonly audio: string;
    readonly group: string;
    readonly delete: string;
    readonly duplicate: string;
    readonly setPrimary: string;
    readonly download: string;
    readonly preview: string;
    readonly imageCount: string;
    readonly textCount: string;
    readonly idle: string;
    readonly loading: string;
    readonly error: string;
    readonly resize: string;
    readonly connect: string;
  };
  readonly prompt: {
    readonly title: string;
    readonly placeholder: string;
    readonly expand: string;
    readonly collapse: string;
  };
  readonly promptSources: {
    readonly title: string;
    readonly add: string;
    readonly name: string;
    readonly url: string;
    readonly remove: string;
    readonly empty: string;
    readonly loadFailed: string;
  };
  readonly generation: {
    readonly generate: string;
    readonly generating: string;
    readonly paidTaskContinues: string;
    readonly retry: string;
    readonly textUnavailable: string;
    readonly streamUnavailable: string;
    readonly failed: string;
  };
  readonly assets: {
    readonly title: string;
    readonly upload: string;
    readonly uploadFailed: string;
    readonly empty: string;
    readonly remove: string;
  };
  readonly plugins: {
    readonly title: string;
    readonly install: string;
    readonly urlPlaceholder: string;
    readonly loadFailed: string;
    readonly empty: string;
  };
  readonly importExport: {
    readonly invalidArchive: string;
    readonly importFailed: string;
    readonly exportFailed: string;
  };
  readonly agent: {
    readonly open: string;
    readonly unavailable: string;
    readonly connecting: string;
    readonly connected: string;
    readonly protocolMismatch: string;
    readonly promptPlaceholder: string;
    readonly send: string;
  };
  readonly accessibility: {
    readonly canvas: string;
    readonly minimap: string;
    readonly projectActions: string;
    readonly generationStatus: string;
  };
  readonly navigation: {
    readonly landing: string;
    readonly dashboard: string;
    readonly docs: string;
    readonly plugins: string;
    readonly shortcuts: string;
    readonly lightTheme: string;
    readonly darkTheme: string;
    readonly switchLanguage: string;
  };
}

export type InfiniteCanvasI18n = InfiniteCanvasProductI18n & InfiniteCanvasOssEditorI18n;

export interface InfiniteCanvasLocaleOption {
  readonly value: string;
  readonly label: string;
  readonly shortLabel: string;
}

export type InfiniteCanvasConfirmationKind = 'delete-project' | 'delete-projects' | 'leave-unsaved';

export interface InfiniteCanvasConfirmation {
  readonly kind: InfiniteCanvasConfirmationKind;
  readonly title: string;
  readonly description: string;
  readonly confirmLabel: string;
}

export interface InfiniteCanvasToast {
  readonly kind: 'success' | 'error' | 'info';
  readonly message: string;
}

export interface InfiniteCanvasGenerationAccessInput {
  readonly mode: 'image' | 'video' | 'text' | 'audio' | '3d' | 'music' | 'lyrics';
  readonly model: string;
}

export type InfiniteCanvasGenerationAccessResult =
  | { readonly allowed: true }
  | {
      readonly allowed: false;
      readonly reason: 'client-key-required';
    };

export interface InfiniteCanvasGenerationPriceInput extends InfiniteCanvasVideoAccessInput {
  readonly mode: 'image' | 'video';
}

/** Project-independent audio material returned by a consumer history adapter. */
export interface InfiniteCanvasAudioHistoryItem {
  readonly id: string;
  readonly url: string;
  readonly title: string;
  readonly coverUrl?: string;
  readonly coverThumbnailUrl?: string;
  readonly durationMs?: number;
  readonly lyrics?: string;
  readonly available: boolean;
  readonly status?: 'ready' | 'processing' | 'failed' | 'unavailable';
}

export interface InfiniteCanvasAudioHistory {
  /** The entry stays hidden unless explicitly enabled, even when loadPage is supplied. */
  readonly enabled?: boolean;
  readonly loadPage: (input: {
    readonly page: number;
    readonly pageSize: number;
    readonly signal: AbortSignal;
  }) => Promise<{
    readonly items: readonly InfiniteCanvasAudioHistoryItem[];
    readonly total: number;
  }>;
}

export interface InfiniteCanvasIntegrations {
  readonly optimizePrompt?: (prompt: string, media: 'image' | 'video') => Promise<string>;
  readonly generateAudio?: (config: import('./stores/use-config-store').AiConfig, prompt: string, signal?: AbortSignal) => Promise<import('./services/file-storage').UploadedFile>;
  readonly generateMusic?: (request: Readonly<Record<string, unknown>>) => Promise<CanvasTaskSubmission>;
  readonly getMusicTask?: (taskId: string, signal?: AbortSignal) => Promise<readonly import('./types/project').CanvasMusicTaskResult[]>;

  readonly audioHistory?: InfiniteCanvasAudioHistory;
  /** Optional consumer-owned brand icons; undefined keeps the package icon. */
  readonly renderModelIcon?: (input: {
    readonly model: string;
    readonly capability?: string;
    readonly presentationKey: string;
  }) => ReactNode;
  /** Optional consumer-owned 3D viewer and download controls. No renderer dependency is bundled. */
  readonly renderThreeDPreview?: (input: { readonly url: string; readonly title: string }) => ReactNode;
  /** Optional presentation only: the consumer owns live pricing, formatting and loading/error copy. */
  readonly renderGenerationPrice?: (input: InfiniteCanvasGenerationPriceInput) => ReactNode;
  readonly generateMusicField?: (input: {
    readonly field: 'lyrics' | 'style';
    readonly model: string;
    readonly prompt: string;
    readonly signal?: AbortSignal;
  }) => Promise<string>;
  readonly generateLyrics?: (input: {
    readonly prompt: string;
    readonly language: string;
    readonly signal?: AbortSignal;
  }) => Promise<string>;
  readonly upload: UploadHandler;
  readonly navigateToHome?: () => void;
  readonly navigateToLanding: () => void;
  readonly navigateToDashboard: () => void;
  readonly navigateToDocs: () => void;
  readonly navigateToEditor: (projectId: string) => void;
  readonly changeLocale: (locale: string) => void;
  readonly confirm: (confirmation: InfiniteCanvasConfirmation) => boolean | Promise<boolean>;
  readonly toast?: (toast: InfiniteCanvasToast) => void;
  readonly resolveGenerationAccess?: (
    input: InfiniteCanvasGenerationAccessInput,
  ) => InfiniteCanvasGenerationAccessResult | Promise<InfiniteCanvasGenerationAccessResult>;
  readonly onClientKeyRequired?: () => void;
  readonly onProjectMissing?: (projectId: string) => void;
  readonly onError?: (error: unknown, operation: string) => void;
  readonly onAnalytics?: (event: string, data?: Readonly<Record<string, string | number | boolean>>) => void;
}

export interface InfiniteCanvasAgentOptions {
  readonly enabled: true;
  readonly endpoint?: string;
  readonly renderPanel?: () => ReactNode;
}

/**
 * Optional consumer-configured media submission and observation capability.
 *
 * Project persistence is browser-local.
 * Task observation uses the template public Image/Video APIs by default; consumers
 * can override their reads for both live polling and project recovery.
 */
export interface InfiniteCanvasGenerationTransport {
  /** Basic 3D uses consumer APIs only; there is no default shared generation endpoint. */
  readonly submitThreeD?: (request: {
    readonly model: string;
    readonly prompt: string;
    readonly referenceUrls: readonly string[];
  }) => Promise<CanvasTaskSubmission>;
  readonly getThreeDTask?: (
    taskId: string,
    options: { readonly signal?: AbortSignal },
  ) => Promise<CanvasTaskState>;
  readonly submitImage: (request: ImageGenerationRequest) => Promise<CanvasTaskSubmission>;
  readonly submitVideo: (request: GenerateAsyncVideoRequest) => Promise<CanvasTaskSubmission>;
  readonly getImageTask?: (
    taskId: string,
    options: { readonly signal?: AbortSignal },
  ) => Promise<CanvasTaskState>;
  readonly getVideoTask?: (
    taskId: string,
    options: { readonly signal?: AbortSignal },
  ) => Promise<CanvasTaskState>;
}

export interface InfiniteCanvasDashboardProps {
  /** Use the same fixed adapter as the Editor; omit both to use the current template catalog. */
  readonly modelAdapter?: InfiniteCanvasModelAdapter;
  /** Optional consumer-owned image shown in every project card at a 16:9 aspect ratio. */
  readonly projectImageUrl?: string;
  /** Optional consumer-owned project preview; takes precedence over the default illustration. */
  readonly projectPreview?: ReactNode;
  readonly i18n: InfiniteCanvasI18n;
  readonly integrations: InfiniteCanvasIntegrations;
  readonly page: number;
  readonly onPageChange: (page: number) => void;
}

/** Optional visual association only; never changes the canvas selection state. */
export interface InfiniteCanvasMusicResultHighlight {
  /** Disabled unless explicitly true. */
  readonly enabled?: boolean;
  /** Overrides the theme-aware default for both the node outline and connection. */
  readonly color?: string;
  /** Styles the separate node outline, not the original node selection border. */
  readonly nodeStyle?: CSSProperties;
  /** Styles the separate SVG connection underlay, not the original selected path. */
  readonly connectionStyle?: CSSProperties;
}

export interface InfiniteCanvasEditorProps {
  readonly musicResultHighlight?: InfiniteCanvasMusicResultHighlight;
  /** Opt in to music and lyrics capabilities. Disabled by default, even if an adapter supplies music. */
  readonly enableMusic?: boolean;
  /** Consumer-owned selection made at initialization, not a runtime switch. */
  readonly modelAdapter?: InfiniteCanvasModelAdapter;
  readonly projectId: string;
  readonly i18n: InfiniteCanvasI18n;
  readonly integrations: InfiniteCanvasIntegrations;
  readonly storageKeyPrefix: string;
  readonly canvasAgent?: InfiniteCanvasAgentOptions;
  readonly generationTransport?: InfiniteCanvasGenerationTransport;
}

export interface InfiniteCanvasExportResult {
  readonly fileName: string;
  readonly projectIds: readonly string[];
  readonly blob: Blob;
}

export interface InfiniteCanvasImportResult {
  readonly projectId: string;
  readonly title: string;
}

export interface InfiniteCanvasNodePreview {
  readonly node: CanvasNodeData;
  readonly image?: CanvasNodeImage;
}

export type { CanvasProject, CanvasProjectSummary };
