'use client';

import { useState, type DragEvent } from 'react';

import {
  endHistoryImageDrag,
  hasHistoryImageDrag,
  readHistoryImageDrag,
  type HistoryImageDragPayload,
} from '@/lib/desktop/image-history-drag';

export function useHistoryImageDrop(onImageDrop: (image: HistoryImageDragPayload) => void, enabled = true) {
  const [isHistoryDragActive, setIsHistoryDragActive] = useState(false);

  const onDragEnter = (event: DragEvent<HTMLDivElement>) => {
    if (!enabled || !hasHistoryImageDrag(event.dataTransfer)) return;
    event.preventDefault();
    setIsHistoryDragActive(true);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!enabled || !hasHistoryImageDrag(event.dataTransfer)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
    setIsHistoryDragActive(false);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    setIsHistoryDragActive(false);
    if (!enabled) return;
    const image = readHistoryImageDrag(event.dataTransfer);
    if (!image) return;
    event.preventDefault();
    event.stopPropagation();
    endHistoryImageDrag();
    onImageDrop(image);
  };

  return { isHistoryDragActive, historyDropProps: { onDragEnter, onDragOver, onDragLeave, onDrop } };
}
