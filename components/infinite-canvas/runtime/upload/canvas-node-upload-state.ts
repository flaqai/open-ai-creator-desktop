import type { CanvasNodeData } from '../../types/canvas';

export function startCanvasNodeUpload(nodes: readonly CanvasNodeData[], nodeId: string): CanvasNodeData[] {
  return nodes.map((node) =>
    node.id === nodeId
      ? {
          ...node,
          metadata: { ...node.metadata, status: 'loading', errorDetails: undefined },
        }
      : node,
  );
}

export function failCanvasNodeUpload(
  nodes: readonly CanvasNodeData[],
  nodeId: string,
  errorDetails: string,
): CanvasNodeData[] {
  return nodes.map((node) =>
    node.id === nodeId && node.metadata?.status === 'loading'
      ? {
          ...node,
          metadata: { ...node.metadata, status: 'error', errorDetails },
        }
      : node,
  );
}
