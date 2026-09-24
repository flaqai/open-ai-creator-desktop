import type { MouseEvent } from 'react';
import type { LucideIcon } from 'lucide-react';

import { isDesktopRuntime } from './runtime';

export interface ContextAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
  children?: ContextAction[];
  run?: () => unknown | Promise<unknown>;
}

export interface ContextRequest {
  actions: ContextAction[];
  x: number;
  y: number;
  target: HTMLElement;
}

export const CONTEXT_MENU_EVENT = 'flaq:context-menu';
export const CONTEXT_MENU_CLOSE_EVENT = 'flaq:context-menu-close';
export const APP_MENU_EVENT = 'flaq:app-menu';

export function showContextActions(request: ContextRequest) {
  window.dispatchEvent(new CustomEvent<ContextRequest>(CONTEXT_MENU_EVENT, { detail: request }));
}

export function closeContextActions() {
  window.dispatchEvent(new Event(CONTEXT_MENU_CLOSE_EVENT));
}

export function appMenuCommand(command: string) {
  window.dispatchEvent(new CustomEvent(APP_MENU_EVENT, { detail: command }));
}

/** Explicit business actions; never infer an action from a button's label. */
export function contextActions(actions: ContextAction[] | (() => ContextAction[])) {
  return (event: MouseEvent<HTMLElement>) => {
    if (!isDesktopRuntime()) return;
    event.preventDefault();
    event.stopPropagation();
    showContextActions({
      actions: typeof actions === 'function' ? actions() : actions,
      x: event.clientX,
      y: event.clientY,
      target: event.currentTarget,
    });
  };
}
