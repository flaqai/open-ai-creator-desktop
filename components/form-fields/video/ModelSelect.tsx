'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  getFilteredVisibleProviders,
  getVideoProviderByModelVersion,
  versionSupportsImageToVideo,
  versionSupportsTextToVideo,
} from '@/lib/constants/video/';
import type { ModelVersionConfig } from '@/lib/constants/video/types';
import { cn } from '@/lib/utils';
import { getModelIconConfig } from '@/lib/utils/modelIcons';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../video-ui-form/ModelSelectContainer';
import ModelSelectItem from '../../video-ui-form/ModelSelectItem';

interface ModelSelectProps {
  name: string;
  hasImages?: boolean;
  allowedProviders?: string[];
  videoType?: 'Text-to-video' | 'Image-to-video';
  displayMode?: 'model' | 'label' | 'both';
}

export default function ModelSelect({
  name,
  hasImages = false,
  allowedProviders,
  videoType,
  displayMode = 'model',
}: ModelSelectProps) {
  const { control, watch, setValue } = useFormContext();
  const selectedModelVersion = watch(name);
  const selectedModelIcon = selectedModelVersion ? getModelIconConfig(selectedModelVersion) : null;

  // Track previous hasImages state to detect changes
  const prevHasImages = useRef<boolean>(hasImages);

  // Dynamically filter model version list based on hasImages
  // Use getFilteredVisibleProviders (excludes special-purpose models, controls WAN by channel)
  // When images are present, only show versions that support image-to-video
  const modelVersions = useMemo(() => {
    const visibleProviders = getFilteredVisibleProviders(true);
    const providers = allowedProviders
      ? visibleProviders.filter((p) => allowedProviders.includes(p.provider))
      : visibleProviders;
    const allVisibleVersions = providers.flatMap((p) => p.versions);

    if (videoType === 'Text-to-video') {
      return allVisibleVersions.filter((v) => versionSupportsTextToVideo(v));
    }

    if (videoType === 'Image-to-video') {
      return allVisibleVersions.filter((v) => versionSupportsImageToVideo(v));
    }

    if (hasImages) {
      return allVisibleVersions.filter((v) => versionSupportsImageToVideo(v));
    }

    return allVisibleVersions;
  }, [hasImages, allowedProviders, videoType]);

  // Sort model version list:
  // 1. Put all versions of the currently selected model's brand first
  // 2. Within that brand, pin the selected version to the top
  const sortedVersions = useMemo(() => {
    if (!selectedModelVersion || !modelVersions.length) return modelVersions;

    // Find the selected version
    const selectedVersion = modelVersions.find((v) => v.modelVersion === selectedModelVersion);
    if (!selectedVersion) return modelVersions;

    const selectedProvider = selectedVersion.provider;

    // Group by brand
    const sameProviderVersions = modelVersions.filter(
      (v) => v.provider === selectedProvider && v.modelVersion !== selectedModelVersion,
    );
    const otherProviderVersions = modelVersions.filter((v) => v.provider !== selectedProvider);

    // Return: selected version + other versions from same brand + versions from other brands
    return [selectedVersion, ...sameProviderVersions, ...otherProviderVersions];
  }, [modelVersions, selectedModelVersion]);

  // Format range display (convert array to min-max format)
  const formatRangeLabel = (values: string[], unit: string) => {
    if (values.length === 0) return '';
    if (values.length === 1) return values[0];

    // Extract numeric parts and sort
    const numbers = values
      .map((v) => parseInt(v.replace(/\D/g, ''), 10))
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);

    if (numbers.length === 0) return values.join(', ');
    if (numbers.length === 1) return `${numbers[0]}${unit}`;

    const min = numbers[0];
    const max = numbers[numbers.length - 1];
    return `${min}-${max}${unit}`;
  };

  // Generate feature list for each model version
  const getVersionFeatures = (version: ModelVersionConfig) => {
    const features = [];

    // Add duration info (from options.duration array)
    if (version.options.duration && version.options.duration.length > 0) {
      const durationLabel = formatRangeLabel(version.options.duration, 's');
      features.push({ icon: 'duration' as const, label: durationLabel });
    }

    // Add resolution info (from options.resolution array)
    if (version.options.resolution && version.options.resolution.length > 0) {
      const resolutionLabel = formatRangeLabel(version.options.resolution, 'p');
      features.push({ icon: 'resolution' as const, label: resolutionLabel });
    }

    // Add audio input capability
    if (version.options?.audioUrl || version.options?.audio) {
      features.push({ icon: 'audio' as const, label: 'Audio Upload' });
    }

    // Add sound generation capability
    if (version.options?.sound) {
      features.push({ icon: 'sound' as const, label: 'Sound' });
    }

    // Add background music capability
    if (version.options?.bgm) {
      features.push({ icon: 'bgm' as const, label: 'BGM' });
    }

    // Add style control capability
    if (version.options?.style?.length) {
      features.push({ icon: 'style' as const, label: 'Style' });
    }

    // Add end frame info
    if (version.options?.endFrame?.isSupported) {
      features.push({ icon: 'endFrame' as const, label: 'End frame' });
    }

    return features;
  };

  // Get display name for model version: defaults to showing flaq model_name directly
  const getVersionDisplayName = (version: ModelVersionConfig) => {
    if (displayMode === 'label') return version.name;
    if (displayMode === 'both') return `${version.modelVersion} / ${version.name}`;
    return version.modelVersion;
  };

  // When hasImages changes, check if the current model is still available
  // If the user uploads images but the current model does not support image-to-video, switch automatically
  useEffect(() => {
    if (!sortedVersions.length) return;

    // Only execute logic when hasImages actually changes
    if (prevHasImages.current === hasImages) {
      return;
    }

    // Update the previous hasImages state
    prevHasImages.current = hasImages;

    // Check if the current selection is in the new list
    const isCurrentInList = sortedVersions.some((v) => v.modelVersion === selectedModelVersion);
    if (isCurrentInList) {
      // Current selection is in the list, no need to switch
      return;
    }

    // Current selection is not in the list, need to switch to a supported version (same brand preferred)
    const currentProvider = getVideoProviderByModelVersion(selectedModelVersion);

    // Prefer selecting a model from the same brand
    let newModelVersion = sortedVersions[0]?.modelVersion;

    if (currentProvider && newModelVersion) {
      const sameBrandVersion = sortedVersions.find((v) => v.provider === currentProvider);
      if (sameBrandVersion) {
        newModelVersion = sameBrandVersion.modelVersion;
      }
    }

    if (newModelVersion) {
      setValue(name, newModelVersion);
    }
  }, [hasImages, sortedVersions, selectedModelVersion, setValue, name]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className='space-y-0'>
          <Select onValueChange={field.onChange} value={field.value ?? ''} name={name}>
            <FormControl>
              {/* Model version list, selector trigger button */}
              <SelectTrigger className='w-full rounded-xl border border-[#303030] bg-[#1f1f1f] text-sm text-white'>
                <div className='flex items-center gap-2'>
                  {selectedModelVersion && selectedModelIcon?.src ? (
                    <span
                      className={cn(
                        'flex size-4 items-center justify-center overflow-hidden rounded',
                        selectedModelIcon.background === 'light' && 'bg-white p-0.5',
                      )}
                    >
                      <img
                        src={selectedModelIcon.src}
                        alt={selectedModelVersion}
                        className='size-full object-contain'
                      />
                    </span>
                  ) : (
                    <div className='size-4' />
                  )}
                  <SelectValue placeholder='Select model version'>
                    {selectedModelVersion
                      ? (() => {
                          const version = sortedVersions.find((v) => v.modelVersion === selectedModelVersion);
                          return version ? getVersionDisplayName(version) : 'Select model version';
                        })()
                      : 'Select model version'}
                  </SelectValue>
                </div>
              </SelectTrigger>
            </FormControl>
            <SelectContent className='rounded-xl border border-[#303030] bg-[#1f1f1f]'>
              {sortedVersions.map((version) => {
                const isDisabled = version.isComingSoon || false;
                const showComingSoon = version.isComingSoon || false;

                return (
                  <SelectItem
                    key={version.modelVersion}
                    value={version.modelVersion}
                    disabled={isDisabled}
                    className={cn(
                      'w-full cursor-pointer rounded-none p-0 text-white hover:bg-white/10 focus:bg-white/10 [&>span:first-child]:hidden [&>span:last-child]:w-full',
                      isDisabled && 'cursor-not-allowed opacity-50 hover:bg-transparent',
                    )}
                  >
                    <ModelSelectItem
                      value={version.modelVersion}
                      label={getVersionDisplayName(version)}
                      features={getVersionFeatures(version)}
                      isSelected={selectedModelVersion === version.modelVersion}
                      isDisabled={isDisabled}
                      showComingSoon={showComingSoon}
                      onClick={() => !isDisabled && field.onChange(version.modelVersion)}
                    />
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
