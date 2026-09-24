// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
export type CanvasColorTheme = 'light' | 'dark';
export type CanvasBackgroundMode = 'dots' | 'lines' | 'blank';

export const canvasThemes = {
  light: {
    canvas: {
      background: 'var(--ui-canvas-background, var(--ui-background-color))',
      dot: 'color-mix(in srgb, var(--ui-canvas-text, var(--ui-text-color)) 28%, transparent)',
      line: 'color-mix(in srgb, var(--ui-canvas-text, var(--ui-text-color)) 12%, transparent)',
      selectionStroke: 'var(--ui-canvas-accent, var(--ui-text-color))',
      selectionFill:
        'color-mix(in srgb, var(--ui-canvas-accent, var(--ui-text-color)) 12%, transparent)',
    },
    node: {
      label: 'color-mix(in srgb, var(--ui-canvas-text, var(--ui-text-color)) 78%, transparent)',
      fill: 'var(--ui-canvas-surface, var(--ui-light-gray-1))',
      panel: 'var(--ui-canvas-panel, var(--ui-background-color))',
      stroke: 'var(--ui-canvas-border, var(--ui-light-gray-2))',
      activeStroke: 'var(--ui-canvas-accent, var(--ui-text-color))',
      musicResultStroke: 'var(--ui-canvas-music-result, #0891b2)',
      placeholder: 'var(--ui-canvas-muted, var(--ui-gray-color))',
      text: 'var(--ui-canvas-text, var(--ui-text-color))',
      muted: 'var(--ui-canvas-muted, var(--ui-gray-color))',
      faint: 'color-mix(in srgb, var(--ui-canvas-muted, var(--ui-gray-color)) 62%, transparent)',
    },
    toolbar: {
      panel: 'color-mix(in srgb, var(--ui-canvas-panel, var(--ui-background-color)) 96%, transparent)',
      border: 'var(--ui-canvas-border, var(--ui-light-gray-2))',
      item: 'var(--ui-canvas-text, var(--ui-text-color))',
      itemHover: 'var(--ui-canvas-surface, var(--ui-light-gray-1))',
      activeBg:
        'color-mix(in srgb, var(--ui-canvas-muted-accent, var(--ui-gray-color)) 18%, transparent)',
      activeText: 'var(--ui-canvas-accent, var(--ui-text-color))',
    },
  },
  dark: {
    canvas: {
      background: 'var(--ui-canvas-background, var(--ui-background-color))',
      dot: 'color-mix(in srgb, var(--ui-canvas-text, var(--ui-text-color)) 24%, transparent)',
      line: 'color-mix(in srgb, var(--ui-canvas-text, var(--ui-text-color)) 10%, transparent)',
      selectionStroke: 'var(--ui-canvas-accent, var(--ui-text-color))',
      selectionFill:
        'color-mix(in srgb, var(--ui-canvas-accent, var(--ui-text-color)) 16%, transparent)',
    },
    node: {
      label: 'color-mix(in srgb, var(--ui-canvas-text, var(--ui-text-color)) 78%, transparent)',
      fill: 'var(--ui-canvas-surface, var(--ui-light-gray-1))',
      panel: 'var(--ui-canvas-panel, var(--ui-background-color))',
      stroke: 'var(--ui-canvas-border, var(--ui-light-gray-2))',
      activeStroke: 'var(--ui-canvas-accent, var(--ui-text-color))',
      musicResultStroke: 'var(--ui-canvas-music-result, #22d3ee)',
      placeholder: 'var(--ui-canvas-muted, var(--ui-gray-color))',
      text: 'var(--ui-canvas-text, var(--ui-text-color))',
      muted: 'var(--ui-canvas-muted, var(--ui-gray-color))',
      faint: 'color-mix(in srgb, var(--ui-canvas-muted, var(--ui-gray-color)) 62%, transparent)',
    },
    toolbar: {
      panel: 'color-mix(in srgb, var(--ui-canvas-panel, var(--ui-background-color)) 96%, transparent)',
      border: 'var(--ui-canvas-border, var(--ui-light-gray-2))',
      item: 'var(--ui-canvas-text, var(--ui-text-color))',
      itemHover: 'var(--ui-canvas-surface, var(--ui-light-gray-1))',
      activeBg:
        'color-mix(in srgb, var(--ui-canvas-muted-accent, var(--ui-gray-color)) 18%, transparent)',
      activeText: 'var(--ui-canvas-accent, var(--ui-text-color))',
    },
  },
} as const;

export type CanvasTheme = (typeof canvasThemes)[CanvasColorTheme];
