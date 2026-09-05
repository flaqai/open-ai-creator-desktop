'use client';

import { Clock, MonitorPlay, Square } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import FormSelect from '@/components/form/FormSelect';
import Spinning from '@/components/Spinning';

interface BottomActionAreaProps {
  durationOptions?: { name: string; value: string }[];
  ratioOptions?: { name: string; value: string }[];
  resolutionOptions?: { name: string; value: string }[];
  showDuration?: boolean;
  showRatio?: boolean;
  showResolution?: boolean;
  isSubmitting?: boolean;
  submitButtonText?: string;
  ratioFieldName?: string;
  resolutionFieldName?: string;
}

export default function BottomActionArea({
  durationOptions,
  ratioOptions,
  resolutionOptions,
  showDuration = false,
  showRatio = false,
  showResolution = false,
  isSubmitting = false,
  submitButtonText,
  ratioFieldName = 'ratio',
  resolutionFieldName = 'resolution',
}: BottomActionAreaProps) {
  const t = useTranslations('components.video-form');
  const form = useFormContext();

  // Add icons to options
  const durationOptionsWithIcon = durationOptions?.map((opt) => ({
    ...opt,
    leftIcon: <Clock className='size-4 text-[#777777]' />,
  }));

  const ratioOptionsWithIcon = ratioOptions?.map((opt) => ({
    ...opt,
    leftIcon: <Square className='size-4 text-[#777777]' />,
  }));

  const resolutionOptionsWithIcon = resolutionOptions?.map((opt) => ({
    ...opt,
    leftIcon: <MonitorPlay className='size-4 text-[#777777]' />,
  }));

  return (
    <div className='mt-auto flex flex-col gap-1 bg-[#1c1d20]'>
      {/* Top layer: Form options integration area */}
      <div className='flex flex-wrap items-center gap-1'>
        {/* Duration */}
        <FormField
          control={form.control}
          name='duration'
          render={({ field }) => (
            <FormItem
              className={cn(
                'flex-1 space-y-0',
                // Use CSS to hide instead of conditional rendering to avoid field unmounting and value loss
                (!showDuration || !durationOptionsWithIcon || durationOptionsWithIcon.length === 0) && 'hidden',
              )}
            >
              <FormControl>
                <FormSelect options={durationOptionsWithIcon || []} name='duration' side='top' />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Ratio */}
        <FormField
          control={form.control}
          name={ratioFieldName}
          render={({ field }) => (
            <FormItem
              className={cn(
                'flex-1 space-y-0',
                // Use CSS to hide instead of conditional rendering to avoid field unmounting and value loss
                (!showRatio || !ratioOptionsWithIcon || ratioOptionsWithIcon.length === 0) && 'hidden',
              )}
            >
              <FormControl>
                <FormSelect options={ratioOptionsWithIcon || []} name={ratioFieldName} side='top' />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Resolution */}
        <FormField
          control={form.control}
          name={resolutionFieldName}
          render={({ field }) => (
            <FormItem
              className={cn(
                'flex-1 space-y-0',
                // Use CSS to hide instead of conditional rendering to avoid field unmounting and value loss
                (!showResolution || !resolutionOptionsWithIcon || resolutionOptionsWithIcon.length === 0) && 'hidden',
              )}
            >
              <FormControl>
                <FormSelect options={resolutionOptionsWithIcon || []} name={resolutionFieldName} side='top' />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Bottom layer: Generate button */}
      <div className='flex items-center gap-1'>
        {/* Generate button */}
        <button
          type='submit'
          disabled={isSubmitting}
          className='bg-color-main flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-base font-semibold text-white uppercase hover:cursor-pointer hover:opacity-80 disabled:cursor-not-allowed'
        >
          {isSubmitting ? <Spinning className='size-4' /> : <>{submitButtonText || t('generate')}</>}
        </button>
      </div>
    </div>
  );
}
