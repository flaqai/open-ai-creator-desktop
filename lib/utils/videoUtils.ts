'use client';

import type { FFmpeg } from '@ffmpeg/ffmpeg';

import { isDesktopRuntime } from '@/lib/desktop/runtime';

import { createSerialQueue } from './serial-queue';

const waitForVideoEvent = (video: HTMLVideoElement, eventName: keyof HTMLMediaElementEventMap) =>
  new Promise<void>((resolve, reject) => {
    const handleSuccess = () => {
      cleanup();
      resolve();
    };

    const handleError = () => {
      cleanup();
      reject(new Error(`Video ${eventName} failed`));
    };

    const cleanup = () => {
      clearTimeout(timer);
      video.removeEventListener(eventName, handleSuccess);
      video.removeEventListener('error', handleError);
    };

    video.addEventListener(eventName, handleSuccess, { once: true });
    video.addEventListener('error', handleError, { once: true });
    const timer = setTimeout(handleError, 30_000);
  });

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
}

export const loadVideoMetadata = async (source: File | string): Promise<VideoMetadata> => {
  const video = document.createElement('video');
  const objectUrl = source instanceof File ? URL.createObjectURL(source) : source;

  try {
    video.preload = 'metadata';
    const loaded = waitForVideoEvent(video, 'loadedmetadata');
    video.src = objectUrl;
    await loaded;

    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      throw new Error('Invalid video duration');
    }

    return {
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
    };
  } finally {
    video.pause();
    video.removeAttribute('src');
    video.load();
    if (source instanceof File) {
      URL.revokeObjectURL(objectUrl);
    }
  }
};

export const loadVideoDuration = async (source: File | string): Promise<number> => {
  const metadata = await loadVideoMetadata(source);
  return metadata.duration;
};

const FFMPEG_CORE_BASE_URL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd';

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoadPromise: Promise<FFmpeg> | null = null;

const getFFmpeg = async () => {
  if (ffmpegInstance?.loaded) {
    return ffmpegInstance;
  }

  if (!ffmpegLoadPromise) {
    ffmpegLoadPromise = (async () => {
      const [{ FFmpeg }, { toBlobURL }] = await Promise.all([import('@ffmpeg/ffmpeg'), import('@ffmpeg/util')]);
      const ffmpeg = new FFmpeg();
      const local = isDesktopRuntime();
      const base = local ? new URL('/vendor/ffmpeg', window.location.href).href : FFMPEG_CORE_BASE_URL;
      const coreURL = local ? `${base}/ffmpeg-core.js` : await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = local
        ? `${base}/ffmpeg-core.wasm`
        : await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm');
      try {
        await ffmpeg.load({ coreURL, wasmURL });
      } finally {
        if (!local) {
          URL.revokeObjectURL(coreURL);
          URL.revokeObjectURL(wasmURL);
        }
      }

      ffmpegInstance = ffmpeg;
      return ffmpeg;
    })().catch((error) => {
      ffmpegLoadPromise = null;
      throw error;
    });
  }

  return ffmpegLoadPromise;
};

const enqueueTrim = createSerialQueue();

export function trimVideoFile(videoFile: File, startTime: number, endTime: number): Promise<File> {
  return enqueueTrim(() => trimVideoFileExclusive(videoFile, startTime, endTime));
}

async function trimVideoFileExclusive(videoFile: File, startTime: number, endTime: number): Promise<File> {
  const duration = endTime - startTime;
  if (startTime < 0 || duration <= 0) {
    throw new Error('Invalid trim range');
  }

  const ffmpeg = await getFFmpeg();
  const { fetchFile } = await import('@ffmpeg/util');
  const inputExtension = videoFile.name.split('.').pop() || 'mp4';
  const inputName = `input.${inputExtension}`;
  const outputName = 'output.mp4';

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

    const exitCode = await ffmpeg.exec([
      '-i',
      inputName,
      '-ss',
      startTime.toFixed(3),
      '-t',
      duration.toFixed(3),
      '-movflags',
      'faststart',
      outputName,
    ]);

    if (exitCode !== 0) {
      throw new Error(`FFmpeg exited with code ${exitCode}`);
    }

    const data = await ffmpeg.readFile(outputName);
    const originalName = videoFile.name.replace(/\.[^/.]+$/, '');
    const outputBytes = data as Uint8Array;
    const outputBuffer = outputBytes.buffer.slice(
      outputBytes.byteOffset,
      outputBytes.byteOffset + outputBytes.byteLength,
    ) as ArrayBuffer;

    return new File([outputBuffer], `${originalName}_trimmed.mp4`, { type: 'video/mp4' });
  } finally {
    await Promise.allSettled([ffmpeg.deleteFile(inputName), ffmpeg.deleteFile(outputName)]);
  }
}
