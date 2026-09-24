import { useEffect, useRef, useState } from 'react';
import { Music2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import type { CanvasNodeData } from '../../types/canvas';
import { canvasThemes } from '../../lib/canvas-theme';
import { useThemeStore } from '../../stores/use-theme-store';
import { useInfiniteCanvasTranslation } from '../../runtime/i18n/infinite-canvas-translation';
import { useOptionalInfiniteCanvasIntegrations } from '../../runtime/integrations/infinite-canvas-integrations-context';

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export function CanvasMusicPlayer({ node, onDurationChange, compact = false, dense = false }: { readonly dense?: boolean; readonly compact?: boolean; readonly node: CanvasNodeData; readonly onDurationChange?: (nodeId: string, url: string, durationMs: number) => void }) {
  const audio = useRef<HTMLAudioElement>(null);
  const { t } = useInfiniteCanvasTranslation();
  const integrations = useOptionalInfiniteCanvasIntegrations();
  const theme = canvasThemes[useThemeStore((state) => state.theme)];
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const url = node.metadata?.content;
  const cover = node.metadata?.coverThumbnailUrl || node.metadata?.coverUrl;
  useEffect(() => { setPlaying(false); setTime(0); setDuration(0); }, [url]);
  const updateDuration = () => {
    const seconds = audio.current?.duration;
    if (!seconds || !Number.isFinite(seconds) || seconds <= 0 || !url) return;
    setDuration(seconds);
    const durationMs = Math.round(seconds * 1000);
    if (durationMs !== node.metadata?.durationMs) onDurationChange?.(node.id, url, durationMs);
  };
  const toggle = async () => {
    if (!audio.current) return;
    if (!audio.current.paused) audio.current.pause();
    else try { await audio.current.play(); } catch (error) { integrations?.onError?.(error, 'play-music'); }
  };
  const sliderClasses = {
    className: 'group/music-slider h-4 cursor-pointer data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40',
    trackClassName: 'h-1 bg-canvas-border transition-[height] group-hover/music-slider:h-1.5 group-active/music-slider:h-1.5',
    rangeClassName: 'bg-canvas-accent opacity-80 transition-opacity group-hover/music-slider:opacity-100 group-active/music-slider:opacity-100',
    thumbClassName: 'h-3 w-3 cursor-grab border-canvas-accent bg-canvas-accent transition-[transform,box-shadow] group-hover/music-slider:scale-125 active:cursor-grabbing active:scale-125 active:ring-4 active:ring-canvas-accent/20 focus-visible:ring-canvas-accent',
  };
  return <div className={`flex h-full w-full min-h-0 flex-col ${dense ? 'gap-2 p-2' : 'gap-3 p-4'}`} style={{ color: theme.node.text }} data-canvas-no-zoom
    onDoubleClick={(event) => event.stopPropagation()}>
    <audio ref={audio} src={url} preload='metadata' className='hidden'
      onLoadedMetadata={updateDuration}
      onDurationChange={updateDuration}
      onTimeUpdate={() => setTime(audio.current?.currentTime || 0)}
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
      onVolumeChange={() => { setVolume(audio.current?.volume ?? 1); setMuted(audio.current?.muted ?? false); }} />
    <div className='flex shrink-0 items-center gap-3'>
      <div className='group/cover relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl' style={{ background: theme.node.stroke, width: dense ? 64 : 80, height: dense ? 64 : 80 }}>
        {cover ? <img src={cover} alt='' draggable={false} className='h-full w-full object-cover' /> : <Music2 className='size-8 opacity-50' />}
        <button type='button' onClick={toggle} aria-label={t(playing ? 'music.pause' : 'music.play')}
          onMouseDown={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()}
          className='absolute inset-0 flex cursor-pointer items-center justify-center bg-black/45 text-white opacity-0 transition-[opacity,background-color] hover:bg-black/55 active:bg-black/65 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white group-hover/cover:opacity-100 focus-visible:opacity-100'>
          {playing ? <Pause className='size-7 fill-current' /> : <Play className='size-7 fill-current' />}
        </button>
      </div>
      <div className={`min-w-0 flex-1 ${dense ? 'space-y-0' : 'space-y-2'}`}>
        <div className='flex min-w-0 items-center justify-between gap-2'>
          <div className='truncate text-sm font-semibold' title={node.title}>{node.title || t('canvas.node.audio')}</div>
          <button type='button' onClick={toggle} aria-label={t(playing ? 'music.pause' : 'music.play')}
            onMouseDown={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()}
            className='flex size-7 shrink-0 items-center justify-center cursor-pointer rounded-full transition-[background-color,transform] hover:bg-canvas-accent/10 active:scale-90 active:bg-canvas-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canvas-accent'>
            {playing ? <Pause className='size-5 fill-current' /> : <Play className='size-5 fill-current' />}
          </button>
        </div>
        <div className={dense ? 'py-0' : 'py-1'} onMouseDown={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()}>
          <Slider {...sliderClasses} aria-label={t('music.seek')} min={0} max={duration || 1} step={0.1} value={[Math.min(time, duration)]}
            disabled={!duration} onValueChange={([next]) => { if (audio.current && next !== undefined) { audio.current.currentTime = next; setTime(next); } }} />
        </div>
        <div className='flex items-center justify-between gap-2 text-xs tabular-nums' style={{ color: theme.node.muted }}>
          <span className='shrink-0'>{formatTime(time)} / {formatTime(duration)}</span>
          <div className='flex w-20 shrink-0 items-center gap-2' onMouseDown={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()}>
            <button type='button' className='flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full transition-[background-color,transform] hover:bg-canvas-accent/10 active:scale-90 active:bg-canvas-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canvas-accent' aria-label={t(muted ? 'music.unmute' : 'music.mute')} onClick={() => { if (audio.current) audio.current.muted = !audio.current.muted; }}>
              {muted || volume === 0 ? <VolumeX className='size-3.5' /> : <Volume2 className='size-3.5' />}
            </button>
            <Slider {...sliderClasses} aria-label={t('music.volume')} min={0} max={1} step={0.01} value={[muted ? 0 : volume]}
              onValueChange={([next]) => { if (audio.current && next !== undefined) { audio.current.volume = next; audio.current.muted = false; } }} />
          </div>
        </div>
      </div>
    </div>
    {!compact && node.metadata?.lyrics && <div className='custom-scrollbar min-h-0 flex-1 overflow-y-auto border-t pt-3 text-sm leading-relaxed whitespace-pre-wrap'
      style={{ borderColor: theme.node.stroke }} onWheel={(event) => event.stopPropagation()}>{node.metadata.lyrics}</div>}
  </div>;
}
