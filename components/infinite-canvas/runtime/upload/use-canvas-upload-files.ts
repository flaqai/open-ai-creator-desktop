'use client';

import { useCallback } from 'react';

import type { UploadPurpose, UploadResult } from '@/components/infinite-canvas/types/upload';
import type { InfiniteCanvasIntegrations } from '../../infinite-canvas.types';

export type CanvasUploadMedia = 'audio' | 'image' | 'video';

export type CanvasUploadFiles = (
  files: readonly File[],
  purpose: UploadPurpose,
  media: CanvasUploadMedia,
  signal?: AbortSignal,
) => Promise<UploadResult>;

export function useCanvasUploadFiles(integrations: InfiniteCanvasIntegrations): CanvasUploadFiles {
  return useCallback(
    async (files, purpose, media, signal) => {
      let result: UploadResult;
      try {
        result = await integrations.upload({ files, purpose, signal });
      } catch (cause) {
        result = {
          status: 'error',
          error: {
            code: cause instanceof TypeError ? 'network-error' : 'upload-failed',
            message: cause instanceof Error ? cause.message : 'Upload failed.',
            cause,
          },
        };
      }

      if (result.status === 'error') integrations.onError?.(result.error, `upload-${media}`);
      return result;
    },
    [integrations],
  );
}
