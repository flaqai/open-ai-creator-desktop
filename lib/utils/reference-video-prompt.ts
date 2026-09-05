import type {
  UnifiedGeneratorReferenceMediaAsset,
  UnifiedGeneratorReferenceMediaKind,
  UnifiedGeneratorReferencePromptNode,
} from '@/lib/constants/unified-generator/types';

export type UnifiedGeneratorReferenceMentionAsset = {
  assetId: string;
  id: string;
  kind: UnifiedGeneratorReferenceMediaKind;
  source: File | string;
  name?: string;
};

const REFERENCE_MENTION_TOKEN_REGEX = /@((?:image|video|audio)_\d+)|<<<((?:image|video|audio)_\d+)>>>/g;

function getContent(doc: unknown): UnifiedGeneratorReferencePromptNode[] {
  if (!doc || typeof doc !== 'object') {
    return [];
  }

  const node = doc as UnifiedGeneratorReferencePromptNode;
  return Array.isArray(node.content) ? node.content : [];
}

function getReferenceMentionAssets(
  imageList: UnifiedGeneratorReferenceMediaAsset[],
  videoList: UnifiedGeneratorReferenceMediaAsset[],
  audioList: UnifiedGeneratorReferenceMediaAsset[] = [],
): UnifiedGeneratorReferenceMentionAsset[] {
  return [
    ...imageList.map((asset, index) => ({
      assetId: asset.id,
      id: `image_${index + 1}`,
      kind: 'image' as const,
      source: asset.source,
      name: asset.name,
    })),
    ...videoList.map((asset, index) => ({
      assetId: asset.id,
      id: `video_${index + 1}`,
      kind: 'video' as const,
      source: asset.source,
      name: asset.name,
    })),
    ...audioList.map((asset, index) => ({
      assetId: asset.id,
      id: `audio_${index + 1}`,
      kind: 'audio' as const,
      source: asset.source,
      name: asset.name,
    })),
  ];
}

function createTextNode(text: string): UnifiedGeneratorReferencePromptNode | null {
  return text ? { type: 'text', text } : null;
}

function createMentionNode(asset: UnifiedGeneratorReferenceMentionAsset): UnifiedGeneratorReferencePromptNode {
  return {
    type: 'mention',
    attrs: {
      id: asset.id,
      assetId: asset.assetId,
      label: `@${asset.id}`,
      kind: asset.kind,
    },
  };
}

function createReferencePromptParagraph(
  line: string,
  assetMap: Map<string, UnifiedGeneratorReferenceMentionAsset>,
): UnifiedGeneratorReferencePromptNode {
  const content: UnifiedGeneratorReferencePromptNode[] = [];
  let lastIndex = 0;

  line.replace(
    REFERENCE_MENTION_TOKEN_REGEX,
    (token: string, mentionId: string | undefined, serializedId: string | undefined, index: number) => {
      const leadingTextNode = createTextNode(line.slice(lastIndex, index));
      if (leadingTextNode) {
        content.push(leadingTextNode);
      }

      const id = mentionId || serializedId;
      const asset = id ? assetMap.get(id) : undefined;
      content.push(asset ? createMentionNode(asset) : { type: 'text', text: token });
      lastIndex = index + token.length;

      return token;
    },
  );

  const trailingTextNode = createTextNode(line.slice(lastIndex));
  if (trailingTextNode) {
    content.push(trailingTextNode);
  }

  return {
    type: 'paragraph',
    content,
  };
}

function getMentionAsset(node: UnifiedGeneratorReferencePromptNode, assets: UnifiedGeneratorReferenceMentionAsset[]) {
  if (node.attrs?.assetId) {
    return assets.find((asset) => asset.assetId === node.attrs?.assetId);
  }

  return assets.find((asset) => asset.id === node.attrs?.id);
}

function serializeNode(
  node: UnifiedGeneratorReferencePromptNode,
  assets: UnifiedGeneratorReferenceMentionAsset[],
): string {
  if (node.type === 'text') {
    return node.text || '';
  }

  if (node.type === 'mention' && node.attrs?.id) {
    const asset = getMentionAsset(node, assets);
    return `<<<${asset?.id || node.attrs.id}>>>`;
  }

  if (Array.isArray(node.content)) {
    return node.content.map((child) => serializeNode(child, assets)).join('');
  }

  return '';
}

function collectMissingMentionIds(
  node: UnifiedGeneratorReferencePromptNode,
  assets: UnifiedGeneratorReferenceMentionAsset[],
  ids: Set<string>,
) {
  if (node.type === 'mention' && node.attrs?.id && !getMentionAsset(node, assets)) {
    ids.add(node.attrs.id);
  }

  node.content?.forEach((child) => collectMissingMentionIds(child, assets, ids));
}

export const EMPTY_REFERENCE_PROMPT_DOC: UnifiedGeneratorReferencePromptNode = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [],
    },
  ],
};

export function buildReferenceMentionAssets(
  imageList: UnifiedGeneratorReferenceMediaAsset[],
  videoList: UnifiedGeneratorReferenceMediaAsset[],
  audioList: UnifiedGeneratorReferenceMediaAsset[] = [],
) {
  return getReferenceMentionAssets(imageList, videoList, audioList);
}

export function serializeReferencePrompt(
  editorJson: unknown,
  imageList: UnifiedGeneratorReferenceMediaAsset[] = [],
  videoList: UnifiedGeneratorReferenceMediaAsset[] = [],
  audioList: UnifiedGeneratorReferenceMediaAsset[] = [],
): string {
  if (typeof editorJson === 'string') {
    return editorJson.trim();
  }

  const assets = getReferenceMentionAssets(imageList, videoList, audioList);

  return getContent(editorJson)
    .map((node) => serializeNode(node, assets))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function getReferencePromptLength(editorJson: unknown): number {
  return serializeReferencePrompt(editorJson).length;
}

export function createReferencePromptDocFromText(
  prompt: string,
  imageList: UnifiedGeneratorReferenceMediaAsset[] = [],
  videoList: UnifiedGeneratorReferenceMediaAsset[] = [],
  audioList: UnifiedGeneratorReferenceMediaAsset[] = [],
): UnifiedGeneratorReferencePromptNode {
  const assets = getReferenceMentionAssets(imageList, videoList, audioList);
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));
  const lines = prompt.split(/\r?\n/);

  return {
    type: 'doc',
    content: lines.map((line) => createReferencePromptParagraph(line, assetMap)),
  };
}

export function validateReferencePromptReferences(
  editorJson: unknown,
  imageList: UnifiedGeneratorReferenceMediaAsset[],
  videoList: UnifiedGeneratorReferenceMediaAsset[],
  audioList: UnifiedGeneratorReferenceMediaAsset[] = [],
): string[] {
  const assets = getReferenceMentionAssets(imageList, videoList, audioList);
  const ids = new Set<string>();
  getContent(editorJson).forEach((node) => collectMissingMentionIds(node, assets, ids));
  return Array.from(ids);
}
