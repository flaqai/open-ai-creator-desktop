// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import i18n from '../i18n';
import { getNodeSpec as getRegistryNodeSpec } from '../lib/canvas/node-registry';
import { CanvasNodeType } from '../types/canvas';
import type { CanvasNodeData, CanvasNodeMetadata } from '../types/canvas';

const CONFIG_NODE_MIN_WIDTH = 400;
export const CONFIG_NODE_MIN_HEIGHT = 280;

type CanvasNodeSpec = {
  width: number;
  height: number;
  title: string;
  metadata?: CanvasNodeMetadata;
};

export const NODE_DEFAULT_SIZE = {
  [CanvasNodeType.Image]: {
    width: 340,
    height: 240,
    get title() {
      return i18n.t('canvas.nodeTypes.image');
    },
  },
  [CanvasNodeType.Text]: {
    width: 340,
    height: 240,
    get title() {
      return i18n.t('canvas.nodeTypes.text');
    },
  },
  [CanvasNodeType.Config]: {
    width: CONFIG_NODE_MIN_WIDTH,
    height: CONFIG_NODE_MIN_HEIGHT,
    get title() {
      return i18n.t('canvas.nodeTypes.config');
    },
  },
  [CanvasNodeType.Video]: {
    width: 420,
    height: 236,
    get title() {
      return i18n.t('canvas.nodeTypes.video');
    },
  },
  [CanvasNodeType.Audio]: {
    width: 340,
    height: 120,
    get title() {
      return i18n.t('canvas.nodeTypes.audio');
    },
  },
  [CanvasNodeType.Group]: {
    width: 760,
    height: 480,
    get title() {
      return i18n.t('canvas.nodeTypes.group');
    },
  },
} satisfies Record<CanvasNodeType, { width: number; height: number; title: string }>;

export const NODE_SPECS = {
  [CanvasNodeType.Image]: {
    width: 340,
    height: 240,
    get title() {
      return NODE_DEFAULT_SIZE[CanvasNodeType.Image].title;
    },
    metadata: { content: '', status: 'idle' },
  },
  [CanvasNodeType.Text]: {
    width: 340,
    height: 240,
    get title() {
      return NODE_DEFAULT_SIZE[CanvasNodeType.Text].title;
    },
    metadata: { content: '', status: 'idle', fontSize: 14 },
  },
  [CanvasNodeType.Config]: {
    width: CONFIG_NODE_MIN_WIDTH,
    height: CONFIG_NODE_MIN_HEIGHT,
    get title() {
      return NODE_DEFAULT_SIZE[CanvasNodeType.Config].title;
    },
    metadata: { content: '', status: 'idle', generationMode: 'image' },
  },
  [CanvasNodeType.Video]: {
    width: 420,
    height: 236,
    get title() {
      return NODE_DEFAULT_SIZE[CanvasNodeType.Video].title;
    },
    metadata: { content: '', status: 'idle' },
  },
  [CanvasNodeType.Audio]: {
    width: 340,
    height: 120,
    get title() {
      return NODE_DEFAULT_SIZE[CanvasNodeType.Audio].title;
    },
    metadata: { content: '', status: 'idle' },
  },
  [CanvasNodeType.Group]: {
    width: 760,
    height: 480,
    get title() {
      return NODE_DEFAULT_SIZE[CanvasNodeType.Group].title;
    },
    metadata: { status: 'idle' },
  },
} satisfies Record<CanvasNodeType, CanvasNodeSpec>;

// Return built-in specs directly and resolve plugin types from the registry.
export function getNodeSpec(type: string) {
  if ((Object.values(CanvasNodeType) as string[]).includes(type)) return NODE_SPECS[type as CanvasNodeType];
  const spec = getRegistryNodeSpec(type);
  return { width: spec.width, height: spec.height, title: spec.title, metadata: spec.metadata };
}

export function ensureCanvasNodeMinimumSize(node: CanvasNodeData): CanvasNodeData {
  if (node.type === CanvasNodeType.Audio && node.metadata?.generationMode === 'music') {
    return { ...node, width: Math.max(node.width, 400), height: Math.max(node.height, 280) };
  }
  const minimumHeight = node.metadata?.generationMode === 'music' || node.metadata?.generationMode === 'lyrics' ? 380 : CONFIG_NODE_MIN_HEIGHT;
  return node.type === CanvasNodeType.Config && (node.width < CONFIG_NODE_MIN_WIDTH || node.height < minimumHeight)
    ? { ...node, width: Math.max(node.width, CONFIG_NODE_MIN_WIDTH), height: Math.max(node.height, minimumHeight) }
    : node;
}
