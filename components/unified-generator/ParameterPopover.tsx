'use client';

import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import ToolbarButton from './ToolbarButton';

interface ParameterLabels {
  resolution: string;
  ratio: string;
  duration: string;
  quality: string;
  seed: string;
  negativePrompt: string;
  optional: string;
}

function RatioIcon({ value, active }: { value: string; active: boolean }) {
  if (value === '-' || value === 'Auto') {
    return (
      <span className='relative flex h-5 w-5 items-center justify-center'>
        <span
          className={cn(
            'absolute h-4 w-4 rounded-[2px] border-[1.25px]',
            active ? 'border-color-main' : 'border-color-t3',
          )}
        />
        <span
          className={cn(
            'absolute h-3 w-3 rounded-[1.5px] border-[1.25px]',
            active ? 'border-color-main' : 'border-color-t3',
          )}
        />
      </span>
    );
  }
  const [width, height] = value.split(':').map(Number);
  const safeWidth = width || 1;
  const safeHeight = height || 1;
  const scale = 16 / Math.max(safeWidth, safeHeight);
  return (
    <span
      className={cn('rounded-[2px] border-[1.25px]', active ? 'border-color-main' : 'border-color-t3')}
      style={{ width: `${safeWidth * scale}px`, height: `${safeHeight * scale}px` }}
    />
  );
}

