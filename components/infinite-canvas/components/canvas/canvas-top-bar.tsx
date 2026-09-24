// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Download,
  Home,
  Workflow,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Redo2,
  Save,
  Trash2,
  Undo2,
  Upload,
} from 'lucide-react';

import { canvasThemes } from '../../lib/canvas-theme';
import { useInfiniteCanvasTranslation } from '../../runtime/i18n/infinite-canvas-translation';
import { Button, Dropdown, Modal, Tooltip } from '../../runtime/ui/source-ui';
import { useCanvasSidePanelStore } from '../../stores/use-canvas-side-panel-store';
import { useThemeStore } from '../../stores/use-theme-store';
import { UserStatusActions } from '../layout/user-status-actions';

export function CanvasTopBar({
  title,
  titleDraft,
  isTitleEditing,
  onTitleDraftChange,
  onStartTitleEditing,
  onFinishTitleEditing,
  onCancelTitleEditing,
  canUndo,
  canRedo,
  hasUnsavedChanges,
  isSaving,
  lastSavedAt,
  onChangeLocale,
  onHome,
  onDocs,
  onProjects,
  onCreateProject,
  onDeleteProject,
  onExportProject,
  onImportImage,
  onUndo,
  onRedo,
  onSave,
}: {
  title: string;
  titleDraft: string;
  isTitleEditing: boolean;
  onTitleDraftChange: (value: string) => void;
  onStartTitleEditing: () => void;
  onFinishTitleEditing: () => void;
  onCancelTitleEditing: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  lastSavedAt: number | null;
  onChangeLocale: (locale: string) => void;
  onHome: () => void;
  onDocs: () => void;
  onProjects: () => void;
  onCreateProject: () => void;
  onDeleteProject: () => void;
  onExportProject: () => void;
  onImportImage: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
}) {
  const colorTheme = useThemeStore((state) => state.theme);
  const { i18n, t } = useInfiniteCanvasTranslation();
  const theme = canvasThemes[colorTheme];
  const titleRef = useRef<HTMLDivElement>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const sidePanelOpen = useCanvasSidePanelStore((state) => state.panelOpen);
  const toggleSidePanel = useCanvasSidePanelStore((state) => state.togglePanel);

  useEffect(() => {
    if (!isTitleEditing) return;
    const close = (event: PointerEvent) => {
      if (!titleRef.current?.contains(event.target as Node)) onFinishTitleEditing();
    };
    document.addEventListener('pointerdown', close, true);
    return () => document.removeEventListener('pointerdown', close, true);
  }, [isTitleEditing, onFinishTitleEditing]);

  const saveStatus = isSaving
    ? i18n.editor.saving
    : lastSavedAt === null
      ? i18n.editor.saveNow
      : `${i18n.editor.saved} ${formatSavedAt(lastSavedAt)}`;

  return (
    <>
      <div className='pointer-events-none absolute left-0 right-0 top-0 z-50 flex h-16 items-center justify-between pl-1 pr-4'>
        <div className='pointer-events-auto flex min-w-0 items-center gap-2'>
          <Tooltip title={sidePanelOpen ? t('canvas.collapsePanel') : t('canvas.expandPanel')}>
            <button
              type='button'
              onClick={toggleSidePanel}
              aria-label={sidePanelOpen ? t('canvas.collapsePanel') : t('canvas.expandPanel')}
              className={`${sidePanelOpen ? 'hidden sm:grid' : 'grid'} size-7 place-items-center rounded-full transition hover:bg-black/5 dark:hover:bg-white/10`}
              style={{ color: theme.node.text }}
            >
              {sidePanelOpen ? <PanelLeftClose className='size-4' /> : <PanelLeftOpen className='size-4' />}
            </button>
          </Tooltip>
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                { key: 'home', icon: <Home className='size-4' />, label: t('canvas.home'), onClick: onHome },
                {
                  key: 'docs',
                  icon: <BookOpen className='size-4' />,
                  label: t('canvas.docs'),
                  onClick: onDocs,
                },
                {
                  key: 'projects',
                  icon: <Workflow className='size-4' />,
                  label: t('canvas.projects'),
                  onClick: onProjects,
                },
                { type: 'divider' },
                {
                  key: 'save',
                  disabled: isSaving,
                  icon: <Save className='size-4' />,
                  label: (
                    <SaveMenuLabel
                      status={saveStatus}
                      hasUnsavedChanges={hasUnsavedChanges}
                      isSaving={isSaving}
                    />
                  ),
                  onClick: onSave,
                },
                { key: 'new', icon: <Plus className='size-4' />, label: t('canvas.create'), onClick: onCreateProject },
                {
                  key: 'delete',
                  danger: true,
                  icon: <Trash2 className='size-4' />,
                  label: t('canvas.deleteCurrent'),
                  onClick: onDeleteProject,
                },
                { type: 'divider' },
                {
                  key: 'import',
                  icon: <Upload className='size-4' />,
                  label: t('canvas.importAsset'),
                  onClick: onImportImage,
                },
                {
                  key: 'export',
                  icon: <Download className='size-4' />,
                  label: t('canvas.exportCurrent'),
                  onClick: onExportProject,
                },
                { type: 'divider' },
                {
                  key: 'undo',
                  disabled: !canUndo,
                  icon: <Undo2 className='size-4' />,
                  label: <MenuLabel text={t('canvas.undo')} shortcut='⌘ Z' />,
                  onClick: onUndo,
                },
                {
                  key: 'redo',
                  disabled: !canRedo,
                  icon: <Redo2 className='size-4' />,
                  label: <MenuLabel text={t('canvas.redo')} shortcut='⌘ ⇧ Z / ⌘ Y' />,
                  onClick: onRedo,
                },
              ],
            }}
          >
            <button
              type='button'
              className='grid size-7 place-items-center rounded-full transition hover:bg-black/5 dark:hover:bg-white/10'
              style={{ color: theme.node.text }}
              aria-label={t('canvas.openMenu')}
            >
              <Menu className='size-4' />
            </button>
          </Dropdown>

          <div ref={titleRef} className='flex min-w-0 items-center gap-2'>
            {isTitleEditing ? (
              <input
                autoFocus
                value={titleDraft}
                onChange={(event) => onTitleDraftChange(event.target.value)}
                onBlur={onFinishTitleEditing}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') onFinishTitleEditing();
                  if (event.key === 'Escape') onCancelTitleEditing();
                }}
                className='max-w-[280px] bg-transparent p-0 text-left text-lg font-semibold tracking-normal outline-none'
                style={{ color: theme.node.text }}
              />
            ) : (
              <button
                type='button'
                className='max-w-[280px] truncate border-b border-dashed border-transparent text-left text-lg font-semibold tracking-normal transition hover:border-current'
                onDoubleClick={onStartTitleEditing}
                title={t('canvas.renameHint')}
              >
                {title}
              </button>
            )}
          </div>
        </div>

        <div className='pointer-events-auto flex items-center gap-1.5'>
          <UserStatusActions
            showConfig={false}
            variant='canvas'
            onChangeLocale={onChangeLocale}
            onHome={onHome}
            onDashboard={onProjects}
            onDocs={onDocs}
            onOpenShortcuts={() => setShortcutsOpen(true)}
          />
        </div>
      </div>
      <Modal
        title={t('canvas.shortcuts')}
        open={shortcutsOpen}
        onCancel={() => setShortcutsOpen(false)}
        footer={null}
        centered
      >
        <div className='space-y-2 border-t pt-4 text-sm' style={{ borderColor: theme.node.stroke }}>
          <Shortcut keys={['Ctrl / Space', t('canvas.shortcut.drag')]} value={t('canvas.shortcut.toggleTool')} />
          <Shortcut keys={[t('canvas.shortcut.wheel')]} value={t('canvas.shortcut.zoom')} />
          <Shortcut keys={[t('canvas.shortcut.zoomSlider')]} value={t('canvas.shortcut.preciseZoom')} />
          <Shortcut keys={[t('canvas.shortcut.drag')]} value={t('canvas.shortcut.boxSelect')} />
          <Shortcut keys={['Shift / Cmd', t('canvas.shortcut.click')]} value={t('canvas.shortcut.addSelection')} />
          <Shortcut keys={['Ctrl / Cmd', 'A']} value={t('canvas.shortcut.selectAll')} />
          <Shortcut keys={['Ctrl / Cmd', 'C / V']} value={t('canvas.shortcut.copyPaste')} />
          <Shortcut keys={['Ctrl / Cmd', 'Z']} value={t('canvas.undo')} />
          <Shortcut keys={['Ctrl / Cmd', 'Shift', 'Z']} value={t('canvas.redo')} />
          <Shortcut keys={['Ctrl / Cmd', 'Y']} value={t('canvas.redo')} />
          <Shortcut keys={['Delete / Backspace']} value={t('canvas.shortcut.delete')} />
          <Shortcut keys={['Esc']} value={t('canvas.shortcut.escape')} />
          <Shortcut keys={[t('canvas.shortcut.dropMedia')]} value={t('canvas.shortcut.upload')} />
        </div>
      </Modal>
    </>
  );
}

