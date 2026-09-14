'use client';

import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AudioToggleFieldProps {
  show?: boolean;
}

/**
 * Audio enable toggle component
 * Allows users to choose whether to generate video with sound
 */
export default function AudioToggleField({ show = false }: AudioToggleFieldProps) {
  const t = useTranslations('components.video-form');
  const { control } = useFormContext();

  if (!show) return null;

  return (
    <FormField
      control={control}
      name='enableAudio'
      render={({ field }) => (
        <FormItem className='flex w-full flex-col gap-2.5 space-y-0'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Label htmlFor='enableAudio' className='text-foreground/70 cursor-pointer text-sm font-normal'>
                {t('enable-audio')}
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className='text-foreground/40 h-3.5 w-3.5 cursor-help' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className='max-w-[200px] text-xs'>{t('enable-audio-tip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FormControl>
              <Switch
                id='enableAudio'
                className='data-[state=checked]:border-color-main border-foreground h-[16px] w-[28px] rounded border !bg-transparent focus:ring-0'
                thumbClassName='h-3 w-3 rounded-[2px] bg-foreground data-[state=unchecked]:translate-x-[1px] data-[state=checked]:translate-x-[12px] data-[state=checked]:bg-color-main'
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </div>
        </FormItem>
      )}
    />
  );
}
