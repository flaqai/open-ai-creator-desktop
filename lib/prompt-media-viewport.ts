export type Point = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type PanBounds = {
  x: number;
  y: number;
};

export const MIN_MEDIA_ZOOM = 1;
export const MAX_MEDIA_ZOOM = 3;
export const DEFAULT_SPLIT_MEDIA_PERCENT = 65;
export const MIN_SPLIT_MEDIA_PERCENT = 20;
export const MAX_SPLIT_MEDIA_PERCENT = 72;

export type PromptViewerMode = 'split' | 'prompt' | 'media';
export type PromptResizeIntent = PromptViewerMode;

export type PromptResizeResult = {
  mode: PromptViewerMode;
  splitPercent: number;
};

export function clampDividerPercent(percent: number) {
  return Math.min(100, Math.max(0, percent));
}

export function clampSplitMediaPercent(percent: number) {
  return Math.min(MAX_SPLIT_MEDIA_PERCENT, Math.max(MIN_SPLIT_MEDIA_PERCENT, percent));
}

export function promptResizeIntent(percent: number): PromptResizeIntent {
  const safePercent = clampDividerPercent(percent);
  if (safePercent < MIN_SPLIT_MEDIA_PERCENT) return 'prompt';
  if (safePercent > MAX_SPLIT_MEDIA_PERCENT) return 'media';
  return 'split';
}

export function resolvePromptResize(percent: number, previousSplitPercent: number): PromptResizeResult {
  const intent = promptResizeIntent(percent);
  return {
    mode: intent,
    splitPercent: intent === 'split' ? clampSplitMediaPercent(percent) : clampSplitMediaPercent(previousSplitPercent),
  };
}

export function supportsPromptPanelResize(isWide: boolean) {
  return isWide;
}

export function supportsMediaInteraction(mediaType: 'image' | 'video', isWide: boolean) {
  return mediaType === 'image' && isWide;
}

export function clampMediaZoom(zoom: number) {
  return Math.min(MAX_MEDIA_ZOOM, Math.max(MIN_MEDIA_ZOOM, zoom));
}

export function containSize(viewport: Size, intrinsic: Size): Size {
  if (viewport.width <= 0 || viewport.height <= 0 || intrinsic.width <= 0 || intrinsic.height <= 0) {
    return { width: 0, height: 0 };
  }

  const scale = Math.min(viewport.width / intrinsic.width, viewport.height / intrinsic.height);
  return {
    width: intrinsic.width * scale,
    height: intrinsic.height * scale,
  };
}

export function panBounds(viewport: Size, fitted: Size, zoom: number): PanBounds {
  const safeZoom = clampMediaZoom(zoom);
  return {
    x: Math.max(0, (fitted.width * safeZoom - viewport.width) / 2),
    y: Math.max(0, (fitted.height * safeZoom - viewport.height) / 2),
  };
}

export function clampPan(point: Point, bounds: PanBounds): Point {
  return {
    x: Math.min(bounds.x, Math.max(-bounds.x, point.x)),
    y: Math.min(bounds.y, Math.max(-bounds.y, point.y)),
  };
}

export function zoomAroundPoint({
  currentZoom,
  nextZoom,
  pan,
  pointer,
  viewport,
  fitted,
}: {
  currentZoom: number;
  nextZoom: number;
  pan: Point;
  pointer: Point;
  viewport: Size;
  fitted: Size;
}): { zoom: number; pan: Point } {
  const fromZoom = clampMediaZoom(currentZoom);
  const zoom = clampMediaZoom(nextZoom);

  if (zoom === MIN_MEDIA_ZOOM) {
    return { zoom, pan: { x: 0, y: 0 } };
  }

  const pointerFromCenter = {
    x: pointer.x - viewport.width / 2,
    y: pointer.y - viewport.height / 2,
  };
  const ratio = zoom / fromZoom;
  const nextPan = {
    x: pointerFromCenter.x - (pointerFromCenter.x - pan.x) * ratio,
    y: pointerFromCenter.y - (pointerFromCenter.y - pan.y) * ratio,
  };

  return {
    zoom,
    pan: clampPan(nextPan, panBounds(viewport, fitted, zoom)),
  };
}
