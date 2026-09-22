'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Loader2, Pause, Play, Scissors, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { readBrandColor } from '@/lib/theme/colors';
import { cn } from '@/lib/utils';
import { videoAudioContext } from '@/components/video-ui-form/VideoContenxtProvider';

interface AudioFilePreviewCardProps {
  file: File;
  onDelete: () => void;
  onDurationChange?: (duration: number) => void;
  onTrimChange?: (startTime: number, endTime: number) => void;
}

export default function AudioFilePreviewCard({
  file,
  onDelete,
  onDurationChange,
  onTrimChange,
}: AudioFilePreviewCardProps) {
  const t = useTranslations('components.audio-modal');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isGeneratingWaveform, setIsGeneratingWaveform] = useState(false);

  // Trim state persistence
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);

  // Progress indicator drag state
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isProgressHandleHovered, setIsProgressHandleHovered] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const justFinishedDraggingRef = useRef(false);

  const audioContext = useContext(videoAudioContext);

  // Generate waveform data (always generate for default display)
  const generateWaveform = useCallback(async (url: string) => {
    setIsGeneratingWaveform(true);
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const { fetchMedia } = await import('@/lib/platform/media');
      const response = await fetchMedia(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const rawData = audioBuffer.getChannelData(0);
      const samples = 100;
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData: number[] = [];

      for (let i = 0; i < samples; i += 1) {
        const blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j += 1) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }

      const normalizedData = filteredData.map((n) => n / Math.max(...filteredData));
      setWaveformData(normalizedData);
      audioCtx.close();
    } catch (error) {
      console.error('Error generating waveform:', error);
    } finally {
      setIsGeneratingWaveform(false);
    }
  }, []);

  // Draw waveform
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const barWidth = width / waveformData.length;
    const centerY = height / 2;

    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    ctx.clearRect(0, 0, width, height);
    const primaryColor = readBrandColor('primary');
    const primarySoftColor = readBrandColor('primarySoft');

    waveformData.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * (height * 0.8);

      const time = (index / waveformData.length) * duration;
      const isInRange = !showTrimmer || (time >= startTime && time <= endTime);
      const isPlayed = time <= currentTime;

      if (isInRange) {
        ctx.fillStyle = isPlayed ? primaryColor : primarySoftColor;
      } else {
        ctx.fillStyle = '#404040';
      }

      ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);
    });
  }, [waveformData, duration, startTime, endTime, currentTime, showTrimmer]);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Always generate waveform (regardless of whether trimmer is shown)
  useEffect(() => {
    if (audioUrl) {
      generateWaveform(audioUrl);
    }
  }, [audioUrl, generateWaveform]);

  // Animate waveform drawing
  useEffect(() => {
    if (waveformData.length > 0) {
      const animate = () => {
        drawWaveform();
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
    return undefined;
  }, [waveformData, drawWaveform]);

  // Convert time to position
  const timeToPosition = (time: number) => {
    if (!waveformContainerRef.current || duration === 0) return 0;
    return (time / duration) * waveformContainerRef.current.offsetWidth;
  };

  // Convert position to time
  const positionToTime = (position: number) => {
    if (!waveformContainerRef.current || duration === 0) return 0;
    const ratio = position / waveformContainerRef.current.offsetWidth;
    return Math.max(0, Math.min(duration, ratio * duration));
  };

  // Click waveform to jump
  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isDraggingProgress || isDraggingStart || isDraggingEnd) return;

    // If just finished dragging, ignore this click
    if (justFinishedDraggingRef.current) {
      justFinishedDraggingRef.current = false;
      return;
    }

    const container = waveformContainerRef.current;
    if (!container || !audioRef.current) return;

    const rect = container.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    let newTime = positionToTime(x);

    // If trim mode is enabled, limit to trim area
    if (showTrimmer) {
      newTime = Math.max(startTime, Math.min(endTime, newTime));
    }

    audioRef.current.currentTime = newTime;
  };

  // Progress indicator drag
  const handleProgressHandleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    document.body.style.userSelect = 'none';
    setIsDraggingProgress(true);
  };

  const handleProgressDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!waveformContainerRef.current || !audioRef.current) return;

      const rect = waveformContainerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      let newTime = positionToTime(x);

      // If trim mode is enabled, limit to trim area
      if (showTrimmer) {
        newTime = Math.max(startTime, Math.min(endTime, newTime));
      }

      audioRef.current.currentTime = newTime;
    },
    [positionToTime, showTrimmer, startTime, endTime],
  );

  const handleProgressDragEnd = useCallback(() => {
    setIsDraggingProgress(false);
    document.body.style.userSelect = '';
    justFinishedDraggingRef.current = true;
    setTimeout(() => {
      justFinishedDraggingRef.current = false;
    }, 50);
  }, []);

  // Trim boundary drag
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
      e.preventDefault();
      if (!waveformContainerRef.current) return;

      const rect = waveformContainerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      const time = positionToTime(x);

      if (isDraggingStart) {
        const newStartTime = Math.min(time, endTime - 0.1);
        setStartTime(newStartTime);
        const trimmedDuration = endTime - newStartTime;
        onTrimChange?.(newStartTime, endTime);
        onDurationChange?.(trimmedDuration);
        audioContext?.setAudioDuration?.(trimmedDuration);
      } else if (isDraggingEnd) {
        const newEndTime = Math.max(time, startTime + 0.1);
        setEndTime(newEndTime);
        const trimmedDuration = newEndTime - startTime;
        onTrimChange?.(startTime, newEndTime);
        onDurationChange?.(trimmedDuration);
        audioContext?.setAudioDuration?.(newEndTime - startTime);
      }
    },
    [isDraggingStart, isDraggingEnd, startTime, endTime, onTrimChange, onDurationChange, audioContext, positionToTime],
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

  const handlePlayPause = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // If trimmer is shown and current progress is outside trim range, jump to start position
        if (showTrimmer && (currentTime < startTime || currentTime >= endTime)) {
          audioRef.current.currentTime = startTime;
        }
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete();
  };

  // Toggle trim mode
  const handleToggleTrimmer = () => {
    const newShowTrimmer = !showTrimmer;
    setShowTrimmer(newShowTrimmer);

    // When switching to trim mode, notify parent component of trim range
    if (newShowTrimmer) {
      onTrimChange?.(startTime, endTime);
      const trimmedDuration = endTime - startTime;
      onDurationChange?.(trimmedDuration);
      audioContext?.setAudioDuration?.(trimmedDuration);
    } else {
      // When switching back to full mode, reset to full duration
      onTrimChange?.(0, duration);
      onDurationChange?.(duration);
      audioContext?.setAudioDuration?.(duration);
    }
  };

  const formatTime = (time: number, ceilSeconds = false) => {
    const totalSeconds = ceilSeconds ? Math.ceil(time) : Math.floor(time);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return undefined;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // If trimmer is shown and playback reaches end position, jump to start position
      if (showTrimmer && audio.currentTime >= endTime) {
        audio.pause();
        audio.currentTime = startTime;
        setIsPlaying(false);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setEndTime(audio.duration);
      // Use full duration on initialization
      if (!showTrimmer) {
        onDurationChange?.(audio.duration);
        audioContext?.setAudioDuration?.(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (showTrimmer) {
        audio.currentTime = startTime;
      } else {
        setCurrentTime(0);
      }
    };

    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioUrl, showTrimmer, startTime, endTime, onDurationChange, audioContext]);

  // Progress indicator drag listeners
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
  }, [isDraggingProgress, handleProgressDragMove, handleProgressDragEnd]);

  // Trim boundary drag listeners
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
  }, [isDraggingStart, isDraggingEnd, handleTrimDragMove, handleTrimDragEnd]);

  const progressPosition = timeToPosition(currentTime);

  return (
    <div className='group border-foreground/10 hover:border-color-main/50 bg-card relative rounded-xl border p-2.5 transition-all'>
      <div className='flex items-center gap-2.5'>
        <button
          type='button'
          onClick={handlePlayPause}
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-full transition-all',
            isPlaying
              ? 'bg-color-main text-primary-foreground'
              : 'bg-foreground/5 text-foreground/60 hover:bg-foreground/10',
          )}
        >
          {isPlaying ? <Pause className='size-5 fill-current' /> : <Play className='size-5 fill-current' />}
        </button>
        <div className='flex min-w-0 flex-1 flex-col items-start gap-1.5'>
          <div className='flex w-full items-center justify-between gap-2'>
            <p className='text-foreground line-clamp-1 text-sm font-medium'>{file.name}</p>
            <div className='flex shrink-0 items-center gap-2'>
              <button
                type='button'
                onClick={handleToggleTrimmer}
                className={cn(
                  'text-foreground/40 hover:text-color-main transition-colors',
                  showTrimmer && 'text-color-main',
                )}
                title={showTrimmer ? t('hide-trim') : t('show-trim')}
              >
                <Scissors className='size-4' />
              </button>
              <button
                type='button'
                onClick={handleDelete}
                className='text-foreground/40 hover:text-foreground/60 transition-colors'
              >
                <Trash2 className='size-4' />
              </button>
            </div>
          </div>

          {/* Waveform + progress indicator + trim boundaries */}
          <div className='w-full space-y-1'>
            <span className='text-foreground/40 text-xs'>
              {formatTime(currentTime)}/{formatTime(duration, true)}
            </span>

            <div
              ref={waveformContainerRef}
              role='button'
              tabIndex={0}
              className='relative h-20 w-full cursor-pointer'
              onClick={handleWaveformClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleWaveformClick(e as any);
                }
              }}
            >
              {isGeneratingWaveform ? (
                <div className='bg-foreground/5 flex h-full w-full items-center justify-center rounded-md'>
                  <Loader2 className='text-color-main size-6 animate-spin' />
                </div>
              ) : (
                <>
                  {/* Waveform Canvas */}
                  <canvas ref={canvasRef} className='h-full w-full rounded-md' />

                  {/* Trim boundaries - only shown when showTrimmer is true */}
                  {showTrimmer && (
                    <>
                      {/* Left boundary */}
                      <div
                        role='slider'
                        tabIndex={0}
                        aria-label={t('start-time')}
                        aria-valuemin={0}
                        aria-valuemax={duration}
                        aria-valuenow={startTime}
                        className='bg-color-main absolute top-0 z-20 h-full w-0.5 cursor-ew-resize'
                        style={{ left: `${timeToPosition(startTime)}px` }}
                        onMouseDown={handleTrimBoundaryMouseDown('start')}
                        onTouchStart={handleTrimBoundaryMouseDown('start')}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            const newStartTime = Math.max(0, startTime - 0.1);
                            setStartTime(newStartTime);
                            onTrimChange?.(newStartTime, endTime);
                            onDurationChange?.(endTime - newStartTime);
                          } else if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            const newStartTime = Math.min(endTime - 0.1, startTime + 0.1);
                            setStartTime(newStartTime);
                            onTrimChange?.(newStartTime, endTime);
                            onDurationChange?.(endTime - newStartTime);
                          }
                        }}
                      >
                        <div className='bg-color-main absolute top-1/2 left-1/2 flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-md'>
                          <div className='bg-foreground h-2.5 w-0.5' />
                        </div>
                      </div>

                      {/* Right boundary */}
                      <div
                        role='slider'
                        tabIndex={0}
                        aria-label={t('end-time')}
                        aria-valuemin={0}
                        aria-valuemax={duration}
                        aria-valuenow={endTime}
                        className='bg-color-main absolute top-0 z-20 h-full w-0.5 cursor-ew-resize'
                        style={{ left: `${timeToPosition(endTime)}px` }}
                        onMouseDown={handleTrimBoundaryMouseDown('end')}
                        onTouchStart={handleTrimBoundaryMouseDown('end')}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            const newEndTime = Math.max(startTime + 0.1, endTime - 0.1);
                            setEndTime(newEndTime);
                            onTrimChange?.(startTime, newEndTime);
                            onDurationChange?.(newEndTime - startTime);
                          } else if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            const newEndTime = Math.min(duration, endTime + 0.1);
                            setEndTime(newEndTime);
                            onTrimChange?.(startTime, newEndTime);
                            onDurationChange?.(newEndTime - startTime);
                          }
                        }}
                      >
                        <div className='bg-color-main absolute top-1/2 left-1/2 flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-md'>
                          <div className='bg-foreground h-2.5 w-0.5' />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Progress indicator - always shown */}
                  <div
                    className='bg-color-main pointer-events-none absolute top-0 z-30 h-full w-0.5'
                    style={{ left: `${progressPosition}px` }}
                  >
                    {/* Top circular drag handle */}
                    <div
                      role='slider'
                      tabIndex={0}
                      aria-label='播放进度'
                      aria-valuemin={0}
                      aria-valuemax={duration}
                      aria-valuenow={currentTime}
                      className={cn(
                        'bg-color-main pointer-events-auto absolute -top-1 -left-2.5 flex size-5 cursor-grab items-center justify-center rounded-full shadow-md ring-2 ring-white transition-transform active:cursor-grabbing',
                        (isProgressHandleHovered || isDraggingProgress) && 'scale-125',
                      )}
                      onMouseDown={handleProgressHandleMouseDown}
                      onTouchStart={handleProgressHandleMouseDown}
                      onMouseEnter={() => setIsProgressHandleHovered(true)}
                      onMouseLeave={() => setIsProgressHandleHovered(false)}
                      onKeyDown={(e) => {
                        if (!audioRef.current) return;
                        if (e.key === 'ArrowLeft') {
                          e.preventDefault();
                          let newTime = currentTime - 1;
                          if (showTrimmer) {
                            newTime = Math.max(startTime, newTime);
                          }
                          audioRef.current.currentTime = newTime;
                        } else if (e.key === 'ArrowRight') {
                          e.preventDefault();
                          let newTime = currentTime + 1;
                          if (showTrimmer) {
                            newTime = Math.min(endTime, newTime);
                          }
                          audioRef.current.currentTime = newTime;
                        }
                      }}
                    >
                      <div className='bg-foreground size-2 rounded-full' />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Trim info - only shown in trim mode */}
            {showTrimmer && (
              <div className='text-foreground/60 flex items-center justify-between text-xs'>
                <span>
                  {t('start-time')}: <span className='text-color-main font-medium'>{formatTime(startTime)}</span>
                </span>
                <span>
                  {t('end-time')}: <span className='text-color-main font-medium'>{formatTime(endTime)}</span>
                </span>
                <span>
                  {t('duration')}:{' '}
                  <span className='text-color-main font-medium'>{formatTime(endTime - startTime, true)}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload='metadata' className='hidden' />}
    </div>
  );
}
