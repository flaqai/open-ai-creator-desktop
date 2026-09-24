import type { CreateImageTaskRequest } from '@/network/image/client';
import type { CreateVideoTaskRequest } from '@/network/video/client';
import type { CanvasProjectTaskStatus } from './project';

export type ImageGenerationRequest = CreateImageTaskRequest;
export type GenerateAsyncVideoRequest = CreateVideoTaskRequest;

/** Values used by the editor after the public API response has been decoded. */
export interface CanvasTaskSubmission {
  readonly taskId: string;
}

export interface CanvasTaskState {
  readonly status: CanvasProjectTaskStatus;
  readonly resultUrl: string;
  readonly error: string;
}
