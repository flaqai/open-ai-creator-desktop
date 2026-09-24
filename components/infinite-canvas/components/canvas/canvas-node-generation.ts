// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
import i18n from '../../i18n';
import { getGenerationResourceNodes } from '../../lib/canvas/canvas-resource-references';
import { imageReferenceLabel } from '../../lib/image-reference-prompt';
import { seedanceReferenceLabel } from '../../lib/seedance-video';
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import type { SourceTextMessage as AiTextMessage } from '../../runtime/generation/source-generation-runtime';
import { CanvasNodeType, type CanvasConnection, type CanvasNodeData } from '../../types/canvas';
import type { ReferenceImage } from '../../types/image';
import type { ReferenceAudio, ReferenceVideo } from '../../types/media';

export type NodeGenerationContext = {
  prompt: string;
  referenceImages: ReferenceImage[];
  referenceVideos: ReferenceVideo[];
  referenceAudios: ReferenceAudio[];
  textCount: number;
  imageCount: number;
  videoCount: number;
  audioCount: number;
};

export type NodeGenerationInput = {
  nodeId: string;
  type: 'text' | 'image' | 'video' | 'audio';
  title: string;
  text?: string;
  image?: ReferenceImage;
  video?: ReferenceVideo;
  audio?: ReferenceAudio;
};

export function resolveMusicComposerPrompt(prompt: string, inputs: NodeGenerationInput[]): string {
  return prompt.replace(/@\[node:([^\]]+)\]/g, (_match, nodeId: string) => {
    const input = inputs.find((item) => item.nodeId === nodeId);
    return input ? input.text || inputLabel(input, inputs) : '';
  });
}

export function buildNodeGenerationContext(
  nodeId: string,
  nodes: CanvasNodeData[],
  connections: CanvasConnection[],
  prompt: string,
): NodeGenerationContext {
  const inputs = buildNodeGenerationInputs(nodeId, nodes, connections);
  const sourceNode = nodes.find((node) => node.id === nodeId);
  if (sourceNode?.type === CanvasNodeType.Config && Boolean(sourceNode.metadata?.composerContent?.trim())) {
    return buildComposerGenerationContext(inputs, prompt);
  }

  const upstreamText = inputs
    .map((input) => input.text)
    .filter(Boolean)
    .join('\n\n');
  const referenceImages = inputs.map((input) => input.image).filter((image): image is ReferenceImage => Boolean(image));
  const referenceVideos = inputs.map((input) => input.video).filter((video): video is ReferenceVideo => Boolean(video));
  const referenceAudios = inputs.map((input) => input.audio).filter((audio): audio is ReferenceAudio => Boolean(audio));

  return {
    prompt: upstreamText ? `${prompt}\n\n${upstreamText}` : prompt,
    referenceImages,
    referenceVideos,
    referenceAudios,
    textCount: inputs.filter((input) => input.type === 'text').length,
    imageCount: referenceImages.length,
    videoCount: referenceVideos.length,
    audioCount: referenceAudios.length,
  };
}

function buildComposerGenerationContext(inputs: NodeGenerationInput[], prompt: string): NodeGenerationContext {
  const inputByNodeId = new Map(inputs.map((input) => [input.nodeId, input]));
  const labelByNodeId = new Map<string, string>();
  const textBlocks: string[] = [];
  const mentionedTextIds = new Set<string>();
  let lastIndex = 0;
  let nextPrompt = '';

  for (const match of prompt.matchAll(/@\[node:([^\]]+)\]/g)) {
    if (match.index === undefined) continue;
    nextPrompt += prompt.slice(lastIndex, match.index);
    const input = inputByNodeId.get(match[1] ?? '');
    if (input) {
      let label = labelByNodeId.get(input.nodeId);
      if (!label) {
        label = inputLabel(input, inputs);
        labelByNodeId.set(input.nodeId, label);
        if (input.type === 'text') {
          mentionedTextIds.add(input.nodeId);
          textBlocks.push(`【${label}】\n${input.text || ''}`);
        }
      }
      nextPrompt += input.type === 'text' ? `【${label}】` : label;
    }
    lastIndex = match.index + match[0].length;
  }

  nextPrompt += prompt.slice(lastIndex);
  for (const input of inputs) {
    if (input.type === 'text' && !mentionedTextIds.has(input.nodeId)) {
      textBlocks.push(`【${inputLabel(input, inputs)}】\n${input.text || ''}`);
    }
  }
  if (textBlocks.length) nextPrompt = `${nextPrompt.trim()}\n\n${textBlocks.join('\n\n')}`;
  const referenceImages = inputs
    .map((input) => input.image)
    .filter((image): image is ReferenceImage => Boolean(image));
  const referenceVideos = inputs
    .map((input) => input.video)
    .filter((video): video is ReferenceVideo => Boolean(video));
  const referenceAudios = inputs
    .map((input) => input.audio)
    .filter((audio): audio is ReferenceAudio => Boolean(audio));
  return {
    prompt: nextPrompt,
    referenceImages,
    referenceVideos,
    referenceAudios,
    textCount: inputs.filter((input) => input.type === 'text').length,
    imageCount: referenceImages.length,
    videoCount: referenceVideos.length,
    audioCount: referenceAudios.length,
  };
}

