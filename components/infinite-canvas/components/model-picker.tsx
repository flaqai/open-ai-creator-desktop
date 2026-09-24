// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { useEffect, useId, useMemo, useState } from 'react';
import { AudioLines, Cpu } from 'lucide-react';

const INTEGRATION_FORM_MODEL_SELECT_TRIGGER_CLASS_NAME = 'my-0.5 flex h-[33px] min-w-0 max-w-full items-center gap-1.5 rounded-full border border-light-gray-2 bg-light-gray-1 px-3 text-text-color transition-colors hover:bg-light-gray-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-main-color';
import { getModelIcon } from '@/lib/utils/modelIcons';
import i18n from '../i18n';
import { cn } from '../lib/utils';
import { sourceModelPresentationKey } from '../runtime/generation/source-model-data';
import { useOptionalInfiniteCanvasIntegrations } from '../runtime/integrations/infinite-canvas-integrations-context';
import { useInfiniteCanvasTranslation } from '../runtime/i18n/infinite-canvas-translation';
import {
  modelOptionLabel,
  modelOptionName,
  selectableModelsByCapability,
  type AiConfig,
  type ModelCapability,
} from '../stores/use-config-store';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';

const INFINITE_CANVAS_MODEL_SELECT_TRIGGER_CLASS_NAME = `${INTEGRATION_FORM_MODEL_SELECT_TRIGGER_CLASS_NAME.split(' ')
  .filter((className) => !/^focus-visible:ring-(?!1$)/.test(className))
  .join(' ')} focus-visible:ring-canvas-accent`;

type ModelPickerProps = {
  config: AiConfig;
  value?: string;
  onChange: (model: string) => void;
  capability?: ModelCapability;
  className?: string;
  fullWidth?: boolean;
  appearance?: 'canvas' | 'integration-form';
  allowedModels?: readonly string[];
  placeholder?: string;
  onMissingConfig?: () => void;
};

