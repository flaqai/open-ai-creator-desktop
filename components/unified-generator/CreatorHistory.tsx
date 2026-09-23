'use client';

import { useEffect, useRef, useState, type ComponentProps, type ComponentType } from 'react';
import dynamic from 'next/dynamic';
import useImageHistory, { deleteImageHistoryItem, type ImageHistoryItem } from '@/network/image/history';
import useVideoHistory, { deleteVideoHistoryItem, type VideoHistoryItem } from '@/network/video/history';
import useUnifiedGeneratorStore from '@/store/unified-generator/useUnifiedGeneratorStore';
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionStyle,
  type Variants,
} from 'framer-motion';
import { Eye, ZoomIn, ZoomOut } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  HISTORY_SWITCH_DURATION,
  INDICATOR_TIMES,
  INDICATOR_TRACK_WIDTH,
  INDICATOR_WIDTH,
  indicatorKeyframes,
  indicatorTarget,
} from '@/lib/creator-history-motion';
import { beginHistoryImageDrag, endHistoryImageDrag } from '@/lib/desktop/image-history-drag';
import { Slider } from '@/components/ui/slider';

import CreatorImagePreview from './CreatorImagePreview';
import CreatorVideoPreview from './CreatorVideoPreview';

const ImageDetailModal = dynamic(() => import('@/components/dialog/ImageDetailModal'), { ssr: false });
const VideoDetailModal = dynamic(() => import('@/components/dialog/VideoDetailModal'), { ssr: false });

type SelectedHistoryItem = { type: 'image'; item: ImageHistoryItem } | { type: 'video'; item: VideoHistoryItem } | null;

const PAGE_SIZE = 16;
const DEFAULT_THUMBNAIL_WIDTH = 240;
const MIN_THUMBNAIL_WIDTH = 140;
const MAX_THUMBNAIL_WIDTH = 360;
const HISTORY_CONTENT_VARIANTS: Variants = {
  enter: (direction: number) => ({
    x: `${direction * 100}%`,
  }),
  center: {
    x: 0,
    transition: {
      duration: HISTORY_SWITCH_DURATION,
      ease: [0.33, 0, 0.2, 1],
    },
  },
  exit: (direction: number) => ({
    x: `${direction * -100}%`,
    transition: {
      duration: HISTORY_SWITCH_DURATION,
      ease: [0.33, 0, 0.2, 1],
    },
  }),
};

const REDUCED_HISTORY_CONTENT_VARIANTS: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.08 } },
};

type MotionSpanProps = Omit<ComponentProps<'span'>, 'style'> & {
  style?: MotionStyle;
};

type MotionDivProps = ComponentProps<'div'> & {
  custom?: number;
  variants?: Variants;
  initial?: false | string;
  animate?: string;
  exit?: string;
  layout?: 'size';
};

const MotionSpan = motion.span as unknown as ComponentType<MotionSpanProps>;
const MotionDiv = motion.div as unknown as ComponentType<MotionDivProps>;

