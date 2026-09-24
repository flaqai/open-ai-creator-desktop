'use client';

import { readVideoHistoryCover, storeVideoHistoryCover } from './video-history-cover-cache';

const pendingFrames = new Map<string, Promise<Blob>>();

async function readArchivedVideo(path: string): Promise<Blob> {
  const { invoke, convertFileSrc } = await import('@tauri-apps/api/core');
  await invoke('register_canvas_media_path', { path });
  const response = await fetch(convertFileSrc(path));
  if (!response.ok) throw new Error(`Unable to read archived video (${response.status}).`);
  return response.blob();
}

async function captureFirstFrame(videoBlob: Blob): Promise<Blob> {
  const url = URL.createObjectURL(videoBlob);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';

  try {
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timeout);
        video.removeEventListener('loadeddata', onLoaded);
        video.removeEventListener('error', onError);
      };
      const onLoaded = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error('Archived video could not be decoded.'));
      };
      const timeout = setTimeout(onError, 30_000);
      video.addEventListener('loadeddata', onLoaded, { once: true });
      video.addEventListener('error', onError, { once: true });
      video.src = url;
      video.load();
    });

    if (video.videoWidth <= 0 || video.videoHeight <= 0) throw new Error('Archived video has no frame.');
    const scale = Math.min(1, 640 / video.videoWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable.');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Video frame encoding failed.'))),
        'image/jpeg',
        0.82,
      );
    });
  } finally {
    video.pause();
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(url);
  }
}

/** Generate the history cover from the archived video, never from a remote cover URL. */
export function generateVideoHistoryCover(
  key: string,
  videoUrl: string,
  localPath: string,
  dependencies: {
    readVideo?: (path: string) => Promise<Blob>;
    captureFrame?: (video: Blob) => Promise<Blob>;
  } = {},
): Promise<Blob> {
  if (!key || !videoUrl || !localPath) return Promise.reject(new Error('Video cover source is incomplete.'));
  const source = `video:${videoUrl}`;
  const pendingKey = `${key}\n${source}`;
  const existing = pendingFrames.get(pendingKey);
  if (existing) return existing;

  const request = (async () => {
    const cached = await readVideoHistoryCover(key, source);
    if (cached) return cached;
    const video = await (dependencies.readVideo || readArchivedVideo)(localPath);
    const frame = await (dependencies.captureFrame || captureFirstFrame)(video);
    return storeVideoHistoryCover(key, source, frame);
  })().finally(() => pendingFrames.delete(pendingKey));
  pendingFrames.set(pendingKey, request);
  return request;
}
