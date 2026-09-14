'use client';

import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { CircleX } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { maxSizeMB } from '@/lib/constants';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import Spinning from '@/components/Spinning';

const options = {
  maxSizeMB,
  useWebWorker: true,
};

export default function CompressImageDialog({
  open,
  setOpen,
  reUploadHandler,
  imageFile,
  setFile,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  reUploadHandler: () => void;
  imageFile: File | null;
  setFile: (file: File) => void;
}) {
  const t = useTranslations('components.compress-dialog');
  const [startCompress, setStartCompress] = useState(false);

  const reUpload = () => {
    setOpen(false);
    reUploadHandler();
  };

  const compressFile = async () => {
    setStartCompress(true);

    if (imageFile) {
      const compressedFile = await imageCompression(imageFile, options);
      // console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
      // console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB
      setFile(compressedFile);
    }
    setStartCompress(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className='bg-card-black flex h-[231px] w-[calc(100%-24px)] flex-col justify-between rounded-2xl! border-none p-5 lg:h-[231px] lg:w-[420px]'
      >
        <DialogClose asChild>
          <button type='button' className='absolute top-3 right-3'>
            <CircleX className='text-foreground/70 size-4' />
            <span className='sr-only'>close</span>
          </button>
        </DialogClose>
        <div className='flex flex-1 flex-col items-center justify-between'>
          <div className='flex flex-col items-center gap-3'>
            <div className='text-lg font-semibold'>{t('title')}</div>
            <p className='text-center text-sm text-balance'>{t('content')}</p>
          </div>
          <div className='flex w-full items-start justify-between gap-3'>
            <button
              type='button'
              onClick={reUpload}
              className='bg-main-gray text-foreground/70 flex h-10 items-center justify-center rounded-lg px-2.5'
            >
              {t('reupload')}
            </button>
            <button
              type='button'
              onClick={compressFile}
              disabled={startCompress}
              className='bg-color-main text-background flex h-10 flex-1 items-center justify-center rounded-lg px-2.5'
            >
              {startCompress ? <Spinning className='size-5' /> : t('compress')}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
