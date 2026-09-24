import { useInfiniteCanvasTranslation } from '../../runtime/i18n/infinite-canvas-translation';
import { useId } from 'react';
import type { CanvasMusicAdapter, CanvasMusicValues } from '../../music.types';
import { canvasThemes } from '../../lib/canvas-theme';
import type { AiConfig } from '../../stores/use-config-store';
import { useThemeStore } from '../../stores/use-theme-store';
import { CanvasMusicParameterSlider } from './canvas-music-parameter-slider';
import { Switch } from '../../runtime/ui/source-ui';

export function CanvasMusicSettings({ adapter, config, audioCount = 0, onChange }: {
  readonly adapter: CanvasMusicAdapter;
  readonly config: AiConfig;
  readonly audioCount?: number;
  readonly onChange: (values: CanvasMusicValues) => void;
}) {
  const id = useId();
  const { t } = useInfiniteCanvasTranslation();
  const theme = canvasThemes[useThemeStore((state) => state.theme)];
  const values = { ...adapter.getDefaults(config.model), ...config.music };
  const fields = adapter.getParameters(config, { audioCount });
  const toggles = fields.filter((field) => field.type === 'boolean');
  const inputStyle = { background: theme.node.fill, borderColor: theme.node.stroke, color: theme.node.text };
  return (
    <div className='space-y-4' style={{ color: theme.node.text }}>
      <div className='text-lg font-semibold'>{t('music.settings')}</div>
      {toggles.length ? <div className='grid gap-2 rounded-xl border p-2.5' style={{ borderColor: theme.node.stroke }}>
        {toggles.map((field) => <div key={field.key} className='flex h-8 items-center justify-between gap-3'>
          <span className='text-sm'>{field.label}</span>
          <Switch className='cursor-pointer transition-opacity hover:opacity-80 active:opacity-60 focus-visible:outline-2 focus-visible:outline-canvas-accent' checked={Boolean(values[field.key])} onChange={(value) => onChange({ ...values, [field.key]: value })} aria-label={field.label} />
        </div>)}
      </div> : null}
      {fields.filter((field) => field.type !== 'boolean').map((field) => {
        const value = values[field.key];
        const fieldId = `${id}-${field.key}`;
        const change = (next: string | number) => onChange({ ...values, [field.key]: next });
        if (field.type === 'slider') return <CanvasMusicParameterSlider key={field.key} field={field} value={Number(value)} onChange={change} />;
        return <div key={field.key} className='space-y-2'>
          <label htmlFor={field.type === 'select' ? undefined : fieldId} className='block text-sm' style={{ color: theme.node.muted }}>{field.label}</label>
          {field.type === 'select' ? <div className='grid grid-cols-3 gap-2.5' role='group' aria-label={field.label}>
            {field.options?.map((option) => <button key={option.value} type='button' aria-pressed={String(value) === option.value}
              className='h-9 cursor-pointer rounded-full border px-2 text-sm transition hover:opacity-80 active:scale-95 focus-visible:outline-2 focus-visible:outline-canvas-accent'
              style={{ background: 'transparent', borderColor: String(value) === option.value ? theme.node.text : theme.node.stroke, color: theme.node.text }}
              onClick={() => change(option.value)}>{option.label}</button>)}
          </div> : field.type === 'textarea' ? <textarea id={fieldId} className='custom-scrollbar min-h-28 w-full resize-y rounded-xl border px-3 py-2 text-sm outline-none focus:border-current' style={inputStyle} value={String(value ?? '')} maxLength={field.max} onChange={(event) => change(event.target.value)} />
            : <input id={fieldId} className='h-9 w-full min-w-0 rounded-xl border px-3 text-sm outline-none focus:border-current' style={inputStyle} type={field.type} value={String(value ?? '')} min={field.min} max={field.max} step={field.step} maxLength={field.type === 'text' ? field.max : undefined} onChange={(event) => change(field.type === 'number' ? Number(event.target.value) : event.target.value)} />}
        </div>;
      })}
    </div>
  );
}
