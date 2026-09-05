'use client';

import { useEffect, useRef, useState } from 'react';
import useImageHistory from '@/network/image/history';
import useVideoHistory from '@/network/video/history';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import CreatorVideoPreview from './CreatorVideoPreview';

type HistoryType = 'image' | 'video';

const PAGE_SIZE = 16;

export default function CreatorHistory() {
  const t = useTranslations('CreatorHistory');
  const [type, setType] = useState<HistoryType>('video');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const imageHistory = useImageHistory(1, visibleCount);
  const videoHistory = useVideoHistory({ pageNum: 1, pageSize: visibleCount });
  const history = type === 'image' ? imageHistory : videoHistory;
  const hasMore = history.data.length < history.total;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [type]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) => count + PAGE_SIZE);
        }
      },
      { rootMargin: '300px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <section className='space-y-5'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-xl font-semibold text-white'>{t('title')}</h2>
          <p className='mt-1 text-sm text-white/45'>{t('description')}</p>
        </div>
        <div className='flex rounded-xl border border-white/10 bg-black/20 p-1'>
          {(['video', 'image'] as const).map((historyType) => (
            <button
              key={historyType}
              type='button'
              className={`rounded-lg px-3 py-1.5 text-sm ${type === historyType ? 'bg-white text-black' : 'text-white/50'}`}
              onClick={() => setType(historyType)}
            >
              {t(historyType)}
            </button>
          ))}
        </div>
      </div>

      {history.data.length ? (
        <div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4'>
          {type === 'image'
            ? imageHistory.data.map((item) => {
                const src = item.thumbnailUrl || item.url;
                const card = (
                  <div className='group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5'>
                    {src ? (
                      <img src={src} alt={item.prompt} loading='lazy' className='h-full w-full object-cover' />
                    ) : (
                      <div className='flex h-full items-center justify-center text-white/30'>
                        {item.status === 'processing' ? <Loader2 className='animate-spin' /> : t('no-preview')}
                      </div>
                    )}
                    <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10'>
                      <p className='line-clamp-2 text-xs text-white/80'>{item.prompt}</p>
                    </div>
                  </div>
                );
                return item.url ? (
                  <a key={item.id} href={item.url} target='_blank' rel='noopener noreferrer'>
                    {card}
                  </a>
                ) : (
                  <div key={item.id}>{card}</div>
                );
              })
            : videoHistory.data.map((item) => {
                const card = (
                  <div className='group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-white/5'>
                    <CreatorVideoPreview item={item} noPreviewLabel={t('no-preview')} />
                    <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10'>
                      <p className='line-clamp-2 text-xs text-white/80'>{item.prompt}</p>
                    </div>
                  </div>
                );
                return item.videoUrl ? (
                  <a key={item.id} href={item.videoUrl} target='_blank' rel='noopener noreferrer'>
                    {card}
                  </a>
                ) : (
                  <div key={item.id}>{card}</div>
                );
              })}
        </div>
      ) : (
        <div className='flex min-h-44 items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/35'>
          {t('empty')}
        </div>
      )}

      <div ref={loadMoreRef} className='flex h-8 items-center justify-center text-xs text-white/35'>
        {hasMore ? t('loading-more') : history.data.length ? t('end') : null}
      </div>
    </section>
  );
}
