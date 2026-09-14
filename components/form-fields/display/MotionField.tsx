'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import { ArrowRightLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import SubHeading from '@/components/form/SubHeading';

export interface MotionOption {
  id: string;
  name: string;
  value: string;
  previewUrl: string;
  credit?: number;
  href?: string;
}

interface MotionFieldProps {
  options: MotionOption[];
  show?: boolean;
  label?: string;
  currentMotionId?: string;
  onMotionChange?: (value: string, motion: MotionOption) => void;
}

export default function MotionField({
  options,
  show = true,
  label,
  currentMotionId,
  onMotionChange,
}: MotionFieldProps) {
  const router = useRouter();
  const { setValue, watch } = useFormContext();
  const t = useTranslations('components.image-form');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedMotion = watch('selectedMotion') || options[0];

  if (!show || !options || options.length === 0) return null;

  const handleMotionSelect = (motion: MotionOption) => {
    setValue('selectedMotion', motion);
    setIsModalOpen(false);

    // 1. Trigger callback (if available)
    onMotionChange?.(motion.value, motion);

    // 2. Auto-navigate (if not on current page and has navigation path)
    if (motion.id !== currentMotionId && motion.href) {
      router.push(motion.href);
    }
  };

  const isSingleOption = options.length === 1;

  return (
    <div className='flex w-full flex-col gap-2'>
      <SubHeading>{label || t('motion')}</SubHeading>
      <Dialog open={isModalOpen} onOpenChange={isSingleOption ? undefined : setIsModalOpen}>
        <DialogTrigger asChild disabled={isSingleOption}>
          <div
            className={cn(
              'border-border bg-card rounded-xl border p-3',
              !isSingleOption && 'hover:border-color-main cursor-pointer',
            )}
          >
            <div className='flex items-center justify-between gap-3'>
              <Image
                src={selectedMotion.previewUrl}
                alt={selectedMotion.name}
                width={85}
                height={48}
                className='h-12 w-[85px] shrink-0 rounded-lg object-cover'
              />
              <div className='flex items-center justify-center gap-2'>
                <span className='text-foreground/80 text-[14px] leading-[21px] font-medium tracking-[0.28px] capitalize'>
                  {selectedMotion.name.toLowerCase()}
                </span>
                {!isSingleOption && <ArrowRightLeft className='text-foreground/60 size-4' />}
              </div>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className='sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl'>
          <DialogHeader>
            <DialogTitle>{label || t('selectMotion')}</DialogTitle>
          </DialogHeader>
          <div className='mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4'>
            {options.map((motion) => (
              <button
                key={motion.id}
                type='button'
                onClick={() => handleMotionSelect(motion)}
                className={cn(
                  'hover:border-color-main flex flex-col items-center gap-2 rounded-lg border p-1 transition-colors',
                  selectedMotion?.id === motion.id ? 'border-color-main' : 'border-transparent',
                )}
              >
                <Image
                  src={motion.previewUrl}
                  alt={motion.name}
                  width={210}
                  height={118}
                  className='h-auto w-full shrink-0 rounded-lg object-cover'
                />
                <span className='text-foreground/70 text-center text-xs'>{motion.name}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
