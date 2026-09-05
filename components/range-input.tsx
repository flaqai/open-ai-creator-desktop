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
    <div className='flex h-8 w-[264px] items-center gap-1 rounded border border-white/10 bg-white/5 px-2'>
      <button type='button' onClick={() => handleButtonClick(-step)}>
        <Minus className='hover:text-main size-4 text-[#C2C2C2]' />
      </button>
      <Slider
        value={[value]}
        onValueChange={onSliderChange}
        max={max}
        step={step}
        min={min}
        className='h-3.5 w-full'
        rangeClassName='bg-color-main'
        trackClassName='bg-[#171D1D] h-full'
        thumbClassName={cn('size-5 bg-[#4C4C4C]', value <= (max - min) / 2 && '-translate-x-1')}
      />
      <button type='button' onClick={() => handleButtonClick(step)}>
        <Plus className='hover:text-main size-4 text-[#C2C2C2]' />
      </button>
      <input
        type='number'
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onInputChange}
        className='hide-number-input h-7 w-12 rounded-sm bg-[#121212] text-center text-xs text-white/70'
      />
    </div>
  );
}
