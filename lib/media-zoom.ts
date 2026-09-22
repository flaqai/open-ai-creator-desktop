const DEFAULT_WHEEL_ZOOM_SENSITIVITY = 0.0015;
const WHEEL_LINE_HEIGHT = 16;
const MAX_WHEEL_DELTA_PIXELS = 240;

export type WheelZoomInput = {
  currentZoom: number;
  deltaY: number;
  deltaMode?: number;
  pageHeight?: number;
  minZoom: number;
  maxZoom: number;
  sensitivity?: number;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

/** Convert wheel/trackpad input into continuous zoom without fixed zoom stops. */
export function continuousWheelZoom({
  currentZoom,
  deltaY,
  deltaMode = 0,
  pageHeight = 800,
  minZoom,
  maxZoom,
  sensitivity = DEFAULT_WHEEL_ZOOM_SENSITIVITY,
}: WheelZoomInput) {
  const safeMinimum = Math.min(minZoom, maxZoom);
  const safeMaximum = Math.max(minZoom, maxZoom);
  const current = clamp(currentZoom, safeMinimum, safeMaximum);
  if (!Number.isFinite(deltaY) || deltaY === 0) return current;

  const modeMultiplier = deltaMode === 1 ? WHEEL_LINE_HEIGHT : deltaMode === 2 ? Math.max(1, pageHeight) : 1;
  const pixelDelta = clamp(deltaY * modeMultiplier, -MAX_WHEEL_DELTA_PIXELS, MAX_WHEEL_DELTA_PIXELS);
  return clamp(current * Math.exp(-pixelDelta * sensitivity), safeMinimum, safeMaximum);
}