export function buildNodeGenerationInputs(
  nodeId: string,
  nodes: CanvasNodeData[],
  connections: CanvasConnection[],
): NodeGenerationInput[] {
  return getGenerationResourceNodes(nodeId, nodes, connections).flatMap((node): NodeGenerationInput[] => {
    const image = readReferenceImage(node);
    if (image) return [{ nodeId: node.id, type: 'image' as const, title: node.title, image }];
    const video = readReferenceVideo(node);
    if (video) return [{ nodeId: node.id, type: 'video' as const, title: node.title, video }];
    const audio = readReferenceAudio(node);
    if (audio) return [{ nodeId: node.id, type: 'audio' as const, title: node.title, audio }];
    const text = readNodeTextInput(node);
    if (text) return [{ nodeId: node.id, type: 'text' as const, title: node.title, text }];
    return [];
  });
}

export function buildNodeResponseMessages(context: NodeGenerationContext): AiTextMessage[] {
  if (!context.referenceImages.length) {
    return [{ role: 'user', content: context.prompt }];
  }

  return [
    {
      role: 'user',
      content: [
        { type: 'text' as const, text: context.prompt },
        ...context.referenceImages.map((image) => ({ type: 'image_url' as const, image_url: { url: image.dataUrl } })),
      ],
    },
  ];
}

export async function hydrateNodeGenerationContext(context: NodeGenerationContext) {
  const { imageToDataUrl } = await import('../../services/image-storage');
  return {
    ...context,
    referenceImages: await Promise.all(
      context.referenceImages.map(async (image) => ({ ...image, dataUrl: await imageToDataUrl(image) })),
    ),
  };
}

function readNodeTextInput(node: CanvasNodeData) {
  if (node.type === CanvasNodeType.Text) return node.metadata?.content || node.metadata?.prompt || '';
  return node.metadata?.prompt || '';
}

function generationLabel(type: NodeGenerationInput['type'], index: number) {
  if (type === 'image') return imageReferenceLabel(index);
  if (type === 'video') return seedanceReferenceLabel('video', index);
  if (type === 'audio') return seedanceReferenceLabel('audio', index);
  return i18n.t('canvas.composer.resources.text', { index: index + 1 });
}

function inputLabel(input: NodeGenerationInput, inputs: NodeGenerationInput[]) {
  const index = inputs.filter((item) => item.type === input.type).findIndex((item) => item.nodeId === input.nodeId);
  return generationLabel(input.type, index);
}

function readReferenceImage(node: CanvasNodeData): ReferenceImage | null {
  const metadata = node.metadata;
  const content = metadata?.content;
  if (node.type !== CanvasNodeType.Image || !content || !/^https?:\/\//i.test(content)) return null;
  return {
    id: node.id,
    name: `${node.title || node.id}.png`,
    type: metadata.mimeType || 'image/png',
    dataUrl: content,
    url: content,
    storageKey: metadata.storageKey,
  };
}

function readReferenceVideo(node: CanvasNodeData): ReferenceVideo | null {
  const metadata = node.metadata;
  const content = metadata?.content;
  if (node.type !== CanvasNodeType.Video || !content || !/^https?:\/\//i.test(content)) return null;
  return {
    id: node.id,
    name: `${node.title || node.id}.mp4`,
    type: metadata.mimeType || 'video/mp4',
    url: content,
    storageKey: metadata.storageKey,
    bytes: metadata.bytes,
    width: metadata.naturalWidth,
    height: metadata.naturalHeight,
    durationMs: metadata.durationMs,
  };
}

function readReferenceAudio(node: CanvasNodeData): ReferenceAudio | null {
  const metadata = node.metadata;
  const content = metadata?.content;
  if (node.type !== CanvasNodeType.Audio || !content || !/^https?:\/\//i.test(content)) return null;
  return {
    id: node.id,
    name: `${node.title || node.id}.mp3`,
    type: metadata.mimeType || 'audio/mpeg',
    url: content,
    storageKey: metadata.storageKey,
    durationMs: metadata.durationMs,
  };
}
