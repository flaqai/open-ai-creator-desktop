export type JsonPrimitive = boolean | number | string | null;
export type JsonValue = JsonPrimitive | { readonly [key: string]: JsonValue } | readonly JsonValue[];

export type CanvasBuiltInNodeType = 'image' | 'text' | 'config' | 'video' | 'audio' | 'group';
export type CanvasNodeTypeId = CanvasBuiltInNodeType | (string & {});
export type CanvasNodeStatus = 'idle' | 'success' | 'loading' | 'error';
export type CanvasGenerationMode = 'text' | 'image' | 'video' | 'audio' | '3d' | 'music' | 'lyrics';
export type CanvasImageGenerationType = 'generation' | 'edit';
export type CanvasProjectTaskType = 'image' | 'video' | 'music' | '3d';
export type CanvasProjectTaskStatus = 'pending' | 'processing' | 'completed' | 'fail';
export type CanvasTextReasoningEffort = 'auto' | 'low' | 'medium' | 'high' | 'xhigh';
export type CanvasBackgroundMode = 'dots' | 'lines' | 'blank';

export interface Position {
  readonly x: number;
  readonly y: number;
}

export interface ViewportTransform {
  readonly x: number;
  readonly y: number;
  readonly k: number;
}

export interface CanvasNodeImage {
  readonly id: string;
  readonly status: CanvasNodeStatus;
  readonly errorDetails?: string;
  readonly content: string;
  readonly storageKey: string;
  readonly naturalWidth: number;
  readonly naturalHeight: number;
  readonly bytes: number;
  readonly mimeType: string;
}

export interface CanvasNodeMetadata {
  readonly music?: Readonly<Record<string, string | number | boolean>>;
  readonly musicRecordId?: string;
  readonly musicCompletedTask?: string;
  readonly lyrics?: string;
  readonly coverUrl?: string;
  readonly coverThumbnailUrl?: string;
  readonly content?: string;
  readonly composerContent?: string;
  readonly prompt?: string;
  readonly status?: CanvasNodeStatus;
  readonly errorDetails?: string;
  readonly fontSize?: number;
  readonly generationMode?: CanvasGenerationMode;
  readonly generationType?: CanvasImageGenerationType;
  readonly model?: string;
  readonly imageResolution?: string;
  readonly imageVersion?: string;
  readonly reasoningEffort?: CanvasTextReasoningEffort;
  readonly size?: string;
  readonly quality?: string;
  readonly background?: string;
  readonly count?: number;
  readonly seconds?: string;
  readonly vquality?: string;
  readonly generateAudio?: string;
  readonly watermark?: string;
  readonly seed?: number;
  readonly negativePrompt?: string;
  readonly isTranslate?: boolean;
  readonly audioVoice?: string;
  readonly audioFormat?: string;
  readonly audioSpeed?: string;
  readonly audioInstructions?: string;
  readonly references?: readonly string[];
  readonly naturalWidth?: number;
  readonly naturalHeight?: number;
  readonly freeResize?: boolean;
  readonly images?: readonly CanvasNodeImage[];
  readonly primaryImageId?: string;
  readonly storageKey?: string;
  readonly mimeType?: string;
  readonly bytes?: number;
  readonly durationMs?: number;
  readonly groupId?: string;
  readonly interactive?: boolean;
}

export interface CanvasNodeData {
  readonly id: string;
  readonly type: CanvasNodeTypeId;
  readonly title: string;
  readonly position: Position;
  readonly width: number;
  readonly height: number;
  readonly metadata?: CanvasNodeMetadata;
}

export interface CanvasConnection {
  readonly id: string;
  readonly fromNodeId: string;
  readonly toNodeId: string;
}

export interface CanvasAssistantReference {
  readonly id: string;
  readonly type: CanvasNodeTypeId;
  readonly title: string;
  readonly dataUrl?: string;
  readonly storageKey?: string;
  readonly text?: string;
}

export type CanvasAssistantMessageRole = 'user' | 'assistant' | 'system' | 'tool' | 'error';

export interface CanvasAssistantMessage {
  readonly id: string;
  readonly role: CanvasAssistantMessageRole;
  readonly title?: string;
  readonly text: string;
  readonly meta?: string;
  readonly detail?: JsonValue;
  readonly references?: readonly CanvasAssistantReference[];
}

export interface CanvasAssistantSession {
  readonly id: string;
  readonly title: string;
  readonly messages: readonly CanvasAssistantMessage[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CanvasProjectGenerationTask {
  readonly taskId: string;
  readonly taskKind: CanvasProjectTaskType;
  readonly resultNodeId: string;
  readonly resultSlotId?: string;
  readonly createdAt: string;
  readonly resultUrl?: string;
}

export interface CanvasProject {
  readonly id: string;
  readonly title: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly nodes: readonly CanvasNodeData[];
  readonly connections: readonly CanvasConnection[];
  readonly chatSessions: readonly CanvasAssistantSession[];
  readonly activeChatId: string | null;
  readonly backgroundMode: CanvasBackgroundMode;
  readonly showImageInfo: boolean;
  readonly viewport: ViewportTransform;
  readonly generationTasks?: readonly CanvasProjectGenerationTask[];
}

export interface CanvasProjectSummary {
  readonly projectId: string;
  readonly title: string;
  readonly createdAt: string;
  readonly updatedAt: string | number;
  readonly nodeCount: number;
  readonly connectionCount: number;
}

export interface CanvasMusicTaskResult {
  readonly id: string;
  readonly status: CanvasProjectTaskStatus;
  readonly url: string;
  readonly lyrics: string;
  readonly title: string;
  readonly coverUrl: string;
  readonly coverThumbnailUrl: string;
  readonly error?: string;
}
