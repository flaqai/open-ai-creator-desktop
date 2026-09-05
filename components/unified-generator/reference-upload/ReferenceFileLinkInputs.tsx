'use client';

import { FileText, FileUp, Link as LinkIcon, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

import type { VideoModel } from '@/lib/constants/video';
import { cn } from '@/lib/utils';

import ReferenceInputHeading from './ReferenceInputHeading';

function isPublicWebUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function ReferenceFileLinkInputs({
  model,
  files,
  links,
  onFilesChange,
  onLinksChange,
}: {
  model: VideoModel;
  files: File[];
  links: string[];
  onFilesChange: (files: File[]) => void;
  onLinksChange: (links: string[]) => void;
}) {
  const t = useTranslations('components.video-form.reference-source');
  const tUpload = useTranslations('components.hero-form.reference-upload');
  const fileConfig = model.options.referenceFile;
  const linkConfig = model.options.referenceLink;
  const selectedFile = files[0];
  const linkValue = links[0] || '';
  const acceptedExtensions = (fileConfig?.acceptedFormats || []).map((format) =>
    format.toLowerCase().replace(/^\./, ''),
  );
  const fileTips = [
    t('file-formats', { formats: acceptedExtensions.join(', ') }),
    fileConfig?.maxPages ? t('page-limit', { count: fileConfig.maxPages }) : '',
  ]
    .filter(Boolean)
    .join(' ');
  const hasInvalidLink = Boolean(linkValue.trim() && !isPublicWebUrl(linkValue.trim()));

  const handleFile = (file?: File) => {
    if (!file) return;
    if (linkValue.trim()) {
      toast.error(t('mutually-exclusive'));
      return;
    }
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!acceptedExtensions.includes(extension)) {
      toast.error(t('unsupported-file', { formats: acceptedExtensions.join(', ') }));
      return;
    }
    onFilesChange([file]);
    onLinksChange([]);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    multiple: false,
    maxFiles: fileConfig?.maxFiles || 1,
    noClick: true,
    disabled: !fileConfig?.isSupported || Boolean(linkValue.trim()) || Boolean(selectedFile),
    onDrop: (nextFiles) => handleFile(nextFiles[0]),
    onDropRejected: () => toast.error(tUpload('maxFiles', { count: fileConfig?.maxFiles || 1 })),
  });

  if (!fileConfig?.isSupported && !linkConfig?.isSupported) return null;

  return (
    <div className='flex w-full flex-col gap-2.5'>
      {fileConfig?.isSupported ? (
        <div className='flex w-full flex-col gap-2'>
          <ReferenceInputHeading tips={fileTips}>{t('file-title')}</ReferenceInputHeading>
          <div {...getRootProps()}>
            {selectedFile ? (
              <div className='border-color-b1 bg-color-c1 flex items-center gap-2 rounded-lg border p-2.5'>
                <FileText className='text-color-t2 size-4 shrink-0' />
                <span className='text-color-t1 min-w-0 flex-1 truncate text-xs'>{selectedFile.name}</span>
                <button
                  type='button'
                  onClick={() => onFilesChange([])}
                  className='text-color-t2 hover:text-color-t1 rounded p-1 transition-colors'
                  aria-label={t('remove-file')}
                >
                  <Trash2 className='size-3.5' />
                </button>
              </div>
            ) : (
              <button
                type='button'
                disabled={Boolean(linkValue.trim())}
                onClick={open}
                className={cn(
                  'border-color-b1 bg-color-c1 flex min-h-16 w-full items-center gap-2.5 rounded-lg border border-dashed p-2.5 text-left transition-colors hover:border-white/30',
                  isDragActive && 'bg-color-c4 border-white/40',
                  linkValue.trim() && 'cursor-not-allowed opacity-50',
                )}
              >
                <span className='border-color-b1 flex size-9 shrink-0 items-center justify-center rounded-md border border-dashed'>
                  <FileUp className='text-color-t2 size-4' />
                </span>
                <span className='text-color-t2 text-xs'>{tUpload('upload')}</span>
              </button>
            )}
            <input
              {...getInputProps({
                accept: acceptedExtensions.map((format) => `.${format}`).join(','),
                onClick: (event) => {
                  event.currentTarget.value = '';
                },
              })}
            />
          </div>
        </div>
      ) : null}

      {linkConfig?.isSupported ? (
        <div className='flex w-full flex-col gap-2'>
          <ReferenceInputHeading tips={t('link-tip')}>{t('link-title')}</ReferenceInputHeading>
          <span className='relative'>
            <LinkIcon className='text-color-t3 absolute top-1/2 left-3 size-4 -translate-y-1/2' />
            <input
              type='url'
              value={linkValue}
              disabled={Boolean(selectedFile)}
              onChange={(event) => onLinksChange(event.target.value.trim() ? [event.target.value] : [])}
              onBlur={() => {
                if (hasInvalidLink) toast.error(t('invalid-link'));
              }}
              placeholder={t('link-placeholder')}
              className={cn(
                'border-color-b1 bg-color-c1 text-color-t1 placeholder:text-color-t3 h-9 w-full rounded-lg border pr-3 pl-9 text-xs leading-none transition-colors outline-none focus:border-white/20',
                selectedFile && 'cursor-not-allowed opacity-50',
                hasInvalidLink && 'border-red-500/50',
              )}
            />
          </span>
        </div>
      ) : null}
    </div>
  );
}
