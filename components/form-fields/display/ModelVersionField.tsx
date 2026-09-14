'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import Image from 'next/image';
import { ImageIcon, Scaling } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import type { ImageModelVersionConfig } from '@/lib/constants/image/types';
import { cn } from '@/lib/utils';
import { getModelIconConfig } from '@/lib/utils/modelIcons';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import SubHeading from '@/components/form/SubHeading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/video-ui-form/ModelSelectContainer';

export interface ModelVersionFieldProps {
  title?: string;
  name: string;
  versions: ImageModelVersionConfig[];
  onChange?: (value: string) => void;
  displayMode?: 'model' | 'label' | 'both';
  hideTitle?: boolean;
}

export default function ModelVersionField({
  title,
  name,
  versions,
  onChange,
  displayMode = 'model',
  hideTitle = false,
}: ModelVersionFieldProps) {
  const form = useFormContext();
  const tCommon = useTranslations('Common');
  const selectedModelVersion = form.watch(name);

  const sortedVersions = useMemo(() => {
    if (!selectedModelVersion || !versions.length) return versions;

    const currentVersion = versions.find((version) => version.modelVersion === selectedModelVersion);
    if (!currentVersion) return versions;

    const sameProviderVersions = versions.filter(
      (version) => version.provider === currentVersion.provider && version.modelVersion !== selectedModelVersion,
    );
    const otherProviderVersions = versions.filter((version) => version.provider !== currentVersion.provider);

    return [currentVersion, ...sameProviderVersions, ...otherProviderVersions];
  }, [versions, selectedModelVersion]);

  const selectedVersion = sortedVersions.find((version) => version.modelVersion === selectedModelVersion);
  const selectedIcon = selectedVersion ? getModelIconConfig(selectedVersion.modelVersion) : null;

  const getDisplayText = (version: ImageModelVersionConfig) => {
    if (displayMode === 'label') return version.name;
    if (displayMode === 'both') return `${version.modelVersion} / ${version.name}`;
    return version.modelVersion;
  };

  const formatResolutionRange = (version: ImageModelVersionConfig) => {
    const values = version.options.resolution?.map((item) => item.value.toUpperCase()) || [];
    if (!values.length) return null;

    const normalized = [...new Set(values)]
      .map((value) => ({
        raw: value,
        order: parseInt(value.replace(/\D/g, ''), 10),
      }))
      .filter((item) => !Number.isNaN(item.order))
      .sort((a, b) => a.order - b.order);

    if (!normalized.length) return values[0] || null;
    if (normalized.length === 1) return normalized[0].raw;

    return `${normalized[0].raw}-${normalized[normalized.length - 1].raw}`;
  };

  const getVersionTags = (version: ImageModelVersionConfig) => {
    const tags: Array<{ icon: ReactNode; label: string }> = [];
    const editModel = version.models.find((model) => model.options?.imageInput?.isSupported);

    if (editModel?.options.imageInput?.isSupported) {
      const maxImages = editModel.options.imageInput.max || 1;
      tags.push({
        icon: <ImageIcon className='h-3.5 w-3.5' />,
        label: maxImages > 1 ? `Multi images ${maxImages}` : 'Image 1',
      });
    }

    const resolutionRange = formatResolutionRange(version);
    if (resolutionRange) {
      tags.push({
        icon: <Scaling className='h-3.5 w-3.5' />,
        label: resolutionRange,
      });
    }

    return tags;
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {!hideTitle && <SubHeading>{title || tCommon('selectModel')}</SubHeading>}
          <FormControl>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                onChange?.(value);
              }}
            >
              <SelectTrigger className='border-border bg-card text-foreground h-11 w-full rounded-xl border text-sm font-medium'>
                <div className='flex min-w-0 items-center gap-2'>
                  {selectedVersion && selectedIcon?.src ? (
                    <span
                      className={cn(
                        'flex size-4 shrink-0 items-center justify-center overflow-hidden rounded',
                        selectedIcon.background === 'light' && 'bg-foreground p-0.5',
                      )}
                    >
                      <Image
                        src={selectedIcon.src}
                        alt={selectedVersion.name}
                        width={16}
                        height={16}
                        className='size-full object-contain'
                      />
                    </span>
                  ) : (
                    <div className='h-4 w-4 shrink-0' />
                  )}
                  <SelectValue placeholder='Select model version'>
                    {selectedVersion ? getDisplayText(selectedVersion) : 'Select model version'}
                  </SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent className='border-border bg-card w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] rounded-xl border'>
                {sortedVersions.map((version) => {
                  const icon = getModelIconConfig(version.modelVersion);
                  const isDisabled = version.isComingSoon;
                  const isSelected = field.value === version.modelVersion;
                  const tags = getVersionTags(version);
                  return (
                    <SelectItem
                      key={version.modelVersion}
                      value={version.modelVersion}
                      disabled={isDisabled}
                      className={cn(
                        'text-foreground hover:bg-foreground/10 focus:bg-foreground/10 w-full cursor-pointer rounded-none p-0 [&>span:first-child]:hidden [&>span:last-child]:w-full',
                        isDisabled && 'cursor-not-allowed opacity-50 hover:bg-transparent',
                      )}
                    >
                      <div
                        className={cn(
                          'border-foreground/10 box-border flex w-full max-w-full min-w-full cursor-pointer flex-col gap-3 border-b p-2 last:border-b-0',
                          isSelected && 'bg-foreground/5',
                        )}
                      >
                        <div className='flex items-start justify-between gap-3'>
                          <div className='flex min-w-0 flex-1 items-center gap-2'>
                            {icon.src ? (
                              <span
                                className={cn(
                                  'flex size-5 shrink-0 items-center justify-center overflow-hidden rounded',
                                  icon.background === 'light' && 'bg-foreground p-0.5',
                                )}
                              >
                                <Image
                                  src={icon.src}
                                  alt={version.name}
                                  width={20}
                                  height={20}
                                  className='size-full object-contain'
                                />
                              </span>
                            ) : (
                              <div className='h-5 w-5 shrink-0' />
                            )}
                            <span className='text-foreground truncate text-base font-medium'>
                              {getDisplayText(version)}
                            </span>
                          </div>
                          <div className='flex shrink-0 items-center gap-2'>
                            {version.isComingSoon && (
                              <span className='text-color-main rounded bg-[#f3eeff] px-2 py-0.5 text-xs'>
                                Coming Soon
                              </span>
                            )}
                            {isSelected ? (
                              <div className='flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#427cf1] bg-[#427cf1]'>
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  width='12'
                                  height='12'
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='white'
                                  strokeWidth='3'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  className='lucide lucide-check'
                                >
                                  <path d='M20 6 9 17l-5-5' />
                                </svg>
                              </div>
                            ) : (
                              <div className='border-foreground/20 flex h-5 w-5 items-center justify-center rounded-full border' />
                            )}
                          </div>
                        </div>
                        <div className='flex flex-wrap gap-2'>
                          {tags.map((tag) => (
                            <div
                              key={tag.label}
                              className='border-foreground/10 text-foreground/70 flex items-center gap-1 rounded-md border px-2 py-1 text-xs'
                            >
                              {tag.icon}
                              <span>{tag.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
