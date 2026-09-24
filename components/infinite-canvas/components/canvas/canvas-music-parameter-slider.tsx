import { Slider } from '@/components/ui/slider';
import type { CanvasMusicParameter } from '../../music.types';
import { canvasThemes } from '../../lib/canvas-theme';
import { useThemeStore } from '../../stores/use-theme-store';

export function CanvasMusicParameterSlider({ field, value, onChange }: {
  readonly field: CanvasMusicParameter;
  readonly value: number;
  readonly onChange: (value: number) => void;
}) {
  const theme = canvasThemes[useThemeStore((state) => state.theme)];
  const options = field.options;
  const index = options ? Math.max(0, options.findIndex((option) => Number(option.value) === value)) : value;
  const label = options?.find((option) => Number(option.value) === value)?.label || field.formatValue?.(value) || String(value);
  return <div className='space-y-3 rounded-xl border p-3' style={{ borderColor: theme.node.stroke }}>
    <div className='flex items-center justify-between gap-2 text-sm'><span>{field.label}</span><span>{label}</span></div>
    <Slider value={[index]} min={options ? 0 : field.min} max={options ? options.length - 1 : field.max}
      step={options ? 1 : field.step} onValueChange={([next]) => onChange(options ? Number(options[next ?? 0]?.value) : next ?? 0)}
      aria-label={field.label} className='group/music-parameter h-5 w-full cursor-pointer' trackClassName='bg-canvas-border transition-opacity group-hover/music-parameter:opacity-80' rangeClassName='bg-canvas-accent' thumbClassName='cursor-grab border-canvas-accent bg-canvas-panel transition-[transform,box-shadow] group-hover/music-parameter:scale-110 active:cursor-grabbing active:scale-125 active:ring-4 active:ring-canvas-accent/20 focus-visible:ring-canvas-accent' />
    <div className='flex justify-between gap-1 text-[10px]' style={{ color: theme.node.muted }}>
      {options ? options.map((option) => <span key={option.value}>{option.label}</span>) : <>
        <span>{field.formatValue?.(field.min ?? 0) ?? field.min}</span><span>{field.formatValue?.(field.max ?? 0) ?? field.max}</span>
      </>}
    </div>
    {field.showNumberInput ? <input type='number' aria-label={field.label} value={value} min={field.min} max={field.max} step={field.step}
      className='h-9 w-full rounded-lg border px-2 text-sm' style={{ background: theme.node.fill, borderColor: theme.node.stroke }}
      onChange={(event) => onChange(Number(event.target.value))} /> : null}
  </div>;
}
