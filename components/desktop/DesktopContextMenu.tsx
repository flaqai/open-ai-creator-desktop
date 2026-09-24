'use client';

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { ChevronRight, Copy, ExternalLink, FolderOpen, History, LifeBuoy, PanelLeft, Settings } from 'lucide-react';
import { useLocale } from 'next-intl';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

import {
  appMenuCommand,
  CONTEXT_MENU_CLOSE_EVENT,
  CONTEXT_MENU_EVENT,
  type ContextAction,
  type ContextRequest,
} from '@/lib/desktop/context-actions';
import { mediaDirectoryPreferences } from '@/lib/desktop/media-storage';
import { isDesktopRuntime, isNativeDesktop } from '@/lib/desktop/runtime';
import { textContextActions } from '@/lib/desktop/text-context-actions';
import { writeClipboardText } from '@/lib/platform/clipboard';
import { openExternalUrl } from '@/lib/platform/navigation';

const panel =
  'z-[200] min-w-52 max-w-[calc(100vw-16px)] max-h-[calc(100vh-16px)] rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl animate-in fade-in-0 duration-100 motion-reduce:animate-none';
const row =
  'flex min-h-9 w-full cursor-default select-none items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground disabled:pointer-events-none disabled:opacity-40';

function eventTarget(event: Event): HTMLElement | null {
  const target = event.target;
  return target instanceof HTMLElement ? target : target instanceof Element ? target.parentElement : null;
}

function position(request: ContextRequest, width: number, height: number) {
  const room = 8;
  return {
    left: Math.max(room, Math.min(request.x, window.innerWidth - width - room)),
    top: Math.max(room, Math.min(request.y, window.innerHeight - height - room)),
  };
}

