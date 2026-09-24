// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
import { resolveCanvasMusicValues } from './canvas-music-results';
import type { CanvasImageAngleParams } from '../../components/canvas/canvas-node-angle-dialog';
import type { NodeGenerationInput } from '../../components/canvas/canvas-node-generation';
import type { CanvasNodeGenerationMode } from '../../components/canvas/canvas-node-prompt-panel';
import i18n from '../../i18n';
import type { UploadedFile } from '../../services/file-storage';
import type { UploadedImage } from '../../services/image-storage';
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { defaultConfig, resolveModelForCapability, type AiConfig } from '../../stores/use-config-store';
import {
  CanvasNodeType,
  type CanvasAssistantSession,
  type CanvasConnection,
  type CanvasNodeData,
  type CanvasNodeMetadata,
} from '../../types/canvas';
import type { ReferenceImage } from '../../types/image';
import { audioMetadata, imageMetadata, referenceUrl, videoMetadata } from './canvas-node-factory';

type UploadCanvasImage = (input: string | Blob) => Promise<UploadedImage>;
type UploadCanvasMedia = (input: string | Blob, media: 'audio' | 'video') => Promise<UploadedFile>;

export function imageExtension(dataUrl: string) {
  return dataUrl.match(/^data:image[/]([^;]+)/)?.[1] || dataUrl.match(/image[/]([^;]+)/)?.[1] || 'png';
}

export function audioExtension(mimeType?: string) {
  if (mimeType?.includes('wav')) return 'wav';
  if (mimeType?.includes('opus')) return 'opus';
  if (mimeType?.includes('aac')) return 'aac';
  if (mimeType?.includes('flac')) return 'flac';
  if (mimeType?.includes('pcm')) return 'pcm';
  return 'mp3';
}

