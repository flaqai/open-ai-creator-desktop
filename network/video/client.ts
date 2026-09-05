import { openApiFetchJson } from '../clientFetch';
import type { OpenApiConfig, OpenApiPollResponse, OpenApiSubmitResponse, TaskCreditResult } from '../clientFetch';
import { deleteVideoHistoryItem } from './history';

export interface MultiPromptItem {
  prompt: string;
  duration: number;
}

export interface CreateVideoTaskRequest {
  model_name: string;
  prompt: string;
  duration?: number;
  resolution?: string;
  aspect_ratio?: string;
  image_url?: string;
  image_end_url?: string;
  audio_url?: string;
  sound?: boolean;
  bgm?: boolean;
  style?: string;
  video_url?: string;
  audio_setting?: string;
  images?: string[];
  videos?: string[];
  audios?: string[];
  files?: string[];
  links?: string[];
  guidance_scale?: number;
  negative_prompt?: string;
  seed?: number;
  camera_fixed?: boolean;
  keep_original_sound?: boolean;
  multi_prompt?: MultiPromptItem[];
}

export interface VideoTaskResultItem extends TaskCreditResult {
  url?: string;
  cover_url?: string;
  duration?: number;
  ratio?: string;
}

export interface VideoTaskResult {
  credit?: number;
  videos: VideoTaskResultItem[];
}

export type CreateVideoTaskResponse = OpenApiSubmitResponse;
export type GetVideoTaskResponse = OpenApiPollResponse<VideoTaskResult>;

export async function createVideoTask(config: OpenApiConfig, body: CreateVideoTaskRequest) {
  return openApiFetchJson<CreateVideoTaskResponse>(config, '/api/v1/video/task', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getVideoTask(config: OpenApiConfig, taskId: string, signal?: AbortSignal) {
  return openApiFetchJson<GetVideoTaskResponse>(config, `/api/v1/video/${taskId}`, {
    method: 'GET',
    signal,
  });
}

export async function deleteVideoById(videoId: string) {
  deleteVideoHistoryItem(videoId);
  return {
    code: 200,
    msg: 'Deleted successfully',
  };
}
