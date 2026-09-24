'use client';

import { useMemo, useRef, useState } from 'react';
import useImageHistory from '@/network/image/history';
import useVideoHistory from '@/network/video/history';
import { nanoid } from 'nanoid';
import { useTranslations } from 'next-intl';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { toast } from 'sonner';

import type {
  UnifiedGeneratorReferenceMediaAsset,
  UnifiedGeneratorReferenceMediaKind,
} from '@/lib/constants/unified-generator/types';
import type { VideoModel } from '@/lib/constants/video';
import {
  getMediaDropzoneAccept,
  getMediaInputAccept,
  isAcceptedMediaFile,
  normalizeMediaFormats,
} from '@/lib/utils/media-upload-formats';
import { loadVideoMetadata } from '@/lib/utils/videoUtils';

import ReferenceAudioPreviewDialog from './ReferenceAudioPreviewDialog';
import ReferenceImagePreviewDialog from './ReferenceImagePreviewDialog';
import ReferenceMediaPicker from './ReferenceMediaPicker';
import ReferenceStackPreview from './ReferenceStackPreview';
import ReferenceVideoPreviewDialog from './ReferenceVideoPreviewDialog';

function createAssetId(kind: UnifiedGeneratorReferenceMediaKind) {
  return `${kind}-${nanoid()}`;
}

function getImageDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: image.naturalWidth || image.width, height: image.naturalHeight || image.height });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('metadata-error'));
    };
    image.src = objectUrl;
  });
}

function getMediaDuration(source: File | string, kind: 'video' | 'audio') {
  return new Promise<number>((resolve, reject) => {
    const element = document.createElement(kind);
    const objectUrl = source instanceof File ? URL.createObjectURL(source) : source;
    const cleanUp = () => {
      element.onloadedmetadata = null;
      element.onerror = null;
      element.removeAttribute('src');
      element.load();
      if (source instanceof File) URL.revokeObjectURL(objectUrl);
    };
    element.preload = 'metadata';
    element.onloadedmetadata = () => {
      const duration = element.duration;
      cleanUp();
      Number.isFinite(duration) ? resolve(duration) : reject(new Error('invalid-duration'));
    };
    element.onerror = () => {
      cleanUp();
      reject(new Error('metadata-error'));
    };
    element.src = objectUrl;
  });
}