export default function DesktopContextMenu() {
  const locale = useLocale();
  const zh = locale === 'zh' || locale === 'tw';
  const [request, setRequest] = useState<ContextRequest | null>(null);
  const [submenu, setSubmenu] = useState<string | null>(null);
  const [keyboardIndex, setKeyboardIndex] = useState({ root: 0, child: 0 });
  const [point, setPoint] = useState({ left: 8, top: 8 });
  const rootRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDesktopRuntime()) return;
    const quick = (): ContextAction[] => [
      { id: 'settings', label: zh ? '设置' : 'Settings', icon: Settings, run: () => appMenuCommand('settings') },
      { id: 'history', label: zh ? '历史记录' : 'History', icon: History, run: () => appMenuCommand('history') },
      {
        id: 'folder',
        label: zh ? '打开作品文件夹' : 'Open media folder',
        icon: FolderOpen,
        disabled: !isNativeDesktop(),
        run: () => mediaDirectoryPreferences.open(),
      },
      {
        id: 'sidebar',
        label: zh ? '展开／折叠侧栏' : 'Toggle sidebar',
        icon: PanelLeft,
        run: () => appMenuCommand('toggle_sidebar'),
      },
      {
        id: 'help',
        label: zh ? '帮助中心' : 'Help center',
        icon: LifeBuoy,
        separator: true,
        run: () => openExternalUrl(`https://flaq.ai/${locale}/docs/`),
      },
    ];
    const open = (event: Event) => setRequest((event as CustomEvent<ContextRequest>).detail);
    const close = () => setRequest(null);
    const show = (event: MouseEvent, actions: ContextAction[], target: HTMLElement) => {
      event.preventDefault();
      setRequest({ actions, target, x: event.clientX, y: event.clientY });
    };
    const capture = (event: MouseEvent) => {
      const target = eventTarget(event);
      if (!target || target.closest('[data-app-context-menu]')) return;
      const input = target.closest<HTMLElement>(
        'input:not([type=file]):not([type=checkbox]):not([type=radio]):not([type=range]), textarea, [contenteditable=true]',
      );
      if (input) {
        event.stopPropagation();
        show(event, textContextActions(input, zh), input);
      }
    };
    const fallback = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      const target = eventTarget(event);
      if (!target) return;
      if (target.closest('[data-app-context-menu]')) {
        event.preventDefault();
        return;
      }
      const actions: ContextAction[] = [];
      const text = window.getSelection()?.toString();
      if (text)
        actions.push({
          id: 'selection',
          label: zh ? '复制选中文字' : 'Copy selected text',
          icon: Copy,
          run: () => writeClipboardText(text),
        });
      const link = target.closest<HTMLAnchorElement>('a[href]');
      if (link && /^https?:/.test(link.href)) {
        const external = new URL(link.href).origin !== location.origin;
        actions.push({
          id: 'link',
          label: external ? (zh ? '在默认浏览器打开' : 'Open in default browser') : zh ? '打开' : 'Open',
          icon: ExternalLink,
          run: () => (external ? openExternalUrl(link.href) : link.click()),
        });
        if (external)
          actions.push({
            id: 'copy-link',
            label: zh ? '复制链接' : 'Copy link',
            icon: Copy,
            run: () => writeClipboardText(link.href),
          });
      }
      show(
        event,
        actions.length
          ? [...actions, ...quick().map((a, i) => ({ ...a, separator: i === 0 || a.separator }))]
          : quick(),
        target,
      );
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) return;
      const target = eventTarget(event);
      if (!target || target.closest('[data-app-context-menu]')) return;
      event.preventDefault();
      const box = target.getBoundingClientRect();
      target.dispatchEvent(
        new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          clientX: box.left + Math.min(24, box.width / 2),
          clientY: box.top + Math.min(24, box.height / 2),
        }),
      );
    };
    window.addEventListener(CONTEXT_MENU_EVENT, open);
    window.addEventListener(CONTEXT_MENU_CLOSE_EVENT, close);
    document.addEventListener('contextmenu', capture, true);
    document.addEventListener('contextmenu', fallback);
    document.addEventListener('keydown', keyboard);
    return () => {
      window.removeEventListener(CONTEXT_MENU_EVENT, open);
      window.removeEventListener(CONTEXT_MENU_CLOSE_EVENT, close);
      document.removeEventListener('contextmenu', capture, true);
      document.removeEventListener('contextmenu', fallback);
      document.removeEventListener('keydown', keyboard);
    };
  }, [locale, zh]);

  useLayoutEffect(() => {
    if (!request || !rootRef.current) return;
    const box = rootRef.current.getBoundingClientRect();
    setPoint(position(request, box.width, box.height));
    setSubmenu(null);
    setKeyboardIndex({
      root: Math.max(
        0,
        request.actions.findIndex((action) => !action.disabled),
      ),
      child: 0,
    });
    rootRef.current
      .querySelector<HTMLElement>('[role=menuitem]:not([aria-disabled=true])')
      ?.focus({ preventScroll: true });
  }, [request]);

  useEffect(() => {
    if (!request) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setRequest(null);
    };
    const close = () => setRequest(null);
    const keyboard = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' && rootRef.current?.contains(document.activeElement)) return;
      if (
        !['Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' ', 'Home', 'End'].includes(event.key)
      )
        return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Home' || event.key === 'End') {
        const actions = submenu
          ? request.actions.find((action) => action.id === submenu)?.children || []
          : request.actions;
        const enabled = actions.map((action, index) => (action.disabled ? -1 : index)).filter((index) => index >= 0);
        if (!enabled.length) return;
        const current = submenu ? keyboardIndex.child : keyboardIndex.root;
        const position = enabled.indexOf(current);
        const next =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? enabled.length - 1
              : (position + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length;
        setKeyboardIndex((value) => ({ ...value, [submenu ? 'child' : 'root']: enabled[next] }));
        return;
      }
      if (event.key === 'ArrowRight') {
        const action = request.actions[keyboardIndex.root];
        if (action?.children?.length) {
          setSubmenu(action.id);
          setKeyboardIndex((value) => ({
            ...value,
            child: Math.max(
              0,
              action.children!.findIndex((item) => !item.disabled),
            ),
          }));
        }
        return;
      }
      if (event.key === 'ArrowLeft') {
        setSubmenu(null);
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        const buttons = submenu
          ? submenuRef.current?.querySelectorAll<HTMLButtonElement>('[role=menuitem]')
          : rootRef.current?.querySelectorAll<HTMLButtonElement>(':scope > div > [role=menuitem]');
        buttons?.[submenu ? keyboardIndex.child : keyboardIndex.root]?.click();
        return;
      }
      const target = request.target;
      setRequest(null);
      setSubmenu(null);
      if (target.isConnected) window.setTimeout(() => target.focus({ preventScroll: true }), 0);
    };
    document.addEventListener('pointerdown', outside, true);
    window.addEventListener('keydown', keyboard, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('pointerdown', outside, true);
      window.removeEventListener('keydown', keyboard, true);
      window.removeEventListener('resize', close);
    };
  }, [keyboardIndex, request, submenu]);

  if (!request) return null;
  const finish = (restore = false) => {
    const target = request.target;
    setRequest(null);
    setSubmenu(null);
    if (restore && target.isConnected) window.setTimeout(() => target.focus({ preventScroll: true }), 0);
  };
  const execute = (action: ContextAction) => {
    if (action.disabled || action.children?.length) return;
    finish();
    window.setTimeout(() => {
      void Promise.resolve()
        .then(() => action.run?.())
        .catch((error) => toast.error(error instanceof Error ? error.message : String(error)));
    }, 0);
  };
  const keydown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>('[role=menuitem]:not([aria-disabled=true])') || [],
    );
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      finish(true);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length];
      next?.focus();
      const nextId = next?.dataset.actionId;
      if (nextId) {
        if (
          submenu &&
          request.actions.find((item) => item.id === submenu)?.children?.some((item) => item.id === nextId)
        ) {
          setKeyboardIndex((value) => ({
            ...value,
            child: Math.max(
              0,
              request.actions.find((item) => item.id === submenu)?.children?.findIndex((item) => item.id === nextId) ||
                0,
            ),
          }));
        } else {
          setKeyboardIndex((value) => ({
            ...value,
            root: Math.max(
              0,
              request.actions.findIndex((item) => item.id === nextId),
            ),
          }));
        }
      }
    } else if (event.key === 'ArrowRight') {
      const id = (document.activeElement as HTMLElement)?.dataset.actionId;
      const action = request.actions.find((item) => item.id === id);
      if (action?.children?.length) {
        event.preventDefault();
        setSubmenu(action.id);
        setKeyboardIndex((value) => ({
          ...value,
          child: Math.max(
            0,
            action.children!.findIndex((item) => !item.disabled),
          ),
        }));
        window.setTimeout(
          () => submenuRef.current?.querySelector<HTMLElement>('[role=menuitem]:not([aria-disabled=true])')?.focus(),
          0,
        );
      }
    } else if (event.key === 'ArrowLeft' && submenu) {
      event.preventDefault();
      setSubmenu(null);
      rootRef.current?.querySelector<HTMLElement>(`[data-action-id="${submenu}"]`)?.focus();
    }
  };
  const renderItems = (actions: ContextAction[], nested = false) =>
    actions.map((action, index) => {
      const Icon = action.icon;
      const children = !!action.children?.length;
      return (
        <div key={action.id} className='relative'>
          {action.separator && <div role='separator' className='bg-border my-1 h-px' />}
          <button
            type='button'
            role='menuitem'
            data-action-id={action.id}
            data-active={(nested ? keyboardIndex.child : keyboardIndex.root) === index}
            aria-disabled={action.disabled || undefined}
            aria-haspopup={children ? 'menu' : undefined}
            aria-expanded={children ? submenu === action.id : undefined}
            tabIndex={-1}
            className={`${row} ${action.destructive ? 'text-destructive data-[active=true]:bg-destructive/10 data-[active=true]:text-destructive hover:bg-destructive/10 hover:text-destructive' : ''}`}
            disabled={action.disabled}
            onMouseEnter={() => {
              if (nested) setKeyboardIndex((value) => ({ ...value, child: index }));
              else {
                setKeyboardIndex((value) => ({ ...value, root: index, child: 0 }));
                setSubmenu(children ? action.id : null);
              }
            }}
            onClick={() => (children ? setSubmenu(action.id) : execute(action))}
          >
            {Icon && <Icon className='size-4 shrink-0' aria-hidden />}
            <span className='flex-1'>{action.label}</span>
            {children && <ChevronRight className='size-4 shrink-0' aria-hidden />}
          </button>
          {children && submenu === action.id && !nested && (
            <div
              ref={submenuRef}
              role='menu'
              aria-label={action.label}
              className={`${panel} absolute overflow-y-auto ${point.top > window.innerHeight / 2 ? 'bottom-0' : 'top-0'} ${point.left > window.innerWidth / 2 ? 'right-full mr-1' : 'left-full ml-1'}`}
            >
              <div>{renderItems(action.children!, true)}</div>
            </div>
          )}
        </div>
      );
    });
  return createPortal(
    <div
      ref={rootRef}
      role='menu'
      aria-label={zh ? '快捷菜单' : 'Context menu'}
      data-app-context-menu
      className={`${panel} fixed overflow-visible`}
      style={point}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={keydown}
    >
      {renderItems(request.actions)}
    </div>,
    document.body,
  );
}
