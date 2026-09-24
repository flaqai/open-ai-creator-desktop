export const DESKTOP_CANVAS_COMMAND_EVENT = 'flaq:desktop-canvas-command';

export type DesktopCanvasCommand =
  | 'canvas_save'
  | 'canvas_import'
  | 'canvas_export'
  | 'canvas_reset_view'
  | 'canvas_undo'
  | 'canvas_redo'
  | 'canvas_cut'
  | 'canvas_copy'
  | 'canvas_paste'
  | 'canvas_select_all';

export function dispatchDesktopCanvasCommand(command: DesktopCanvasCommand): void {
  window.dispatchEvent(new CustomEvent<DesktopCanvasCommand>(DESKTOP_CANVAS_COMMAND_EVENT, { detail: command }));
}
