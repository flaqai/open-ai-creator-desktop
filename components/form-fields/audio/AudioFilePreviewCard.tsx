'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Loader2, Pause, Play, Scissors, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { videoAudioContext } from '@/components/video-ui-form/VideoContenxtProvider';

const THEME_MAIN = '#7c3aed';
const THEME_MAIN_SOFT = 'rgba(124, 58, 237, 0.35)';

interface AudioFilePreviewCardProps {
  file: File;
  onDelete: () => void;
  onDurationChange?: (duration: number) => void;
  onTrimChange?: (startTime: number, endTime: number) => void;
  minDuration?: number;
  maxDuration?: number;
  showDurationToasts?: boolean;
}

export default function AudioFilePreviewCard({
  file,
  onDelete,
  onDurationChange,
  onTrimChange,
  minDuration = 3,
  maxDuration = 30,
  showDurationToasts = true,
}: AudioFilePreviewCardProps) {
  const t = useTranslations('components.video-form.audio');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isGeneratingWaveform, setIsGeneratingWaveform] = useState(false);

  // 裁剪状态持久化
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);

  // 进度指示器拖动状态
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isProgressHandleHovered, setIsProgressHandleHovered] = useState(false);

  // 区间框整体拖动状态
  const [isDraggingRegion, setIsDraggingRegion] = useState(false);
  const [regionDragStartX, setRegionDragStartX] = useState(0);
  const [regionDragStartTime, setRegionDragStartTime] = useState({ start: 0, end: 0 });

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const justFinishedDraggingRef = useRef(false);

  const audioContext = useContext(videoAudioContext);

  // 生成波形数据（始终生成，用于默认显示）
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

  // 绘制波形
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

    waveformData.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * (height * 0.8);

      const time = (index / waveformData.length) * duration;
      const isInRange = !showTrimmer || (time >= startTime && time <= endTime);
      const isPlayed = time <= currentTime;

      if (isInRange) {
        ctx.fillStyle = isPlayed ? THEME_MAIN : THEME_MAIN_SOFT;
      } else {
        ctx.fillStyle = '#E5E7EB';
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

  // 始终生成波形（无论是否显示裁剪器）
  useEffect(() => {
    if (audioUrl) {
      generateWaveform(audioUrl);
    }
  }, [audioUrl, generateWaveform]);

  // 动画绘制波形
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

  // 时间转位置
  const timeToPosition = (time: number) => {
    if (!waveformContainerRef.current || duration === 0) return 0;
    return (time / duration) * waveformContainerRef.current.offsetWidth;
  };

  // 位置转时间
  const positionToTime = (position: number) => {
    if (!waveformContainerRef.current || duration === 0) return 0;
    const ratio = position / waveformContainerRef.current.offsetWidth;
    return Math.max(0, Math.min(duration, ratio * duration));
  };

  // 点击音轨跳转
  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isDraggingProgress || isDraggingStart || isDraggingEnd || isDraggingRegion) return;

    // 如果刚刚完成拖动，忽略这次点击
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

    // 如果开启裁剪模式，限制在裁剪区域内
    if (showTrimmer) {
      newTime = Math.max(startTime, Math.min(endTime, newTime));
    }

    audioRef.current.currentTime = newTime;
  };

  // 区间框整体拖动
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
      e.preventDefault();
      if (!waveformContainerRef.current) return;

      const rect = waveformContainerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - regionDragStartX;
      const deltaTime = (deltaX / rect.width) * duration;

      const regionDuration = regionDragStartTime.end - regionDragStartTime.start;
      let newStartTime = regionDragStartTime.start + deltaTime;
      let newEndTime = regionDragStartTime.end + deltaTime;

      // 限制在音频范围内
      if (newStartTime < 0) {
        newStartTime = 0;
        newEndTime = regionDuration;
      }
      if (newEndTime > duration) {
        newEndTime = duration;
        newStartTime = duration - regionDuration;
      }

      setStartTime(newStartTime);
      setEndTime(newEndTime);
      onTrimChange?.(newStartTime, newEndTime);
      onDurationChange?.(regionDuration);
      audioContext?.setAudioDuration?.(regionDuration);
    },
    [regionDragStartX, regionDragStartTime, duration, onTrimChange, onDurationChange, audioContext],
  );

  const handleRegionDragEnd = useCallback(() => {
    setIsDraggingRegion(false);
    document.body.style.userSelect = '';
    justFinishedDraggingRef.current = true;
    setTimeout(() => {
      justFinishedDraggingRef.current = false;
    }, 50);
  }, []);

  // 进度指示器拖动
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

      // 如果开启裁剪模式，限制在裁剪区域内
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

  // 裁剪边界器拖动
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
        // 限制裁剪区间的最短和最长时长
        let newStartTime = Math.max(0, Math.min(time, endTime - minDuration));
        if (endTime - newStartTime > maxDuration) {
          newStartTime = endTime - maxDuration;
        }
        setStartTime(newStartTime);
        const trimmedDuration = endTime - newStartTime;
        onTrimChange?.(newStartTime, endTime);
        onDurationChange?.(trimmedDuration);
        audioContext?.setAudioDuration?.(trimmedDuration);
      } else if (isDraggingEnd) {
        // 限制裁剪区间的最短和最长时长
        let newEndTime = Math.min(duration, Math.max(time, startTime + minDuration));
        if (newEndTime - startTime > maxDuration) {
          newEndTime = startTime + maxDuration;
        }
        setEndTime(newEndTime);
        const trimmedDuration = newEndTime - startTime;
        onTrimChange?.(startTime, newEndTime);
        onDurationChange?.(trimmedDuration);
        audioContext?.setAudioDuration?.(newEndTime - startTime);
      }
    },
    [
      isDraggingStart,
      isDraggingEnd,
      startTime,
      endTime,
      onTrimChange,
      onDurationChange,
      audioContext,
      positionToTime,
      minDuration,
      maxDuration,
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

  const handlePlayPause = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // 如果显示裁剪器且当前进度在裁剪范围外，跳转到开始位置
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

  // 切换裁剪模式
  const handleToggleTrimmer = () => {
    const newShowTrimmer = !showTrimmer;
    setShowTrimmer(newShowTrimmer);

    // 切换到裁剪模式时，通知父组件裁剪范围
    if (newShowTrimmer) {
      onTrimChange?.(startTime, endTime);
      const trimmedDuration = endTime - startTime;
      onDurationChange?.(trimmedDuration);
      audioContext?.setAudioDuration?.(trimmedDuration);
    } else {
      // 切换回完整模式时，清除裁剪范围
      onTrimChange?.(0, 0);
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

  // 音频事件监听
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return undefined;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // 如果显示裁剪器且播放到结束位置，跳转到开始位置
      if (showTrimmer && audio.currentTime >= endTime) {
        audio.pause();
        audio.currentTime = startTime;
        setIsPlaying(false);
      }
    };

    const handleLoadedMetadata = () => {
      const audioDuration = audio.duration;
      setDuration(audioDuration);
      setEndTime(audioDuration);

      // 检测音频时长，如果超过上限，自动开启裁剪模式
      if (audioDuration > maxDuration) {
        setShowTrimmer(true);
        setStartTime(0);
        setEndTime(maxDuration);
        onTrimChange?.(0, maxDuration);
        onDurationChange?.(maxDuration);
        audioContext?.setAudioDuration?.(maxDuration);

        if (showDurationToasts) {
          toast.info(t('audio-auto-trimmed', { duration: audioDuration.toFixed(1) }), { duration: 5000 });
        }
      } else if (audioDuration < minDuration) {
        if (showDurationToasts) {
          toast.error(t('audio-too-short'));
        }
      } else {
        // 音频时长在当前模型允许的范围内，正常使用
        onDurationChange?.(audioDuration);
        audioContext?.setAudioDuration?.(audioDuration);
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
  }, [
    audioUrl,
    showTrimmer,
    startTime,
    endTime,
    onDurationChange,
    audioContext,
    minDuration,
    maxDuration,
    showDurationToasts,
    t,
  ]);

  // 进度指示器拖动监听
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

  // 裁剪边界器拖动监听
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

  // 区间框整体拖动监听
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
  }, [isDraggingRegion, handleRegionDragMove, handleRegionDragEnd]);

  const progressPosition = timeToPosition(currentTime);

  return (
    <div className='group border-color-b1 bg-card hover:border-foreground/20 relative rounded-lg border p-2.5 transition-all'>
      <div className='flex items-center gap-2.5'>
        <button
          type='button'
          onClick={handlePlayPause}
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-full transition-all',
            isPlaying ? 'bg-color-main text-foreground' : 'bg-card text-foreground/70 hover:bg-card',
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
                  'hover:text-color-main text-foreground/40 transition-colors',
                  showTrimmer && 'text-color-main',
                )}
                title={showTrimmer ? t('hide-trim') : t('show-trim')}
              >
                <Scissors className='size-4' />
              </button>
              <button
                type='button'
                onClick={handleDelete}
                className='text-foreground/40 hover:text-foreground/70 transition-colors'
              >
                <Trash2 className='size-4' />
              </button>
            </div>
          </div>

          {/* 波形 + 进度指示器 + 裁剪边界器 */}
          <div className='w-full space-y-1'>
            <span className='text-foreground/60 text-xs'>
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
                <div className='bg-card flex h-full w-full items-center justify-center rounded-md'>
                  <Loader2 className='text-color-main size-6 animate-spin' />
                </div>
              ) : (
                <>
                  {/* 波形 Canvas */}
                  <canvas ref={canvasRef} className='h-full w-full rounded-md' />

                  {/* 裁剪区间框 - 仅在 showTrimmer 时显示 */}
                  {showTrimmer && (
                    <>
                      {/* 可拖动的区间框背景 */}
                      <div
                        role='button'
                        tabIndex={0}
                        aria-label={t('drag-region')}
                        className='bg-color-main/10 hover:bg-color-main/20 absolute top-0 z-10 h-full cursor-move transition-colors'
                        style={{
                          left: `${timeToPosition(startTime)}px`,
                          width: `${timeToPosition(endTime) - timeToPosition(startTime)}px`,
                        }}
                        onMouseDown={handleRegionMouseDown}
                        onTouchStart={handleRegionMouseDown}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            const regionDuration = endTime - startTime;
                            const newStartTime = Math.max(0, startTime - 1);
                            const newEndTime = newStartTime + regionDuration;
                            if (newEndTime <= duration) {
                              setStartTime(newStartTime);
                              setEndTime(newEndTime);
                              onTrimChange?.(newStartTime, newEndTime);
                            }
                          } else if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            const regionDuration = endTime - startTime;
                            const newEndTime = Math.min(duration, endTime + 1);
                            const newStartTime = newEndTime - regionDuration;
                            if (newStartTime >= 0) {
                              setStartTime(newStartTime);
                              setEndTime(newEndTime);
                              onTrimChange?.(newStartTime, newEndTime);
                            }
                          }
                        }}
                      >
                        {/* 区间框提示文字 */}
                        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                          <span className='text-foreground/60 text-xs font-medium'>
                            {isDraggingRegion ? t('dragging-region') : t('drag-region')}
                          </span>
                        </div>
                      </div>

                      {/* 左边界 */}
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
                            // 确保裁剪范围在模型限制内
                            const trimmedDuration = endTime - newStartTime;
                            if (trimmedDuration <= maxDuration) {
                              setStartTime(newStartTime);
                              onTrimChange?.(newStartTime, endTime);
                              onDurationChange?.(trimmedDuration);
                            }
                          } else if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            const newStartTime = Math.min(endTime - minDuration, startTime + 0.1);
                            setStartTime(newStartTime);
                            const trimmedDuration = endTime - newStartTime;
                            onTrimChange?.(newStartTime, endTime);
                            onDurationChange?.(trimmedDuration);
                          }
                        }}
                      >
                        <div className='bg-color-main absolute top-1/2 left-1/2 flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-md'>
                          <div className='bg-foreground h-2.5 w-0.5' />
                        </div>
                      </div>

                      {/* 右边界 */}
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
                            const newEndTime = Math.max(startTime + minDuration, endTime - 0.1);
                            setEndTime(newEndTime);
                            const trimmedDuration = newEndTime - startTime;
                            onTrimChange?.(startTime, newEndTime);
                            onDurationChange?.(trimmedDuration);
                          } else if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            const newEndTime = Math.min(duration, endTime + 0.1);
                            // 确保裁剪范围在模型限制内
                            const trimmedDuration = newEndTime - startTime;
                            if (trimmedDuration <= maxDuration) {
                              setEndTime(newEndTime);
                              onTrimChange?.(startTime, newEndTime);
                              onDurationChange?.(trimmedDuration);
                            }
                          }
                        }}
                      >
                        <div className='bg-color-main absolute top-1/2 left-1/2 flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-md'>
                          <div className='bg-foreground h-2.5 w-0.5' />
                        </div>
                      </div>
                    </>
                  )}

                  {/* 进度指示器 - 始终显示 */}
                  <div
                    className='pointer-events-none absolute top-0 z-30 h-full w-0.5 bg-[#E75DF1]'
                    style={{ left: `${progressPosition}px` }}
                  >
                    {/* 顶部圆形拖动手柄 */}
                    <div
                      role='slider'
                      tabIndex={0}
                      aria-label='播放进度'
                      aria-valuemin={0}
                      aria-valuemax={duration}
                      aria-valuenow={currentTime}
                      className={cn(
                        'pointer-events-auto absolute -top-1 -left-2.5 flex size-5 cursor-grab items-center justify-center rounded-full bg-[#E75DF1] shadow-md ring-2 ring-[#1c1d20] transition-transform active:cursor-grabbing',
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

            {/* 裁剪信息 - 仅在裁剪模式显示 */}
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
