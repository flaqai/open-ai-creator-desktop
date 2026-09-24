// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import {
  useCallback,
  useMemo,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';

import type { CanvasNodeGenerationMode } from '../../../components/canvas/canvas-node-prompt-panel';
import {
  applyCanvasAgentOps,
  type CanvasAgentOp,
  type CanvasAgentSnapshot,
} from '../../../lib/canvas/canvas-agent-ops';
import { useInfiniteCanvasTranslation } from '../../../runtime/i18n/infinite-canvas-translation';
import type { CanvasConnection, CanvasNodeData, ContextMenuState, ViewportTransform } from '../../../types/canvas';

type GenerateNodeRef = MutableRefObject<
  ((nodeId: string, mode: CanvasNodeGenerationMode, prompt: string) => Promise<void>) | null
>;

type AgentBridgeParams = {
  projectId: string;
  title: string | undefined;
  nodes: CanvasNodeData[];
  connections: CanvasConnection[];
  selectedNodeIds: Set<string>;
  viewport: ViewportTransform;
  nodesRef: MutableRefObject<CanvasNodeData[]>;
  connectionsRef: MutableRefObject<CanvasConnection[]>;
  selectedNodeIdsRef: MutableRefObject<Set<string>>;
  viewportRef: MutableRefObject<ViewportTransform>;
  generateNodeRef: GenerateNodeRef;
  setNodes: Dispatch<SetStateAction<CanvasNodeData[]>>;
  setConnections: Dispatch<SetStateAction<CanvasConnection[]>>;
  setSelectedNodeIds: Dispatch<SetStateAction<Set<string>>>;
  setSelectedConnectionId: Dispatch<SetStateAction<string | null>>;
  setViewport: Dispatch<SetStateAction<ViewportTransform>>;
  setContextMenu: Dispatch<SetStateAction<ContextMenuState | null>>;
};

/**
 * Bridge between the canvas and local Agent: publish the current snapshot and apply/undo capabilities
 * to the Agent store for the local Codex panel. All members except applyAgentOps are internal.
 */
export function useAgentBridge(params: AgentBridgeParams) {
  const { t } = useInfiniteCanvasTranslation();
  const {
    projectId,
    title,
    nodes,
    connections,
    selectedNodeIds,
    viewport,
    nodesRef,
    connectionsRef,
    selectedNodeIdsRef,
    viewportRef,
    generateNodeRef,
    setNodes,
    setConnections,
    setSelectedNodeIds,
    setSelectedConnectionId,
    setViewport,
    setContextMenu,
  } = params;
  const projectTitle = title || t('canvas.project.untitled');

  const agentSnapshot = useMemo<CanvasAgentSnapshot>(
    () => ({
      projectId,
      title: projectTitle,
      nodes,
      connections,
      selectedNodeIds: Array.from(selectedNodeIds),
      viewport,
    }),
    [connections, projectTitle, nodes, projectId, selectedNodeIds, viewport],
  );
  const applyAgentOps = useCallback(
    (ops?: CanvasAgentOp[]) => {
      const safeOps = Array.isArray(ops) ? ops.filter((op) => op?.type) : [];
      const before = {
        projectId,
        title: projectTitle,
        nodes: nodesRef.current,
        connections: connectionsRef.current,
        selectedNodeIds: Array.from(selectedNodeIdsRef.current),
        viewport: viewportRef.current,
      };
      const generationOps = safeOps.filter(
        (op): op is Extract<CanvasAgentOp, { type: 'run_generation' }> =>
          op.type === 'run_generation' && Boolean(op.nodeId),
      );
      const next = applyCanvasAgentOps(
        before,
        safeOps.filter((op) => op.type !== 'run_generation'),
      );
      nodesRef.current = next.nodes;
      connectionsRef.current = next.connections;
      selectedNodeIdsRef.current = new Set(next.selectedNodeIds);
      viewportRef.current = next.viewport;
      setNodes(next.nodes);
      setConnections(next.connections);
      setSelectedNodeIds(new Set(next.selectedNodeIds));
      setSelectedConnectionId(null);
      setViewport(next.viewport);
      setContextMenu(null);
      if (generationOps.length) {
        queueMicrotask(() =>
          generationOps.forEach((op) => {
            const target = nodesRef.current.find((node) => node.id === op.nodeId);
            const prompt = op.prompt?.trim()
              ? op.prompt
              : (target?.metadata?.composerContent ?? target?.metadata?.prompt ?? '');
            void generateNodeRef.current?.(op.nodeId, op.mode || target?.metadata?.generationMode || 'image', prompt);
          }),
        );
      }
      return { ...next, projectId, title: projectTitle };
    },
    [projectTitle, projectId],
  );
  return { agentSnapshot, applyAgentOps };
}
