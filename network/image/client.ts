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

export async function createImageTask(config: OpenApiConfig, body: CreateImageTaskRequest) {
  return openApiFetchJson<CreateImageTaskResponse>(config, '/api/v1/image/task', {
    method: 'POST',
    body: JSON.stringify(body),
  });
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
