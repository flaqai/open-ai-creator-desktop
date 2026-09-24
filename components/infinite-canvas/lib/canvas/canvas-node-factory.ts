// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { ensureCanvasNodeMinimumSize, getNodeSpec, NODE_DEFAULT_SIZE } from '../../constant/canvas';
import type { UploadedFile } from '../../services/file-storage';
import type { UploadedImage } from '../../services/image-storage';
import type { AiConfig } from '../../stores/use-config-store';
import {
  CanvasNodeType,
  type CanvasImageGenerationType,
  type CanvasNodeData,
  type CanvasNodeMetadata,
  type CanvasNodeTypeId,
  type Position,
} from '../../types/canvas';
import type { ReferenceImage } from '../../types/image';
import { nodeSizeFromRatio } from './canvas-node-size';

export function createCanvasNode(
  type: CanvasNodeTypeId,
  position: Position,
  metadata?: CanvasNodeMetadata,
): CanvasNodeData {
  const spec = getNodeSpec(type);
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return ensureCanvasNodeMinimumSize({
    id,
    type,
    title: spec.title,
    position: {
      x: position.x - spec.width / 2,
      y: position.y - spec.height / 2,
    },
    width: spec.width,
    height: spec.height,
    metadata: { ...spec.metadata, ...metadata },
  });
}

export function imageMetadata(image: UploadedImage): CanvasNodeMetadata {
  return {
    content: image.url,
    storageKey: image.storageKey,
    status: 'success',
    naturalWidth: image.width,
    naturalHeight: image.height,
    bytes: image.bytes,
    mimeType: image.mimeType,
  };
}

export function videoMetadata(video: UploadedFile): CanvasNodeMetadata {
  return {
    content: video.url,
    storageKey: video.storageKey,
    status: 'success',
    naturalWidth: video.width,
    naturalHeight: video.height,
    bytes: video.bytes,
    mimeType: video.mimeType || 'video/mp4',
    durationMs: video.durationMs,
  };
}

export function audioMetadata(audio: UploadedFile): CanvasNodeMetadata {
  return {
    content: audio.url,
    storageKey: audio.storageKey,
    status: 'success',
    bytes: audio.bytes,
    mimeType: audio.mimeType || 'audio/mpeg',
    durationMs: audio.durationMs,
  };
}

export function referenceUrl(image: ReferenceImage) {
  return (
    image.url ||
    (/^https?:\/\//i.test(image.dataUrl) ? image.dataUrl : undefined) ||
    (/^https?:\/\//i.test(image.storageKey || '') ? image.storageKey : undefined)
  );
}

export function buildImageGenerationMetadata(
  type: CanvasImageGenerationType,
  config: AiConfig,
  count: number,
  references: ReferenceImage[],
): CanvasNodeMetadata {
  return {
    generationType: type,
    model: config.model,
    ...buildAdvancedGenerationMetadata(config),
    size: config.size,
    quality: config.quality,
    imageResolution: config.imageResolution,
    imageVersion: config.imageVersion,
    ...(config.background ? { background: config.background } : {}),
    count,
    references: references.map(referenceUrl).filter((url): url is string => Boolean(url)),
  };
}

export function buildAdvancedGenerationMetadata(config: AiConfig): CanvasNodeMetadata {
  return {
    ...(config.seed === undefined ? {} : { seed: config.seed }),
    ...(config.negativePrompt === undefined ? {} : { negativePrompt: config.negativePrompt }),
    ...(config.isTranslate === undefined ? {} : { isTranslate: config.isTranslate }),
  };
}

export function buildAudioGenerationMetadata(config: AiConfig): CanvasNodeMetadata {
  return {
    model: config.model,
    audioVoice: config.audioVoice,
  };
}

export function applyNodeConfigPatch(node: CanvasNodeData, patch: Partial<CanvasNodeData['metadata']>) {
  const safePatch = patch || {};
  const next = ensureCanvasNodeMinimumSize({ ...node, metadata: { ...node.metadata, ...safePatch } });
  const spec =
    node.type === CanvasNodeType.Video
      ? NODE_DEFAULT_SIZE[CanvasNodeType.Video]
      : NODE_DEFAULT_SIZE[CanvasNodeType.Image];
  const size =
    typeof safePatch.size === 'string' && !node.metadata?.content
      ? nodeSizeFromRatio(safePatch.size, spec.width, spec.height)
      : null;
  return size && (node.type === CanvasNodeType.Image || node.type === CanvasNodeType.Video)
    ? {
        ...next,
        ...size,
        position: {
          x: node.position.x + node.width / 2 - size.width / 2,
          y: node.position.y + node.height / 2 - size.height / 2,
        },
      }
    : next;
}
