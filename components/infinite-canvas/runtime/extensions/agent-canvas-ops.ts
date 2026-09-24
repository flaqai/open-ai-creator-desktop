import { nanoid } from 'nanoid';

import type {
  CanvasConnection,
  CanvasNodeData,
  CanvasNodeMetadata,
  CanvasNodeTypeId,
  ViewportTransform,
} from '@/components/infinite-canvas/types/project';

export type CanvasAgentOp =
  | {
      readonly type: 'add_node';
      readonly id?: string;
      readonly nodeType?: CanvasNodeTypeId;
      readonly title?: string;
      readonly position?: { readonly x: number; readonly y: number };
      readonly x?: number;
      readonly y?: number;
      readonly width?: number;
      readonly height?: number;
      readonly metadata?: CanvasNodeMetadata;
    }
  | {
      readonly type: 'update_node';
      readonly id: string;
      readonly patch?: Partial<CanvasNodeData>;
      readonly metadata?: CanvasNodeMetadata;
    }
  | {
      readonly type: 'delete_node';
      readonly id?: string;
      readonly ids?: readonly string[];
      readonly nodeType?: CanvasNodeTypeId;
    }
  | {
      readonly type: 'delete_connections';
      readonly id?: string;
      readonly ids?: readonly string[];
      readonly all?: boolean;
    }
  | { readonly type: 'connect_nodes'; readonly id?: string; readonly fromNodeId: string; readonly toNodeId: string }
  | { readonly type: 'set_viewport'; readonly viewport: ViewportTransform }
  | { readonly type: 'select_nodes'; readonly ids: readonly string[] };

export interface CanvasAgentSnapshot {
  readonly projectId: string;
  readonly title: string;
  readonly nodes: readonly CanvasNodeData[];
  readonly connections: readonly CanvasConnection[];
  readonly selectedNodeIds: readonly string[];
  readonly viewport: ViewportTransform;
}

export function applyCanvasAgentOps(
  snapshot: CanvasAgentSnapshot,
  ops: readonly CanvasAgentOp[] = [],
): CanvasAgentSnapshot {
  let nodes = snapshot.nodes;
  let connections = snapshot.connections;
  let selectedNodeIds = snapshot.selectedNodeIds;
  let viewport = snapshot.viewport;
  ops.forEach((op, index) => {
    if (op.type === 'add_node') {
      const type = op.nodeType ?? 'text';
      const node: CanvasNodeData = {
        id: op.id ?? `${type}-${nanoid()}`,
        type,
        title: op.title ?? type,
        position: op.position ?? { x: op.x ?? index * 36, y: op.y ?? index * 36 },
        width: op.width ?? 340,
        height: op.height ?? 240,
        metadata: op.metadata,
      };
      nodes = [...nodes, node];
      selectedNodeIds = [node.id];
    } else if (op.type === 'update_node') {
      nodes = nodes.map((node) =>
        node.id === op.id
          ? { ...node, ...op.patch, metadata: { ...node.metadata, ...op.patch?.metadata, ...op.metadata } }
          : node,
      );
    } else if (op.type === 'delete_node') {
      const ids = new Set(
        op.ids ??
          (op.id
            ? [op.id]
            : op.nodeType
              ? nodes.filter((node) => node.type === op.nodeType).map((node) => node.id)
              : []),
      );
      nodes = nodes.filter((node) => !ids.has(node.id));
      connections = connections.filter(
        (connection) => !ids.has(connection.fromNodeId) && !ids.has(connection.toNodeId),
      );
      selectedNodeIds = selectedNodeIds.filter((id) => !ids.has(id));
    } else if (op.type === 'delete_connections') {
      const ids = new Set(op.ids ?? (op.id ? [op.id] : []));
      connections = op.all ? [] : connections.filter((connection) => !ids.has(connection.id));
    } else if (op.type === 'connect_nodes') {
      const exists = connections.some(
        (connection) => connection.fromNodeId === op.fromNodeId && connection.toNodeId === op.toNodeId,
      );
      const hasNodes = nodes.some((node) => node.id === op.fromNodeId) && nodes.some((node) => node.id === op.toNodeId);
      if (!exists && hasNodes) {
        connections = [
          ...connections,
          { id: op.id ?? `connection-${nanoid()}`, fromNodeId: op.fromNodeId, toNodeId: op.toNodeId },
        ];
      }
    } else if (op.type === 'set_viewport') viewport = op.viewport;
    else if (op.type === 'select_nodes') selectedNodeIds = op.ids.filter((id) => nodes.some((node) => node.id === id));
  });
  return { ...snapshot, nodes, connections, selectedNodeIds, viewport };
}