export function generationReferenceUrls(context: {
  referenceImages: ReferenceImage[];
  referenceVideos: Array<{ storageKey?: string; url?: string }>;
  referenceAudios?: Array<{ storageKey?: string; url?: string }>;
}) {
  return [
    ...context.referenceImages.map(referenceUrl).filter((url): url is string => Boolean(url)),
    ...context.referenceVideos
      .map((video) => video.url || (/^https?:\/\//i.test(video.storageKey || '') ? video.storageKey : undefined))
      .filter((url): url is string => Boolean(url)),
    ...(context.referenceAudios || [])
      .map((audio) => audio.url || (/^https?:\/\//i.test(audio.storageKey || '') ? audio.storageKey : undefined))
      .filter((url): url is string => Boolean(url)),
  ];
}

export async function resolveMetadataReferences(metadata: CanvasNodeMetadata) {
  if (metadata.generationType !== 'edit') return [];
  if (!metadata.references?.length) return null;
  const references = await Promise.all(
    metadata.references.map(async (url, index) => {
      return /^https?:\/\//i.test(url)
        ? {
            id: `${index}`,
            name: `reference-${index}.png`,
            type: 'image/png',
            dataUrl: url,
          }
        : null;
    }),
  );
  return references.every(Boolean) ? (references as ReferenceImage[]) : null;
}

export async function hydrateCanvasImages(
  nodes: CanvasNodeData[],
  uploadCanvasImage: UploadCanvasImage,
  uploadCanvasMedia: UploadCanvasMedia,
) {
  const imageUploads = new Map<string, Promise<UploadedImage>>();
  const adoptImage = async (content: string) => {
    const source = content;
    let upload = imageUploads.get(source);
    if (!upload) {
      upload = uploadCanvasImage(source);
      imageUploads.set(source, upload);
    }
    return upload;
  };

  return Promise.all(
    nodes.map(async (node) => {
      const content = node.metadata?.content;
      if (
        (node.type === CanvasNodeType.Video || node.type === CanvasNodeType.Audio) &&
        content &&
        !/^https?:\/\//i.test(content)
      ) {
        const mediaType = node.type === CanvasNodeType.Video ? 'video' : 'audio';
        const media = await uploadCanvasMedia(content, mediaType);
        return {
          ...node,
          metadata: {
            ...node.metadata,
            ...(mediaType === 'video' ? videoMetadata(media) : audioMetadata(media)),
          },
        };
      }
      if (node.type !== CanvasNodeType.Image || !content) return node;
      const images = await Promise.all(
        (node.metadata?.images || []).map(async (image) => {
          if (!image.content || /^https?:\/\//i.test(image.content)) return image;
          const uploaded = await adoptImage(image.content);
          return {
            ...image,
            content: uploaded.url,
            storageKey: '',
            naturalWidth: uploaded.width,
            naturalHeight: uploaded.height,
            bytes: uploaded.bytes,
            mimeType: uploaded.mimeType,
          };
        }),
      );
      if (/^https?:\/\//i.test(content)) {
        return { ...node, metadata: { ...node.metadata, images } };
      }
      const uploaded = await adoptImage(content);
      return { ...node, metadata: { ...node.metadata, ...imageMetadata(uploaded), images } };
    }),
  );
}

export async function hydrateAssistantImages(
  sessions: CanvasAssistantSession[],
  uploadCanvasImage: UploadCanvasImage,
) {
  const hydrateItem = async <T extends { dataUrl?: string; storageKey?: string }>(item: T) => {
    if (item.dataUrl && !/^https?:\/\//i.test(item.dataUrl)) {
      const source = item.dataUrl;
      if (!source) return item;
      const image = await uploadCanvasImage(source);
      return { ...item, dataUrl: image.url, storageKey: '' };
    }
    return item;
  };
  return Promise.all(
    sessions.map(async (session) => ({
      ...session,
      messages: await Promise.all(
        session.messages.map(async (message) => ({
          ...message,
          references: await Promise.all((message.references || []).map(hydrateItem)),
        })),
      ),
    })),
  );
}

export function getGenerationCount(count: string) {
  return Math.max(1, Math.min(15, Math.floor(Math.abs(Number(count)) || 1)));
}

export function getInputSummary(inputs: NodeGenerationInput[]) {
  const durationSeconds = (media: 'video' | 'audio') => {
    const durations = inputs.map((input) => input[media]?.durationMs).filter(
      (duration): duration is number => typeof duration === 'number' && Number.isFinite(duration) && duration >= 0,
    );
    return durations.length ? durations.reduce((sum, duration) => sum + duration, 0) / 1000 : undefined;
  };
  const videoDuration = durationSeconds('video');
  const audioDuration = durationSeconds('audio');
  return {
    textCount: inputs.filter((input) => input.type === 'text').length,
    imageCount: inputs.filter((input) => input.type === 'image').length,
    videoCount: inputs.filter((input) => input.type === 'video').length,
    audioCount: inputs.filter((input) => input.type === 'audio').length,
    referenceVideoDurationSeconds: videoDuration,
    referenceAudioDurationSeconds: audioDuration,
    referenceDurationSeconds: videoDuration === undefined && audioDuration === undefined
      ? undefined
      : (videoDuration ?? 0) + (audioDuration ?? 0),
  };
}

export function getGenerationPriceInputSummary(node: CanvasNodeData, inputs: NodeGenerationInput[]) {
  const references = node.type === CanvasNodeType.Video && node.metadata?.content
    ? [
        ...inputs.filter((input) => input.nodeId !== node.id),
        {
          nodeId: node.id,
          type: 'video' as const,
          title: node.title,
          video: { id: node.id, name: node.title, type: 'video/mp4', url: node.metadata.content, durationMs: node.metadata.durationMs },
        },
      ]
    : inputs;
  const summary = getInputSummary(references);
  // Image editing submits the node's own image instead of its upstream image references.
  return node.type === CanvasNodeType.Image && node.metadata?.content ? { ...summary, imageCount: 1 } : summary;
}

export function buildGenerationConfig(
  config: AiConfig,
  node: CanvasNodeData | undefined,
  mode: CanvasNodeGenerationMode,
): AiConfig {
  return {
    ...config,
    music: resolveCanvasMusicValues(node),
    model: resolveModelForCapability(config, node?.metadata?.model, mode),
    seed: node?.metadata?.seed ?? config.seed,
    negativePrompt: node?.metadata?.negativePrompt ?? config.negativePrompt,
    isTranslate: node?.metadata?.isTranslate ?? config.isTranslate,
    imageResolution: node?.metadata?.imageResolution || config.imageResolution || defaultConfig.imageResolution,
    imageVersion: node?.metadata?.imageVersion ?? node?.metadata?.quality ?? config.imageVersion,
    reasoningEffort: node?.metadata?.reasoningEffort || config.reasoningEffort || defaultConfig.reasoningEffort,
    quality: node?.metadata?.quality || config.quality || defaultConfig.quality,
    size: node?.metadata?.size || config.size || defaultConfig.size,
    background: node?.metadata?.background ?? config.background ?? defaultConfig.background,
    videoSeconds: node?.metadata?.seconds || config.videoSeconds || defaultConfig.videoSeconds,
    vquality: node?.metadata?.vquality || config.vquality || defaultConfig.vquality,
    videoGenerateAudio: node?.metadata?.generateAudio || config.videoGenerateAudio || defaultConfig.videoGenerateAudio,
    videoWatermark: node?.metadata?.watermark || config.videoWatermark || defaultConfig.videoWatermark,
    audioVoice: node?.metadata?.audioVoice || config.audioVoice || defaultConfig.audioVoice,
    audioFormat: node?.metadata?.audioFormat || config.audioFormat || defaultConfig.audioFormat,
    audioSpeed: node?.metadata?.audioSpeed || config.audioSpeed || defaultConfig.audioSpeed,
    audioInstructions: node?.metadata?.audioInstructions || config.audioInstructions || defaultConfig.audioInstructions,
    count:
      mode === 'image'
        ? '1'
        : String(node?.metadata?.count || config.count || defaultConfig.count),
  };
}

export function isGenerationCanceled(error: unknown) {
  return error instanceof Error && (error.message === i18n.t('common.requestCanceled') || error.name === 'AbortError');
}

export function findRetrySourceNode(nodeId: string, nodes: CanvasNodeData[], connections: CanvasConnection[]) {
  const queue = connections
    .filter((connection) => connection.toNodeId === nodeId)
    .map((connection) => connection.fromNodeId);
  const visited = new Set<string>();
  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const node = nodes.find((item) => item.id === id);
    if (node?.type === CanvasNodeType.Config) return node;
    connections
      .filter((connection) => connection.toNodeId === id)
      .forEach((connection) => queue.push(connection.fromNodeId));
  }
  return null;
}

export function sourceNodeReferenceImages(node: CanvasNodeData | null) {
  if (!node || node.type !== CanvasNodeType.Image || !node.metadata?.content) return [];
  return [
    {
      id: node.id,
      name: `${node.title || node.id}.png`,
      type: node.metadata.mimeType || 'image/png',
      dataUrl: node.metadata.content,
      storageKey: node.metadata.storageKey,
    },
  ];
}

export function isAudioFile(file: File) {
  return file.type.startsWith('audio/') || /\.(mp3|wav)$/i.test(file.name);
}

export function buildAngleLabel(params: CanvasImageAngleParams) {
  const horizontal =
    params.horizontalAngle === 0
      ? i18n.t('canvas.generation.front')
      : params.horizontalAngle > 0
        ? i18n.t('canvas.generation.rotateRight', { angle: params.horizontalAngle })
        : i18n.t('canvas.generation.rotateLeft', { angle: Math.abs(params.horizontalAngle) });
  const pitch =
    params.pitchAngle === 0
      ? i18n.t('canvas.generation.level')
      : params.pitchAngle > 0
        ? i18n.t('canvas.generation.topDown', { angle: params.pitchAngle })
        : i18n.t('canvas.generation.lowAngle', { angle: Math.abs(params.pitchAngle) });
  return i18n.t('canvas.generation.angleLabel', {
    horizontal,
    pitch,
    distance: params.cameraDistance.toFixed(1),
    lens: i18n.t(params.wideAngle ? 'canvas.editors.wide' : 'canvas.editors.standard'),
  });
}

export function buildAnglePrompt(params: CanvasImageAngleParams) {
  return i18n.t('canvas.generation.anglePrompt', { angle: buildAngleLabel(params) });
}
