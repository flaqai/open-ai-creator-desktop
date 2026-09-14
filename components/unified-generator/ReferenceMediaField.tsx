'use client';

import { useEffect, useMemo, useRef } from 'react';
import { FileText, ImageIcon, Music2, Plus, VideoIcon, X } from 'lucide-react';

import { cn } from '@/lib/utils';

type MediaKind = 'image' | 'video' | 'audio' | 'file';

interface ReferenceMediaFieldProps {
  kind: MediaKind;
  label: string;
  files: File[];
  max: number;
  accept?: string[];
  onChange: (files: File[]) => void;
  onLimitReached: () => void;
  className?: string;
}

const ACCEPT_BY_KIND: Record<MediaKind, string> = {
  image: 'image/*',
  video: 'video/*',
  audio: 'audio/*',
  file: '.docx,.doc,.xlsx,.xls,.pptx,.ppt,.pdf,.txt,.key,.pages,.numbers,.md',
};

function EmptyIcon({ kind }: { kind: MediaKind }) {
  if (kind === 'image') return <ImageIcon className='size-5' />;
  if (kind === 'video') return <VideoIcon className='size-5' />;
  if (kind === 'file') return <FileText className='size-5' />;
  return <Music2 className='size-5' />;
}

export default function ReferenceMediaField({
  kind,
  label,
  files,
  max,
  accept,
  onChange,
  onLimitReached,
  className,
}: ReferenceMediaFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const visibleFiles = files.slice(0, 4);
  const previews = useMemo(
    () => visibleFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [visibleFiles],
  );

  useEffect(() => () => previews.forEach((item) => URL.revokeObjectURL(item.url)), [previews]);

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles?.length) return;
    const next = [...files, ...Array.from(selectedFiles)];
    if (next.length > max) onLimitReached();
    onChange(next.slice(0, max));
    if (inputRef.current) inputRef.current.value = '';
  };
  const canAdd = files.length < max;

  return (
    <div className={cn('group/stack relative h-[68px] w-[52px] shrink-0 overflow-visible', className)}>
      {previews.map(({ file, url }, index) => (
        <div
          key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
          className='group/item border-color-b1 bg-color-c3 text-color-t3 absolute top-0 left-0 flex h-[68px] w-[52px] items-center justify-center overflow-hidden rounded-xl border border-dashed shadow-[0_10px_28px_rgba(0,0,0,0.18)] transition-transform duration-300 lg:group-hover/stack:translate-x-[calc(var(--stack-index)*44px)]'
          style={
            {
              transform: `translateX(${index * 7}px) rotate(${(index - 1.5) * 2}deg)`,
              zIndex: index + 1,
              '--stack-index': index,
            } as React.CSSProperties
          }
        >
          {kind === 'image' ? <img src={url} alt='' className='size-full object-cover' /> : null}
          {kind === 'video' ? (
            <video src={url} muted playsInline preload='metadata' className='size-full object-cover' />
          ) : null}
          {kind === 'audio' || kind === 'file' ? <EmptyIcon kind={kind} /> : null}
          <button
            type='button'
            aria-label={`${label} ${index + 1}`}
            className='absolute top-1 right-1 z-10 hidden size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover/item:flex group-hover/item:opacity-100'
            onClick={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))}
          >
            <X className='size-3.5' />
          </button>
        </div>
      ))}
      {files.length > visibleFiles.length ? (
        <span className='bg-color-main text-color-inverse-t1 absolute -right-2 -bottom-2 z-30 flex size-6 items-center justify-center rounded-full text-[10px] font-semibold'>
          {files.length}
        </span>
      ) : null}
      {files.length === 0 ? (
        <button
          type='button'
          aria-label={label}
          onClick={() => inputRef.current?.click()}
          className='border-color-b1 bg-color-c3 text-color-t3 hover:text-color-t1 hover:border-foreground/50 flex h-[68px] w-[52px] items-center justify-center rounded-xl border border-dashed transition-colors'
        >
          <EmptyIcon kind={kind} />
        </button>
      ) : canAdd ? (
        <button
          type='button'
          aria-label={label}
          onClick={() => inputRef.current?.click()}
          className='border-color-b1 bg-color-c3 text-color-t2 hover:text-color-t1 hover:border-foreground/50 absolute -right-1 -bottom-1 z-30 flex size-6 items-center justify-center rounded-full border shadow-[0_8px_18px_rgba(0,0,0,0.35)] transition-colors'
        >
          <Plus className='size-4' />
        </button>
      ) : null}
      <input
        ref={inputRef}
        type='file'
        multiple={max > 1}
        accept={
          accept?.length
            ? accept.map((format) => (format.startsWith('.') || format.includes('/') ? format : `.${format}`)).join(',')
            : ACCEPT_BY_KIND[kind]
        }
        className='hidden'
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  );
}
