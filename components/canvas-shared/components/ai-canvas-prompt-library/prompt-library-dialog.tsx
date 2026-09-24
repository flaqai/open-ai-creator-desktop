'use client';

import { useTranslations } from 'next-intl';

import type { ReactNode } from 'react';
import { BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function PromptLibraryDialog({
  children,
  onOpenChange,
  open,
}: {
  readonly children: ReactNode;
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
}) {
  const t = useTranslations('InfiniteCanvas.promptLibrary');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button type='button' variant='ghost' size='icon' aria-label={t('open')}>
          <BookOpen className='size-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='flex h-[min(760px,85dvh)] max-w-4xl flex-col gap-3 overflow-hidden bg-background p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <div className='min-h-0 flex-1'>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
