import {
  formatPromptForDesktopLog,
  sanitizeDesktopLogText,
  writeDesktopLog,
  type DesktopLogger,
} from '@/lib/desktop/logging';

import { openApiFetchJson } from '../clientFetch';
import type { OpenApiConfig, OpenApiPollResponse, OpenApiSubmitResponse, TaskCreditResult } from '../clientFetch';
import { deleteImageHistoryItem } from './history';

export interface CreateImageTaskRequest {
  model_name: string;
  prompt: string;
  width: number;
  height: number;
  resolution?: string;
  quality?: string;
  image_url_list?: string[];
  seed?: number;
  negative_prompt?: string;
}

export interface ImageTaskResultItem extends TaskCreditResult {
  url?: string;
  thumbnail_url?: string;
  resolution?: string;
}

export interface ImageTaskResult {
  credit?: number;
  images: ImageTaskResultItem[];
}

export type CreateImageTaskResponse = OpenApiSubmitResponse;
export type GetImageTaskResponse = OpenApiPollResponse<ImageTaskResult>;

export async function createImageTask(
  config: OpenApiConfig,
  body: CreateImageTaskRequest,
  logger: DesktopLogger = writeDesktopLog,
) {
  void logger(
    'info',
    'image-generation',
    `Submitting image task model=${sanitizeDesktopLogText(body.model_name, 100)} size=${body.width}x${body.height} resolution=${body.resolution || 'default'} quality=${body.quality || 'default'} references=${body.image_url_list?.length || 0} prompt=${formatPromptForDesktopLog(body.prompt)}`,
  );
  const response = await openApiFetchJson<CreateImageTaskResponse>(
    config,
    '/api/v1/image/task',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    { transportRetries: 1 },
  );
  if (response.code !== 0 || !response.data?.task_id) {
    void logger(
      'error',
      'image-generation',
      `Image task submission rejected code=${response.code} message=${sanitizeDesktopLogText(response.message || 'No message')}`,
    );
  } else {
    void logger(
      'info',
      'image-generation',
      `Image task submitted task=${sanitizeDesktopLogText(response.data.task_id, 180)} status=${response.data.task_status || 'submitted'}`,
    );
  }
  return response;
}

export async function getImageTask(config: OpenApiConfig, taskId: string, signal?: AbortSignal) {
  return openApiFetchJson<GetImageTaskResponse>(config, `/api/v1/image/${taskId}`, {
    method: 'GET',
    signal,
  });
}

export async function deleteImageById(imageId: string) {
  deleteImageHistoryItem(imageId);
  return {
    code: 200,
    msg: 'Deleted successfully',
  };
}
