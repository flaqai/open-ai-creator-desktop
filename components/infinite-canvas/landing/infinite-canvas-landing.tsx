'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Infinity as InfinityIcon, Loader2, Plus } from 'lucide-react';

import { createCanvasProjectStorage } from '@/components/infinite-canvas/runtime/persistence/local-projects';
import { type CanvasProjectSummary } from '@/components/infinite-canvas/types/project';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { InfiniteCanvasProjectCard } from '@/components/infinite-canvas/project-card/infinite-canvas-project-card';
import type { InfiniteCanvasLandingProps } from './infinite-canvas-landing.types';

const RECENT_PROJECT_LIMIT = 4;
const RECENT_PROJECT_SKELETON_KEYS = [
  'recent-project-1',
  'recent-project-2',
  'recent-project-3',
  'recent-project-4',
] as const;

type RecentProjectsLoadState = 'idle' | 'loading' | 'ready' | 'empty' | 'error';

export function InfiniteCanvasLanding({
  entryForm,
  i18n,
  integrations,
  projectImageUrl,
}: InfiniteCanvasLandingProps) {
  const storage = useMemo(() => createCanvasProjectStorage(), []);
  const [projects, setProjects] = useState<readonly CanvasProjectSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loadState, setLoadState] = useState<RecentProjectsLoadState>('idle');
  const [isCreating, setIsCreating] = useState(false);
  const creatingRef = useRef(false);
  const requestSequence = useRef(0);

  const handleError = useCallback(
    (error: unknown, operation: string) => {
      integrations.onError?.(error, operation);
    },
    [integrations],
  );

  const loadRecentProjects = useCallback(async () => {
    const sequence = ++requestSequence.current;
    setLoadState('loading');
    try {
      const page = await storage.listProjects(1, RECENT_PROJECT_LIMIT);
      if (sequence !== requestSequence.current) return;
      setProjects(page.rows);
      setTotal(page.total);
      setLoadState(page.rows.length === 0 ? 'empty' : 'ready');
    } catch (error) {
      if (sequence !== requestSequence.current) return;
      setProjects([]);
      setTotal(0);
      setLoadState('error');
      handleError(error, 'list-recent-projects');
    }
  }, [handleError, storage]);

  useEffect(() => {
    void loadRecentProjects();
  }, [loadRecentProjects]);

  const createProject = async () => {
    if (creatingRef.current) return;
    creatingRef.current = true;
    setIsCreating(true);
    try {
      const project = await storage.createProject(i18n.untitled);
      integrations.onAnalytics?.('infinite_canvas_project_created', { source: 'landing' });
      integrations.navigateToEditor(project.id);
    } catch (error) {
      creatingRef.current = false;
      setIsCreating(false);
      handleError(error, 'create-project');
    }
  };

  const openDashboard = () => {
    integrations.navigateToDashboard();
  };

  const openProject = (projectId: string) => {
    integrations.navigateToEditor(projectId);
  };

  return (
    <div className='w-full'>
      <div className='p-3'>{entryForm}</div>


        <section
          className='container-centered min-w-0 py-10 lg:py-14'
          aria-labelledby='infinite-canvas-recent-projects'
          aria-busy={loadState === 'loading'}
        >
          <div className='flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
            <h2 id='infinite-canvas-recent-projects' className='text-2xl font-semibold'>
              {i18n.recentTitle}
            </h2>
            <button
              type='button'
              onClick={openDashboard}
              className='inline-flex items-center gap-1 text-sm font-medium text-main-color transition-opacity hover:opacity-75'
            >
              {i18n.viewAll}
              {total > RECENT_PROJECT_LIMIT ? ` (${total})` : ''}
              <ArrowRight className='size-4' aria-hidden='true' />
            </button>
          </div>

          <ul
            aria-labelledby='infinite-canvas-recent-projects'
            className='-mx-4 mt-6 grid snap-x snap-proximity auto-cols-[252px] grid-flow-col gap-4 overflow-x-auto overscroll-x-contain px-4 pb-1 pt-1 scroll-px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>li]:min-w-0 [&>li]:snap-start sm:-mx-0 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-2 sm:px-0 lg:grid-cols-5'
          >
            <li>
              <button
                type='button'
                onClick={createProject}
                disabled={isCreating}
                aria-busy={isCreating}
                className='flex h-[180px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-color-b1 bg-color-c1 px-5 text-center transition-colors hover:border-color-main disabled:opacity-50'
              >
                <span className='grid size-7 place-items-center text-color-t2'>
                  {isCreating ? (
                    <Loader2 className='size-5 animate-spin' aria-hidden='true' />
                  ) : (
                    <Plus className='size-7' aria-hidden='true' />
                  )}
                </span>
                <span className='text-sm font-medium text-color-t1'>{i18n.newProject}</span>
                <span className='text-xs leading-5 text-color-t2'>{i18n.newProjectDescription}</span>
              </button>
            </li>

            {loadState === 'loading'
              ? RECENT_PROJECT_SKELETON_KEYS.map((key) => (
                  <li
                    key={key}
                    aria-label={i18n.loading}
                    className='rounded-xl border border-light-gray-2 bg-light-gray p-2'
                  >
                    <Skeleton className='aspect-video w-full rounded-lg bg-light-gray-2' />
                    <Skeleton className='mt-3 h-4 w-3/4 bg-light-gray-2' />
                    <Skeleton className='mt-2 h-3 w-1/2 bg-light-gray-2' />
                  </li>
                ))
              : null}

            {loadState === 'error' ? (
              <li className='flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-light-gray-2 px-5 text-center sm:col-span-2 lg:col-span-4'>
                <p className='text-sm text-gray-color'>{i18n.loadError}</p>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='mt-3'
                  onClick={() => void loadRecentProjects()}
                >
                  {i18n.retry}
                </Button>
              </li>
            ) : null}

            {loadState === 'empty' ? (
              <li className='flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-light-gray-2 bg-light-gray/40 px-5 text-center sm:col-span-2 lg:col-span-4'>
                <InfinityIcon className='size-8 text-text-color' aria-hidden='true' />
                <p className='mt-3 text-sm font-medium text-text-color'>{i18n.emptyTitle}</p>
                <p className='mt-1 max-w-md text-xs leading-5 text-gray-color'>{i18n.emptyDescription}</p>
              </li>
            ) : null}

            {loadState === 'ready'
              ? projects.map((project, index) => (
                  <li key={project.projectId}>
                    <InfiniteCanvasProjectCard
                      project={project}
                      imageUrl={projectImageUrl}
                      variant={index}
                      locale={i18n.locale}
                      labels={{
                        connectionCount: i18n.connectionCount,
                        nodeCount: i18n.nodeCount,
                        open: i18n.open,
                        updated: i18n.updated,
                      }}
                      onOpen={() => openProject(project.projectId)}
                    />
                  </li>
                ))
              : null}
          </ul>
        </section>

    </div>
  );
}
