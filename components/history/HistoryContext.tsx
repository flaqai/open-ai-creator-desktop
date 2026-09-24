'use client';

import { useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { deleteImageHistoryItem, type ImageHistoryItem } from '@/network/image/history';
import { deleteVideoHistoryItem, type VideoHistoryItem } from '@/network/video/history';
import { useLocale } from 'next-intl';

import { contextActions } from '@/lib/desktop/context-actions';
import { mediaContextActions } from '@/lib/desktop/media-context-actions';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';

const ImageDetail = dynamic(() => import('@/components/dialog/ImageDetailModal'));
const VideoDetail = dynamic(() => import('@/components/dialog/VideoDetailModal'));

export default function HistoryContext({
  item,
  kind,
  children,
}: {
  item: ImageHistoryItem | VideoHistoryItem;
  kind: 'image' | 'video';
  children: ReactNode;
}) {
  const locale = useLocale();
  const zh = locale === 'zh' || locale === 'tw';
  const [details, setDetails] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const image = item as ImageHistoryItem;
  const video = item as VideoHistoryItem;
  const pending = item.status === 'processing' || item.status === 'pending';
  const url = kind === 'image' ? image.url : video.videoUrl || '';
  const remove = () => {
    if (kind === 'image') deleteImageHistoryItem(item.id);
    else deleteVideoHistoryItem(item.id);
  };
  return (
    <>
      <div
        className='contents'
        onContextMenu={
          pending
            ? undefined
            : contextActions(() =>
                mediaContextActions({ ...item, url, kind }, zh, {
                  view: url && item.status !== 'fail' ? () => setDetails(true) : undefined,
                  remove: () => setConfirm(true),
                }),
              )
        }
      >
        {children}
      </div>
      {details &&
        (kind === 'image' ? (
          <ImageDetail open onOpenChange={setDetails} image={image} onDeleteRequest={remove} />
        ) : (
          <VideoDetail open onOpenChange={setDetails} video={video} onDeleteRequest={remove} />
        ))}
      <ConfirmDialog
        open={confirm}
        setOpen={setConfirm}
        callback={remove}
        titleText={zh ? '移除记录？' : 'Remove record?'}
      >
        {zh
          ? '仅移除本机历史记录，已保存的文件不会删除。'
          : 'Only the local history entry is removed. Saved files are kept.'}
      </ConfirmDialog>
    </>
  );
}
