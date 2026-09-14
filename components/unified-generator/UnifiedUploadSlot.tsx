'use client';

import { Music2, Trash2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

import { cn } from '@/lib/utils';

export default function UnifiedUploadSlot({
  title,
  file,
  onFileChange,
}: {
  title: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/mp4': ['.m4a'],
    },
    onDrop: (files) => {
      if (files[0]) onFileChange(files[0]);
    },
  });

  return (
    <div
      {...getRootProps()}
      title={file?.name}
      className={cn(
        'group border-color-b1 bg-color-c3 text-color-t3 hover:bg-color-c4 hover:text-color-t1 hover:border-foreground/40 relative flex h-[68px] w-[52px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed transition-colors',
        isDragActive && 'bg-color-c4 border-foreground/40',
      )}
    >
      <input {...getInputProps()} />
      <Music2 className={cn('size-5', file && 'text-color-main')} />
      {file ? (
        <button
          type='button'
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            onFileChange(null);
          }}
          className='absolute top-1 right-1 z-10 flex size-5 items-center justify-center rounded-full bg-black/60 text-white transition-opacity sm:opacity-0 sm:group-hover:opacity-100'
          aria-label={title}
        >
          <Trash2 className='size-3.5' />
        </button>
      ) : null}
    </div>
  );
}
