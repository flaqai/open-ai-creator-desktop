// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { useEffect, useId, useMemo, useState } from 'react';
import { AudioLines, Cpu } from 'lucide-react';

import { getModelIconConfig } from '@/lib/utils/modelIcons';
import { ModelIconImage } from '@/components/model/ModelIconImage';

import i18n from '../i18n';
import { cn } from '../lib/utils';
import {
  resolveSourceModelForInputs,
  sourceModelFamilyKey,
  sourceModelFamilyLabel,
  sourceModelPresentationKey,
  type SourceModelInputs,
} from '../runtime/generation/source-model-data';
import { useInfiniteCanvasTranslation } from '../runtime/i18n/infinite-canvas-translation';
import { useOptionalInfiniteCanvasIntegrations } from '../runtime/integrations/infinite-canvas-integrations-context';
import {
  modelOptionLabel,
  modelOptionName,
  selectableModelsByCapability,
  type AiConfig,
  type ModelCapability,
} from '../stores/use-config-store';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';

const INTEGRATION_FORM_MODEL_SELECT_TRIGGER_CLASS_NAME =
  'my-0.5 flex h-[33px] min-w-0 max-w-full items-center gap-1.5 rounded-full border border-light-gray-2 bg-light-gray-1 px-3 text-text-color transition-colors hover:bg-light-gray-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-main-color';

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
  inputCounts?: SourceModelInputs;
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
  inputCounts,
}: ModelPickerProps) {
  const { t } = useInfiniteCanvasTranslation();
  const pickerId = useId();
  const [open, setOpen] = useState(false);
  const options = useMemo(() => {
    const allowed = allowedModels ? new Set(allowedModels) : null;
    const models = Array.from(
      new Set(
        [
          ...(capability ? [] : [value]),
          ...selectableModelsByCapability(config, capability).filter(
            (model) => !config.modelAdapter || allowed === null || allowed.has(modelOptionName(model)),
          ),
        ].filter(Boolean),
      ),
    );
    if (config.modelAdapter || (capability !== 'image' && capability !== 'video'))
      return models.map((model) => ({
        value: model,
        disabled: Boolean(config.modelAdapter?.models.find((item) => item.name === modelOptionName(model))?.disabled),
      }));
    const grouped = new Map<string, { value: string; disabled: boolean }>();
    for (const model of [value, ...models].filter(Boolean) as string[]) {
      const key = sourceModelFamilyKey(model);
      if (grouped.has(key)) continue;
      const resolved = resolveSourceModelForInputs(model, capability, inputCounts ?? { imageCount: 0 });
      grouped.set(key, { value: model, disabled: resolved === null });
    }
    return [...grouped.values()];
  }, [allowedModels, capability, config, inputCounts, value]);
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
      onValueChange={(model) => {
        if (!config.modelAdapter && (capability === 'image' || capability === 'video')) {
          const resolved = resolveSourceModelForInputs(model, capability, inputCounts ?? { imageCount: 0 });
          if (resolved)
            onChange(model.includes('::') ? `${model.slice(0, model.indexOf('::') + 2)}${resolved.id}` : resolved.id);
          return;
        }
        onChange(model);
      }}
    >
      <SelectTrigger
        className={cn(
          appearance === 'integration-form'
            ? cn(
                INFINITE_CANVAS_MODEL_SELECT_TRIGGER_CLASS_NAME,
                'canvas-composer-model-picker !border-canvas-border !bg-canvas-surface !text-canvas-text hover:!bg-canvas-surface-hover data-placeholder:text-canvas-muted [&_.canvas-select-chevron]:text-canvas-muted w-fit justify-start text-sm font-normal [&_.canvas-select-chevron]:size-3.5',
              )
            : 'canvas-composer-model-picker border-canvas-border bg-canvas-panel text-canvas-text hover:bg-canvas-surface focus-visible:border-canvas-accent focus-visible:ring-canvas-accent/20 data-placeholder:text-canvas-muted h-8 w-fit max-w-full gap-2 rounded-full border px-3 text-sm font-normal shadow-sm transition-colors',
          fullWidth ? 'w-full min-w-0 justify-start' : 'min-w-[9rem] justify-start',
          'data-[state=open]:border-canvas-accent data-[state=open]:ring-canvas-accent/20 [&_.canvas-select-chevron]:text-canvas-muted data-[state=open]:ring-2',
          className,
        )}
        onMouseDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        title={
          current
            ? config.modelAdapter
              ? modelOptionLabel(config, current)
              : sourceModelFamilyLabel(current)
            : pickerPlaceholder
        }
      >
        <ModelIcon
          config={config}
          capability={capability}
          model={current}
          size={appearance === 'integration-form' ? 'image-form' : 'canvas'}
        />
        <span className='canvas-model-picker-text min-w-0 flex-1 truncate text-left'>
          {current
            ? config.modelAdapter
              ? modelOptionLabel(config, current)
              : sourceModelFamilyLabel(current)
            : pickerPlaceholder}
        </span>
      </SelectTrigger>
      <SelectContent
        data-canvas-no-zoom
        className='border-canvas-border bg-canvas-panel text-canvas-text ring-canvas-border [&_[data-slot=select-scroll-down-button]]:bg-canvas-panel [&_[data-slot=select-scroll-up-button]]:bg-canvas-panel z-[1200] w-80 max-w-[calc(100vw-24px)] rounded-xl border p-1 shadow-xl'
        position='popper'
        align='start'
        side='bottom'
        sideOffset={6}
        onPointerDown={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {options.length ? (
          options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              textValue={
                config.modelAdapter ? modelOptionLabel(config, option.value) : sourceModelFamilyLabel(option.value)
              }
              className='focus:bg-canvas-surface focus:text-canvas-text data-[state=checked]:text-canvas-accent'
            >
              <ModelLabel
                capability={capability}
                config={config}
                model={option.value}
                unavailable={option.disabled && !config.modelAdapter}
              />
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
  const label =
    capability === '3d'
      ? config.modelAdapter?.threeD?.label
      : capability === 'music'
        ? config.modelAdapter?.music?.label
        : capability
          ? i18n.t(`settingsPanels.model.capabilities.${capability}`)
          : '';
  if (capability && config.models.length) return i18n.t('settingsPanels.model.assign', { capability: label });
  return config.models.length
    ? i18n.t('settingsPanels.model.noMatch', { capability: label })
    : i18n.t('settingsPanels.model.addFirst');
}

function ModelLabel({
  capability,
  config,
  model,
  unavailable,
}: {
  capability?: ModelCapability;
  config: AiConfig;
  model: string;
  unavailable?: boolean;
}) {
  return (
    <span className='flex min-w-0 items-center gap-2'>
      <ModelIcon config={config} capability={capability} model={model} />
      <span className='truncate'>
        {config.modelAdapter ? modelOptionLabel(config, model) : sourceModelFamilyLabel(model)}
      </span>
      {unavailable ? (
        <span className='text-canvas-muted shrink-0 text-xs'>{i18n.t('modelAdapter.invalidInputs')}</span>
      ) : null}
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
  const presentationKey = sourceModelPresentationKey(model, config.modelAdapter);
  const customIcon = integrations?.renderModelIcon?.({ model, capability, presentationKey });
  const modelIcon = getModelIconConfig(presentationKey);
  const sizeClassName = size === 'image-form' ? 'size-5 [&_svg]:size-5' : 'size-4 [&_svg]:size-4';
  if (customIcon != null)
    return (
      <span className={cn('flex shrink-0 items-center justify-center overflow-hidden', sizeClassName)}>
        {customIcon}
      </span>
    );
  if (capability === 'image' || capability === 'video' || capability === '3d' || capability === 'music') {
    return (
      <span className={cn('flex shrink-0 items-center justify-center overflow-hidden', sizeClassName)}>
        {modelIcon.src ? <ModelIconImage icon={modelIcon} /> : <Cpu className='size-full' />}
      </span>
    );
  }
  if (capability === 'audio')
    return <AudioLines className={cn(size === 'image-form' ? 'size-5' : 'size-4', 'shrink-0 opacity-80')} />;
  return <Cpu className={cn(size === 'image-form' ? 'size-5' : 'size-4', 'shrink-0 opacity-70')} />;
}
