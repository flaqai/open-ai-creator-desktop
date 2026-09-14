'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';

export interface OutputTypeOption {
  id: string;
  value: string;
  name: string;
}

interface OutputTypeFieldProps {
  options: OutputTypeOption[];
  show?: boolean;
  label?: string;
  onOutputTypeChange?: (value: string) => void;
}

export default function OutputTypeField({ options, show = true, label, onOutputTypeChange }: OutputTypeFieldProps) {
  const { setValue, watch } = useFormContext();
  const t = useTranslations('components.image-form');

  const selectedType = watch('outputType');

  if (!show || !options || options.length === 0) return null;

  const handleTypeChange = (value: string) => {
    setValue('outputType', value);
    if (onOutputTypeChange) {
      onOutputTypeChange(value);
    }
  };

  return (
    <div className='flex w-full flex-col gap-2'>
      <div className='text-foreground/60 text-[14px] leading-[21px] font-normal capitalize'>
        {label || t('outputType')}
      </div>
      <div className='flex flex-col gap-2.5'>
        {options.map((option) => (
          <button
            key={option.id}
            type='button'
            onClick={() => handleTypeChange(option.value)}
            className={cn(
              'flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-300 hover:cursor-pointer',
              selectedType === option.value
                ? 'border-color-main bg-color-main/10'
                : 'hover:border-color-main/80 border-foreground/10 bg-card',
            )}
          >
            <div
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full border-2',
                selectedType === option.value ? 'border-color-main' : 'border-foreground/20',
              )}
            >
              {selectedType === option.value && <div className='bg-color-main h-3 w-3 rounded-full' />}
            </div>
            <span className='text-foreground text-[14px] font-medium'>{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
