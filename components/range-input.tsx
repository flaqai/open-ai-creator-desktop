'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

export default function RangeInput({
  min = 0,
  max = 10,
  step = 1,
  defaultValue,
  onChange,
}: {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  onChange?: (val: number) => void;
}) {
  const [value, setValue] = useState(defaultValue || 0);

  const handleButtonClick = (val: number) => {
    setValue((prev) => prev + val);
  };

  const onSliderChange = (val: number[]) => {
    setValue(val[0]);
    if (onChange) {
      onChange(val[0]);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (Number(e.target.value) > max) return;
    if (Number(e.target.value) < min) return;
    setValue(Number(e.target.value));
    if (onChange) {
      onChange(Number(e.target.value));
    }
  };

  return (
    <div className='border-foreground/10 bg-foreground/5 flex h-8 w-[264px] items-center gap-1 rounded border px-2'>
      <button type='button' onClick={() => handleButtonClick(-step)}>
        <Minus className='hover:text-main text-muted-foreground size-4' />
      </button>
      <Slider
        value={[value]}
        onValueChange={onSliderChange}
        max={max}
        step={step}
        min={min}
        className='h-3.5 w-full'
        rangeClassName='bg-color-main'
        trackClassName='bg-card h-full'
        thumbClassName={cn('size-5 bg-card', value <= (max - min) / 2 && '-translate-x-1')}
      />
      <button type='button' onClick={() => handleButtonClick(step)}>
        <Plus className='hover:text-main text-muted-foreground size-4' />
      </button>
      <input
        type='number'
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onInputChange}
        className='hide-number-input bg-card text-foreground/70 h-7 w-12 rounded-sm text-center text-xs'
      />
    </div>
  );
}
