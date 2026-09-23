export type IndicatorEdges = { left: number; right: number };
export type HistoryMediaType = 'image' | 'video';

export const INDICATOR_WIDTH = 64;
export const INDICATOR_TRAVEL = 68;
export const INDICATOR_TRACK_WIDTH = INDICATOR_WIDTH + INDICATOR_TRAVEL;
export const HISTORY_SWITCH_DURATION = 0.48;
export const INDICATOR_TIMES = [0, 0.35, 0.72, 1];

export function indicatorTarget(type: HistoryMediaType): IndicatorEdges {
  return type === 'image'
    ? { left: INDICATOR_TRAVEL, right: INDICATOR_TRACK_WIDTH }
    : { left: 0, right: INDICATOR_WIDTH };
}

export function indicatorKeyframes(current: IndicatorEdges, target: HistoryMediaType) {
  const { left, right } = current;

  if (target === 'image') {
    return {
      left: [left, left, left + (INDICATOR_TRAVEL - left) * 0.63, INDICATOR_TRAVEL],
      right: [right, right + (INDICATOR_TRACK_WIDTH - right) * 0.5, INDICATOR_TRACK_WIDTH, INDICATOR_TRACK_WIDTH],
    };
  }

  return {
    left: [left, left * 0.5, 0, 0],
    right: [right, right, right + (INDICATOR_WIDTH - right) * 0.63, INDICATOR_WIDTH],
  };
}
