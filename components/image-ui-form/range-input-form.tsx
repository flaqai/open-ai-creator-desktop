'use client';

import { useEffect, useRef } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import Box from '@/components/Box';

export default function RangeInputForm({
  name,
  min = 0,
  max = 10,
  step = 0.5,
  defaultValue,
}: {
  name: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
}) {
  const methods = useFormContext<{ [key: string]: number[] }>();
  const onceRef = useRef(true);

  useEffect(() => {
    if (defaultValue && onceRef.current) {
      methods.setValue(name, [defaultValue]);
      onceRef.current = false;
    }

    return () => {};
  }, [defaultValue, name, methods]);

  const handleButtonClick = (value: number) => {
    if (methods.getValues(name)[0] + value > max) return;
    if (methods.getValues(name)[0] + value < min) return;
    methods.setValue(name, [methods.getValues(name)[0] + value]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (Number(e.target.value) > max) return;
    if (Number(e.target.value) < min) return;
    methods.setValue(name, [Number(e.target.value)]);
  };

  return (
    <Box variant='input' className='flex w-full'>
      <FormField
        control={methods.control}
        name={name}
        render={({ field }) => (
          <FormItem key={field.name} className='flex w-full gap-3 space-y-0'>
            <FormControl className='w-full'>
              <div className='flex w-full items-center gap-1'>
                <button type='button' onClick={() => handleButtonClick(-step)}>
                  <Minus className='hover:text-main size-4 text-[#C2C2C2]' />
                </button>
                <Slider
                  value={[field.value?.[0]]}
                  onValueChange={field.onChange}
                  max={max}
                  step={step}
                  min={min}
                  className='h-3.5 w-full'
                  rangeClassName='bg-color-main'
                  trackClassName='bg-[#171D1D] h-full'
                  thumbClassName={cn('size-5 bg-[#4C4C4C]', field.value?.[0] <= (max - min) / 2 && '-translate-x-1')}
                />
                <button type='button' onClick={() => handleButtonClick(step)}>
                  <Plus className='hover:text-main size-4 text-[#C2C2C2]' />
                </button>
                <input
                  type='number'
                  name={name}
                  min={min}
                  max={max}
                  step={step}
                  value={field?.value?.[0]}
                  onChange={handleInputChange}
                  className='hide-number-input h-7 w-12 rounded-sm bg-[#121212] text-center text-xs text-white/70'
                />
              </div>
            </FormControl>
          </FormItem>
        )}
      />
    </Box>
  );
}