export default function ParameterPopover({
  resolutions,
  ratios,
  durations,
  durationRange,
  qualityOptions,
  resolution,
  ratio,
  duration,
  quality,
  seed,
  seedRange,
  supportsSeed,
  negativePrompt,
  supportsNegativePrompt,
  labels,
  open,
  onOpenChange,
  onResolutionChange,
  onRatioChange,
  onDurationChange,
  onQualityChange,
  onSeedChange,
  onNegativePromptChange,
}: {
  resolutions: string[];
  ratios: string[];
  durations: number[];
  durationRange?: { min: number; max: number };
  qualityOptions: Array<{ name: string; value: string }>;
  resolution: string;
  ratio: string;
  duration?: number;
  quality: string;
  seed?: number;
  seedRange?: { min: number; max: number };
  supportsSeed: boolean;
  negativePrompt: string;
  supportsNegativePrompt: boolean;
  labels: ParameterLabels;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolutionChange: (value: string) => void;
  onRatioChange: (value: string) => void;
  onDurationChange: (value: number) => void;
  onQualityChange: (value: string) => void;
  onSeedChange: (value?: number) => void;
  onNegativePromptChange: (value: string) => void;
}) {
  const summary = [
    resolution?.toUpperCase(),
    ratio === '-' ? 'Auto' : ratio,
    qualityOptions.find((item) => item.value === quality)?.name || quality,
    duration ? `${duration}s` : '',
  ].filter(Boolean);
  if (!summary.length && !supportsSeed && !supportsNegativePrompt) return null;
  const durationValues = durationRange
    ? (durationRange.min <= 3 ? [3, 6, 10] : [4, 8, 12]).filter(
        (value) => value >= durationRange.min && value <= durationRange.max,
      )
    : durations;

  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={false}>
      <PopoverTrigger asChild>
        <ToolbarButton active={open}>
          {summary.map((item, index) => (
            <span key={item} className='inline-flex items-center gap-1'>
              {index > 0 ? <span className='bg-color-b1 h-[19px] w-px' /> : null}
              <span>{item}</span>
            </span>
          ))}
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent
        side='top'
        align='start'
        sideOffset={8}
        className='border-color-b1 bg-color-c1 text-color-t1 w-[437px] max-w-[calc(100vw-32px)] rounded-lg border p-2 shadow-xl'
      >
        <div className='flex flex-col gap-2'>
          {resolutions.length ? (
            <div className='space-y-2'>
              <div className='text-color-t2 text-sm'>{labels.resolution}</div>
              <div className='flex items-center gap-2'>
                {resolutions.map((value) => (
                  <button
                    key={value}
                    type='button'
                    className={cn(
                      'flex h-[30px] flex-1 items-center justify-center rounded px-2 text-sm transition-colors',
                      resolution === value
                        ? 'bg-color-c4 text-color-main'
                        : 'text-color-t3 hover:bg-color-c4 hover:text-color-t1',
                    )}
                    onClick={() => onResolutionChange(value)}
                  >
                    {value.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {resolutions.length && ratios.length ? <div className='border-color-b1 border-t' /> : null}
          {ratios.length ? (
            <div className='space-y-2'>
              <div className='text-color-t2 text-sm'>{labels.ratio}</div>
              <div className='grid grid-cols-6 gap-2'>
                {ratios.map((value) => (
                  <button
                    key={value}
                    type='button'
                    className={cn(
                      'flex h-[57px] flex-col items-center justify-center gap-1 rounded px-2 text-sm transition-colors',
                      ratio === value
                        ? 'bg-color-c4 text-color-main'
                        : 'text-color-t3 hover:bg-color-c4 hover:text-color-t1',
                    )}
                    onClick={() => onRatioChange(value)}
                  >
                    <RatioIcon value={value} active={ratio === value} />
                    {value === '-' ? 'Auto' : value}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {ratios.length && qualityOptions.length ? <div className='border-color-b1 border-t' /> : null}
          {qualityOptions.length ? (
            <div className='space-y-2'>
              <div className='text-color-t2 text-sm'>{labels.quality}</div>
              <div className='flex items-center gap-2'>
                {qualityOptions.map((option) => (
                  <button
                    key={option.value}
                    type='button'
                    className={cn(
                      'flex h-[30px] min-w-16 flex-1 items-center justify-center rounded px-3 py-1 text-sm leading-[22px] transition-colors',
                      quality === option.value
                        ? 'bg-color-c4 text-color-main'
                        : 'text-color-t3 hover:bg-color-c4 hover:text-color-t1',
                    )}
                    onClick={() => onQualityChange(option.value)}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {(resolutions.length || ratios.length || qualityOptions.length) && (durationRange || durations.length) ? (
            <div className='border-color-b1 border-t' />
          ) : null}
          {durationRange || durations.length ? (
            <div className='space-y-2'>
              <div className='text-color-t2 text-sm'>{labels.duration}</div>
              <div className='flex flex-wrap items-center gap-2'>
                {durationValues
                  .filter((value, index, values) => values.indexOf(value) === index)
                  .map((value) => (
                    <button
                      key={value}
                      type='button'
                      className={cn(
                        'flex h-[30px] min-w-12 items-center justify-center rounded px-3 text-sm transition-colors',
                        duration === value
                          ? 'bg-color-c4 text-color-main'
                          : 'text-color-t3 hover:bg-color-c4 hover:text-color-t1',
                      )}
                      onClick={() => onDurationChange(value)}
                    >
                      {value}s
                    </button>
                  ))}
                {durationRange ? (
                  <label className='border-color-b1 bg-color-c3 text-color-t2 focus-within:border-color-main flex h-[30px] w-[104px] items-center rounded border px-2 text-sm'>
                    <input
                      type='number'
                      min={durationRange.min}
                      max={durationRange.max}
                      value={duration ?? ''}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        if (Number.isFinite(value)) onDurationChange(value);
                      }}
                      onBlur={(event) => {
                        const value = Number(event.target.value);
                        onDurationChange(
                          Number.isFinite(value)
                            ? Math.min(Math.max(value, durationRange.min), durationRange.max)
                            : durationRange.min,
                        );
                      }}
                      className='text-color-t1 min-w-0 flex-1 bg-transparent outline-none'
                    />
                    <span className='text-color-t3'>s</span>
                  </label>
                ) : null}
              </div>
            </div>
          ) : null}
          {supportsNegativePrompt ? (
            <>
              <div className='border-color-b1 border-t' />
              <label className='space-y-2'>
                <span className='text-color-t2 text-sm'>{labels.negativePrompt}</span>
                <textarea
                  value={negativePrompt}
                  placeholder={labels.optional}
                  className='custom-scrollbar border-color-b1 bg-color-c3 text-color-t1 focus:border-color-main min-h-[72px] w-full resize-y rounded border px-3 py-2 text-sm outline-none'
                  onChange={(event) => onNegativePromptChange(event.target.value)}
                />
              </label>
            </>
          ) : null}
          {supportsSeed ? (
            <>
              <div className='border-color-b1 border-t' />
              <label className='space-y-2'>
                <span className='text-color-t2 text-sm'>{labels.seed}</span>
                <input
                  type='number'
                  min={seedRange?.min}
                  max={seedRange?.max}
                  value={seed ?? ''}
                  placeholder={labels.optional}
                  className='border-color-b1 bg-color-c3 text-color-t1 focus:border-color-main h-9 w-full rounded border px-3 text-sm outline-none'
                  onChange={(event) => onSeedChange(event.target.value ? Number(event.target.value) : undefined)}
                />
              </label>
            </>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