export default function ReferenceMediaUploads({
  model,
  images,
  videos,
  audios,
  visibleKinds,
  onImagesChange,
  onVideosChange,
  onAudiosChange,
}: {
  model: VideoModel;
  images: UnifiedGeneratorReferenceMediaAsset[];
  videos: UnifiedGeneratorReferenceMediaAsset[];
  audios: UnifiedGeneratorReferenceMediaAsset[];
  visibleKinds?: UnifiedGeneratorReferenceMediaKind[];
  onImagesChange: (assets: UnifiedGeneratorReferenceMediaAsset[]) => void;
  onVideosChange: (assets: UnifiedGeneratorReferenceMediaAsset[]) => void;
  onAudiosChange: (assets: UnifiedGeneratorReferenceMediaAsset[]) => void;
}) {
  const t = useTranslations('components.hero-form.reference-upload');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [pickerKind, setPickerKind] = useState<UnifiedGeneratorReferenceMediaKind | null>(null);
  const [replacement, setReplacement] = useState<{ kind: UnifiedGeneratorReferenceMediaKind; index: number; history: boolean } | null>(null);
  const [historyRequest, setHistoryRequest] = useState(0);
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);
  const [previewVideoIndex, setPreviewVideoIndex] = useState<number | null>(null);
  const [previewAudioIndex, setPreviewAudioIndex] = useState<number | null>(null);
  const [pendingAudioAsset, setPendingAudioAsset] = useState<UnifiedGeneratorReferenceMediaAsset | null>(null);
  const [hoveredPickerKind, setHoveredPickerKind] = useState<UnifiedGeneratorReferenceMediaKind | null>(null);
  const [collapseRevision, setCollapseRevision] = useState(0);

  const imageHistory = useImageHistory(1, Number.MAX_SAFE_INTEGER);
  const videoHistory = useVideoHistory({ pageNum: 1, pageSize: Number.MAX_SAFE_INTEGER });
  const imageHistoryAssets = useMemo<UnifiedGeneratorReferenceMediaAsset[]>(
    () =>
      imageHistory.data
        .filter(
          (item) => item.status !== 'processing' && item.status !== 'fail' && Boolean(item.url || item.thumbnailUrl),
        )
        .map((item) => ({
          id: `history-image-${item.id}`,
          kind: 'image',
          source: item.url || item.thumbnailUrl,
          name: item.prompt || item.modelInfo,
        })),
    [imageHistory.data],
  );
  const videoHistoryAssets = useMemo<UnifiedGeneratorReferenceMediaAsset[]>(
    () =>
      videoHistory.data
        .filter((item) => item.status === 'completed' && Boolean(item.videoUrl))
        .map((item) => ({
          id: `history-video-${item.id}`,
          kind: 'video',
          source: item.videoUrl,
          name: item.prompt || item.platformName,
        })),
    [videoHistory.data],
  );

  const configuredImageMax = model.options.multiImage?.isSupported
    ? model.options.multiImage.maxImages
    : model.options.startFrame?.isSupported
      ? model.options.endFrame?.isSupported
        ? 2
        : 1
      : 0;
  const configuredVideoMax = model.options.multiVideo?.isSupported ? model.options.multiVideo.maxVideos : 0;
  const configuredAudioMax = model.options.multiAudio?.isSupported ? model.options.multiAudio.maxAudios : 0;
  const subjectMax = model.options.maxReferenceSubjects;
  const imageMax =
    subjectMax === undefined
      ? configuredImageMax
      : Math.min(configuredImageMax, Math.max(subjectMax - videos.length, 0));
  const videoMax =
    subjectMax === undefined
      ? configuredVideoMax
      : Math.min(configuredVideoMax, Math.max(subjectMax - images.length, 0));
  const audioMax = configuredAudioMax;

  const getList = (kind: UnifiedGeneratorReferenceMediaKind) =>
    kind === 'image' ? images : kind === 'video' ? videos : audios;
  const getMax = (kind: UnifiedGeneratorReferenceMediaKind) =>
    kind === 'image' ? imageMax : kind === 'video' ? videoMax : audioMax;
  const setList = (kind: UnifiedGeneratorReferenceMediaKind, next: UnifiedGeneratorReferenceMediaAsset[]) => {
    if (kind === 'image') onImagesChange(next);
    if (kind === 'video') onVideosChange(next);
    if (kind === 'audio') onAudiosChange(next);
  };
  const acceptedFormats = (kind: UnifiedGeneratorReferenceMediaKind) => {
    const configured =
      kind === 'image'
        ? model.options.multiImage?.acceptedFormats
        : kind === 'video'
          ? model.options.multiVideo?.acceptedFormats
          : model.options.multiAudio?.acceptedFormats;
    return kind === 'audio' ? configured : normalizeMediaFormats(kind, configured);
  };

  const validateAsset = async (kind: UnifiedGeneratorReferenceMediaKind, source: File | string) => {
    if (source instanceof File) {
      const validType =
        kind === 'audio' ? source.type.startsWith('audio/') : isAcceptedMediaFile(source, kind, acceptedFormats(kind));
      if (!validType) {
        toast.error(t('unsupportedFormat'));
        return null;
      }
    }
    if (kind === 'image' && source instanceof File) {
      try {
        const dimensions = await getImageDimensions(source);
        const minSide = model.options.multiImage?.minSidePx || model.options.startFrame?.minSidePx || 300;
        const maxSide = model.options.multiImage?.maxSidePx || model.options.startFrame?.maxSidePx;
        if (dimensions.width < minSide || dimensions.height < minSide) {
          toast.error(t('imageDimensionMin', { value: minSide }));
          return null;
        }
        if (maxSide && (dimensions.width > maxSide || dimensions.height > maxSide)) {
          toast.error(t('imageDimensionMax', { value: maxSide }));
          return null;
        }
      } catch {
        toast.error(t('metadataError'));
        return null;
      }
    }
    if (kind === 'video' || kind === 'audio') {
      try {
        const videoMetadata = kind === 'video' ? await loadVideoMetadata(source) : null;
        const duration = videoMetadata?.duration ?? (await getMediaDuration(source, 'audio'));
        const config = kind === 'video' ? model.options.multiVideo : model.options.multiAudio;
        const videoConfig = kind === 'video' ? model.options.multiVideo : undefined;
        if (
          kind === 'video' &&
          videoMetadata &&
          videoConfig &&
          ((videoConfig.minSidePx !== undefined &&
            (videoMetadata.width < videoConfig.minSidePx || videoMetadata.height < videoConfig.minSidePx)) ||
            (videoConfig.maxSidePx !== undefined &&
              (videoMetadata.width > videoConfig.maxSidePx || videoMetadata.height > videoConfig.maxSidePx)))
        ) {
          toast.error(
            t('videoDimensionRange', {
              min: videoConfig.minSidePx || 0,
              max: videoConfig.maxSidePx || '∞',
            }),
          );
          return null;
        }
        if (config?.minDurationSeconds !== undefined && duration < config.minDurationSeconds) {
          toast.error(t('durationMin', { value: config.minDurationSeconds }));
          return null;
        }
        return {
          duration,
          trimRange:
            config?.maxDurationSeconds !== undefined && duration > config.maxDurationSeconds
              ? { startTime: 0, endTime: config.maxDurationSeconds }
              : undefined,
        };
      } catch {
        toast.error(t('metadataError'));
        return null;
      }
    }
    return {};
  };

  const appendSources = async (kind: UnifiedGeneratorReferenceMediaKind, sources: Array<File | string>) => {
    const list = getList(kind);
    const max = getMax(kind);
    if (replacement?.kind !== kind && list.length + sources.length > max) {
      toast.error(t('maxFiles', { count: max }));
      return;
    }
    const nextAssets: UnifiedGeneratorReferenceMediaAsset[] = [];
    for (const source of sources) {
      const mediaState = await validateAsset(kind, source);
      if (!mediaState) return;
      const asset: UnifiedGeneratorReferenceMediaAsset = {
        id: createAssetId(kind),
        kind,
        source,
        originalFile: source instanceof File ? source : undefined,
        name: source instanceof File ? source.name : undefined,
        ...mediaState,
      };
      if (kind === 'audio' && asset.trimRange) {
        setPendingAudioAsset(asset);
        setPickerKind(null);
        return;
      }
      if (kind === 'video' && asset.trimRange) {
        toast.error(
          t('mediaDuration', {
            type: t('video'),
            min: model.options.multiVideo?.minDurationSeconds || 0,
            max: model.options.multiVideo?.maxDurationSeconds || asset.duration || 0,
          }),
        );
        return;
      }
      nextAssets.push(asset);
    }
    if (replacement?.kind === kind && list[replacement.index] && nextAssets[0]) {
      setList(kind, list.map((asset, index) => index === replacement.index ? nextAssets[0]! : asset));
      setReplacement(null);
    } else {
      setList(kind, [...list, ...nextAssets].slice(0, max));
    }
    setPickerKind(null);
    setCollapseRevision((revision) => revision + 1);
  };

  const handleDropRejected = (rejections: FileRejection[], max: number) => {
    const hasTooMany = rejections.some((item) => item.errors.some((error) => error.code === 'too-many-files'));
    toast.error(hasTooMany ? t('maxFiles', { count: max }) : t('unsupportedFormat'));
  };

  const imageDropzone = useDropzone({
    accept: getMediaDropzoneAccept('image', acceptedFormats('image')),
    multiple: imageMax > 1,
    maxFiles: Math.max(imageMax - images.length, 1),
    disabled: imageMax === 0 || images.length >= imageMax,
    noClick: true,
    onDrop: (files) => void appendSources('image', files),
    onDropRejected: (rejections) => handleDropRejected(rejections, imageMax),
  });
  const videoDropzone = useDropzone({
    accept: getMediaDropzoneAccept('video', acceptedFormats('video')),
    multiple: videoMax > 1,
    maxFiles: Math.max(videoMax - videos.length, 1),
    disabled: videoMax === 0 || videos.length >= videoMax,
    noClick: true,
    onDrop: (files) => void appendSources('video', files),
    onDropRejected: (rejections) => handleDropRejected(rejections, videoMax),
  });
  const audioDropzone = useDropzone({
    accept: { 'audio/*': acceptedFormats('audio')?.map((format) => `.${format.replace(/^\./, '')}`) || [] },
    multiple: false,
    maxFiles: 1,
    disabled: audioMax === 0 || audios.length >= audioMax,
    noClick: true,
    onDrop: (files) => void appendSources('audio', files),
    onDropRejected: (rejections) => handleDropRejected(rejections, audioMax),
  });

  const renderPicker = (kind: UnifiedGeneratorReferenceMediaKind) => {
    const list = getList(kind);
    const max = getMax(kind);
    const inputRef = kind === 'image' ? imageInputRef : kind === 'video' ? videoInputRef : audioInputRef;
    const historyAssets = kind === 'image' ? imageHistoryAssets : kind === 'video' ? videoHistoryAssets : [];
    const historyLoading =
      kind === 'image' ? imageHistory.isLoading : kind === 'video' ? videoHistory.isLoading : false;
    const dropzone = kind === 'image' ? imageDropzone : kind === 'video' ? videoDropzone : audioDropzone;
    const emptyLabel = kind === 'image' ? t('addImage') : kind === 'video' ? t('addVideo') : t('addAudio');
    return (
      <div {...dropzone.getRootProps()} className='shrink-0'>
        <input
          ref={inputRef}
          type='file'
          accept={
            kind === 'audio'
              ? acceptedFormats('audio')
                  ?.map((format) => `.${format.replace(/^\./, '')}`)
                  .join(',') || 'audio/*'
              : getMediaInputAccept(kind, acceptedFormats(kind))
          }
          multiple={kind !== 'audio' && max > 1}
          className='hidden'
          onChange={(event) => {
            void appendSources(kind, Array.from(event.target.files || []));
            event.target.value = '';
          }}
        />
        <ReferenceMediaPicker
          open={pickerKind === kind}
          onOpenChange={(open) => setPickerKind(open ? kind : null)}
          onPanelHoverChange={(hovered) => setHoveredPickerKind(hovered ? kind : null)}
          kind={kind}
          canAdd={list.length < max || replacement?.kind === kind}
          historyRequested={replacement?.kind === kind && replacement.history ? historyRequest : 0}
          isHistoryLoading={historyLoading}
          historyAssets={historyAssets}
          acceptedFormats={acceptedFormats(kind)}
          historySelectionLimit={replacement?.kind === kind ? 1 : Math.max(max - list.length, 1)}
          onUploadFromDevice={() => inputRef.current?.click()}
          onSelectHistory={(assets) =>
            appendSources(
              kind,
              assets.map((asset) => asset.source),
            )
          }
          trigger={
            <ReferenceStackPreview
              kind={kind}
              assets={list}
              canAdd={list.length < max}
              disabled={max === 0}
              isDragActive={dropzone.isDragActive}
              isPanelHovered={hoveredPickerKind === kind}
              emptyLabel={emptyLabel}
              addLabel={t('addMore')}
              removeLabel={t('remove')}
              collapseRevision={collapseRevision}
              onOpenPicker={() => { setReplacement(null); setPickerKind(kind); }}
              onReplaceLocal={(index) => { setReplacement({ kind, index, history: false }); inputRef.current?.click(); }}
              onReplaceHistory={kind !== 'audio' ? (index) => { setReplacement({ kind, index, history: true }); setHistoryRequest((value) => value + 1); setPickerKind(kind); } : undefined}
              onPreview={(index) => {
                if (kind === 'image') setPreviewImageIndex(index);
                if (kind === 'video') setPreviewVideoIndex(index);
                if (kind === 'audio') setPreviewAudioIndex(index);
              }}
              onRemove={(index) =>
                setList(
                  kind,
                  list.filter((_, itemIndex) => itemIndex !== index),
                )
              }
            />
          }
        />
      </div>
    );
  };

  const selectedVideo = previewVideoIndex === null ? null : videos[previewVideoIndex] || null;
  const selectedAudio = pendingAudioAsset || (previewAudioIndex === null ? null : audios[previewAudioIndex] || null);

  return (
    <>
      <div className='flex flex-wrap items-center gap-2'>
        {(!visibleKinds || visibleKinds.includes('image')) && (imageMax > 0 || images.length > 0)
          ? renderPicker('image')
          : null}
        {(!visibleKinds || visibleKinds.includes('video')) && (videoMax > 0 || videos.length > 0)
          ? renderPicker('video')
          : null}
        {(!visibleKinds || visibleKinds.includes('audio')) && (audioMax > 0 || audios.length > 0)
          ? renderPicker('audio')
          : null}
      </div>

      <ReferenceImagePreviewDialog
        assets={images}
        selectedIndex={previewImageIndex}
        onSelectedIndexChange={setPreviewImageIndex}
        onOpenChange={(open) => {
          if (!open) setPreviewImageIndex(null);
        }}
        onRemove={(index) => onImagesChange(images.filter((_, itemIndex) => itemIndex !== index))}
        onReplace={async (index, file) => {
          const valid = await validateAsset('image', file);
          if (!valid) return false;
          onImagesChange(
            images.map((asset, itemIndex) =>
              itemIndex === index ? { ...asset, source: file, originalFile: file, name: file.name } : asset,
            ),
          );
          return true;
        }}
      />
      <ReferenceVideoPreviewDialog
        asset={selectedVideo}
        minDuration={model.options.multiVideo?.minDurationSeconds}
        maxDuration={model.options.multiVideo?.maxDurationSeconds}
        onOpenChange={(open) => {
          if (!open) setPreviewVideoIndex(null);
        }}
        onRemove={() => {
          if (previewVideoIndex !== null) onVideosChange(videos.filter((_, index) => index !== previewVideoIndex));
          setPreviewVideoIndex(null);
        }}
        onConfirmTrim={async (startTime, endTime) => {
          if (previewVideoIndex === null) return false;
          onVideosChange(
            videos.map((asset, index) =>
              index === previewVideoIndex
                ? { ...asset, trimRange: { startTime, endTime }, duration: endTime - startTime }
                : asset,
            ),
          );
          return true;
        }}
      />
      {selectedAudio ? (
        <ReferenceAudioPreviewDialog
          asset={selectedAudio}
          minDuration={model.options.multiAudio?.minDurationSeconds || 0}
          maxDuration={model.options.multiAudio?.maxDurationSeconds || selectedAudio.duration || 30}
          onOpenChange={(open) => {
            if (!open) {
              setPendingAudioAsset(null);
              setPreviewAudioIndex(null);
            }
          }}
          onRemove={() => {
            if (pendingAudioAsset) setPendingAudioAsset(null);
            if (previewAudioIndex !== null) onAudiosChange(audios.filter((_, index) => index !== previewAudioIndex));
            setPreviewAudioIndex(null);
          }}
          onConfirmTrim={async (startTime, endTime) => {
            if (pendingAudioAsset) {
              onAudiosChange(
                [
                  ...audios,
                  {
                    ...pendingAudioAsset,
                    trimRange: { startTime, endTime },
                    duration: endTime - startTime,
                  },
                ].slice(0, audioMax),
              );
              setPendingAudioAsset(null);
              setCollapseRevision((revision) => revision + 1);
              return true;
            }
            if (previewAudioIndex === null) return false;
            onAudiosChange(
              audios.map((asset, index) =>
                index === previewAudioIndex
                  ? { ...asset, trimRange: { startTime, endTime }, duration: endTime - startTime }
                  : asset,
              ),
            );
            return true;
          }}
        />
      ) : null}
    </>
  );
}
