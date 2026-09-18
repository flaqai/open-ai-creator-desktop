import { useEffect, useMemo, useState } from 'react';

import { STORE_PREFIX } from '@/lib/constants/config';
import type { MediaArchiveStatus } from '@/lib/desktop/media-storage';

import { notifyLocalHistory, readLocalHistory, subscribeLocalHistory, writeLocalHistory } from '../local-history';

const OLD_VIDEO_HISTORY_KEY = 'flaq_video_history';

function migrateOldVideoData() {
  if (typeof window === 'undefined') return;

  const oldData = localStorage.getItem(OLD_VIDEO_HISTORY_KEY);
  const newData = localStorage.getItem(`${STORE_PREFIX}-video-history`);

  if (oldData && !newData) {
    localStorage.setItem(`${STORE_PREFIX}-video-history`, oldData);
    localStorage.removeItem(OLD_VIDEO_HISTORY_KEY);
  }
}

export function readVideoHistoryItems() {
  migrateOldVideoData();
  return readLocalHistory<VideoHistoryItem>(videoHistoryKey);
}

export function subscribeVideoHistory(callback: () => void) {
  migrateOldVideoData();
  return subscribeLocalHistory(videoHistoryKey, callback);
}

export type VideoHistoryRequest = {
  pageNum: number;
  pageSize: number;
  videoType?: 'Image-to-video' | 'Text-to-video' | 'Reference-to-video';
};

export type VideoHistoryItem = {
  status: 'pending' | 'processing' | 'completed' | 'fail';
  platformName: string;
  coverImage?: string;
  isAllowExtend?: boolean;
  categoryName: string;
  createTime: number;
  duration: number;
  errorInfo: string;
  id: string;
  imageEndUrl: string;
  imageUrl: string;
  prompt: string;
  traceId: string;
  videoId: string;
  videoThumbnailUrl: string;
  videoUrl: string;
  videoType: VideoHistoryRequest['videoType'];
  ratio?: string;
  localPath?: string;
  archiveStatus?: MediaArchiveStatus;
  archiveCompletedAt?: number;
};

export const pageSize = 8;
export const videoHistoryKey = `${STORE_PREFIX}-video-history`;

export default function useVideoHistory(reqData: VideoHistoryRequest) {
  const [data, setData] = useState<VideoHistoryItem[]>([]);

  useEffect(() => {
    setData(readVideoHistoryItems());

    return subscribeVideoHistory(() => {
      setData(readVideoHistoryItems());
    });
  }, []);

  const filtered = useMemo(
    () => (reqData.videoType ? data.filter((item) => item.videoType === reqData.videoType) : data),
    [data, reqData.videoType],
  );
  const start = (reqData.pageNum - 1) * reqData.pageSize;
  const rows = useMemo(() => filtered.slice(start, start + reqData.pageSize), [filtered, start, reqData.pageSize]);

  return { data: rows, total: filtered.length, isLoading: false };
}

export function refreshVideoHistory() {
  notifyLocalHistory(videoHistoryKey);
}

export function addPendingVideoHistory(item: Omit<VideoHistoryItem, 'status'>) {
  const current = readVideoHistoryItems();
  writeLocalHistory(videoHistoryKey, [{ ...item, status: 'processing' }, ...current]);
}

export function completeVideoHistory(
  taskId: string,
  payload: {
    videoUrl?: string;
    videoThumbnailUrl?: string;
    duration?: number;
    ratio?: string;
    localPath?: string;
    archiveStatus?: MediaArchiveStatus;
    archiveCompletedAt?: number;
  },
) {
  const current = readVideoHistoryItems();
  writeLocalHistory(
    videoHistoryKey,
    current.map((item) =>
      item.id === taskId || item.traceId === taskId
        ? {
            ...item,
            status: 'completed',
            videoUrl: payload.videoUrl || item.videoUrl,
            videoThumbnailUrl: payload.videoThumbnailUrl || item.videoThumbnailUrl,
            coverImage: payload.videoThumbnailUrl || item.coverImage,
            duration: payload.duration ?? item.duration,
            ratio: payload.ratio || item.ratio,
            localPath: payload.localPath ?? item.localPath,
            archiveStatus: payload.archiveStatus ?? item.archiveStatus,
            archiveCompletedAt: payload.archiveCompletedAt ?? item.archiveCompletedAt,
          }
        : item,
    ),
  );
}

export function updateVideoArchive(
  taskId: string,
  payload: Pick<VideoHistoryItem, 'archiveStatus'> & Pick<VideoHistoryItem, 'localPath'>,
) {
  const current = readVideoHistoryItems();
  writeLocalHistory(
    videoHistoryKey,
    current.map((item) =>
      item.id === taskId || item.traceId === taskId
        ? { ...item, archiveStatus: payload.archiveStatus, localPath: payload.localPath ?? item.localPath }
        : item,
    ),
  );
}

export function failVideoHistory(taskId: string, errorInfo?: string) {
  const current = readVideoHistoryItems();
  writeLocalHistory(
    videoHistoryKey,
    current.map((item) =>
      item.id === taskId || item.traceId === taskId
        ? {
            ...item,
            status: 'fail',
            errorInfo: errorInfo || item.errorInfo,
          }
        : item,
    ),
  );
}

export function deleteVideoHistoryItem(id: string) {
  const current = readVideoHistoryItems();
  writeLocalHistory(
    videoHistoryKey,
    current.filter((item) => item.id !== id && item.traceId !== id),
  );
}
