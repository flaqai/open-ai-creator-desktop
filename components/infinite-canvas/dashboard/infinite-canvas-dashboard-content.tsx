'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
  type ChangeEvent,
} from 'react';
import { ArrowLeft, ArrowUpRight, Download, Loader2, Trash2 } from 'lucide-react';
import useSWR from 'swr';

import { createCanvasProjectStorage } from '@/components/infinite-canvas/runtime/persistence/local-projects';

import { ConfirmationDialog } from '@/components/canvas-shared/components/confirmation-dialog/confirmation-dialog';
import { Pagination } from '@/components/canvas-shared/components/pagination/pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { InfiniteCanvasModelAdapter } from '../infinite-canvas-model-adapter';
import { InfiniteCanvasProjectCard } from '@/components/infinite-canvas/project-card/infinite-canvas-project-card';
import { useInfiniteCanvasI18n } from '../runtime/i18n/infinite-canvas-context';
import { useInfiniteCanvasIntegrations } from '../runtime/integrations/infinite-canvas-integrations-context';
import {
  InvalidCanvasArchiveError,
  exportCanvasProjects,
  importCanvasProjects,
} from '../runtime/persistence/project-archive';
import { DashboardEmptyIllustration } from './dashboard-empty-illustration';
import { DashboardMobileDrawer } from './dashboard-mobile-drawer';
import { useDashboardMobile } from './use-dashboard-mobile';

const PAGE_SIZE = 8;
const LOADING_CARD_KEYS = Array.from({ length: PAGE_SIZE }, (_, index) => `dashboard-project-${index + 1}`);

