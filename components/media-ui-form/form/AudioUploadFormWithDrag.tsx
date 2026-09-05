'use client';

/* eslint-disable react/function-component-definition */
import { forwardRef, ForwardRefRenderFunction, useImperativeHandle, useRef, useState } from 'react';
import { Music, Trash2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

const acceptedAudioTypes = [
  'audio/mpeg', // MP3
  'audio/mp3', // MP3 (alternative)
  'audio/wav', // WAV
  'audio/wave', // WAV (alternative)
  'audio/x-wav', // WAV (alternative)
  'audio/mp4', // M4A
  'audio/m4a', // M4A
  'audio/aac', // AAC
  'audio/x-aac', // AAC (alternative)
  'audio/ogg', // OGG
  'audio/vorbis', // OGG Vorbis
];

// eslint-disable-next-line prefer-arrow-callback
const AudioUploadFormWithDrag: ForwardRefRenderFunction<
  { removeAudio: () => void; previewAudio: (file: File | null) => void },
  {
    name: string;
    label?: string;
    className?: string;
  }
> = ({ name, label, className }, ref) => {
  const methods = useFormContext<{ [key: string]: File | null }>();
  const t = useTranslations('components.audio-upload-form');

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewAudio = (file: File | null) => {
    if (file) {
      setAudioFile(file);
      methods.setValue(name, file);
    } else {
      setAudioFile(null);
      methods.setValue(name, null);
    }
  };

  const removeAudio = () => {
    setAudioFile(null);
    methods.setValue(name, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onRemoveButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    removeAudio();
  };

  const inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (!acceptedAudioTypes.includes(file.type)) {
        toast.error(t('unsupported-format'));
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('file-too-large'));
        return;
      }

      previewAudio(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file && acceptedAudioTypes.includes(file.type)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('file-too-large'));
        return;
      }
      previewAudio(file);
    } else if (file) {
      toast.error(t('unsupported-format'));
    }
  };

  useImperativeHandle(ref, () => ({
    removeAudio,
    previewAudio,
  }));

  return (
    <FormField
      control={methods.control}
      name={name}
      render={() => (
        <FormItem className={cn('relative space-y-0', className)}>
          <FormLabel
            className={cn(
              'group border-input hover:border-color-main relative flex h-[140px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-white transition-colors',
              audioFile && 'border-color-main bg-color-bg/10',
            )}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {audioFile ? (
              <>
                <div className='flex flex-col items-center gap-2'>
                  <Music className='text-color-main size-10' />
                  <div className='max-w-full truncate px-4 text-center text-sm font-medium text-black'>
                    {audioFile.name}
                  </div>
                  <div className='text-xs text-[var(--c-gray)]'>{(audioFile.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                <button
                  className='absolute top-2 right-2 flex size-8 items-center justify-center rounded-lg bg-black/5 transition-colors hover:bg-black/10'
                  onClick={onRemoveButtonClick}
                  type='button'
                >
                  <Trash2 className='size-4 text-black/60' />
                </button>
              </>
            ) : (
              <>
                <div className='bg-color-bg flex size-12 items-center justify-center rounded-full'>
                  <Upload className='group-hover:text-color-main size-6 text-[var(--c-gray)]' />
                </div>
                <div className='text-center text-sm font-medium text-black'>{label || t('upload-audio')}</div>
                <div className='text-xs text-[var(--c-gray)]'>{t('supported-formats')}</div>
              </>
            )}
          </FormLabel>
          <FormControl>
            <input
              type='file'
              ref={fileInputRef}
              accept={acceptedAudioTypes.join(',')}
              className='hidden'
              required={false}
              onChange={inputChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default forwardRef(AudioUploadFormWithDrag);
