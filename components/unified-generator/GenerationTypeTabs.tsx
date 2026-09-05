'use client';

import { ImageIcon, Library, Type } from 'lucide-react';

import type { VideoGenerationType } from '@/lib/constants/video';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

type ImageType = 'text-to-image' | 'image-to-image';
type VideoType = Exclude<VideoGenerationType, 'video-edit'>;

type GenerationOption = {
  value: ImageType | VideoType;
  label: string;
  icon: typeof Type;
};

export default function GenerationTypeTabs({
  mediaType,
  imageType,
  videoType,
  labels,
  onImageTypeChange,
  onVideoTypeChange,
}: {
  mediaType: 'image' | 'video';
  imageType: ImageType;
  videoType: VideoType;
  labels: Record<ImageType | VideoType, string>;
  onImageTypeChange: (value: ImageType) => void;
  onVideoTypeChange: (value: VideoType) => void;
}) {
  const options: GenerationOption[] =
    mediaType === 'video'
      ? [
          { value: 'text-to-video', label: labels['text-to-video'], icon: Type },
          { value: 'image-to-video', label: labels['image-to-video'], icon: ImageIcon },
          { value: 'reference-to-video', label: labels['reference-to-video'], icon: Library },
        ]
      : [
          { value: 'text-to-image', label: labels['text-to-image'], icon: Type },
          { value: 'image-to-image', label: labels['image-to-image'], icon: ImageIcon },
        ];
  const value = mediaType === 'video' ? videoType : imageType;
  const selectedOption = options.find((option) => option.value === value) || options[0];
  const SelectedIcon = selectedOption.icon;

  const handleChange = (nextValue: string) => {
    if (mediaType === 'video') onVideoTypeChange(nextValue as VideoType);
    else onImageTypeChange(nextValue as ImageType);
  };

  return (
    <>
      <div className='min-w-0 flex-1 sm:hidden'>
        <Select value={value} onValueChange={handleChange}>
          <SelectTrigger className='text-color-t1 h-12 w-full min-w-0 justify-start rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 [&>svg:last-child]:size-6 [&>svg:last-child]:text-white [&>svg:last-child]:opacity-100'>
            <span className='flex min-w-0 items-center gap-2'>
              <SelectedIcon className='size-4 shrink-0' />
              <span className='truncate'>{selectedOption.label}</span>
            </span>
          </SelectTrigger>
          <SelectContent className='border-color-b1 bg-color-c1 text-color-t1 rounded-xl'>
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className='text-color-t2 focus:bg-color-c3 focus:text-color-t1 rounded-md'
                >
                  <Icon className='size-4 shrink-0' />
                  <span>{option.label}</span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <div className='no-scrollbar hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto sm:flex'>
        {options.map((option) => {
          const active = option.value === value;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type='button'
              onClick={() => handleChange(option.value)}
              aria-pressed={active}
              className={cn(
                'inline-flex h-11 shrink-0 items-center justify-center gap-2 border-b-2 px-3 text-sm font-medium whitespace-nowrap transition-colors sm:px-4',
                active
                  ? 'border-color-main text-color-main'
                  : 'text-color-t2 hover:text-color-t1 focus-visible:text-color-t1 border-transparent',
              )}
            >
              <Icon className='size-4 shrink-0' />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
