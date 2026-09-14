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
              <SelectTrigger className='border-border bg-card text-foreground h-9 w-full border text-sm hover:cursor-pointer hover:opacity-80'>
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent className='border-border bg-card flex border shadow-lg' side={side}>
              {options.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  disabled={item.disabled}
                  className={cn('text-foreground hover:bg-foreground/20 focus:bg-foreground/20 cursor-pointer rounded')}
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
