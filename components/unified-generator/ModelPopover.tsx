'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AudioLines,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Dices,
  ImageIcon,
  Library,
  ListFilter,
  Scaling,
  SquareIcon,
  Tags,
  Type,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { getModelIconConfig } from '@/lib/utils/modelIcons';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

type GeneratorModel = {
  model: string;
  modelVersion?: string;
  name: string;
  provider: string;
  generationType?: string;
  options?: {
    ratio?: Array<{ value: string }> | null;
    resolution?: Array<{ value: string }> | string[] | string;
    duration?: number;
    durationRange?: { min: number; max: number };
    imageInput?: { isSupported: boolean; max?: number };
    startFrame?: { isSupported: boolean };
    endFrame?: { isSupported: boolean };
    multiImage?: { isSupported?: boolean; maxImages: number };
    sound?: boolean;
    seed?: boolean | { min: number; max: number };
  };
};

type ModelTypeFilter = 'all' | 'text' | 'image' | 'reference';

function getResolutionValues(model: GeneratorModel) {
  const resolution = model.options?.resolution;
  if (!resolution) return [];
  if (typeof resolution === 'string') return [resolution];
  return resolution.map((item) => (typeof item === 'string' ? item : item.value));
}

function formatResolutionRange(model: GeneratorModel) {
  const values = getResolutionValues(model).map((value) => value.toUpperCase());
  if (!values.length) return null;
  const normalized = [...new Set(values)]
    .map((value) => ({ raw: value, order: parseInt(value.replace(/\D/g, ''), 10) }))
    .filter((item) => !Number.isNaN(item.order))
    .sort((a, b) => a.order - b.order);
  if (!normalized.length) return values[0] || null;
  if (normalized.length === 1) return normalized[0].raw;
  return `${normalized[0].raw}-${normalized[normalized.length - 1].raw}`;
}

function getModelTags(
  model: GeneratorModel,
  labels: {
    ratio: string;
    image: string;
    endFrame: string;
    sound: string;
    seed: string;
    duration: (value: string) => string;
  },
) {
  const tags: Array<{ icon: ReactNode; label: string }> = [];
  if (model.options?.ratio?.length) tags.push({ icon: <SquareIcon className='size-3.5' />, label: labels.ratio });
  const duration = model.options?.durationRange
    ? `${model.options.durationRange.min}-${model.options.durationRange.max}s`
    : model.options?.duration
      ? `${model.options.duration}s`
      : '';
  if (duration) tags.push({ icon: <Clock3 className='size-3.5' />, label: labels.duration(duration) });
  const resolution = formatResolutionRange(model);
  if (resolution) tags.push({ icon: <Scaling className='size-3.5' />, label: resolution });
  if (
    model.options?.imageInput?.isSupported ||
    model.options?.startFrame?.isSupported ||
    model.options?.multiImage?.isSupported
  ) {
    tags.push({ icon: <ImageIcon className='size-3.5' />, label: labels.image });
  }
  if (model.options?.endFrame?.isSupported)
    tags.push({ icon: <ImageIcon className='size-3.5' />, label: labels.endFrame });
  if (model.options?.sound) tags.push({ icon: <AudioLines className='size-3.5' />, label: labels.sound });
  if (model.options?.seed) tags.push({ icon: <Dices className='size-3.5' />, label: labels.seed });
  return tags;
}

function getTypeFilter(model: GeneratorModel): Exclude<ModelTypeFilter, 'all'> {
  if (model.generationType === 'reference-to-video') return 'reference';
  if (model.generationType?.startsWith('text-to-')) return 'text';
  return model.options?.imageInput?.isSupported || model.options?.startFrame?.isSupported ? 'image' : 'text';
}

function TypeFilterIcon({ type }: { type: ModelTypeFilter }) {
  if (type === 'text') return <Type className='size-4' />;
  if (type === 'image') return <ImageIcon className='size-4' />;
  if (type === 'reference') return <Library className='size-4' />;
  return <Tags className='size-4' />;
}

function ModelIcon({ value, name }: { value: string; name: string }) {
  const icon = getModelIconConfig(value);
  return (
    <span className='flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md'>
      {icon.src ? (
        <img
          src={icon.src}
          alt={name}
          className={cn(
            'overflow-hidden rounded-md object-contain',
            icon.background === 'light' ? 'size-[22px] bg-white' : 'size-full',
          )}
        />
      ) : (
        <span className='size-6 shrink-0' />
      )}
    </span>
  );
}

