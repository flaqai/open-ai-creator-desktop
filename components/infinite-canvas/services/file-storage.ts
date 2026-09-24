// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
import { nanoid } from 'nanoid';

import type { CanvasUploadFiles, CanvasUploadMedia } from '../runtime/upload/use-canvas-upload-files';

export type UploadedFile = {
  url: string;
  storageKey: string;
  bytes: number;
  mimeType: string;
  width?: number;
  height?: number;
  durationMs?: number;
};

export async function uploadMediaFile(
  input: string | Blob,
  prefix: 'audio' | 'video',
  uploadFiles: CanvasUploadFiles,
): Promise<UploadedFile> {
  if (typeof input === 'string' && /^https?:\/\//i.test(input)) {
    const mimeType = prefix === 'video' ? 'video/mp4' : prefix === 'audio' ? 'audio/mpeg' : 'application/octet-stream';
    const meta = prefix === 'video' ? await readVideoMeta(input) : prefix === 'audio' ? await readAudioMeta(input) : {};
    return { url: input, storageKey: '', bytes: 0, mimeType, ...meta };
  }
  const blob = typeof input === 'string' ? await (await fetch(input)).blob() : input;
  const media: CanvasUploadMedia = prefix;
  const mimeType = blob.type || (prefix === 'video' ? 'video/mp4' : 'audio/mpeg');
  const file =
    blob instanceof File
      ? blob
      : new File([blob], `canvas-${prefix}-${nanoid()}.${mediaExtension(mimeType, prefix)}`, { type: mimeType });
  const [meta, result] = await Promise.all([
    readBlobMeta(blob, prefix),
    uploadFiles([file], prefix === 'video' ? 'video-reference' : 'audio-reference', media),
  ]);
  if (result.status !== 'success' || result.files.length !== 1 || !result.files[0]?.url) {
    throw uploadFailure(result, prefix);
  }
  const uploaded = result.files[0];
  return {
    url: uploaded.url,
    storageKey: '',
    bytes: uploaded.size,
    mimeType: uploaded.mimeType || mimeType,
    ...meta,
  };
}

async function readBlobMeta(blob: Blob, prefix: 'audio' | 'video') {
  const url = URL.createObjectURL(blob);
  try {
    return prefix === 'video' ? await readVideoMeta(url) : await readAudioMeta(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function mediaExtension(mimeType: string, prefix: 'audio' | 'video'): string {
  return mimeType.split('/')[1]?.replace('mpeg', 'mp3') || (prefix === 'video' ? 'mp4' : 'mp3');
}

function uploadFailure(result: Awaited<ReturnType<CanvasUploadFiles>>, media: string): Error {
  if (result.status === 'error') return new Error(result.error.message, { cause: result.error.cause });
  if (result.status === 'rejected') return new Error(`Infinite Canvas ${media} upload rejected: ${result.reason}`);
  return new Error(`Infinite Canvas ${media} upload returned no durable URL.`);
}

function readVideoMeta(url: string) {
  return new Promise<{ width: number; height: number; durationMs?: number }>((resolve) => {
    const video = document.createElement('video');
    const done = () =>
      resolve({
        width: video.videoWidth || 1280,
        height: video.videoHeight || 720,
        durationMs: Number.isFinite(video.duration) ? Math.round(video.duration * 1000) : undefined,
      });
    video.onloadedmetadata = done;
    video.onerror = done;
    video.src = url;
  });
}

function readAudioMeta(url: string) {
  return new Promise<{ durationMs?: number }>((resolve) => {
    const audio = document.createElement('audio');
    const done = () =>
      resolve({ durationMs: Number.isFinite(audio.duration) ? Math.round(audio.duration * 1000) : undefined });
    audio.onloadedmetadata = done;
    audio.onerror = done;
    audio.src = url;
  });
}