export default function CreatorHistory() {
  const t = useTranslations('CreatorHistory');
  const tCommon = useTranslations('Common');
  const tImageDisplay = useTranslations('components.image-form.display');
  const tVideoDisplay = useTranslations('components.video-form.display');
  const type = useUnifiedGeneratorStore((state) => state.mediaType);
  const setType = useUnifiedGeneratorStore((state) => state.setMediaType);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedItem, setSelectedItem] = useState<SelectedHistoryItem>(null);
  const [thumbnailWidth, setThumbnailWidth] = useState(DEFAULT_THUMBNAIL_WIDTH);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const indicatorLeft = useMotionValue(indicatorTarget(type).left);
  const indicatorRight = useMotionValue(indicatorTarget(type).right);
  const indicatorScale = useTransform(
    [indicatorLeft, indicatorRight],
    ([left, right]) => (Number(right) - Number(left)) / INDICATOR_WIDTH,
  );
  const imageHistory = useImageHistory(1, visibleCount, undefined, { excludeFailed: true });
  const videoHistory = useVideoHistory({ pageNum: 1, pageSize: visibleCount, excludeFailed: true });
  const history = type === 'image' ? imageHistory : videoHistory;
  const hasMore = history.data.length < history.total;
  const transitionDirection = type === 'image' ? 1 : -1;

  useEffect(() => {
    const target = indicatorTarget(type);
    if (prefersReducedMotion) {
      indicatorLeft.set(target.left);
      indicatorRight.set(target.right);
      return undefined;
    }

    const current = { left: indicatorLeft.get(), right: indicatorRight.get() };
    if (current.left === target.left && current.right === target.right) return undefined;

    const frames = indicatorKeyframes(current, type);
    const options = { duration: HISTORY_SWITCH_DURATION, times: INDICATOR_TIMES, ease: 'easeInOut' as const };
    const leftAnimation = animate(indicatorLeft, frames.left, options);
    const rightAnimation = animate(indicatorRight, frames.right, options);
    return () => {
      leftAnimation.stop();
      rightAnimation.stop();
    };
  }, [type, prefersReducedMotion, indicatorLeft, indicatorRight]);

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
  }, [hasMore, type]);

  return (
    <section className='space-y-5'>
      <div>
        <div>
          <h2 className='text-foreground text-xl font-semibold'>{t('title')}</h2>
          <p className='text-foreground/45 mt-1 text-sm'>{t('description')}</p>
        </div>
        <div className='border-foreground/10 mt-5 flex flex-wrap items-center justify-between gap-3 border-b pb-2'>
          <div role='tablist' className='relative flex items-center gap-1'>
            <span
              aria-hidden='true'
              className='pointer-events-none absolute bottom-[-10px] left-0 h-0.5 overflow-hidden'
              style={{ width: INDICATOR_TRACK_WIDTH }}
            >
              <MotionSpan
                data-testid='creator-history-tab-indicator'
                className='absolute inset-y-0 left-0 block'
                style={{ width: INDICATOR_WIDTH, x: indicatorLeft }}
              >
                <MotionSpan
                  data-testid='creator-history-tab-indicator-stretch'
                  className='bg-primary block size-full rounded-full'
                  style={{ scaleX: indicatorScale, transformOrigin: 'left center' }}
                />
              </MotionSpan>
            </span>
            {(['video', 'image'] as const).map((historyType) => {
              const active = type === historyType;

              return (
                <button
                  key={historyType}
                  type='button'
                  role='tab'
                  aria-selected={active}
                  className={`relative min-h-10 w-16 px-3 py-2 text-sm transition-colors ${
                    active ? 'text-foreground' : 'text-foreground/50 hover:text-foreground/80'
                  }`}
                  onClick={() => setType(historyType)}
                >
                  {t(historyType)}
                </button>
              );
            })}
          </div>
          <div className='border-foreground/10 bg-foreground/5 flex h-9 w-40 items-center gap-2 rounded-lg border px-2.5'>
            <ZoomOut className='text-foreground/45 size-4 shrink-0' aria-hidden='true' />
            <Slider
              aria-label={t('thumbnail-size')}
              value={[thumbnailWidth]}
              min={MIN_THUMBNAIL_WIDTH}
              max={MAX_THUMBNAIL_WIDTH}
              step={10}
              onValueChange={(value) => setThumbnailWidth(value[0] ?? DEFAULT_THUMBNAIL_WIDTH)}
              className='h-7'
              trackClassName='h-1'
              thumbClassName='size-4'
            />
            <ZoomIn className='text-foreground/45 size-4 shrink-0' aria-hidden='true' />
          </div>
        </div>
      </div>

      <MotionDiv layout='size' className='relative grid overflow-x-clip'>
        <AnimatePresence initial={false} mode='sync' custom={transitionDirection}>
          <MotionDiv
            key={type}
            className='col-start-1 row-start-1 min-w-0'
            custom={transitionDirection}
            variants={prefersReducedMotion ? REDUCED_HISTORY_CONTENT_VARIANTS : HISTORY_CONTENT_VARIANTS}
            initial='enter'
            animate='center'
            exit='exit'
          >
            {history.data.length ? (
              <div style={{ columnWidth: `${thumbnailWidth}px`, columnGap: '0.75rem' }}>
                {type === 'image'
                  ? imageHistory.data.map((item) => {
                      const src = item.thumbnailUrl || item.url;
                      const canOpen = Boolean(item.url) && item.status !== 'processing' && item.status !== 'fail';
                      const card = (
                        <div
                          className={`border-foreground/10 bg-foreground/5 relative overflow-hidden rounded-xl border ${src ? '' : 'min-h-44'}`}
                        >
                          <CreatorImagePreview
                            item={item}
                            noPreviewLabel={t('no-preview')}
                            loadingLabel={tCommon('loading')}
                          />
                          <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10'>
                            <p className='line-clamp-2 text-xs text-white/80'>{item.prompt}</p>
                          </div>
                          {canOpen && (
                            <div className='pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition duration-200 group-hover:bg-black/35 group-hover:opacity-100 group-focus-visible:bg-black/35 group-focus-visible:opacity-100'>
                              <span className='flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-3 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-md'>
                                <Eye className='size-4' />
                                {tImageDisplay('imageDetail')}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                      return canOpen ? (
                        <button
                          key={item.id}
                          type='button'
                          draggable
                          onDragStart={(event) => {
                            beginHistoryImageDrag(event.dataTransfer, {
                              url: item.url,
                              name: item.url.split('/').pop() || 'history-image',
                            });
                          }}
                          onDragEnd={endHistoryImageDrag}
                          onClick={() => setSelectedItem({ type: 'image', item })}
                          className='focus-visible:ring-primary group mb-3 inline-block w-full cursor-grab [break-inside:avoid] rounded-xl text-left align-top focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:cursor-grabbing'
                          aria-label={tImageDisplay('imageDetail')}
                        >
                          {card}
                        </button>
                      ) : (
                        <div key={item.id} className='mb-3 inline-block w-full [break-inside:avoid] align-top'>
                          {card}
                        </div>
                      );
                    })
                  : videoHistory.data.map((item) => {
                      const canOpen = item.status === 'completed' && Boolean(item.videoUrl);
                      const hasPreview = Boolean(
                        item.coverImage || item.videoThumbnailUrl || item.imageUrl || item.videoUrl,
                      );
                      const card = (
                        <div
                          className={`border-foreground/10 bg-foreground/5 relative overflow-hidden rounded-xl border ${hasPreview ? '' : 'min-h-44'}`}
                        >
                          <CreatorVideoPreview
                            item={item}
                            noPreviewLabel={t('no-preview')}
                            loadingLabel={tCommon('loading')}
                          />
                          <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10'>
                            <p className='line-clamp-2 text-xs text-white/80'>{item.prompt}</p>
                          </div>
                          {canOpen && (
                            <div className='pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition duration-200 group-hover:bg-black/35 group-hover:opacity-100 group-focus-visible:bg-black/35 group-focus-visible:opacity-100'>
                              <span className='flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-3 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-md'>
                                <Eye className='size-4' />
                                {tVideoDisplay('videoDetail')}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                      return canOpen ? (
                        <button
                          key={item.id}
                          type='button'
                          onClick={() => setSelectedItem({ type: 'video', item })}
                          className='focus-visible:ring-primary group mb-3 inline-block w-full [break-inside:avoid] rounded-xl text-left align-top focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                          aria-label={tVideoDisplay('videoDetail')}
                        >
                          {card}
                        </button>
                      ) : (
                        <div key={item.id} className='mb-3 inline-block w-full [break-inside:avoid] align-top'>
                          {card}
                        </div>
                      );
                    })}
              </div>
            ) : (
              <div className='border-foreground/10 text-foreground/35 flex min-h-44 items-center justify-center rounded-2xl border border-dashed text-sm'>
                {t('empty')}
              </div>
            )}

            <div ref={loadMoreRef} className='text-foreground/35 flex h-8 items-center justify-center text-xs'>
              {hasMore ? t('loading-more') : history.data.length ? t('end') : null}
            </div>
          </MotionDiv>
        </AnimatePresence>
      </MotionDiv>

      {selectedItem?.type === 'image' && (
        <ImageDetailModal
          open
          onOpenChange={(open) => {
            if (!open) setSelectedItem(null);
          }}
          onDeleteRequest={() => deleteImageHistoryItem(selectedItem.item.id)}
          onDelete={() => setSelectedItem(null)}
          image={{
            id: selectedItem.item.id,
            url: selectedItem.item.url,
            title: selectedItem.item.url.split('/').pop(),
            prompt: selectedItem.item.prompt,
            createTime: selectedItem.item.createTime,
            resolution: selectedItem.item.resolution,
            modelName: selectedItem.item.modelInfo || selectedItem.item.modelName,
            userImageUrlList: selectedItem.item.userImageUrlList,
            size: selectedItem.item.size,
          }}
        />
      )}

      {selectedItem?.type === 'video' && (
        <VideoDetailModal
          open
          onOpenChange={(open) => {
            if (!open) setSelectedItem(null);
          }}
          onDeleteRequest={() => deleteVideoHistoryItem(selectedItem.item.id)}
          onDelete={() => setSelectedItem(null)}
          video={selectedItem.item}
        />
      )}
    </section>
  );
}
