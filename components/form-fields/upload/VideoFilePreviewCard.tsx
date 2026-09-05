'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, Scissors, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';

interface VideoFilePreviewCardProps {
  file: File;
  previewUrl: string;
  initialDuration?: number;
  minDuration?: number;
  maxDuration?: number | null;
  defaultShowTrimmer?: boolean;
  onDelete: () => void;
  onDurationChange?: (duration: number) => void;
  onTrimChange?: (startTime: number, endTime: number) => void;
}

export default function VideoFilePreviewCard({
  file,
  previewUrl,
  initialDuration = 0,
  minDuration = 3,
  maxDuration,
  defaultShowTrimmer = false,
  onDelete,
  onDurationChange,
  onTrimChange,
}: VideoFilePreviewCardProps) {
  const t = useTranslations('components.video-form');
  const resolvedMaxDuration = maxDuration === null ? undefined : (maxDuration ?? 10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration);
  const [showTrimmer, setShowTrimmer] = useState(
    defaultShowTrimmer || (resolvedMaxDuration !== undefined && initialDuration > resolvedMaxDuration),
  );
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(
    initialDuration > 0
      ? resolvedMaxDuration === undefined
        ? Math.floor(initialDuration)
        : Math.min(Math.floor(initialDuration), resolvedMaxDuration)
      : 0,
  );
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isProgressHandleHovered, setIsProgressHandleHovered] = useState(false);
  const [isDraggingRegion, setIsDraggingRegion] = useState(false);
  const [regionDragStartX, setRegionDragStartX] = useState(0);
  const [regionDragStartTime, setRegionDragStartTime] = useState({ start: 0, end: 0 });
  const [trackWidth, setTrackWidth] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(initialDuration > 0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const trackContainerRef = useRef<HTMLDivElement>(null);
  const justFinishedDraggingRef = useRef(false);
  const hasAutoTrimmedRef = useRef(false);
  const isPlayPendingRef = useRef(false);
  const hasShownLoadErrorRef = useRef(false);

  useEffect(() => {
    const element = trackContainerRef.current;
    if (!element) return undefined;

    const updateWidth = () => {
      setTrackWidth(element.offsetWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const formatTime = useCallback((time: number, ceilSeconds = false) => {
    const totalSeconds = ceilSeconds ? Math.ceil(time) : Math.floor(time);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const timeToPosition = useCallback(
    (time: number) => {
      if (trackWidth === 0 || duration === 0) return 0;
      return (time / duration) * trackWidth;
    },
    [duration, trackWidth],
  );

  const positionToTime = useCallback(
    (position: number) => {
      if (trackWidth === 0 || duration === 0) return 0;
      const ratio = position / trackWidth;
      return Math.max(0, Math.min(duration, ratio * duration));
    },
    [duration, trackWidth],
  );

  const emitTrimState = useCallback(
    (nextStart: number, nextEnd: number) => {
      const nextDuration = nextEnd - nextStart;
      onTrimChange?.(nextStart, nextEnd);
      onDurationChange?.(nextDuration);
    },
    [onDurationChange, onTrimChange],
  );

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const actualDuration = video.duration;
    hasShownLoadErrorRef.current = false;
    setIsVideoReady(true);
    setDuration(actualDuration);

    if (actualDuration < minDuration) {
      toast.error(t('video-upload.duration-minimum', { duration: minDuration }));
      return;
    }

    if (resolvedMaxDuration !== undefined && actualDuration > resolvedMaxDuration) {
      setShowTrimmer(true);
      setStartTime(0);
      setEndTime(resolvedMaxDuration);
      emitTrimState(0, resolvedMaxDuration);

      if (!hasAutoTrimmedRef.current) {
        hasAutoTrimmedRef.current = true;
        toast.info(t('video-upload.auto-trimmed', { duration: actualDuration.toFixed(1), max: resolvedMaxDuration }), {
          duration: 5000,
        });
      }
      return;
    }

    setShowTrimmer(defaultShowTrimmer);
    setStartTime(0);
    setEndTime(actualDuration);
    emitTrimState(0, actualDuration);
  }, [defaultShowTrimmer, emitTrimState, minDuration, resolvedMaxDuration, t]);

  const handleVideoError = useCallback(() => {
    setIsPlaying(false);
    setIsVideoReady(false);
    isPlayPendingRef.current = false;

    if (!hasShownLoadErrorRef.current) {
      hasShownLoadErrorRef.current = true;
      toast.error(t('video-upload.load-failed'));
    }
  }, [t]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);
    if (showTrimmer && video.currentTime >= endTime) {
      video.pause();
      video.currentTime = startTime;
      setCurrentTime(startTime);
      setIsPlaying(false);
    }
  }, [endTime, showTrimmer, startTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const handleEnded = () => {
      setIsPlaying(false);
      if (showTrimmer) {
        video.currentTime = startTime;
      } else {
        setCurrentTime(0);
      }
    };

    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleVideoError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleVideoError);
    };
  }, [handleLoadedMetadata, handleTimeUpdate, handleVideoError, showTrimmer, startTime]);

  const handlePlayPause = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    if (!isVideoReady || video.readyState < HTMLMediaElement.HAVE_METADATA || isPlayPendingRef.current) {
      return;
    }

    if (showTrimmer && (video.currentTime < startTime || video.currentTime >= endTime)) {
      video.currentTime = startTime;
    }

    try {
      isPlayPendingRef.current = true;
      await video.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play video preview:', error);
      toast.error(t('video-upload.play-failed'));
    } finally {
      isPlayPendingRef.current = false;
    }
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete();
  };

  const handleToggleTrimmer = () => {
    const nextShowTrimmer = !showTrimmer;
    setShowTrimmer(nextShowTrimmer);

    if (nextShowTrimmer) {
      const nextEnd =
        resolvedMaxDuration !== undefined && duration > resolvedMaxDuration ? resolvedMaxDuration : duration;
      setStartTime(0);
      setEndTime(nextEnd);
      emitTrimState(0, nextEnd);
      return;
    }

    setStartTime(0);
    setEndTime(duration);
    emitTrimState(0, duration);
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
    if (isDraggingProgress || isDraggingStart || isDraggingEnd || isDraggingRegion) return;
    if (justFinishedDraggingRef.current) {
      justFinishedDraggingRef.current = false;
      return;
    }

    const video = videoRef.current;
    const container = trackContainerRef.current;
    if (!video || !container) return;

    const rect = container.getBoundingClientRect();
    const clientX = 'clientX' in e ? e.clientX : rect.left;
    const x = clientX - rect.left;
    let nextTime = positionToTime(x);

    if (showTrimmer) {
      nextTime = Math.max(startTime, Math.min(endTime, nextTime));
    }

    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleProgressHandleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    document.body.style.userSelect = 'none';
    setIsDraggingProgress(true);
  };

  const handleProgressDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!trackContainerRef.current || !videoRef.current) return;

      const rect = trackContainerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      let nextTime = positionToTime(x);

      if (showTrimmer) {
        nextTime = Math.max(startTime, Math.min(endTime, nextTime));
      }

      videoRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
    },
    [endTime, positionToTime, showTrimmer, startTime],
  );

  const handleProgressDragEnd = useCallback(() => {
    setIsDraggingProgress(false);
    document.body.style.userSelect = '';
    justFinishedDraggingRef.current = true;
    setTimeout(() => {
      justFinishedDraggingRef.current = false;
    }, 50);
  }, []);

  const handleTrimBoundaryMouseDown = (type: 'start' | 'end') => (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    document.body.style.userSelect = 'none';
    if (type === 'start') {
      setIsDraggingStart(true);
    } else {
      setIsDraggingEnd(true);
    }
  };

  const handleTrimDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!trackContainerRef.current) return;

      const rect = trackContainerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      const time = positionToTime(x);

      if (isDraggingStart) {
        let nextStart = Math.max(0, Math.min(time, endTime - minDuration));
        if (resolvedMaxDuration !== undefined && endTime - nextStart > resolvedMaxDuration) {
          nextStart = endTime - resolvedMaxDuration;
        }
        setStartTime(nextStart);
        emitTrimState(nextStart, endTime);
      } else if (isDraggingEnd) {
        let nextEnd = Math.min(duration, Math.max(time, startTime + minDuration));
        if (resolvedMaxDuration !== undefined && nextEnd - startTime > resolvedMaxDuration) {
          nextEnd = startTime + resolvedMaxDuration;
        }
        setEndTime(nextEnd);
        emitTrimState(startTime, nextEnd);
      }
    },
    [
      duration,
      emitTrimState,
      endTime,
      isDraggingEnd,
      isDraggingStart,
      minDuration,
      positionToTime,
      resolvedMaxDuration,
      startTime,
    ],
  );

  const handleTrimDragEnd = useCallback(() => {
    setIsDraggingStart(false);
    setIsDraggingEnd(false);
    document.body.style.userSelect = '';
    justFinishedDraggingRef.current = true;
    setTimeout(() => {
      justFinishedDraggingRef.current = false;
    }, 50);
  }, []);

  const handleRegionMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    document.body.style.userSelect = 'none';

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setIsDraggingRegion(true);
    setRegionDragStartX(clientX);
    setRegionDragStartTime({ start: startTime, end: endTime });
  };

  const handleRegionDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!trackContainerRef.current) return;

      const rect = trackContainerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - regionDragStartX;
      const deltaTime = (deltaX / rect.width) * duration;
      const regionDuration = regionDragStartTime.end - regionDragStartTime.start;

      let nextStart = regionDragStartTime.start + deltaTime;
      let nextEnd = regionDragStartTime.end + deltaTime;

      if (nextStart < 0) {
        nextStart = 0;
        nextEnd = regionDuration;
      }

      if (nextEnd > duration) {
        nextEnd = duration;
        nextStart = duration - regionDuration;
      }

      setStartTime(nextStart);
      setEndTime(nextEnd);
      emitTrimState(nextStart, nextEnd);
    },
    [duration, emitTrimState, regionDragStartTime, regionDragStartX],
  );

  const handleRegionDragEnd = useCallback(() => {
    setIsDraggingRegion(false);
    document.body.style.userSelect = '';
    justFinishedDraggingRef.current = true;
    setTimeout(() => {
      justFinishedDraggingRef.current = false;
    }, 50);
  }, []);

  useEffect(() => {
    if (!isDraggingProgress) return undefined;

    document.addEventListener('mousemove', handleProgressDragMove);
    document.addEventListener('mouseup', handleProgressDragEnd);
    document.addEventListener('touchmove', handleProgressDragMove, { passive: false });
    document.addEventListener('touchend', handleProgressDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleProgressDragMove);
      document.removeEventListener('mouseup', handleProgressDragEnd);
      document.removeEventListener('touchmove', handleProgressDragMove);
      document.removeEventListener('touchend', handleProgressDragEnd);
    };
  }, [handleProgressDragEnd, handleProgressDragMove, isDraggingProgress]);

  useEffect(() => {
    if (!isDraggingStart && !isDraggingEnd) return undefined;

    document.addEventListener('mousemove', handleTrimDragMove);
    document.addEventListener('mouseup', handleTrimDragEnd);
    document.addEventListener('touchmove', handleTrimDragMove, { passive: false });
    document.addEventListener('touchend', handleTrimDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleTrimDragMove);
      document.removeEventListener('mouseup', handleTrimDragEnd);
      document.removeEventListener('touchmove', handleTrimDragMove);
      document.removeEventListener('touchend', handleTrimDragEnd);
    };
  }, [handleTrimDragEnd, handleTrimDragMove, isDraggingEnd, isDraggingStart]);

  useEffect(() => {
    if (!isDraggingRegion) return undefined;

    document.addEventListener('mousemove', handleRegionDragMove);
    document.addEventListener('mouseup', handleRegionDragEnd);
    document.addEventListener('touchmove', handleRegionDragMove, { passive: false });
    document.addEventListener('touchend', handleRegionDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleRegionDragMove);
      document.removeEventListener('mouseup', handleRegionDragEnd);
      document.removeEventListener('touchmove', handleRegionDragMove);
      document.removeEventListener('touchend', handleRegionDragEnd);
    };
  }, [handleRegionDragEnd, handleRegionDragMove, isDraggingRegion]);

  const progressPosition = timeToPosition(currentTime);

  return (
    <div className='group border-color-b1 bg-color-1 hover:bg-color-2 rounded-lg border p-2.5 transition-all hover:border-white/20'>
      <div className='overflow-hidden rounded-md border border-white/10 bg-black'>
        <video
          key={previewUrl}
          ref={videoRef}
          src={previewUrl}
          className='max-h-[260px] w-full object-contain'
          preload='metadata'
          playsInline
          muted
          controls
        />
      </div>

      <div className='mt-3 flex min-w-0 flex-col gap-1.5'>
        <div className='flex w-full items-center justify-between gap-2'>
          <p className='line-clamp-1 text-sm font-medium text-white'>{file.name}</p>
          <div className='flex shrink-0 items-center gap-2'>
            <button
              type='button'
              onClick={handlePlayPause}
              className={cn(
                'flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/20 hover:bg-white/10',
                isPlaying && 'border-white/20 bg-white/12 text-white',
              )}
              title={isPlaying ? t('video-upload.pause') : t('video-upload.play')}
            >
              {isPlaying ? <Pause className='size-4 fill-current' /> : <Play className='ml-0.5 size-4 fill-current' />}
            </button>
            <button
              type='button'
              onClick={handleToggleTrimmer}
              className={cn('hover:text-color-main text-white/40 transition-colors', showTrimmer && 'text-color-main')}
              title={showTrimmer ? t('video-upload.hide-trim') : t('video-upload.show-trim')}
            >
              <Scissors className='size-4' />
            </button>
            <button
              type='button'
              onClick={handleDelete}
              className='text-white/40 transition-colors hover:text-white/70'
            >
              <Trash2 className='size-4' />
            </button>
          </div>
        </div>

        <div className='w-full space-y-1'>
          <span className='text-xs text-white/60'>
            {formatTime(currentTime)}/{formatTime(duration, true)}
          </span>

          <div
            ref={trackContainerRef}
            role='button'
            tabIndex={0}
            className='relative h-10 w-full cursor-pointer overflow-hidden rounded-none bg-white/6'
            onClick={handleTrackClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTrackClick(e);
              }
            }}
          >
            <div className='absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/10' />

            {showTrimmer && (
              <>
                <div
                  role='button'
                  tabIndex={0}
                  aria-label={t('video-upload.range-tip', { min: minDuration, max: resolvedMaxDuration ?? duration })}
                  className='border-color-main/45 bg-color-main/15 absolute inset-y-0 z-10 cursor-move border'
                  style={{
                    left: `${timeToPosition(startTime)}px`,
                    width: `${Math.max(18, timeToPosition(endTime) - timeToPosition(startTime))}px`,
                  }}
                  onMouseDown={handleRegionMouseDown}
                  onTouchStart={handleRegionMouseDown}
                />

                <div
                  role='slider'
                  tabIndex={0}
                  aria-label={t('video-upload.trim-start')}
                  aria-valuemin={0}
                  aria-valuemax={duration}
                  aria-valuenow={startTime}
                  className='bg-color-main absolute inset-y-0 z-20 w-1 cursor-ew-resize'
                  style={{ left: `${timeToPosition(startTime)}px` }}
                  onMouseDown={handleTrimBoundaryMouseDown('start')}
                  onTouchStart={handleTrimBoundaryMouseDown('start')}
                >
                  <div className='bg-color-main absolute top-1/2 left-1/2 flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-md'>
                    <div className='h-2 w-0.5 bg-white/80' />
                  </div>
                </div>

                <div
                  role='slider'
                  tabIndex={0}
                  aria-label={t('video-upload.trim-end')}
                  aria-valuemin={0}
                  aria-valuemax={duration}
                  aria-valuenow={endTime}
                  className='bg-color-main absolute inset-y-0 z-20 w-1 cursor-ew-resize'
                  style={{ left: `${timeToPosition(endTime)}px` }}
                  onMouseDown={handleTrimBoundaryMouseDown('end')}
                  onTouchStart={handleTrimBoundaryMouseDown('end')}
                >
                  <div className='bg-color-main absolute top-1/2 left-1/2 flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-md'>
                    <div className='h-2 w-0.5 bg-white/80' />
                  </div>
                </div>
              </>
            )}

            <div
              className='pointer-events-none absolute inset-y-0 z-30 h-full w-0.5 bg-[#E75DF1]'
              style={{ left: `${progressPosition}px` }}
            >
              <div
                role='slider'
                tabIndex={0}
                aria-label={t('video-upload.playback-progress')}
                aria-valuemin={0}
                aria-valuemax={duration}
                aria-valuenow={currentTime}
                className={cn(
                  'pointer-events-auto absolute top-0 -left-2 z-40 flex size-4 cursor-grab items-center justify-center rounded-full bg-[#E75DF1] shadow-md transition-transform active:cursor-grabbing',
                  (isProgressHandleHovered || isDraggingProgress) && 'scale-125',
                )}
                onMouseDown={handleProgressHandleMouseDown}
                onTouchStart={handleProgressHandleMouseDown}
                onMouseEnter={() => setIsProgressHandleHovered(true)}
                onMouseLeave={() => setIsProgressHandleHovered(false)}
              >
                <div className='size-1.5 rounded-full bg-white' />
              </div>
            </div>
          </div>

          {showTrimmer && (
            <div className='space-y-1 text-xs text-white/60'>
              {defaultShowTrimmer && (
                <p>{t('video-upload.range-tip', { min: minDuration, max: resolvedMaxDuration ?? duration })}</p>
              )}
              <div className='flex items-center justify-between'>
                <span>
                  {t('video-upload.trim-start')}:{' '}
                  <span className='font-medium text-white'>{formatTime(startTime)}</span>
                </span>
                <span>
                  {t('video-upload.trim-end')}: <span className='font-medium text-white'>{formatTime(endTime)}</span>
                </span>
              </div>
            </div>
          )}

          <div className='text-xs text-white/50'>
            {t('video-upload.selected-range', {
              start: formatTime(startTime),
              end: formatTime(endTime),
              duration: formatTime(Math.max(0, endTime - startTime)),
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
