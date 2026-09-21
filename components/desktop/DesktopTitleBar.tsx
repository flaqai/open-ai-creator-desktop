'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Copy, Minus, Square, X } from 'lucide-react';

import { isNativeDesktop } from '@/lib/desktop/runtime';

const subscribe = () => () => {};
const serverSnapshot = () => false;

function isWindows() {
  if (typeof navigator === 'undefined' || !isNativeDesktop()) return false;
  return /Windows/i.test(`${navigator.userAgent} ${navigator.platform}`);
}

export function useWindowsDesktopFrame() {
  return useSyncExternalStore(subscribe, isWindows, serverSnapshot);
}

type DesktopTitleBarProps = {
  sidebarWidth: number;
  zh: boolean;
};

export default function DesktopTitleBar({ sidebarWidth, zh }: DesktopTitleBarProps) {
  const windows = useWindowsDesktopFrame();
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    if (!windows) return;
    let disposed = false;
    let unlisten: (() => void) | undefined;

    void import('@tauri-apps/api/window')
      .then(async ({ getCurrentWindow }) => {
        const appWindow = getCurrentWindow();
        const update = async () => {
          const next = await appWindow.isMaximized();
          if (!disposed) setMaximized(next);
        };
        await update();
        const stop = await appWindow.onResized(() => void update());
        if (disposed) stop();
        else unlisten = stop;
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, [windows]);

  if (!windows) return null;

  const withWindow = async (
    action: (appWindow: ReturnType<typeof import('@tauri-apps/api/window').getCurrentWindow>) => Promise<void>,
  ) => {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await action(getCurrentWindow());
  };
  const drag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.detail !== 1) return;
    void withWindow((appWindow) => appWindow.startDragging());
  };
  const toggleMaximize = () => void withWindow((appWindow) => appWindow.toggleMaximize());

  return (
    <header className='desktop-titlebar' aria-label={zh ? '窗口标题栏' : 'Window title bar'}>
      <div className='desktop-titlebar-brand' style={{ width: sidebarWidth }}>
        <img src='/images/logo.png' alt='' aria-hidden='true' className='size-7 shrink-0' draggable={false} />
        <span className='truncate text-[13px] font-semibold tracking-[-0.01em]'>Flaq Creator</span>
      </div>
      <div className='desktop-titlebar-drag' data-tauri-drag-region onMouseDown={drag} onDoubleClick={toggleMaximize}>
        <span className='text-muted-foreground pointer-events-none text-xs font-medium'>
          {zh ? '创作工作台' : 'Creative workspace'}
        </span>
      </div>
      <div className='desktop-window-controls' role='group' aria-label={zh ? '窗口控制' : 'Window controls'}>
        <button
          type='button'
          className='desktop-window-control'
          aria-label={zh ? '最小化窗口' : 'Minimize window'}
          title={zh ? '最小化' : 'Minimize'}
          onClick={() => void withWindow((appWindow) => appWindow.minimize())}
        >
          <Minus aria-hidden='true' className='size-4' strokeWidth={1.5} />
        </button>
        <button
          type='button'
          className='desktop-window-control'
          aria-label={maximized ? (zh ? '还原窗口' : 'Restore window') : zh ? '最大化窗口' : 'Maximize window'}
          title={maximized ? (zh ? '还原' : 'Restore') : zh ? '最大化' : 'Maximize'}
          onClick={toggleMaximize}
        >
          {maximized ? (
            <Copy aria-hidden='true' className='size-3.5 -scale-x-100' strokeWidth={1.5} />
          ) : (
            <Square aria-hidden='true' className='size-3.5' strokeWidth={1.5} />
          )}
        </button>
        <button
          type='button'
          className='desktop-window-control desktop-window-control-close'
          aria-label={zh ? '关闭窗口' : 'Close window'}
          title={zh ? '关闭' : 'Close'}
          onClick={() => void withWindow((appWindow) => appWindow.close())}
        >
          <X aria-hidden='true' className='size-4' strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
