'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { createCanvasProjectStorage } from '@/components/infinite-canvas/runtime/persistence/local-projects';

import { CanvasLeaveLoadingOverlay, CanvasRefreshShell } from './components/canvas/canvas-refresh-shell';
import { resolveEnabledCanvasModelAdapter } from './infinite-canvas-model-adapter';
import type { InfiniteCanvasEditorProps } from './infinite-canvas.types';
import CanvasProjectPage, { type CanvasProjectActions } from './pages/canvas/project';
import { SourceGenerationProvider } from './runtime/generation/source-generation-context';
import { createSourceGenerationRuntime } from './runtime/generation/source-generation-runtime';
import { InfiniteCanvasI18nProvider } from './runtime/i18n/infinite-canvas-context';
import { InfiniteCanvasIntegrationsProvider } from './runtime/integrations/infinite-canvas-integrations-context';
import {
  saveCanvasProjectBeforeNavigation,
  saveCanvasProjectManually,
  saveCanvasProjectNow,
  subscribeCanvasProjectAutosave,
} from './runtime/persistence/canvas-project-autosave';
import {
  toSerializableCanvasProject,
} from './runtime/persistence/project-codec';
import { createProjectSaveRuntime } from './runtime/persistence/project-save-runtime';
import { useProjectSaveLifecycle } from './runtime/persistence/use-project-save-lifecycle';
import { useCanvasStoreApi, type CanvasProject as SourceCanvasProject } from './stores/canvas/use-canvas-store';
import { InfiniteCanvasStoresProvider } from './stores/infinite-canvas-stores-provider';

export function InfiniteCanvasEditor({
  projectId,
  i18n,
  integrations,
  storageKeyPrefix,
  canvasAgent,
  modelAdapter,
  generationTransport,
  enableMusic = false,
  musicResultHighlight,
}: InfiniteCanvasEditorProps): ReactNode {
  const [fixedModelAdapter] = useState(() => resolveEnabledCanvasModelAdapter(modelAdapter, enableMusic));
  const storage = useMemo(
    () => createCanvasProjectStorage(),
    [],
  );
  const generationRuntime = useMemo(
    () => createSourceGenerationRuntime({ generationTransport, integrations }),
    [generationTransport, integrations],
  );
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [project, setProject] = useState<SourceCanvasProject | null>(null);
  const [initialSavedAt, setInitialSavedAt] = useState<number | null>(null);

  const loadProject = useCallback(() => {
    let active = true;
    setLoadState('loading');
    void storage
      .getProject(projectId)
      .then((project) => {
        if (!active) return;
        setProject(structuredClone(project) as SourceCanvasProject);
        setInitialSavedAt(Date.parse(project.updatedAt));
        setLoadState('ready');
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadState('failed');
        integrations.onError?.(error, 'load-project');
      });
    return () => {
      active = false;
    };
  }, [i18n.dashboard.untitled, integrations, storage, projectId]);

  useEffect(loadProject, [loadProject]);

  return (
    <InfiniteCanvasI18nProvider i18n={i18n}>
      <InfiniteCanvasIntegrationsProvider integrations={integrations}>
        <SourceGenerationProvider runtime={generationRuntime}>
          <div
            className='canvas-editor-shell fixed inset-0 z-50 bg-canvas-background text-canvas-text'
            aria-label={i18n.accessibility.canvas}
          >
            {loadState === 'loading' ? (
              <CanvasRefreshShell label={i18n.editor.loading} />
            ) : loadState === 'failed' || project === null ? (
              <div className='grid h-full place-items-center gap-3 text-canvas-text'>
                <span>{i18n.editor.loadError}</span>
                <button
                  type='button'
                  className='rounded-md border border-canvas-border bg-canvas-panel px-3 py-2 transition-colors hover:bg-canvas-surface'
                  onClick={loadProject}
                >
                  {i18n.common.retry}
                </button>
              </div>
            ) : (
              <InfiniteCanvasStoresProvider
                key={`${storageKeyPrefix}:${projectId}`}
                initialProject={project}
                storageKeyPrefix={storageKeyPrefix}
                modelAdapter={fixedModelAdapter}
              >
                <CanvasEditorRuntime
                  musicResultHighlight={musicResultHighlight}
                  canvasAgentEnabled={canvasAgent?.enabled === true}
                  canvasAgentEndpoint={canvasAgent?.endpoint}
                  integrations={integrations}
                  i18n={i18n}
                  initialSavedAt={initialSavedAt}
                  storage={storage}
                  projectId={projectId}
                />
              </InfiniteCanvasStoresProvider>
            )}
          </div>
        </SourceGenerationProvider>
      </InfiniteCanvasIntegrationsProvider>
    </InfiniteCanvasI18nProvider>
  );
}

