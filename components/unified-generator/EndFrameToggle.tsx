'use client';

import { GalleryHorizontalEnd } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

export default function EndFrameToggle({
  checked,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div title={label} className='bg-color-c3 flex h-9 items-center gap-2 rounded-md px-3 max-sm:px-2'>
      <GalleryHorizontalEnd className={cn('size-4 shrink-0', checked ? 'text-color-main' : 'text-color-t2')} />
      <span className='text-color-t2 text-[14px] leading-[22px] max-sm:hidden'>{label}</span>
      <Switch
        checked={checked}
        onCheckedChange={(nextChecked) => onCheckedChange(Boolean(nextChecked))}
        aria-label={label}
        className='data-[state=checked]:border-color-main h-4 w-7 rounded-[4px] border bg-transparent data-[state=checked]:bg-transparent data-[state=unchecked]:border-white data-[state=unchecked]:bg-transparent'
        thumbClassName='h-3 w-3 rounded-[2px] !bg-white shadow-none data-[state=unchecked]:translate-x-[1px] data-[state=unchecked]:!bg-white data-[state=checked]:translate-x-[13px] data-[state=checked]:!bg-color-main'
      />
    </div>
  );
}