export function InfiniteCanvasDashboardContent({
  modelAdapter,
  onPageChange,
  page,
  projectImageUrl,
  projectPreview,
}: {
  readonly modelAdapter?: InfiniteCanvasModelAdapter;
  readonly page: number;
  readonly onPageChange: (page: number) => void;
  readonly projectImageUrl?: string;
  readonly projectPreview?: ReactNode;
}) {
  const i18n = useInfiniteCanvasI18n();
  const isMobile = useDashboardMobile();
  const mobileCopy = isMobile ? i18n.dashboard.mobile : undefined;
  const integrations = useInfiniteCanvasIntegrations();
  const storage = useMemo(() => createCanvasProjectStorage(), []);
  const importRef = useRef<HTMLInputElement>(null);
  const deletingRef = useRef(false);
  const creatingRef = useRef(false);
  const drawerTriggerRef = useRef<HTMLElement | null>(null);
  const [actionProjectId, setActionProjectId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());
  const [pendingDeleteIds, setPendingDeleteIds] = useState<readonly string[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isMutating, startTransition] = useTransition();
  const [isCreating, setIsCreating] = useState(false);
  const isPending = isMutating || isCreating;

  const handleError = useCallback(
    (error: unknown, operation: string) => {
      integrations.onError?.(error, operation);
    },
    [integrations],
  );

  const {
    data,
    error: loadError,
    isLoading,
    mutate,
  } = useSWR(
    ['infinite-canvas-dashboard-projects', page, PAGE_SIZE] as const,
    () => storage.listProjects(page, PAGE_SIZE),
    {
      keepPreviousData: true,
      revalidateOnMount: true,
      dedupingInterval: 0,
      onError: (requestError) => handleError(requestError, 'list-projects'),
      shouldRetryOnError: false,
    },
  );
  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const loadState = loadError !== undefined ? 'error' : data === undefined ? 'loading' : 'ready';
  const actionProjectIndex = rows.findIndex((project) => project.projectId === actionProjectId);
  const actionProject = rows[actionProjectIndex];
  const drawerMode =
    pendingDeleteIds !== null ? 'delete' : editingId !== null ? 'rename' : actionProject ? 'actions' : null;

  useEffect(() => {
    if (!isMobile) setActionProjectId(null);
  }, [isMobile]);

  useEffect(() => {
    setSelected(new Set());
  }, [page]);

  useEffect(() => {
    if (data !== undefined && page > totalPages) onPageChange(totalPages);
  }, [data, onPageChange, page, totalPages]);

  const createProject = async () => {
    if (isPending || creatingRef.current) return;
    creatingRef.current = true;
    setIsCreating(true);
    try {
      const project = await storage.createProject(i18n.dashboard.untitled);
      integrations.onAnalytics?.('infinite_canvas_project_created');
      integrations.navigateToEditor(project.id);
    } catch (error) {
      creatingRef.current = false;
      setIsCreating(false);
      handleError(error, 'create-project');
    }
  };

  const closeRenameDialog = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const renameProject = () => {
    if (editingId === null || isPending) return;
    const title = editingTitle.trim();
    if (!title) return;
    const projectId = editingId;
    startTransition(async () => {
      try {
        await storage.renameProject(projectId, title);
        closeRenameDialog();
        await mutate();
      } catch (error) {
        handleError(error, 'rename-project');
      }
    });
  };

  const requestDeleteProjects = (projectIds: readonly string[]) => {
    if (isMobile && actionProjectId === null) drawerTriggerRef.current = document.activeElement as HTMLElement | null;
    if (projectIds.length > 0) setPendingDeleteIds(projectIds);
  };

  const confirmDeleteProjects = () => {
    if (deletingRef.current || pendingDeleteIds === null || pendingDeleteIds.length === 0) return;
    const projectIds = pendingDeleteIds;
    deletingRef.current = true;
    startTransition(async () => {
      try {
        await (projectIds.length === 1
            ? storage.deleteProject(projectIds[0]!)
            : storage.deleteProjects(projectIds));
        setPendingDeleteIds(null);
        setSelected(new Set());
      } catch (error) {
        handleError(error, 'delete-projects');
        return;
      } finally {
        deletingRef.current = false;
      }

      // A list refresh failure must not turn a completed deletion into a failed deletion.
      // SWR reports refresh errors through its onError handler above.
      await mutate().catch(() => undefined);
    });
  };

  const exportProjects = (projectIds: readonly string[]) => {
    if (projectIds.length === 0) return;
    startTransition(async () => {
      try {
        const projects = await Promise.all(projectIds.map((projectId) => storage.getProject(projectId)));
        const archiveTitle = projects.length === 1 ? projects[0]!.title : 'infinite-canvas-projects';
        const result = await exportCanvasProjects(projects, archiveTitle);
        const url = URL.createObjectURL(result.blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = result.fileName;
        anchor.click();
        URL.revokeObjectURL(url);
        if (isMobile && i18n.dashboard.mobile?.exportStarted) {
          integrations.toast?.({ kind: 'info', message: i18n.dashboard.mobile.exportStarted });
        }
      } catch (error) {
        handleError(error, 'export-projects');
      }
    });
  };

  const importProjects = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file === undefined) return;
    startTransition(async () => {
      try {
        const projects = await importCanvasProjects(file, integrations.upload, modelAdapter);
        await Promise.all(
          projects.map((project) =>
            storage.createProject(project.title, project),
          ),
        );
        await mutate();
      } catch (error) {
        integrations.toast?.({
          kind: 'error',
          message:
            error instanceof InvalidCanvasArchiveError
              ? i18n.importExport.invalidArchive
              : i18n.importExport.importFailed,
        });
        handleError(error, 'import-projects');
      }
    });
  };

  return (
    <>
      <section
        className={`mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1362px] flex-col px-5 pt-3 text-text-color sm:py-14 ${selected.size > 0 ? 'pb-[calc(10rem+env(safe-area-inset-bottom))]' : 'pb-10'}`}
        aria-busy={isLoading}
      >
        <nav
          className='mb-3 flex min-h-11 items-center justify-between gap-4 text-sm sm:min-h-0 sm:justify-start'
          aria-label={i18n.dashboard.title}
        >
          <button
            type='button'
            onClick={integrations.navigateToLanding}
            className='flex min-h-11 items-center gap-2 rounded-sm text-gray-color transition-colors hover:text-main-color focus-visible:outline-main-color sm:min-h-0'
          >
            <ArrowLeft className='size-4 sm:hidden' aria-hidden='true' />
            {i18n.dashboard.eyebrow}
          </button>
          <button
            type='button'
            aria-current='page'
            onClick={integrations.navigateToDashboard}
            className='hidden rounded-sm text-main-color focus-visible:outline-main-color sm:inline-flex'
          >
            {i18n.dashboard.title}
          </button>
          <button
            type='button'
            onClick={integrations.navigateToDocs}
            className='flex min-h-11 items-center gap-2 rounded-sm text-gray-color transition-colors hover:text-main-color focus-visible:outline-main-color sm:min-h-0'
          >
            {mobileCopy?.docs ?? i18n.navigation.docs}
            <ArrowUpRight className='size-4 sm:hidden' aria-hidden='true' />
          </button>
        </nav>
        <header className='flex flex-col justify-between gap-7 sm:flex-row sm:items-start sm:gap-6'>
          <div>
            <h1 className='text-[32px] font-semibold leading-10 tracking-tight text-text-color sm:text-[40px] sm:leading-[48px]'>
              {mobileCopy?.title ?? i18n.dashboard.title}
            </h1>
            <p className='mt-2 text-sm text-gray-color'>{i18n.dashboard.description}</p>
          </div>
          <div className='flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3'>
            <input
              ref={importRef}
              className='hidden'
              type='file'
              accept='.zip,application/zip'
              onChange={importProjects}
            />
            <Button
              type='button'
              variant='outline'
              onClick={() => importRef.current?.click()}
              disabled={isPending}
              className='order-2 h-12 w-full min-w-[104px] rounded-xl border-light-gray-2 bg-light-gray-1 px-6 text-text-color hover:bg-light-gray-2 hover:text-text-color sm:order-none sm:w-auto sm:rounded-lg'
            >
              {mobileCopy?.importProject ?? i18n.dashboard.importProject}
            </Button>
            <Button
              type='button'
              onClick={createProject}
              disabled={isPending}
              aria-busy={isCreating}
              className='order-1 h-12 w-full min-w-[120px] gap-2 rounded-xl bg-color-main px-6 text-white hover:bg-color-main/90 sm:order-none sm:w-auto sm:rounded-lg'
            >
              {isCreating ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
              {isCreating ? i18n.dashboard.creating : (mobileCopy?.create ?? i18n.dashboard.create)}
            </Button>
          </div>
        </header>

        {selected.size > 0 ? (
          <div className='fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 items-center gap-3 border-t border-light-gray-2 bg-light-gray-1 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:static sm:mt-10 sm:flex sm:justify-between sm:border-0 sm:bg-transparent sm:p-0'>
            <p className='text-sm font-medium text-text-color sm:text-main-color' aria-live='polite'>
              {mobileCopy
                ? mobileCopy.selectedCount.replace('{count}', String(selected.size))
                : `${i18n.dashboard.selectedLabel} ${selected.size}`}
            </p>
            <div className='contents sm:flex sm:flex-wrap sm:gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => exportProjects([...selected])}
                disabled={isPending}
                className='order-3 h-12 gap-2 rounded-xl border-light-gray-2 bg-light-gray-1 px-2 text-text-color hover:bg-light-gray-2 hover:text-text-color sm:order-none sm:h-9 sm:rounded-md sm:border-main-color/45 sm:bg-main-color/15 sm:px-3 sm:text-main-color sm:hover:bg-main-color/25'
              >
                <Download className='hidden size-4 sm:block' aria-hidden='true' />
                <span className='truncate'>{i18n.dashboard.exportSelected}</span>
              </Button>
              <Button
                type='button'
                variant='destructive'
                size='sm'
                onClick={() => requestDeleteProjects([...selected])}
                disabled={isPending}
                className='order-4 h-12 gap-2 rounded-xl bg-destructive-color px-2 text-gradient-main-foreground hover:bg-destructive-color/90 sm:order-none sm:h-9 sm:rounded-md sm:bg-destructive sm:px-3 sm:text-destructive-foreground sm:hover:bg-destructive/90'
              >
                <Trash2 className='hidden size-4 sm:block' aria-hidden='true' />
                <span className='truncate'>{i18n.dashboard.deleteSelected}</span>
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={isPending}
                className='order-2 h-11 justify-self-end border-transparent bg-transparent text-text-color hover:bg-light-gray-2 hover:text-text-color sm:order-none sm:h-9 sm:border-input'
                onClick={() => setSelected(new Set())}
              >
                {i18n.dashboard.cancelSelection}
              </Button>
            </div>
          </div>
        ) : null}

        {loadState === 'ready' && rows.length > 0 && mobileCopy ? (
          <h2 className='mt-7 text-2xl font-semibold leading-8 sm:hidden'>{mobileCopy.recentTitle}</h2>
        ) : null}

        {loadState === 'loading' ? (
          <ul className='mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4' aria-label={i18n.common.loading}>
            {LOADING_CARD_KEYS.map((key) => (
              <li key={key} className='overflow-hidden rounded-2xl border border-light-gray-2 bg-light-gray'>
                <Skeleton className='aspect-[16/9] w-full bg-light-gray-2' />
                <div className='h-[98px] p-4'>
                  <Skeleton className='h-4 w-2/3 bg-light-gray-2' />
                  <Skeleton className='mt-3 h-3 w-1/2 bg-light-gray-2' />
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {loadState === 'error' ? (
          <div className='mt-10 flex flex-col items-center rounded-xl border border-dashed border-light-gray-2 bg-light-gray/40 px-6 py-16'>
            <p className='text-gray-color'>{i18n.dashboard.loadError}</p>
            <Button type='button' variant='outline' className='mt-4' onClick={() => void mutate()}>
              {i18n.common.retry}
            </Button>
          </div>
        ) : null}

        {loadState === 'ready' && rows.length === 0 ? (
          <div className='mt-7 flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-light-gray-2 bg-light-gray px-6 py-10 text-center sm:mt-[120px] sm:py-16'>
            <DashboardEmptyIllustration />
            <h2 className='mt-8 text-2xl font-medium text-text-color'>
              {mobileCopy?.emptyTitle ?? i18n.dashboard.emptyTitle}
            </h2>
            <p className='mt-4 max-w-md text-sm text-gray-color'>
              {mobileCopy?.emptyDescription ?? i18n.dashboard.emptyDescription}
            </p>
            <Button
              type='button'
              onClick={createProject}
              disabled={isPending}
              aria-busy={isCreating}
              className='mt-4 h-12 min-w-[120px] gap-2 rounded-lg bg-color-main px-6 text-white hover:bg-color-main/90'
            >
              {isCreating ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
              {isCreating ? i18n.dashboard.creating : (mobileCopy?.create ?? i18n.dashboard.create)}
            </Button>
          </div>
        ) : null}

        {loadState === 'ready' && rows.length > 0 ? (
          <ul
            className={`${mobileCopy ? 'mt-3 sm:mt-8' : 'mt-8'} grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4`}
          >
            {rows.map((project, index) => {
              const isSelected = selected.has(project.projectId);
              return (
                <li key={project.projectId}>
                  <InfiniteCanvasProjectCard
                    project={project}
                    imageUrl={projectImageUrl}
                    preview={projectPreview}
                    variant={index}
                    locale={i18n.locale}
                    labels={{
                      connectionCount: i18n.dashboard.connectionCount,
                      nodeCount: i18n.dashboard.nodeCount,
                      open: i18n.dashboard.open,
                      updated: i18n.dashboard.updated,
                    }}
                    selected={isSelected}
                    onSelectedChange={(checked) =>
                      setSelected((current) => {
                        const next = new Set(current);
                        if (checked) next.add(project.projectId);
                        else next.delete(project.projectId);
                        return next;
                      })
                    }
                    onOpen={() => integrations.navigateToEditor(project.projectId)}
                    mobileActions={
                      isMobile
                        ? {
                            label: i18n.accessibility.projectActions,
                            onOpen: () => {
                              drawerTriggerRef.current = document.activeElement as HTMLElement | null;
                              setActionProjectId(project.projectId);
                            },
                          }
                        : undefined
                    }
                    actions={{
                      deleteLabel: i18n.dashboard.delete,
                      exportLabel: i18n.dashboard.exportProject,
                      onDelete: () => requestDeleteProjects([project.projectId]),
                      onExport: () => exportProjects([project.projectId]),
                      onRename: () => {
                        setEditingId(project.projectId);
                        setEditingTitle(project.title);
                      },
                      renameLabel: i18n.dashboard.rename,
                    }}
                  />
                </li>
              );
            })}
          </ul>
        ) : null}

        {loadState === 'ready' && total > 0 ? (
          <footer className='mt-12 grid gap-4 text-xs text-gray-color sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center'>
            <p>
              {total} {i18n.dashboard.totalProjects} · {i18n.dashboard.showingProjects} {rows.length}
            </p>
            <Pagination
              className='justify-self-end [&_button[aria-current=page]]:border-transparent [&_button[aria-current=page]]:bg-color-main [&_button[aria-current=page]]:text-white'
              page={page}
              totalPages={totalPages}
              ariaLabel={i18n.accessibility.projectActions}
              previousLabel={i18n.dashboard.previousPage}
              nextLabel={i18n.dashboard.nextPage}
              onPageChange={onPageChange}
            />
          </footer>
        ) : null}
      </section>

      {isMobile ? (
        <DashboardMobileDrawer
          mode={drawerMode}
          project={actionProject}
          variant={Math.max(0, actionProjectIndex)}
          title={editingTitle}
          pending={isPending}
          deleteCount={pendingDeleteIds?.length ?? 0}
          onTitleChange={setEditingTitle}
          onClose={() => {
            setActionProjectId(null);
            setPendingDeleteIds(null);
            closeRenameDialog();
          }}
          onClosed={() => drawerTriggerRef.current?.focus()}
          onEdit={() => {
            if (!actionProject) return;
            setEditingId(actionProject.projectId);
            setEditingTitle(actionProject.title);
            setActionProjectId(null);
          }}
          onExport={() => {
            if (!actionProject) return;
            exportProjects([actionProject.projectId]);
            setActionProjectId(null);
          }}
          onDelete={() => {
            if (!actionProject) return;
            requestDeleteProjects([actionProject.projectId]);
            setActionProjectId(null);
          }}
          onSave={renameProject}
          onConfirmDelete={confirmDeleteProjects}
        />
      ) : (
        <>
          <ConfirmationDialog
            open={pendingDeleteIds !== null}
            title={i18n.dashboard.deleteConfirmTitle}
            description={i18n.dashboard.deleteConfirmDescription}
            cancelLabel={i18n.common.cancel}
            confirmLabel={pendingDeleteIds?.length === 1 ? i18n.dashboard.delete : i18n.dashboard.deleteSelected}
            confirmVariant='destructive'
            pending={isPending}
            onCancel={() => setPendingDeleteIds(null)}
            onConfirm={confirmDeleteProjects}
          />

          <Dialog open={editingId !== null} onOpenChange={(open) => (open ? undefined : closeRenameDialog())}>
            <DialogContent

              className='w-[calc(100%-2rem)] max-w-md border-light-gray-2 bg-light-gray p-5 text-text-color shadow-2xl'
            >
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  renameProject();
                }}
              >
                <DialogHeader>
                  <DialogTitle className='text-base'>{i18n.dashboard.renameTitle}</DialogTitle>
                  <DialogDescription className='text-xs text-gray-color'>
                    {i18n.dashboard.renameDescription}
                  </DialogDescription>
                </DialogHeader>
                <label
                  className='mt-5 block text-xs font-medium text-gray-color'
                  htmlFor='infinite-canvas-project-title'
                >
                  {i18n.dashboard.projectName}
                </label>
                <Input
                  id='infinite-canvas-project-title'
                  value={editingTitle}
                  onChange={(event) => setEditingTitle(event.target.value)}
                  className='mt-2 border border-light-gray-2 bg-background-color text-text-color focus:border-main-color'
                />
                <DialogFooter className='mt-6 gap-2'>
                  <Button type='button' variant='outline' onClick={closeRenameDialog}>
                    {i18n.common.cancel}
                  </Button>
                  <Button
                    type='submit'
                    disabled={isPending || editingTitle.trim().length === 0}
                    className='bg-color-main text-white hover:bg-color-main/90'
                  >
                    {i18n.dashboard.saveChanges}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
}