function CanvasEditorRuntime({
  musicResultHighlight,
  canvasAgentEnabled,
  canvasAgentEndpoint,
  integrations,
  i18n,
  initialSavedAt,
  storage,
  projectId,
}: {
  readonly musicResultHighlight?: InfiniteCanvasEditorProps['musicResultHighlight'];
  readonly canvasAgentEnabled: boolean;
  readonly canvasAgentEndpoint?: string;
  readonly integrations: InfiniteCanvasEditorProps['integrations'];
  readonly i18n: InfiniteCanvasEditorProps['i18n'];
  readonly initialSavedAt: number | null;
  readonly storage: ReturnType<typeof createCanvasProjectStorage>;
  readonly projectId: string;
}) {
  const canvasStore = useCanvasStoreApi();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const restorePage = (event: PageTransitionEvent) => {
      // Browser back can restore the editor with its pre-navigation loading state.
      if (event.persisted) setIsLeaving(false);
    };
    window.addEventListener('pageshow', restorePage);
    return () => window.removeEventListener('pageshow', restorePage);
  }, []);

  const saveRuntime = useMemo(
    () =>
      createProjectSaveRuntime({
        projectId,
        initialSavedAt,
        save: async (id, project) => {
          await storage.saveProject(id, toSerializableCanvasProject(project));
        },
        onFailure: (error, kind) => {
          integrations.onError?.(error, 'save-project');
          integrations.toast?.({ kind: 'error', message: i18n.editor.saveFailed });
          if (kind === 'missing') integrations.onProjectMissing?.(projectId);
        },
      }),
    [i18n.editor.saveFailed, initialSavedAt, integrations, storage, projectId],
  );
  const saveState = useProjectSaveLifecycle(saveRuntime);

  useEffect(() => {
    return subscribeCanvasProjectAutosave(canvasStore, saveRuntime);
  }, [canvasStore, saveRuntime]);

  const runLeavingTask = useCallback(async (task: () => Promise<boolean>): Promise<boolean> => {
    setIsLeaving(true);
    try {
      const completed = await task();
      if (!completed) setIsLeaving(false);
      return completed;
    } catch (error) {
      setIsLeaving(false);
      throw error;
    }
  }, []);
  const navigateAfterSave = useCallback(
    (navigate: () => void) =>
      runLeavingTask(() => saveCanvasProjectBeforeNavigation(canvasStore, saveRuntime, navigate)),
    [canvasStore, runLeavingTask, saveRuntime],
  );
  const saveCurrentProject = useCallback(
    () => saveCanvasProjectNow(canvasStore, saveRuntime),
    [canvasStore, saveRuntime],
  );
  const saveNow = useCallback(
    () =>
      saveCanvasProjectManually(canvasStore, saveRuntime, () => {
        integrations.toast?.({ kind: 'success', message: i18n.editor.saved });
      }),
    [canvasStore, i18n.editor.saved, integrations, saveRuntime],
  );

  const projectActions = useMemo<CanvasProjectActions>(
    () => ({
      create: async (title) => {
        await runLeavingTask(async () => {
          if (!(await saveCurrentProject())) return false;
          const project = await storage.createProject(title);
          integrations.navigateToEditor(project.id);
          return true;
        });
      },
      delete: async () => {
        await runLeavingTask(async () => {
          await storage.deleteProject(projectId);
          saveRuntime.discard();
          integrations.navigateToDashboard();
          return true;
        });
      },
      changeLocale: (locale) => navigateAfterSave(() => integrations.changeLocale(locale)),
      navigateToDashboard: () => navigateAfterSave(integrations.navigateToDashboard),
      navigateToDocs: () => navigateAfterSave(integrations.navigateToDocs),
      navigateToHome: () => navigateAfterSave(integrations.navigateToHome ?? integrations.navigateToLanding),
      navigateToLanding: () => navigateAfterSave(integrations.navigateToLanding),
      rename: async (title) => {
        await storage.renameProject(projectId, title);
      },
      saveNow,
      saveState,
    }),
    [
      integrations,
      navigateAfterSave,
      storage,
      projectId,
      runLeavingTask,
      saveCurrentProject,
      saveNow,
      saveRuntime,
      saveState,
    ],
  );

  return (
    <>
      <CanvasProjectPage
        musicResultHighlight={musicResultHighlight}
        canvasAgentEndpoint={canvasAgentEndpoint}
        projectActions={projectActions}
        projectId={projectId}
        canvasAgentEnabled={canvasAgentEnabled}
      />
      {isLeaving ? <CanvasLeaveLoadingOverlay label={i18n.editor.savingBeforeLeaving ?? i18n.editor.saving} /> : null}
    </>
  );
}
