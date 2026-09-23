import {
  formatPromptForDesktopLog,
  sanitizeDesktopLogText,
  writeDesktopLog,
  type DesktopLogger,
} from '@/lib/desktop/logging';

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

export async function createVideoTask(
  config: OpenApiConfig,
  body: CreateVideoTaskRequest,
  logger: DesktopLogger = writeDesktopLog,
) {
  void logger(
    'info',
    'video-generation',
    `Submitting video task model=${sanitizeDesktopLogText(body.model_name, 100)} ratio=${body.aspect_ratio || 'default'} resolution=${body.resolution || 'default'} duration=${body.duration ?? 'default'} references=image:${body.images?.length || Number(Boolean(body.image_url))},video:${body.videos?.length || Number(Boolean(body.video_url))},audio:${body.audios?.length || Number(Boolean(body.audio_url))},file:${body.files?.length || 0},link:${body.links?.length || 0} prompt=${formatPromptForDesktopLog(body.prompt)}`,
  );
  const response = await openApiFetchJson<CreateVideoTaskResponse>(
    config,
    '/api/v1/video/task',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    { transportRetries: 1 },
  );
  if (response.code !== 0 || !response.data?.task_id) {
    void logger(
      'error',
      'video-generation',
      `Video task submission rejected code=${response.code} message=${sanitizeDesktopLogText(response.message || 'No message')}`,
    );
  } else {
    void logger(
      'info',
      'video-generation',
      `Video task submitted task=${sanitizeDesktopLogText(response.data.task_id, 180)} status=${response.data.task_status || 'submitted'}`,
    );
  }
  return response;
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
