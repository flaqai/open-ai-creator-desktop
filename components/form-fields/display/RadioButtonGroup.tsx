'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';

export interface RadioButtonOption {
  id: string;
  value: string;
  name: string;
  prompt?: string; // Prompt to set when selected
}

interface RadioButtonGroupProps {
  options: RadioButtonOption[];
  fieldName?: string;
  defaultValue?: string;
  label?: string;
  translationNamespace?: string;
  show?: boolean;
  onChange?: (value: string) => void;
}

export default function RadioButtonGroup({
  options,
  fieldName = 'selectedOption',
  defaultValue,
  label,
  translationNamespace = 'components.image-form',
  show = true,
  onChange,
}: RadioButtonGroupProps) {
  const { setValue, watch } = useFormContext();
  const t = useTranslations(translationNamespace);
  const selectedValue = watch(fieldName) || defaultValue;

  if (!show || !options?.length) return null;

  const handleChange = (value: string) => {
    setValue(fieldName, value);

    // Auto-update prompt (if available)
    const selectedOption = options.find((opt) => opt.value === value);
    if (selectedOption?.prompt) {
      setValue('prompt', selectedOption.prompt);
    }

    onChange?.(value);
  };

  return (
    <div className='flex w-full flex-col gap-2'>
      <div className='text-foreground/60 text-[14px] leading-[21px] font-normal capitalize'>
        {label || t('radioGroup')}
      </div>
      <div className='flex flex-col gap-2.5'>
        {options.map((option) => (
          <button
            key={option.id}
            type='button'
            onClick={() => handleChange(option.value)}
            className={cn(
              'flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-300',
              selectedValue === option.value
                ? 'border-color-main bg-color-main/10'
                : 'border-border bg-card hover:border-border',
            )}
          >
            <div
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full border-2',
                selectedValue === option.value ? 'border-color-main' : 'border-border',
              )}
            >
              {selectedValue === option.value && <div className='bg-color-main h-3 w-3 rounded-full' />}
            </div>
            <span className='text-foreground text-[14px] font-medium'>{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
