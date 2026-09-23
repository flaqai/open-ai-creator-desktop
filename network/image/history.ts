import { useEffect, useMemo, useState } from 'react';

import { STORE_PREFIX } from '@/lib/constants/config';
import type { MediaArchiveStatus } from '@/lib/desktop/media-storage';
import { ImageFormType } from '@/components/image-ui-form/image-context-provider';

import { notifyLocalHistory, readLocalHistory, subscribeLocalHistory, writeLocalHistory } from '../local-history';

const OLD_IMAGE_HISTORY_KEY = 'flaq_image_history';
export const imageHistoryKey = `${STORE_PREFIX}-image-history`;

function migrateOldData() {
  if (typeof window === 'undefined') return;

  const oldData = localStorage.getItem(OLD_IMAGE_HISTORY_KEY);
  const newData = localStorage.getItem(imageHistoryKey);

  if (oldData && !newData) {
    localStorage.setItem(imageHistoryKey, oldData);
    localStorage.removeItem(OLD_IMAGE_HISTORY_KEY);
  }
}

export function readImageHistoryItems() {
  migrateOldData();
  return readLocalHistory<ImageHistoryItem>(imageHistoryKey);
}

export function subscribeImageHistory(callback: () => void) {
  migrateOldData();
  return subscribeLocalHistory(imageHistoryKey, callback);
}

export type ImageHistoryItem = {
  id: string;
  prompt: string;
  createTime: number;
  url: string;
  thumbnailUrl: string;
  resolution: string;
  size?: number;
  modelName?: string;
  modelInfo?: string;
  userImageUrlList?: string[];
  status?: 'processing' | 'completed' | 'fail';
  taskId?: string;
  errorInfo?: string;
  localPath?: string;
  archiveStatus?: MediaArchiveStatus;
  archiveCompletedAt?: number;
};

export type ImageHistoryFilterType = ImageFormType;
export type ImageHistoryOptions = {
  excludeFailed?: boolean;
};

export function filterImageHistoryItems(items: ImageHistoryItem[], options: ImageHistoryOptions = {}) {
  return options.excludeFailed ? items.filter((item) => item.status !== 'fail') : items;
}

export default function useImageHistory(
  pageNum: number,
  pageSize: number,
  filter?: ImageHistoryFilterType,
  options: ImageHistoryOptions = {},
) {
  void filter;

  const [data, setData] = useState<ImageHistoryItem[]>([]);

  useEffect(() => {
    setData(readImageHistoryItems());

    return subscribeImageHistory(() => {
      setData(readImageHistoryItems());
    });
  }, []);

  const { excludeFailed } = options;
  const filtered = useMemo(() => filterImageHistoryItems(data, { excludeFailed }), [data, excludeFailed]);
  const start = (pageNum - 1) * pageSize;
  const rows = useMemo(() => filtered.slice(start, start + pageSize), [filtered, start, pageSize]);

  return {
    data: rows,
    total: filtered.length,
    isLoading: false,
  };
}

export function refreshImageHistory() {
  notifyLocalHistory(imageHistoryKey);
}

export function addPendingImageHistory(item: Omit<ImageHistoryItem, 'status'>) {
  const current = readImageHistoryItems();
  writeLocalHistory(imageHistoryKey, [
    { ...item, status: 'processing', taskId: item.id, thumbnailUrl: item.thumbnailUrl || '', url: item.url || '' },
    ...current,
  ]);
}

export function completeImageHistory(
  taskId: string,
  payload: {
    url?: string;
    thumbnailUrl?: string;
    resolution?: string;
    credit?: number;
    localPath?: string;
    archiveStatus?: MediaArchiveStatus;
    archiveCompletedAt?: number;
  },
) {
  const current = readImageHistoryItems();
  writeLocalHistory(
    imageHistoryKey,
    current.map((item) =>
      item.id === taskId || item.taskId === taskId
        ? {
            ...item,
            status: 'completed',
            url: payload.url || item.url,
            thumbnailUrl: payload.thumbnailUrl || payload.url || item.thumbnailUrl,
            resolution: payload.resolution || item.resolution,
            localPath: payload.localPath ?? item.localPath,
            archiveStatus: payload.archiveStatus ?? item.archiveStatus,
            archiveCompletedAt: payload.archiveCompletedAt ?? item.archiveCompletedAt,
          }
        : item,
    ),
  );
}

export function updateImageArchive(
  taskId: string,
  payload: Pick<ImageHistoryItem, 'archiveStatus'> & Pick<ImageHistoryItem, 'localPath'>,
) {
  const current = readImageHistoryItems();
  writeLocalHistory(
    imageHistoryKey,
    current.map((item) =>
      item.id === taskId || item.taskId === taskId
        ? { ...item, archiveStatus: payload.archiveStatus, localPath: payload.localPath ?? item.localPath }
        : item,
    ),
  );
}

export function failImageHistory(taskId: string, errorInfo?: string) {
  const current = readImageHistoryItems();
  writeLocalHistory(
    imageHistoryKey,
    current.map((item) =>
      item.id === taskId || item.taskId === taskId
        ? {
            ...item,
            status: 'fail',
            errorInfo,
          }
        : item,
    ),
  );
}

export function deleteImageHistoryItem(id: string) {
  const current = readImageHistoryItems();
  writeLocalHistory(
    imageHistoryKey,
    current.filter((item) => item.id !== id && item.taskId !== id),
  );
}
