/* eslint-disable react/jsx-props-no-spreading */

'use client';

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

const AgSwitch = forwardRef<
  ElementRef<typeof SwitchPrimitives.Root>,
  ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    thumbClassName?: string;
  }
>(({ className, thumbClassName, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-[16px] w-[28px] shrink-0 cursor-pointer items-center rounded-full border border-[#889799] bg-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-white data-[state=unchecked]:bg-transparent',
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-3 w-3 rounded-full bg-[#889799] ring-0 transition-transform data-[state=checked]:translate-x-[12px] data-[state=checked]:bg-white data-[state=unchecked]:translate-x-px',
        thumbClassName,
      )}
    />
  </SwitchPrimitives.Root>
));

AgSwitch.displayName = SwitchPrimitives.Root.displayName;

export default AgSwitch;
