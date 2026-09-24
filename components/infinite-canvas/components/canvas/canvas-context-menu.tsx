// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { useEffect, useRef } from 'react';
import { showContextActions } from '@/lib/desktop/context-actions';
import { isDesktopRuntime } from '@/lib/desktop/runtime';
import type { KeyboardEvent, ReactNode } from 'react';
import { Download, Image as ImageIcon, Plus, RotateCcw, Settings2, Trash2, Type, Upload, Video } from 'lucide-react';

import { canvasThemes } from '../../lib/canvas-theme';
import { useInfiniteCanvasTranslation } from '../../runtime/i18n/infinite-canvas-translation';
import { useThemeStore } from '../../stores/use-theme-store';
import { CanvasNodeType, type ContextMenuState, type Position } from '../../types/canvas';

export function CanvasNodeContextMenu({
  menu,
  onClose,
  onDuplicate,
  onDelete,
  onCreate,
  onImport,
  onResetView,
  onExportMedia,
}: {
  menu: ContextMenuState;
  onClose: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCreate: (type: CanvasNodeType, position: Position) => void;
  onImport: (position: Position) => void;
  onResetView: () => void;
  onExportMedia?: () => void;
}) {
  const { t } = useInfiniteCanvasTranslation();
  const theme = canvasThemes[useThemeStore((state) => state.theme)];
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDesktopRuntime()) return;
    const actions = menu.type === 'canvas' ? [
      { id: 'text', label: t('canvas.toolbar.text'), icon: Type, run: () => onCreate(CanvasNodeType.Text, menu.position) },
      { id: 'image', label: t('canvas.toolbar.image'), icon: ImageIcon, run: () => onCreate(CanvasNodeType.Image, menu.position) },
      { id: 'video', label: t('canvas.toolbar.video'), icon: Video, run: () => onCreate(CanvasNodeType.Video, menu.position) },
      { id: 'config', label: t('canvas.toolbar.config'), icon: Settings2, run: () => onCreate(CanvasNodeType.Config, menu.position) },
      { id: 'import', label: t('canvas.importAsset'), icon: Upload, separator: true, run: () => onImport(menu.position) },
      { id: 'reset', label: t('canvas.resetView'), icon: RotateCcw, run: onResetView },
    ] : menu.type === 'node' ? [{ id: 'duplicate', label: t('canvas.controls.duplicate'), icon: Plus, run: onDuplicate }] : [];
    if (onExportMedia) actions.push({ id: 'export-media', label: t('common.download'), icon: Download, run: onExportMedia });
    actions.push({ id: 'delete', label: t('canvas.controls.delete'), icon: Trash2, separator: true, destructive: true, run: onDelete });
    showContextActions({ actions, x: menu.x, y: menu.y, target: document.activeElement instanceof HTMLElement ? document.activeElement : document.body });
    onClose();
    // Canvas creates a new menu object per right-click; its callbacks belong to that object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-canvas-overlay]')) return;
      onClose();
    };
    if (!isDesktopRuntime()) window.addEventListener('pointerdown', close);
    return () => { if (!isDesktopRuntime()) window.removeEventListener('pointerdown', close); };
  }, [onClose]);

  useEffect(() => {
    menuRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
  }, [menu.type]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    const buttons = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
    if (!buttons.length) return;
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 :
      (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
    event.preventDefault();
  };

  if (isDesktopRuntime()) return null;

  return (
    <div
      ref={menuRef}
      data-canvas-overlay
      role='menu'
      aria-label={t('canvas.openMenu')}
      onKeyDown={onKeyDown}
      onContextMenu={(event) => event.preventDefault()}
      className='fixed z-[80] min-w-48 overflow-hidden rounded-xl border py-1 shadow-2xl'
      style={{
        left: `clamp(8px, ${menu.x}px, calc(100vw - 208px))`,
        top: `clamp(8px, ${menu.y}px, calc(100vh - ${menu.type === 'canvas' ? 308 : 110}px))`,
        background: theme.toolbar.panel,
        borderColor: theme.toolbar.border,
        color: theme.node.text,
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {menu.type === 'canvas' ? (
        <>
          <MenuButton icon={<Type className='size-4' />} label={t('canvas.toolbar.text')} onClick={() => onCreate(CanvasNodeType.Text, menu.position)} />
          <MenuButton icon={<ImageIcon className='size-4' />} label={t('canvas.toolbar.image')} onClick={() => onCreate(CanvasNodeType.Image, menu.position)} />
          <MenuButton icon={<Video className='size-4' />} label={t('canvas.toolbar.video')} onClick={() => onCreate(CanvasNodeType.Video, menu.position)} />
          <MenuButton icon={<Settings2 className='size-4' />} label={t('canvas.toolbar.config')} onClick={() => onCreate(CanvasNodeType.Config, menu.position)} />
          <div className='my-1 border-t' style={{ borderColor: theme.toolbar.border }} />
          <MenuButton icon={<Upload className='size-4' />} label={t('canvas.importAsset')} onClick={() => onImport(menu.position)} />
          <MenuButton icon={<RotateCcw className='size-4' />} label={t('canvas.resetView')} onClick={onResetView} />
        </>
      ) : null}
      {menu.type === 'node' ? (
        <MenuButton icon={<Plus className='size-4' />} label={t('canvas.controls.duplicate')} onClick={onDuplicate} />
      ) : null}
      <MenuButton icon={<Trash2 className='size-4' />} label={t('canvas.controls.delete')} onClick={onDelete} danger />
    </div>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  const theme = canvasThemes[useThemeStore((state) => state.theme)];

  return (
    <button
      type='button'
      role='menuitem'
      className='flex min-h-9 w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ui-primary)]'
      style={{ color: danger ? 'var(--ui-destructive-color)' : theme.node.text }}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
