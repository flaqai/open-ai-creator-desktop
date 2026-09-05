'use client';

import { useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SelectOption = {
  name: string;
  value: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
};

export default function FormSelect({
  name,
  options,
  side,
}: {
  name: string;
  options: SelectOption[];
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className='h-auto w-full space-y-0'>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className='h-9 w-full border border-[#303030] bg-[#1f1f1f] text-sm text-white hover:cursor-pointer hover:opacity-80'>
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent className='flex border border-[#303030] bg-[#1f1f1f] shadow-lg' side={side}>
              {options.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  disabled={item.disabled}
                  className={cn('cursor-pointer rounded text-white hover:bg-white/20 focus:bg-white/20')}
                >
                  <span className='flex items-center gap-1.5'>
                    {item?.leftIcon}
                    {item.name}
                    {item?.rightIcon}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
