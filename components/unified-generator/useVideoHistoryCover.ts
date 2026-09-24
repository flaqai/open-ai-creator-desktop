'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  readVideoHistoryCover,
  storeVideoHistoryCover,
  VIDEO_HISTORY_COVER_SAVED_EVENT,
} from '@/lib/media/video-history-cover-cache';
import { generateVideoHistoryCover } from '@/lib/media/video-history-frame';

type MemoryCover = { source: string; url: string };
type CoverState = MemoryCover & { key: string };

const memoryCovers = new Map<string, MemoryCover>();
const pendingFrameCaptures = new Set<string>();

function rememberCover(key: string, source: string, blob: Blob) {
  const previous = memoryCovers.get(key);
  if (previous?.source === source) return previous.url;
  if (previous) URL.revokeObjectURL(previous.url);
  const url = URL.createObjectURL(blob);
  memoryCovers.set(key, { source, url });
  return url;
}

export async function preloadVideoHistoryCover(key: string, videoUrl: string, localPath?: string) {
  if (!key || !videoUrl) return;
  const source = `video:${videoUrl}`;
  const blob =
    (await readVideoHistoryCover(key, source)) ||
    (localPath ? await generateVideoHistoryCover(key, videoUrl, localPath) : null);
  if (blob) rememberCover(key, source, blob);
}

export default function useVideoHistoryCover(key: string, videoUrl: string, localPath?: string) {
  const source = videoUrl ? `video:${videoUrl}` : '';
  const remembered = memoryCovers.get(key);
  const [cached, setCached] = useState<CoverState | null>(() =>
    remembered?.source === source ? { key, ...remembered } : null,
  );

  useEffect(() => {
    let active = true;
    const inMemory = memoryCovers.get(key);
    setCached(inMemory?.source === source ? { key, ...inMemory } : null);

    if (!key || !videoUrl)
      return () => {
        active = false;
      };

    const load = () => {
      void preloadVideoHistoryCover(key, videoUrl, localPath)
        .then(() => {
          if (!active) return;
          const cover = memoryCovers.get(key);
          if (cover?.source === source) setCached({ key, ...cover });
        })
        .catch(() => {
          // History remains usable if local frame generation is unavailable.
        });
    };
    load();
    const onSaved = (event: Event) => {
      if ((event as CustomEvent<string>).detail === key) load();
    };
    window.addEventListener(VIDEO_HISTORY_COVER_SAVED_EVENT, onSaved);
    return () => {
      active = false;
      window.removeEventListener(VIDEO_HISTORY_COVER_SAVED_EVENT, onSaved);
    };
  }, [key, localPath, source, videoUrl]);

  const cacheLoadedVideoFrame = useCallback(
    (video: HTMLVideoElement) => {
      if (!key || !videoUrl || pendingFrameCaptures.has(key) || video.videoWidth <= 0) return;
      if (memoryCovers.get(key)?.source === source) return;
      pendingFrameCaptures.add(key);

      try {
        const scale = Math.min(1, 640 / video.videoWidth);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
        canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas is unavailable.');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              pendingFrameCaptures.delete(key);
              return;
            }
            storeVideoHistoryCover(key, source, blob)
              .then((stored) => setCached({ key, source, url: rememberCover(key, source, stored) }))
              .catch(() => {})
              .finally(() => pendingFrameCaptures.delete(key));
          },
          'image/jpeg',
          0.82,
        );
      } catch {
        pendingFrameCaptures.delete(key);
      }
    },
    [key, source, videoUrl],
  );

  const cachedUrl = cached?.key === key && cached.source === source ? cached.url : undefined;
  return { coverUrl: cachedUrl, cacheLoadedVideoFrame };
}
