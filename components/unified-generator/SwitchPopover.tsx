'use client';

import { Fragment } from 'react';
import { Settings2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';

import ToolbarButton from './ToolbarButton';

export default function SwitchPopover({
  items,
  open,
  onOpenChange,
  onToggle,
}: {
  items: Array<{ key: 'enableAudio'; label: string; checked: boolean }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: (key: 'enableAudio', checked: boolean) => void;
}) {
  const tCommon = useTranslations('Common');

  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={false}>
      <PopoverTrigger asChild>
        <ToolbarButton active={open}>
          <Settings2 className='size-4' />
          <span className='text-[14px] leading-[22px]'>{tCommon('panel')}</span>
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent
        side='top'
        align='start'
        sideOffset={8}
        className='border-color-b1 bg-color-c1 text-color-t1 w-[123px] rounded-[8px] border p-2 shadow-xl'
      >
        <div className='flex flex-col gap-2'>
          {items.map((item, index) => (
            <Fragment key={item.key}>
              <div className='flex h-[22px] items-center justify-between'>
                <span className='text-color-t2 text-[14px] leading-[22px]'>{item.label}</span>
                <Switch
                  checked={item.checked}
                  onCheckedChange={(checked) => onToggle(item.key, Boolean(checked))}
                  className='data-[state=checked]:border-color-main data-[state=unchecked]:border-foreground h-4 w-7 rounded-[4px] border bg-transparent data-[state=checked]:bg-transparent data-[state=unchecked]:bg-transparent'
                  thumbClassName='h-3 w-3 rounded-[2px] !bg-foreground shadow-none data-[state=unchecked]:translate-x-[1px] data-[state=unchecked]:!bg-foreground data-[state=checked]:translate-x-[13px] data-[state=checked]:!bg-color-main'
                />
              </div>
              {index !== items.length - 1 ? <div className='border-color-b1 border-t' /> : null}
            </Fragment>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