export default function ModelPopover({
  models,
  selectedModel,
  label,
  onChange,
}: {
  models: GeneratorModel[];
  selectedModel: GeneratorModel;
  label: string;
  onChange: (model: string) => void;
}) {
  const t = useTranslations('UnifiedGenerator.model-select');
  const [open, setOpen] = useState(false);
  const [providerOpen, setProviderOpen] = useState(false);
  const [providerFilter, setProviderFilter] = useState('all');
  const [typeOpen, setTypeOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ModelTypeFilter>('all');
  const modelListRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const providers = useMemo(() => Array.from(new Set(models.map((model) => model.provider))), [models]);
  const typeOptions = useMemo(() => Array.from(new Set(models.map(getTypeFilter))), [models]);
  const visibleModels = useMemo(() => {
    const filtered = models.filter(
      (model) =>
        (providerFilter === 'all' || model.provider === providerFilter) &&
        (typeFilter === 'all' || getTypeFilter(model) === typeFilter),
    );
    const current = filtered.find((model) => model.model === selectedModel.model);
    const sameProvider = filtered.filter(
      (model) => model.provider === selectedModel.provider && model.model !== selectedModel.model,
    );
    const otherProviders = filtered.filter((model) => model.provider !== selectedModel.provider);
    return [...(current ? [current] : []), ...sameProvider, ...otherProviders];
  }, [models, providerFilter, selectedModel, typeFilter]);

  const updateScrollState = useCallback(() => {
    const list = modelListRef.current;
    if (!list) return;
    const maxScrollTop = list.scrollHeight - list.clientHeight;
    setCanScrollUp(list.scrollTop > 1);
    setCanScrollDown(list.scrollTop < maxScrollTop - 1);
  }, []);

  const scrollList = (direction: 'up' | 'down') => {
    modelListRef.current?.scrollBy({ top: direction === 'up' ? -160 : 160, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!open) return;
    const frameId = requestAnimationFrame(updateScrollState);
    return () => cancelAnimationFrame(frameId);
  }, [open, providerFilter, typeFilter, updateScrollState, visibleModels.length]);

  const typeLabels: Record<ModelTypeFilter, string> = {
    all: t('all-types'),
    text: t('text-type'),
    image: t('image-type'),
    reference: t('reference-type'),
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          aria-label={label}
          className='!bg-color-c3 hover:!bg-color-c4 flex h-9 w-full min-w-0 flex-1 justify-between rounded-lg !border-0 px-3 py-0 text-sm text-[#b8b8b8] !shadow-none hover:text-[#b8b8b8] sm:max-w-[360px] sm:min-w-[280px]'
        >
          <span className='flex min-w-0 items-center gap-2.5'>
            <ModelIcon value={selectedModel.modelVersion || selectedModel.model} name={selectedModel.name} />
            <span className='min-w-0 truncate text-white'>{selectedModel.model}</span>
          </span>
          <ChevronDown className='size-4 shrink-0 text-white/50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        onInteractOutside={(event) => {
          const target = event.target as HTMLElement;
          if (providerOpen || typeOpen || target.closest('[data-slot="select-content"]')) event.preventDefault();
        }}
        className='border-color-b1 bg-color-bg w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-xl p-0 text-white'
      >
        <div className='border-color-b1 border-b p-2'>
          <div className='flex items-center gap-2'>
            <Select
              open={providerOpen}
              onOpenChange={setProviderOpen}
              value={providerFilter}
              onValueChange={setProviderFilter}
            >
              <SelectTrigger
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
                className='border-color-b1 bg-color-1 text-color-t2 hover:bg-color-2 h-9 min-w-0 flex-1 rounded-lg border px-3 py-0 text-sm shadow-none hover:cursor-pointer'
              >
                <span className='flex min-w-0 items-center gap-2'>
                  {providerFilter === 'all' ? (
                    <span className='flex size-6 shrink-0 items-center justify-center'>
                      <ListFilter className='size-4' />
                    </span>
                  ) : (
                    <ModelIcon value={providerFilter} name='' />
                  )}
                  <span className='truncate'>{providerFilter === 'all' ? t('all-providers') : providerFilter}</span>
                </span>
              </SelectTrigger>
              <SelectContent className='border-color-b1 bg-color-1 flex rounded-xl'>
                <SelectItem value='all' className='text-color-t2 focus:bg-color-3 cursor-pointer rounded-md'>
                  <span className='flex items-center gap-1.5'>
                    <span className='flex size-6 items-center justify-center'>
                      <ListFilter className='size-4' />
                    </span>
                    {t('all-providers')}
                  </span>
                </SelectItem>
                {providers.map((provider) => (
                  <SelectItem
                    key={provider}
                    value={provider}
                    className='text-color-t2 focus:bg-color-3 cursor-pointer rounded-md'
                  >
                    <span className='flex items-center gap-1.5'>
                      <ModelIcon value={provider} name='' />
                      <span className='truncate'>{provider}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              open={typeOpen}
              onOpenChange={setTypeOpen}
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as ModelTypeFilter)}
            >
              <SelectTrigger
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
                className='border-color-b1 bg-color-1 text-color-t2 hover:bg-color-2 h-9 w-[112px] rounded-lg border px-3 py-0 text-sm shadow-none hover:cursor-pointer'
              >
                <span className='flex min-w-0 items-center gap-2'>
                  <TypeFilterIcon type={typeFilter} />
                  <span className='truncate'>{typeLabels[typeFilter]}</span>
                </span>
              </SelectTrigger>
              <SelectContent className='border-color-b1 bg-color-1 flex rounded-xl'>
                {(['all', ...typeOptions] as ModelTypeFilter[]).map((type) => (
                  <SelectItem
                    key={type}
                    value={type}
                    className='text-color-t2 focus:bg-color-3 cursor-pointer rounded-md'
                  >
                    <span className='flex items-center gap-1.5'>
                      <span className='flex size-6 items-center justify-center'>
                        <TypeFilterIcon type={type} />
                      </span>
                      {typeLabels[type]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='relative'>
          {canScrollUp ? (
            <button
              type='button'
              aria-label={t('scroll-up')}
              onClick={() => scrollList('up')}
              className='bg-color-bg absolute inset-x-0 top-0 z-10 flex h-5 items-center justify-center text-white/90'
            >
              <ChevronUp className='size-4' />
            </button>
          ) : null}
          <div ref={modelListRef} onScroll={updateScrollState} className='no-scrollbar max-h-[360px] overflow-y-auto'>
            {visibleModels.map((model) => {
              const active = model.model === selectedModel.model;
              const tags = getModelTags(model, {
                ratio: t('ratio'),
                image: t('image'),
                endFrame: t('end-frame'),
                sound: t('sound'),
                seed: t('seed'),
                duration: (value) => t('duration', { value }),
              });
              return (
                <button
                  key={model.model}
                  type='button'
                  onClick={() => {
                    onChange(model.model);
                    setOpen(false);
                  }}
                  className={cn(
                    'border-color-b1 flex w-full flex-col gap-2 border-b p-2 text-left last:border-b-0 hover:bg-white/5',
                    active && 'bg-color-main/10 hover:bg-color-main/10',
                  )}
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex min-w-0 flex-1 items-center gap-2.5'>
                      <ModelIcon value={model.modelVersion || model.model} name={model.name} />
                      <span className='min-w-0 truncate text-base font-medium text-white'>{model.model}</span>
                    </div>
                    <span
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-full border',
                        active ? 'border-color-main bg-color-main' : 'border-white/25',
                      )}
                    >
                      {active ? <Check className='size-3 text-white' /> : null}
                    </span>
                  </div>
                  {tags.length ? (
                    <div className='flex flex-wrap gap-2'>
                      {tags.map((tag) => (
                        <span
                          key={tag.label}
                          className='border-color-b1 bg-color-1 flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-white/70'
                        >
                          {tag.icon}
                          <span>{tag.label}</span>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
          {canScrollDown ? (
            <button
              type='button'
              aria-label={t('scroll-down')}
              onClick={() => scrollList('down')}
              className='bg-color-bg absolute inset-x-0 bottom-0 z-10 flex h-5 items-center justify-center text-white/90'
            >
              <ChevronDown className='size-4' />
            </button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
