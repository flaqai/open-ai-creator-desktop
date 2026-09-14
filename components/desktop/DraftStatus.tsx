'use client';

import { useLocale } from 'next-intl';

import { useDesktopRuntime } from '@/hooks/use-desktop-runtime';
import type { DraftStatus as Status } from '@/hooks/use-local-draft';

export default function DraftStatus({ status, clear }: { status: Status; clear: () => unknown }) {
  const desktop = useDesktopRuntime();
  const locale = useLocale();
  const zh = locale === 'zh' || locale === 'tw';
  if (!desktop) return null;
  const labels = zh
    ? {
        loading: '正在恢复草稿…',
        ready: '草稿自动保存到此设备',
        saving: '正在保存…',
        saved: '草稿已保存到此设备',
        error: '草稿存储失败',
      }
    : {
        loading: 'Restoring draft…',
        ready: 'Drafts save on this device',
        saving: 'Saving…',
        saved: 'Draft saved on this device',
        error: 'Draft storage failed',
      };
  return (
    <div className='text-muted-foreground flex items-center justify-between gap-3 text-xs'>
      <span role='status'>{labels[status]}</span>
      <button
        type='button'
        disabled={status === 'loading'}
        className='shrink-0 underline'
        onClick={() => {
          if (
            window.confirm(
              zh ? '清空当前草稿？已生成的作品不受影响。' : 'Clear this draft? Generated works are not affected.',
            )
          )
            void clear();
        }}
      >
        {zh ? '清空草稿' : 'Clear draft'}
      </button>
    </div>
  );
}
