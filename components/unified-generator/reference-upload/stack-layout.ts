import type { CSSProperties } from 'react';

export const STACKED_ITEM_WIDTH = 52;
export const STACKED_ITEM_GAP = 8;

function getLeanRotation(index: number) {
  return index % 2 === 0 ? -5 : 5;
}

export function getExpandedStackWidth(totalItems: number) {
  return totalItems * STACKED_ITEM_WIDTH + Math.max(0, totalItems - 1) * STACKED_ITEM_GAP;
}

export function getMediaStackStyle(index: number, totalItems: number) {
  const rotation = totalItems > 1 ? getLeanRotation(index) : 0;

  return {
    zIndex: index + 2,
    ['--stack-transform' as string]: `rotate(${rotation}deg)`,
    ['--spread-transform' as string]: `translateX(${index * (STACKED_ITEM_WIDTH + STACKED_ITEM_GAP)}px) rotate(${rotation}deg)`,
  } as CSSProperties;
}

export function getAddSlotStyle(index: number) {
  const rotation = getLeanRotation(index);

  return {
    ['--stack-transform' as string]: `rotate(${rotation}deg)`,
    ['--spread-transform' as string]: `translateX(${index * (STACKED_ITEM_WIDTH + STACKED_ITEM_GAP)}px) rotate(${rotation}deg)`,
  } as CSSProperties;
}
