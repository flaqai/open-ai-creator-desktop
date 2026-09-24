// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
import type { CanvasNodeData } from '../../types/canvas';
import type { CanvasNodeContext, CanvasPluginHost } from '../../types/canvas-plugin';
import type { CanvasTheme } from '../canvas-theme';
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { createPluginStorage, emitCanvasEvent, onCanvasEvent } from './canvas-event-bus';
import { getNodePluginId } from './node-registry';

// Assemble host capabilities, node data, theme, and scale into the context injected into plugin nodes.
export function buildNodeContext(
  host: CanvasPluginHost,
  node: CanvasNodeData,
  theme: CanvasTheme,
  scale: number,
  isSelected = false,
): CanvasNodeContext {
  const storage = createPluginStorage(host.storageKeyPrefix, getNodePluginId(node.type));
  return {
    node,
    theme,
    scale,
    isSelected,
    updateMetadata: (patch) => host.updateMetadata(node.id, patch),
    updateNode: (patch) => host.updateNode(node.id, patch),
    getNode: (id) => host.getNode(id),
    getNodes: () => host.getNodes(),
    getConnections: () => host.getConnections(),
    getUpstream: () => host.getUpstream(node.id),
    getDownstream: () => host.getDownstream(node.id),
    applyOps: (ops) => host.applyOps(ops),
    emit: (event, payload) => emitCanvasEvent(event, payload),
    on: (event, handler) => onCanvasEvent(event, handler),
    ai: host.ai,
    openPanel: () => host.openPanel(node.id),
    closePanel: () => host.closePanel(),
    storage,
  };
}
