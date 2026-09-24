'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from '@/i18n/navigation';

import { STORE_PREFIX } from '@/lib/constants/config';
import { isNativeDesktop, OPEN_DESKTOP_SETTINGS_EVENT } from '@/lib/desktop/runtime';

import { InfiniteCanvasDashboard } from '../infinite-canvas-dashboard';
import { useCanvasI18n } from './use-canvas-i18n';
import { useCanvasIntegrations } from './use-canvas-integrations';

const InfiniteCanvasEditor = dynamic(
  () => import('../infinite-canvas-editor').then((module) => module.InfiniteCanvasEditor),
  { ssr: false },
);
const OpenApiSettingsDialog = dynamic(() => import('@/components/dialog/OpenApiSettingsDialog'));

/** A fixed editor URL is required because the desktop build is a static export. */
export function CanvasWorkspace({ projectId }: { readonly projectId?: string }) {
  const i18n = useCanvasI18n();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const openSettings = useCallback(() => {
    if (isNativeDesktop()) window.dispatchEvent(new Event(OPEN_DESKTOP_SETTINGS_EVENT));
    else setSettingsOpen(true);
  }, []);
  const integrations = useCanvasIntegrations(openSettings);
  const desktopIntegrations = useMemo(
    () => ({
      ...integrations,
      onProjectMissing: () => router.replace('/ai-canvas'),
    }),
    [integrations, router],
  );

  useEffect(() => {
    if (!isNativeDesktop()) return;
    let disposed = false;
    let setActive: ((active: boolean) => Promise<unknown>) | undefined;
    void import('@tauri-apps/api/core').then(({ invoke }) => {
      setActive = (active) => invoke('set_canvas_editor_menu_active', { active });
      if (!disposed) void setActive(Boolean(projectId));
    });
    return () => {
      disposed = true;
      void setActive?.(false);
    };
  }, [projectId]);

  return (
    <div className='canvas-workspace min-h-screen'>
      {projectId ? (
        <InfiniteCanvasEditor
          projectId={projectId}
          i18n={i18n}
          integrations={desktopIntegrations}
          storageKeyPrefix={STORE_PREFIX}
        />
      ) : (
        <InfiniteCanvasDashboard i18n={i18n} integrations={desktopIntegrations} page={page} onPageChange={setPage} />
      )}
      {!isNativeDesktop() && <OpenApiSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />}
    </div>
  );
}
