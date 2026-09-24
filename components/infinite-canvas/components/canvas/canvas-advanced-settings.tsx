import { useId } from 'react';
import { SlidersHorizontal } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { InfiniteCanvasAdvancedParameters } from '../../infinite-canvas-model-adapter';
import { canvasThemes } from '../../lib/canvas-theme';
import type { AiConfig } from '../../stores/use-config-store';
import { useThemeStore } from '../../stores/use-theme-store';
import type { CanvasNodeMetadata } from '../../types/canvas';

export function CanvasAdvancedSettings({
  parameters,
  config,
  onChange,
}: {
  readonly parameters: InfiniteCanvasAdvancedParameters;
  readonly config: AiConfig;
  readonly onChange: (patch: Partial<CanvasNodeMetadata>) => void;
}) {
  const id = useId();
  const theme = canvasThemes[useThemeStore((state) => state.theme)];
  const fieldStyle = { background: theme.node.fill, borderColor: theme.node.stroke, color: theme.node.text };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type='button'
          className='inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border border-canvas-border bg-canvas-panel px-2 text-[11px] text-canvas-text'
          style={fieldStyle}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <SlidersHorizontal className='size-3.5' />
          {parameters.label}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side='top'
        className='custom-scrollbar z-[1200] max-h-[60dvh] w-72 overflow-y-auto border-canvas-border bg-canvas-panel text-canvas-text'
        style={fieldStyle}
        onMouseDown={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <div className='space-y-3'>
          {parameters.seed ? (
            <div className='space-y-1.5'>
              <label htmlFor={`${id}-seed`} className='text-xs'>{parameters.seed.label}</label>
              <Input
                id={`${id}-seed`}
                type='number'
                min={parameters.seed.min}
                max={parameters.seed.max}
                step={1}
                style={fieldStyle}
                value={config.seed === -1 ? '' : (config.seed ?? '')}
                onChange={(event) => onChange({ seed: event.target.value === '' ? -1 : Number(event.target.value) })}
              />
            </div>
          ) : null}
          {parameters.negativePrompt ? (
            <div className='space-y-1.5'>
              <label htmlFor={`${id}-negative`} className='text-xs'>{parameters.negativePrompt.label}</label>
              <Textarea
                id={`${id}-negative`}
                className='custom-scrollbar max-h-40 min-h-20 resize-y'
                style={fieldStyle}
                value={config.negativePrompt ?? ''}
                onChange={(event) => onChange({ negativePrompt: event.target.value })}
              />
            </div>
          ) : null}
          {parameters.isTranslate ? (
            <div className='flex items-center justify-between gap-3'>
              <label htmlFor={`${id}-translate`} className='text-xs'>{parameters.isTranslate.label}</label>
              <Switch
                id={`${id}-translate`}
                checked={config.isTranslate ?? false}
                onCheckedChange={(isTranslate) => onChange({ isTranslate })}
              />
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
