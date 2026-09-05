'use client';

import { useEffect, useState } from 'react';

export default function useReferenceAssetUrl(source: File | string | null) {
  const [fileUrl, setFileUrl] = useState<{ file: File; url: string } | null>(null);

  useEffect(() => {
    if (!(source instanceof File)) return undefined;

    const objectUrl = URL.createObjectURL(source);
    let active = true;
    queueMicrotask(() => {
      if (active) setFileUrl({ file: source, url: objectUrl });
    });

    return () => {
      active = false;
      URL.revokeObjectURL(objectUrl);
    };
  }, [source]);

  if (typeof source === 'string') return source || undefined;
  if (source instanceof File && fileUrl?.file === source) return fileUrl.url;
  return undefined;
}