export function formatSavedAt(savedAt: number): string {
  const date = new Date(savedAt);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}:${pad(date.getSeconds())}`;
}

function MenuLabel({ text, shortcut }: { text: string; shortcut: string }) {
  return (
    <span className='flex min-w-36 items-center justify-between gap-8'>
      <span>{text}</span>
      <span className='text-xs opacity-45'>{shortcut}</span>
    </span>
  );
}

function SaveMenuLabel({
  status,
  hasUnsavedChanges,
  isSaving,
}: {
  status: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
}) {
  return (
    <span className='flex min-w-36 items-center justify-between gap-3'>
      <span>{status}</span>
      {hasUnsavedChanges && !isSaving ? <span className='size-1.5 rounded-full bg-current' aria-hidden='true' /> : null}
    </span>
  );
}

function Shortcut({ keys, value }: { keys: string[]; value: string }) {
  return (
    <div className='grid grid-cols-[minmax(0,1fr)_120px] items-center gap-6 rounded-lg px-1 py-1.5'>
      <span className='flex min-w-0 flex-wrap items-center gap-1.5'>
        {keys.map((key, index) => (
          <span key={`${key}-${index}`} className='flex items-center gap-1.5'>
            {index ? <span className='text-xs opacity-35'>+</span> : null}
            <kbd
              className='min-w-9 rounded-md border px-2.5 py-1.5 text-center text-xs font-medium leading-none shadow-[inset_0_-1px_0_rgba(0,0,0,.08),0_1px_2px_rgba(0,0,0,.06)]'
              style={{
                borderColor: 'var(--ui-canvas-border, var(--ui-light-gray-1))',
                background:
                  'linear-gradient(var(--ui-canvas-panel, var(--ui-background-color)), color-mix(in srgb, var(--ui-canvas-surface, var(--ui-light-gray-1)) 35%, var(--ui-canvas-panel, var(--ui-background-color))))',
                color: 'var(--ui-canvas-text, var(--ui-text-color))',
              }}
            >
              {key}
            </kbd>
          </span>
        ))}
      </span>
      <span className='text-right text-sm opacity-55'>{value}</span>
    </div>
  );
}
