'use client';

import { Dices, Info, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import type { VideoModel } from '@/lib/constants/video';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import SubHeading from '@/components/form/SubHeading';

import PromptField from '../input/PromptField';

interface VideoModelParameterFieldsProps {
  currentModel?: VideoModel | null;
}

function formatStyleLabel(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function ToggleField({ name, label, tip }: { name: 'enableBgm' | 'keepOriginalSound'; label: string; tip: string }) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex w-full flex-col gap-2.5 space-y-0'>
          <div className='flex items-center justify-between'>
            <div className='flex min-w-0 items-center gap-2'>
              <Label htmlFor={name} className='text-foreground/70 cursor-pointer text-sm font-normal'>
                {label}
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className='text-foreground/40 h-3.5 w-3.5 shrink-0 cursor-help' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className='max-w-[220px] text-xs'>{tip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FormControl>
              <Switch
                id={name}
                className='data-[state=checked]:border-color-main border-foreground h-[16px] w-[28px] rounded border !bg-transparent focus:ring-0'
                thumbClassName='h-3 w-3 rounded-[2px] bg-foreground data-[state=unchecked]:translate-x-[1px] data-[state=checked]:translate-x-[12px] data-[state=checked]:bg-color-main'
                checked={!!field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </div>
        </FormItem>
      )}
    />
  );
}

const GUIDANCE_SCALE_DEFAULT = 0.5;
const GUIDANCE_SCALE_MIN = 0;
const GUIDANCE_SCALE_MAX = 1;
const GUIDANCE_SCALE_STEP = 0.1;
const MAX_SEED = 2147483647;

export default function VideoModelParameterFields({ currentModel }: VideoModelParameterFieldsProps) {
  const t = useTranslations('components.video-form');
  const { control } = useFormContext();
  const options = currentModel?.options;

  const showStyle = !!options?.style?.length;
  const showBgm = !!options?.bgm;
  const showSeed = !!options?.seed;
  const showNegativePrompt = !!options?.negativePrompt;
  const showGuidanceScale = !!options?.guidanceScale;
  const showKeepOriginalSound = !!options?.keepOriginalSound;
  const shouldShow =
    showStyle || showBgm || showSeed || showNegativePrompt || showGuidanceScale || showKeepOriginalSound;

  if (!shouldShow) return null;

  return (
    <div className='flex flex-col gap-2.5'>
      <SubHeading>{t('model-parameters')}</SubHeading>

      {showBgm && <ToggleField name='enableBgm' label={t('enable-bgm')} tip={t('enable-bgm-tip')} />}

      {showKeepOriginalSound && (
        <ToggleField name='keepOriginalSound' label={t('keep-original-sound')} tip={t('keep-original-sound-tip')} />
      )}

      {showStyle && (
        <FormField
          control={control}
          name='style'
          render={({ field }) => (
            <FormItem className='space-y-1.5'>
              <Label className='text-foreground/70 text-sm font-normal'>{t('style')}</Label>
              <Select value={field.value || options?.style?.[0] || 'general'} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className='border-foreground/5 bg-card text-foreground/80 h-10 w-full rounded-xl border'>
                    <SelectValue placeholder='' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='border-border bg-card text-foreground'>
                  {options?.style?.map((style) => (
                    <SelectItem key={style} value={style}>
                      {formatStyleLabel(style)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      )}

      {showSeed && (
        <div className='flex flex-col gap-2.5'>
          <div className='flex items-center gap-2'>
            <SubHeading>{t('seed')}</SubHeading>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='text-foreground/40 h-3.5 w-3.5 cursor-help' />
                </TooltipTrigger>
                <TooltipContent>
                  <p className='max-w-[200px] text-xs'>{t('seed-hint')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <FormField
            control={control}
            name='seed'
            render={({ field }) => (
              <FormItem className='space-y-0'>
                <FormControl>
                  <div className='relative'>
                    <Dices className='text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                    <Input
                      type='text'
                      inputMode='numeric'
                      placeholder='0~2147483647'
                      value={field.value === undefined ? '' : String(field.value)}
                      className='border-foreground/5 bg-card text-muted-foreground placeholder:text-muted-foreground h-9 w-full rounded-xl pr-9 pl-10 text-sm hover:bg-[#25272a] focus-visible:ring-0'
                      onFocus={(event) => event.target.select()}
                      onChange={(event) => {
                        const raw = event.target.value.replace(/[^0-9]/g, '');
                        if (raw === '') {
                          field.onChange(undefined);
                          return;
                        }

                        const num = parseInt(raw, 10);
                        field.onChange(num > MAX_SEED ? MAX_SEED : num);
                      }}
                      onBlur={(event) => {
                        const raw = event.target.value.replace(/[^0-9]/g, '');
                        if (raw === '') {
                          field.onChange(undefined);
                        }
                      }}
                    />
                    <button
                      type='button'
                      onClick={() => field.onChange(Math.floor(Math.random() * (MAX_SEED + 1)))}
                      className='text-muted-foreground hover:text-foreground/70 absolute top-1/2 right-2.5 -translate-y-1/2 transition-colors'
                      tabIndex={-1}
                    >
                      <RefreshCw className='size-3.5' />
                    </button>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}

      {showGuidanceScale && (
        <FormField
          control={control}
          name='guidanceScale'
          render={({ field }) => {
            const currentValue = field.value ?? GUIDANCE_SCALE_DEFAULT;

            return (
              <FormItem className='space-y-0'>
                <FormControl>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-foreground/40 text-xs'>{t('guidance-scale-flexible')}</span>
                      <span className='text-foreground/70 text-xs font-medium'>{currentValue.toFixed(1)}</span>
                      <span className='text-foreground/40 text-xs'>{t('guidance-scale-strict')}</span>
                    </div>
                    <Slider
                      min={GUIDANCE_SCALE_MIN}
                      max={GUIDANCE_SCALE_MAX}
                      step={GUIDANCE_SCALE_STEP}
                      value={[currentValue]}
                      onValueChange={(value) => field.onChange(value[0])}
                      trackClassName='cursor-pointer bg-card'
                      rangeClassName='bg-color-main'
                      thumbClassName='size-3.5 cursor-pointer border-0 bg-foreground shadow-md'
                    />
                  </div>
                </FormControl>
              </FormItem>
            );
          }}
        />
      )}

      <PromptField
        show={showNegativePrompt}
        fieldName='negativePrompt'
        title={t('negative-prompt')}
        placeholder={t('negative-prompt-placeholder')}
      />
    </div>
  );
}
