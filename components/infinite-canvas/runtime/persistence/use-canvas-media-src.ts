'use client';

import { useEffect, useState } from 'react';

import { readCanvasMedia, readCanvasMediaPath, registeredCanvasMediaUrl } from './canvas-media-cache';

/** Returns a revocable local preview when available, otherwise the durable remote URL. */
export function useCanvasMediaSrc(url: string | undefined): string | undefined {
  const [local, setLocal] = useState<{ source: string; preview: string } | null>(null);

  useEffect(() => {
    if (!url || !/^https?:\/\//i.test(url)) return;
    let active = true;
    let preview: string | undefined;
    const load = () => {
      void (async () => {
        const blob = await readCanvasMedia(url);
        if (!active || preview) return;
        if (blob) {
          preview = URL.createObjectURL(blob);
          setLocal({ source: url, preview });
          return;
        }
        const path = await readCanvasMediaPath(url);
        if (!path || !active) return;
        const assetUrl = await registeredCanvasMediaUrl(path);
        if (active) setLocal({ source: url, preview: assetUrl });
      })().catch(() => {
        /* A remote preview remains usable if local storage is unavailable. */
      });
    };
    load();
    const onSaved = (event: Event) => {
      if ((event as CustomEvent<string>).detail === url) load();
    };
    window.addEventListener('flaq:canvas-media-saved', onSaved);
    return () => {
      active = false;
      window.removeEventListener('flaq:canvas-media-saved', onSaved);
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [url]);

  return local && local.source === url ? local.preview : url;
}
