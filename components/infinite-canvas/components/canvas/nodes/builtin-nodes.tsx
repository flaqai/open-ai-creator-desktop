// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { FileText, Group, Image as ImageIcon, Music2, Settings2, Video } from 'lucide-react';

import { NODE_SPECS } from '../../../constant/canvas';
import i18n from '../../../i18n';
import { registerNodeDefinitions } from '../../../lib/canvas/node-registry';
import { CanvasNodeType, type CanvasNodeData } from '../../../types/canvas';
import type { CanvasNodeDefinition, CanvasNodeResource } from '../../../types/canvas-plugin';

// Extensible metadata for built-in nodes, reusing NODE_SPECS for size and initial metadata.
// Rendering remains in canvas-node's internal renderer, so no Content component is provided.
function builtinResource(node: CanvasNodeData): CanvasNodeResource | null {
  if (node.type === CanvasNodeType.Image && node.metadata?.content)
    return { kind: 'image', url: node.metadata.content };
  if (node.type === CanvasNodeType.Video && node.metadata?.content)
    return { kind: 'video', url: node.metadata.content };
  if (node.type === CanvasNodeType.Audio && node.metadata?.content)
    return { kind: 'audio', url: node.metadata.content };
  if (node.type === CanvasNodeType.Text && (node.metadata?.content || node.metadata?.prompt))
    return { kind: 'text', text: node.metadata.content || node.metadata.prompt };
  return null;
}

const iconClass = 'size-5';

function builtinDefinitions(): CanvasNodeDefinition[] {
  return [
  {
    type: CanvasNodeType.Text,
    title: i18n.t('assets.kinds.text'),
    icon: <FileText className={iconClass} />,
    minimapColor: undefined,
    resource: builtinResource,
  },
  {
    type: CanvasNodeType.Image,
    title: i18n.t('assets.kinds.image'),
    icon: <ImageIcon className={iconClass} />,
    minimapColor: 'var(--ui-green-color)',
    keepAspectRatio: (node: CanvasNodeData) => !node.metadata?.freeResize,
    resource: builtinResource,
  },
  {
    type: CanvasNodeType.Video,
    title: i18n.t('assets.kinds.video'),
    icon: <Video className={iconClass} />,
    minimapColor: 'var(--ui-hot-color)',
    keepAspectRatio: () => true,
    resource: builtinResource,
  },
  {
    type: CanvasNodeType.Audio,
    title: i18n.t('canvas.nodeTypes.audio'),
    icon: <Music2 className={iconClass} />,
    minimapColor: 'var(--ui-canvas-accent, var(--ui-text-color))',
    resource: builtinResource,
  },
  {
    type: CanvasNodeType.Config,
    title: i18n.t('canvas.configNode.title'),
    icon: <Settings2 className={iconClass} />,
    minimapColor: 'var(--ui-blue-color)',
    hasSourceHandle: false,
  },
  {
    type: CanvasNodeType.Group,
    title: i18n.t('canvas.node.group'),
    icon: <Group className={iconClass} />,
    minimapColor: 'var(--ui-canvas-muted, var(--ui-gray-color))',
  },
  ].map((def) => {
    const spec = NODE_SPECS[def.type];
    return {
      ...def,
      title: spec.title,
      defaultSize: { width: spec.width, height: spec.height },
      defaultMetadata: spec.metadata,
    };
  });
}

export function registerBuiltinNodes() {
  registerNodeDefinitions(builtinDefinitions(), 'builtin');
}
