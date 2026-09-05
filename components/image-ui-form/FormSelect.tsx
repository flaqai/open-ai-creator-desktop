'use client';

import { useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
  className,
  disabled,
  onChange,
}: {
  name: string;
  options: SelectOption[];
  className?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}) {
  const methods = useFormContext();

  const handleChange = (val: string) => {
    if (onChange) {
      onChange(val);
      return;
    }
    methods.setValue(name, val);
  };

  return (
    <FormField
      control={methods.control}
      name={name}
      render={({ field }) => (
        <FormItem className='space-y-0'>
          <FormLabel className='sr-only'>{name}</FormLabel>
          <Select onValueChange={handleChange} value={field.value} disabled={disabled}>
            <FormControl>
              <SelectTrigger
                className={cn(
                  'h-9 w-full rounded-xl border border-[#303030] bg-[#1f1f1f] px-3 py-3 text-sm text-[#b8b8b8] hover:cursor-pointer hover:bg-[#303030]/80',
                  className,
                )}
              >
                <SelectValue placeholder='' />
              </SelectTrigger>
            </FormControl>
            <SelectContent className='flex rounded-xl border-[#303030] bg-[#1f1f1f]'>
              {options.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  disabled={item.disabled}
                  className={cn(
                    'cursor-pointer rounded text-[#b8b8b8] focus:bg-[#303030]',
                    item.value === field.value && 'text-[#b8b8b8]',
                    item.disabled && 'cursor-not-allowed opacity-50',
                  )}
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
