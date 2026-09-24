'use client';

import { useMemo, useRef } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { getClientOpenApiConfigAsync } from '@/network/clientFetch';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { openExternalUrl } from '@/lib/platform/navigation';
import useUploadFiles from '@/hooks/use-upload-files';

import type { InfiniteCanvasIntegrations } from '../infinite-canvas.types';
import { storeCanvasMedia } from '../runtime/persistence/canvas-media-cache';
import { CanvasStorageError } from '../runtime/persistence/canvas-storage-error';

export function useCanvasIntegrations(openSettings: () => void): InfiniteCanvasIntegrations {
  const t = useTranslations('InfiniteCanvas');
  const router = useRouter();
  const pathname = usePathname();
  const uploadFiles = useUploadFiles();
  const uploadRef = useRef(uploadFiles);
  uploadRef.current = uploadFiles;

  return useMemo(
    () => ({
      navigateToHome: () => router.push('/'),
      navigateToLanding: () => router.push('/ai-canvas'),
      navigateToDashboard: () => router.push('/ai-canvas'),
      navigateToEditor: (projectId) => router.push(`/ai-canvas/editor?id=${encodeURIComponent(projectId)}`),
      navigateToDocs: () => void openExternalUrl('https://flaq.ai/docs?page=ai-canvas'),
      changeLocale: (locale) => router.replace(pathname, { locale }),
      confirm: ({ title, description }) => window.confirm(`${title}\n\n${description}`),
      toast: ({ kind, message }) =>
        kind === 'error' ? toast.error(message) : kind === 'success' ? toast.success(message) : toast.info(message),
      onClientKeyRequired: openSettings,
      onProjectMissing: () => router.replace('/ai-canvas'),
      onError: (error, operation) => {
        if (operation === 'load-project' && error instanceof CanvasStorageError && error.kind === 'missing')
          router.replace('/ai-canvas');
        else toast.error(error instanceof Error ? error.message : String(error));
      },
      async resolveGenerationAccess() {
        try {
          await getClientOpenApiConfigAsync();
          return { allowed: true };
        } catch {
          return { allowed: false, reason: 'client-key-required' };
        }
      },
      async upload({ files, signal }) {
        if (signal?.aborted) return { status: 'rejected', reason: 'cancelled' };
        try {
          const urls = await uploadRef.current(files.map((file) => ({ data: file, type: file.type })));
          if (signal?.aborted) return { status: 'rejected', reason: 'cancelled' };
          if (urls.length !== files.length || urls.some((url) => !/^https?:\/\//i.test(url)))
            throw new Error(t('generation.failed'));
          await Promise.all(files.map((file, index) => storeCanvasMedia(urls[index], file)));
          return {
            status: 'success',
            files: files.map((file, index) => ({
              name: file.name,
              mimeType: file.type,
              size: file.size,
              url: urls[index],
            })),
          };
        } catch (cause) {
          return {
            status: 'error',
            error: { code: 'upload-failed', message: cause instanceof Error ? cause.message : String(cause), cause },
          };
        }
      },
    }),
    [openSettings, pathname, router, t],
  );
}