export function ModelPicker({
  config,
  value,
  onChange,
  capability,
  className,
  fullWidth = false,
  appearance = 'canvas',
  allowedModels,
  placeholder,
  onMissingConfig,
}: ModelPickerProps) {
  const { t } = useInfiniteCanvasTranslation();
  const pickerId = useId();
  const [open, setOpen] = useState(false);
  const options = useMemo(
    () => {
      const allowed = allowedModels ? new Set(allowedModels) : null;
      return Array.from(
        new Set(
          [
            ...(capability ? [] : [value]),
            ...selectableModelsByCapability(config, capability).filter(
              (model) => allowed === null || allowed.has(modelOptionName(model)),
            ),
          ].filter(Boolean),
        ),
      );
    },
    [allowedModels, capability, config, value],
  );
  const current = value || '';
  const pickerPlaceholder = placeholder || t('settingsPanels.model.select');

  useEffect(() => {
    const closeOtherPicker = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== pickerId) setOpen(false);
    };
    window.addEventListener('model-picker-open', closeOtherPicker);
    return () => window.removeEventListener('model-picker-open', closeOtherPicker);
  }, [pickerId]);

  return (
    <Select
      open={open}
      value={current}
      onOpenChange={(nextOpen) => {
        if (nextOpen && !options.length) onMissingConfig?.();
        if (nextOpen) window.dispatchEvent(new CustomEvent('model-picker-open', { detail: pickerId }));
        setOpen(nextOpen);
      }}
      onValueChange={onChange}
    >
      <SelectTrigger
        className={cn(
          appearance === 'integration-form'
            ? cn(
                INFINITE_CANVAS_MODEL_SELECT_TRIGGER_CLASS_NAME,
                'canvas-composer-model-picker w-fit justify-start !border-canvas-border !bg-canvas-surface text-sm font-normal !text-canvas-text hover:!bg-canvas-surface-hover data-placeholder:text-canvas-muted [&_.canvas-select-chevron]:size-3.5 [&_.canvas-select-chevron]:text-canvas-muted',
              )
            : 'canvas-composer-model-picker h-8 w-fit max-w-full gap-2 rounded-full border border-canvas-border bg-canvas-panel px-3 text-sm font-normal text-canvas-text shadow-sm transition-colors hover:bg-canvas-surface focus-visible:border-canvas-accent focus-visible:ring-canvas-accent/20 data-placeholder:text-canvas-muted',
          fullWidth ? 'w-full min-w-0 justify-start' : 'min-w-[9rem] justify-start',
          'data-[state=open]:border-canvas-accent data-[state=open]:ring-2 data-[state=open]:ring-canvas-accent/20 [&_.canvas-select-chevron]:text-canvas-muted',
          className,
        )}
        onMouseDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        title={current ? modelOptionLabel(config, current) : pickerPlaceholder}
      >
        <ModelIcon config={config} capability={capability} model={current} size={appearance === 'integration-form' ? 'image-form' : 'canvas'} />
        <span className='canvas-model-picker-text min-w-0 flex-1 truncate text-left'>
          {current ? modelOptionLabel(config, current) : pickerPlaceholder}
        </span>
      </SelectTrigger>
      <SelectContent
        data-canvas-no-zoom
        className='z-[1200] w-80 max-w-[calc(100vw-24px)] rounded-xl border border-canvas-border bg-canvas-panel p-1 text-canvas-text shadow-xl ring-canvas-border [&_[data-slot=select-scroll-down-button]]:bg-canvas-panel [&_[data-slot=select-scroll-up-button]]:bg-canvas-panel'
        position='popper'
        align='start'
        side='bottom'
        sideOffset={6}
        onPointerDown={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {options.length ? (
          options.map((model) => (
            <SelectItem
              key={model}
              value={model}
              disabled={config.modelAdapter?.models.find((item) => item.name === modelOptionName(model))?.disabled}
              textValue={modelOptionLabel(config, model)}
              className='focus:bg-canvas-surface focus:text-canvas-text data-[state=checked]:text-canvas-accent'
            >
              <ModelLabel capability={capability} config={config} model={model} />
            </SelectItem>
          ))
        ) : (
          <SelectItem value='__empty__' disabled>
            {emptyModelLabel(config, capability)}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}

function emptyModelLabel(config: AiConfig, capability?: ModelCapability) {
  const label = capability === '3d' ? config.modelAdapter?.threeD?.label : capability === 'music' ? config.modelAdapter?.music?.label : capability ? i18n.t(`settingsPanels.model.capabilities.${capability}`) : '';
  if (capability && config.models.length) return i18n.t('settingsPanels.model.assign', { capability: label });
  return config.models.length
    ? i18n.t('settingsPanels.model.noMatch', { capability: label })
    : i18n.t('settingsPanels.model.addFirst');
}

function ModelLabel({
  capability,
  config,
  model,
}: {
  capability?: ModelCapability;
  config: AiConfig;
  model: string;
}) {
  return (
    <span className='flex min-w-0 items-center gap-2'>
      <ModelIcon config={config} capability={capability} model={model} />
      <span className='truncate'>{modelOptionLabel(config, model)}</span>
    </span>
  );
}

function ModelIcon({
  config,
  capability,
  model,
  size = 'canvas',
}: {
  capability?: ModelCapability;
  model: string;
  size?: 'canvas' | 'image-form';
  config: AiConfig;
}) {
  const integrations = useOptionalInfiniteCanvasIntegrations();
  const customIcon = integrations?.renderModelIcon?.({ model, capability, presentationKey: sourceModelPresentationKey(model, config.modelAdapter) });
  const sizeClassName = size === 'image-form' ? 'size-5 [&_svg]:size-5' : 'size-4 [&_svg]:size-4';
  if (customIcon != null) return <span className={cn('flex shrink-0 items-center justify-center overflow-hidden', sizeClassName)}>{customIcon}</span>;
  if (capability === 'image' || capability === 'video' || capability === '3d' || capability === 'music') {
    return (
      <span className={cn('flex shrink-0 items-center justify-center overflow-hidden', sizeClassName)}>
        {getModelIcon(model) ? <img src={getModelIcon(model)} alt='' className='size-full object-contain' /> : <Cpu className='size-full' />}
      </span>
    );
  }
  if (capability === 'audio')
    return <AudioLines className={cn(size === 'image-form' ? 'size-5' : 'size-4', 'shrink-0 opacity-80')} />;
  return <Cpu className={cn(size === 'image-form' ? 'size-5' : 'size-4', 'shrink-0 opacity-70')} />;
}
