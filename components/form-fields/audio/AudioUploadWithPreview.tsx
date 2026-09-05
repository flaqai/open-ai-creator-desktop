/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

'use client';

import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import SubHeading from '@/components/form/SubHeading';
import AudioFilePreviewCard from '@/components/generation-modal/AudioFilePreviewCard';

const acceptedAudioTypes = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/mp4',
  'audio/m4a',
  'audio/aac',
  'audio/x-aac',
  'audio/ogg',
  'audio/vorbis',
];
const maxFileSize = 10 * 1024 * 1024;

export interface AudioUploadWithPreviewRef {
  deleteFile: () => void;
  removeAudio: () => void;
  previewAudio: (file: File) => void;
  getAudioDuration: () => number;
  getTrimRange: () => { startTime: number; endTime: number } | null;
}

interface AudioUploadWithPreviewProps {
  name: string;
  title?: string;
  uploadText?: string;
  supportedFormatsText?: string;
  className?: string;
}

const AudioUploadWithPreview = forwardRef<AudioUploadWithPreviewRef, AudioUploadWithPreviewProps>(
  ({ name, title, uploadText, supportedFormatsText, className }, ref) => {
    const tUpload = useTranslations('components.audio-upload-form');
    const methods = useFormContext();
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioDuration, setAudioDuration] = useState<number>(0);
    const [trimRange, setTrimRange] = useState<{ startTime: number; endTime: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const previewAudio = useCallback(
      async (file: File) => {
        if (file) {
          setAudioFile(file);
          methods.setValue(name, file, { shouldValidate: true, shouldDirty: true });
        } else {
          setAudioFile(null);
          methods.setValue(name, null, { shouldValidate: true, shouldDirty: true });
        }
      },
      [methods, name],
    );

    const deleteFile = useCallback(() => {
      setAudioFile(null);
      setAudioDuration(0);
      setTrimRange(null);
      methods.setValue(name, null, { shouldValidate: true, shouldDirty: true });
      methods.setValue('audioTrimRange', null, { shouldValidate: true, shouldDirty: true });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, [methods, name]);

    const getAudioDuration = useCallback(() => {
      return audioDuration;
    }, [audioDuration]);

    const getTrimRange = useCallback(() => {
      return trimRange;
    }, [trimRange]);

    const handleTrimChange = useCallback(
      (startTime: number, endTime: number) => {
        setTrimRange({ startTime, endTime });
        const trimmedDuration = endTime - startTime;
        setAudioDuration(trimmedDuration);
        methods.setValue('audioTrimRange', { startTime, endTime }, { shouldValidate: true, shouldDirty: true });
      },
      [methods],
    );

    const handleDurationChange = useCallback((duration: number) => {
      setAudioDuration(duration);
    }, []);

    const validateAndUploadFile = (file: File) => {
      if (!acceptedAudioTypes.includes(file.type)) {
        toast.error(tUpload('unsupported-format'));
        return false;
      }

      if (file.size > maxFileSize) {
        toast.error(tUpload('file-too-large'));
        return false;
      }

      previewAudio(file);
      return true;
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        validateAndUploadFile(file);
      }
    };

    const handleUploadClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      fileInputRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        validateAndUploadFile(file);
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        deleteFile,
        removeAudio: deleteFile,
        previewAudio,
        getAudioDuration,
        getTrimRange,
      }),
      [deleteFile, previewAudio, getAudioDuration, getTrimRange],
    );

    return (
      <div className={className}>
        <div className='flex flex-col gap-3'>
          {/* Header */}
          {title && <SubHeading>{title}</SubHeading>}

          {/* Upload area or Preview */}
          {audioFile ? (
            <AudioFilePreviewCard
              file={audioFile}
              onDelete={deleteFile}
              onDurationChange={handleDurationChange}
              onTrimChange={handleTrimChange}
            />
          ) : (
            <div
              onClick={handleUploadClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'relative flex h-[112px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-[#232528] hover:border-white/30 hover:bg-[#2a2b2f]',
                isDragging && 'border-white/30 bg-[#2a2b2f]',
              )}
            >
              <div className='flex size-8 items-center justify-center rounded-lg bg-white/5'>
                <Upload className='size-6 text-white/40' />
              </div>
              <div className='text-center text-sm text-white/40'>{uploadText || tUpload('upload-audio')}</div>
              <div className='text-xs text-white/40'>{supportedFormatsText || tUpload('supported-formats')}</div>
            </div>
          )}
        </div>

        <input
          type='file'
          ref={fileInputRef}
          accept={acceptedAudioTypes.join(',')}
          onChange={handleFileSelect}
          className='hidden'
        />
      </div>
    );
  },
);

AudioUploadWithPreview.displayName = 'AudioUploadWithPreview';

export default AudioUploadWithPreview;
