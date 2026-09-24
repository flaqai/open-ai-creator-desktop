// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { CanvasAudioHistoryDialog } from '@/components/infinite-canvas/components/canvas-audio-history/canvas-audio-history-dialog';
import type { InfiniteCanvasMusicResultHighlight } from '../../infinite-canvas.types';
import { CanvasMusicResultList } from '../../components/canvas/canvas-music-result-list';
import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type {
  ChangeEvent as ReactChangeEvent,
  DragEvent as ReactDragEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import { Group, Video } from 'lucide-react';
import { nanoid } from 'nanoid';
import { DESKTOP_CANVAS_COMMAND_EVENT, type DesktopCanvasCommand } from '@/lib/desktop/canvas-menu';
import { closeContextActions } from '@/lib/desktop/context-actions';
import { readClipboardText } from '@/lib/platform/clipboard';

import { AssetPickerModal, type InsertAssetPayload } from '../../components/canvas/asset-picker-modal';
import { CanvasConfigComposer } from '../../components/canvas/canvas-config-composer';
import {
  CanvasConfigNodePanel,
  visibleConfigGenerationMode,
} from '../../components/canvas/canvas-config-node-panel';
import { ActiveConnectionPath, ConnectionPath } from '../../components/canvas/canvas-connections';
import { CanvasNodeContextMenu } from '../../components/canvas/canvas-context-menu';
import {
  ConnectionCreateMenu,
  NodeCreateMenu,
  type PendingConnectionCreate,
} from '../../components/canvas/canvas-create-menus';
import { Minimap } from '../../components/canvas/canvas-mini-map';
import { CanvasNode } from '../../components/canvas/canvas-node';
import { CanvasNodeAngleDialog, type CanvasImageAngleParams } from '../../components/canvas/canvas-node-angle-dialog';
import { CanvasNodeCropDialog, type CanvasImageCropRect } from '../../components/canvas/canvas-node-crop-dialog';
import {
  buildNodeGenerationContext,
  buildNodeGenerationInputs,
  resolveMusicComposerPrompt,
  buildNodeResponseMessages,
  hydrateNodeGenerationContext,
  type NodeGenerationInput,
} from '../../components/canvas/canvas-node-generation';
import { CanvasNodeHoverToolbar, CanvasNodeInfoModal } from '../../components/canvas/canvas-node-hover-toolbar';
import { hasCanvasThreeDModels } from '../../infinite-canvas-model-adapter';
import {
  CanvasNodeMaskEditDialog,
  type CanvasImageMaskEditPayload,
} from '../../components/canvas/canvas-node-mask-edit-dialog';
import { CanvasNodePromptPanel, type CanvasNodeGenerationMode } from '../../components/canvas/canvas-node-prompt-panel';
import { attachCanvasAudioHistory, applyCanvasMusicResults, connectCanvasMusicResults, connectedMusicResults, reconcileMusicResultSources, hasUnavailableMusicInput } from '../../lib/canvas/canvas-music-results';
import { CanvasNodeSplitDialog, type CanvasImageSplitParams } from '../../components/canvas/canvas-node-split-dialog';
import {
  CanvasNodeUpscaleDialog,
  type CanvasImageUpscaleParams,
} from '../../components/canvas/canvas-node-upscale-dialog';
import { CanvasPluginManagerModal } from '../../components/canvas/canvas-plugin-manager-modal';
import { CanvasRefreshShell } from '../../components/canvas/canvas-refresh-shell';
import { CanvasSidePanel } from '../../components/canvas/canvas-side-panel';
import { CanvasToolbar } from '../../components/canvas/canvas-toolbar';
import { CanvasTopBar } from '../../components/canvas/canvas-top-bar';
import { CanvasZoomControls } from '../../components/canvas/canvas-zoom-controls';
import { InfiniteCanvas } from '../../components/canvas/infinite-canvas';
import { registerBuiltinNodes } from '../../components/canvas/nodes/builtin-nodes';
import { NODE_DEFAULT_SIZE, ensureCanvasNodeMinimumSize, getNodeSpec } from '../../constant/canvas';
import { canvasThemes, type CanvasBackgroundMode } from '../../lib/canvas-theme';
import { exportCanvasProjects } from '../../lib/canvas/canvas-export';
import {
  audioExtension,
  buildAngleLabel,
  buildAnglePrompt,
  buildGenerationConfig,
  findRetrySourceNode,
  generationReferenceUrls,
  getGenerationCount,
  getGenerationPriceInputSummary,
  getInputSummary,
  hydrateAssistantImages,
  hydrateCanvasImages,
  imageExtension,
  isGenerationCanceled,
  resolveMetadataReferences,
  sourceNodeReferenceImages,
} from '../../lib/canvas/canvas-generation-helpers';
import { cropDataUrl, splitDataUrl, upscaleDataUrl } from '../../lib/canvas/canvas-image-data';
import {
  CANVAS_MEDIA_FILE_ACCEPT,
  acceptsCanvasMediaFile,
  canvasMediaFileAccept,
  canvasMediaFileType,
} from '../../lib/canvas/canvas-media-file-types';
import {
  buildTextGenerationConfigMetadata,
  type TextGenerationConfigMode,
} from '../../lib/canvas/canvas-text-generation-config';
import {
  applyNodeConfigPatch,
  audioMetadata,
  buildAudioGenerationMetadata,
  buildImageGenerationMetadata,
  buildAdvancedGenerationMetadata,
  createCanvasNode,
  imageMetadata,
  videoMetadata,
} from '../../lib/canvas/canvas-node-factory';
import {
  findContainingGroupId,
  findGroupDropTarget,
  getConnectionTargetAnchor,
  normalizeConnection,
  snapNodesIntoGroup,
} from '../../lib/canvas/canvas-node-geometry';
import { fitNodeSize, nodeSizeFromRatio } from '../../lib/canvas/canvas-node-size';
import { buildNodeMentionReferences, type CanvasResourceReference } from '../../lib/canvas/canvas-resource-references';
import {
  getNodeDefinition,
  isBuiltinNodeType as isBuiltinType,
  useNodeRegistryVersion,
} from '../../lib/canvas/node-registry';
import { getDataUrlByteSize, readImageMeta } from '../../lib/image-utils';
import { saveAs } from '../../runtime/files/source-download';
import { useInfiniteCanvasTranslation } from '../../runtime/i18n/infinite-canvas-translation';
import { useInfiniteCanvasIntegrations } from '../../runtime/integrations/infinite-canvas-integrations-context';
import { useSourceGenerationRuntime } from '../../runtime/generation/source-generation-context';
import {
  completeProjectGenerationTask,
  pendingProjectGenerationTasks,
  removeProjectGenerationTask,
  upsertProjectGenerationTask,
  type CanvasGenerationBinding,
} from '../../runtime/generation/generation-bindings';
import {
  getSourceModelMetadataPatch,
  getSourceVideoModelDefaults,
  resolveSourceReferenceVideoModel,
  sourceModelName,
} from '../../runtime/generation/source-model-data';
import { failCanvasNodeUpload, startCanvasNodeUpload } from '../../runtime/upload/canvas-node-upload-state';
import { useCanvasUploadFiles } from '../../runtime/upload/use-canvas-upload-files';
import { App, Button, Modal } from '../../runtime/ui/source-ui';
import { uploadMediaFile, type UploadedFile } from '../../services/file-storage';
import { uploadImage } from '../../services/image-storage';
import { useCanvasStore, useCanvasStoreApi } from '../../stores/canvas/use-canvas-store';
import { useAssetStore } from '../../stores/use-asset-store';
import { defaultConfig, useConfigStore, useEffectiveConfig } from '../../stores/use-config-store';
import { useThemeStore } from '../../stores/use-theme-store';
import { useInfiniteCanvasStorageKeyPrefix } from '../../stores/editor-store-registry';
import {
  CanvasNodeType,
  type CanvasAssistantImage,
  type CanvasAssistantSession,
  type CanvasConnection,
  type CanvasNodeData,
  type CanvasNodeImage,
  type CanvasNodeMetadata,
  type CanvasNodeTypeId,
  type ConnectionHandle,
  type ContextMenuState,
  type Position,
  type SelectionBox,
  type ViewportTransform,
} from '../../types/canvas';
import type { ReferenceImage } from '../../types/image';
import type { ReferenceAudio, ReferenceVideo } from '../../types/media';
import type { ProjectSaveState } from '../../runtime/persistence/project-save-runtime';
import { useAgentBridge } from './hooks/use-agent-bridge';
import { usePluginHost } from './hooks/use-plugin-host';

type CanvasClipboard = {
  nodes: CanvasNodeData[];
  connections: CanvasConnection[];
};

type ConnectionDropTarget = {
  nodeId: string | null;
  isNearNode: boolean;
};

type CanvasHistoryEntry = Pick<CanvasClipboard, 'nodes' | 'connections'> & {
  chatSessions: CanvasAssistantSession[];
  activeChatId: string | null;
  backgroundMode: CanvasBackgroundMode;
  showImageInfo: boolean;
};

type CanvasGenerationRequest = {
  targetNodeId: string;
  originNodeId: string;
  runningNodeId: string;
  controller: AbortController;
};

export interface CanvasProjectActions {
  readonly changeLocale: (locale: string) => Promise<boolean>;
  readonly create: (title: string) => Promise<void>;
  readonly delete: () => Promise<void>;
  readonly navigateToDashboard: () => Promise<boolean>;
  readonly navigateToDocs: () => Promise<boolean>;
  readonly navigateToHome: () => Promise<boolean>;
  readonly navigateToLanding: () => Promise<boolean>;
  readonly rename: (title: string) => Promise<void>;
  readonly saveNow: () => Promise<boolean>;
  readonly saveState: ProjectSaveState;
}

const VIDEO_NODE_MAX_WIDTH = 420;
const VIDEO_NODE_MAX_HEIGHT = 420;
// Stable empty reference array prevents `... || []` from invalidating CanvasNode's React.memo on every render.
const EMPTY_REFERENCES: CanvasResourceReference[] = [];
const CONNECTION_HANDLE_HIT_RADIUS = 40;
const CONNECTION_NODE_HIT_PADDING = 32;
const NODE_STATUS_IDLE = 'idle' as const;
const NODE_STATUS_LOADING = 'loading' as const;
const NODE_STATUS_SUCCESS = 'success' as const;
const NODE_STATUS_ERROR = 'error' as const;
const CanvasAgentOptIn = lazy(() => import('../../components/agent/canvas-agent-opt-in'));

async function adoptGeneratedFile(file: UploadedFile): Promise<UploadedFile> {
  return file;
}

export default function CanvasPage({
  projectActions,
  projectId,
  canvasAgentEnabled,
  canvasAgentEndpoint,
  musicResultHighlight,
}: {
  readonly projectActions: CanvasProjectActions;
  readonly projectId: string;
  readonly canvasAgentEnabled: boolean;
  readonly canvasAgentEndpoint?: string;
  readonly musicResultHighlight?: InfiniteCanvasMusicResultHighlight;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    registerBuiltinNodes();
    setMounted(true);
  }, []);

  if (!mounted) return <CanvasRefreshShell />;

  return (
    <InfiniteCanvasPage
      musicResultHighlight={musicResultHighlight}
      projectActions={projectActions}
      projectId={projectId}
      canvasAgentEnabled={canvasAgentEnabled}
      canvasAgentEndpoint={canvasAgentEndpoint}
    />
  );
}

function InfiniteCanvasPage({
  projectActions,
  projectId,
  canvasAgentEnabled,
  canvasAgentEndpoint,
  musicResultHighlight,
}: {
  readonly projectActions: CanvasProjectActions;
  readonly projectId: string;
  readonly canvasAgentEnabled: boolean;
  readonly canvasAgentEndpoint?: string;
  readonly musicResultHighlight?: InfiniteCanvasMusicResultHighlight;
}) {
  const { message, modal } = App.useApp();
  const { i18n, t } = useInfiniteCanvasTranslation();
  const generationRuntime = useSourceGenerationRuntime();
  const {
    recoverProjectBindings,
    requestAudioGeneration,
    requestMusicGeneration,
    requestLyricsGeneration,
    requestEdit,
    requestGeneration,
    requestImageQuestion,
    requestVideoGeneration,
    requestThreeDGeneration,
  } = generationRuntime;
  const storeGeneratedAudio = adoptGeneratedFile;
  const storeGeneratedVideo = adoptGeneratedFile;
  // Subscribe to the registry version so plugin registration changes rerender the canvas.
  const nodeRegistryVersion = useNodeRegistryVersion((state) => state.version);
  const integrations = useInfiniteCanvasIntegrations();
  const uploadFiles = useCanvasUploadFiles(integrations);
  const uploadCanvasImage = useCallback((input: string | Blob) => uploadImage(input, uploadFiles), [uploadFiles]);
  const uploadCanvasMediaFile = useCallback(
    (input: string | Blob, media: 'audio' | 'video') => uploadMediaFile(input, media, uploadFiles),
    [uploadFiles],
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<{ nodeId?: string; nodeType?: CanvasNodeType; position?: Position } | null>(null);
  const clipboardRef = useRef<CanvasClipboard | null>(null);
  const historyRef = useRef<{ past: CanvasHistoryEntry[]; future: CanvasHistoryEntry[] }>({ past: [], future: [] });
  const lastHistoryRef = useRef<CanvasHistoryEntry | null>(null);
  const historyCommitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewportSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applyingHistoryRef = useRef(false);
  const historyPausedRef = useRef(false);
  const didInitialCenterRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const nodeDraggingRef = useRef(false);
  const dragRef = useRef<{
    isDraggingNode: boolean;
    hasMoved: boolean;
    startX: number;
    startY: number;
    initialSelectedNodes: { id: string; x: number; y: number }[];
  }>({
    isDraggingNode: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    initialSelectedNodes: [],
  });

  const config = useConfigStore((state) => state.config);
  const effectiveConfig = useEffectiveConfig();
  const isAiConfigReady = useConfigStore((state) => state.isAiConfigReady);
  const openConfigDialog = useConfigStore((state) => state.openConfigDialog);
  const addAsset = useAssetStore((state) => state.addAsset);
  const hydrated = useCanvasStore((state) => state.hydrated);
  const openProject = useCanvasStore((state) => state.openProject);
  const updateProject = useCanvasStore((state) => state.updateProject);
  const canvasStore = useCanvasStoreApi();
  const currentProject = useCanvasStore((state) => (state.project.id === projectId ? state.project : undefined));
  const theme = canvasThemes[useThemeStore((state) => state.theme)];
  const [nodes, setNodes] = useState<CanvasNodeData[]>([]);
  const [connections, setConnections] = useState<CanvasConnection[]>([]);
  useEffect(() => {
    setNodes((previous) => reconcileMusicResultSources(previous, connections));
  }, [nodes, connections]);

  const [chatSessions, setChatSessions] = useState<CanvasAssistantSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportTransform>({ x: 0, y: 0, k: 1 });
  const [canvasTool, setCanvasTool] = useState<'select' | 'pan'>('select');
  const [size, setSize] = useState({ width: 1200, height: 720 });
  const [audioHistorySourceId, setAudioHistorySourceId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [connectingParams, setConnectingParams] = useState<ConnectionHandle | null>(null);
  const [connectionTargetNodeId, setConnectionTargetNodeId] = useState<string | null>(null);
  const [pendingConnectionCreate, setPendingConnectionCreate] = useState<PendingConnectionCreate | null>(null);
  const [mouseWorld, setMouseWorld] = useState<Position>({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [nodeCreatePosition, setNodeCreatePosition] = useState<Position | null>(null);
  const [runningNodeId, setRunningNodeId] = useState<string | null>(null);
  const [isMiniMapOpen, setIsMiniMapOpen] = useState(false);
  const [backgroundMode, setBackgroundMode] = useState<CanvasBackgroundMode>('lines');
  const [showImageInfo, setShowImageInfo] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [projectLoaded, setProjectLoaded] = useState(false);
  const [toolbarNodeId, setToolbarNodeId] = useState<string | null>(null);
  const [nodeImageSettingsOpen, setNodeImageSettingsOpen] = useState(false);
  const [dialogNodeId, setDialogNodeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editRequestNonce, setEditRequestNonce] = useState(0);
  const [infoNodeId, setInfoNodeId] = useState<string | null>(null);
  const [pluginManagerOpen, setPluginManagerOpen] = useState(false);
  const [cropNodeId, setCropNodeId] = useState<string | null>(null);
  const [maskEditNodeId, setMaskEditNodeId] = useState<string | null>(null);
  const [splitNodeId, setSplitNodeId] = useState<string | null>(null);
  const [upscaleNodeId, setUpscaleNodeId] = useState<string | null>(null);
  const [superResolveNodeId, setSuperResolveNodeId] = useState<string | null>(null);
  const [angleNodeId, setAngleNodeId] = useState<string | null>(null);
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(null);
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [expandedImageNodeId, setExpandedImageNodeId] = useState<string | null>(null);
  const [isNodeDragging, setIsNodeDragging] = useState(false);
  const [isNodeResizing, setIsNodeResizing] = useState(false);
  const [dropTargetGroupId, setDropTargetGroupId] = useState<string | null>(null);

  const nodesRef = useRef(nodes);
  const connectionsRef = useRef(connections);
  const selectedNodeIdsRef = useRef(selectedNodeIds);
  const viewportRef = useRef(viewport);
  const focusAnimRef = useRef<number | null>(null);
  const generateNodeRef = useRef<
    ((nodeId: string, mode: CanvasNodeGenerationMode, prompt: string) => Promise<void>) | null
  >(null);
  const connectingParamsRef = useRef(connectingParams);
  const connectionTargetNodeIdRef = useRef(connectionTargetNodeId);
  const selectionBoxRef = useRef(selectionBox);
  const pendingConnectionCreateRef = useRef(pendingConnectionCreate);
  const generationRequestsRef = useRef(new Map<string, CanvasGenerationRequest>());

  const createHistoryEntry = useCallback(
    (): CanvasHistoryEntry => ({
      nodes: nodesRef.current,
      connections: connectionsRef.current,
      chatSessions,
      activeChatId,
      backgroundMode,
      showImageInfo,
    }),
    [activeChatId, backgroundMode, chatSessions, showImageInfo],
  );

  const startGenerationRequest = useCallback(
    (targetNodeId: string, originNodeId: string, runningId = originNodeId, controller = new AbortController()) => {
      const previous = generationRequestsRef.current.get(targetNodeId);
      if (previous?.controller !== controller) previous?.controller.abort();
      generationRequestsRef.current.set(targetNodeId, {
        targetNodeId,
        originNodeId,
        runningNodeId: runningId,
        controller,
      });
      return controller;
    },
    [],
  );

  const finishGenerationRequest = useCallback((targetNodeId: string, controller: AbortController) => {
    const request = generationRequestsRef.current.get(targetNodeId);
    if (request?.controller === controller) generationRequestsRef.current.delete(targetNodeId);
  }, []);

  useEffect(() => {
    return () => {
      // Stop local observers only; accepted tasks remain in the saved project for recovery.
      for (const request of generationRequestsRef.current.values()) request.controller.abort();
      generationRequestsRef.current.clear();
    };
  }, []);

  const persistGenerationBinding = useCallback(
    (binding: CanvasGenerationBinding) => {
      const state = canvasStore.getState();
      if (state.project.id !== binding.projectId) return;
      state.updateProject(binding.projectId, {
        generationTasks: upsertProjectGenerationTask(state.project.generationTasks ?? [], binding),
      });
    },
    [canvasStore],
  );

  const removeGenerationBinding = useCallback(
    (taskId: string) => {
      const state = canvasStore.getState();
      state.updateProject(projectId, {
        generationTasks: removeProjectGenerationTask(state.project.generationTasks ?? [], taskId),
      });
    },
    [canvasStore, projectId],
  );

  const completeGenerationBinding = useCallback(
    (taskId: string, resultUrl: string) => {
      const state = canvasStore.getState();
      state.updateProject(projectId, {
        generationTasks: completeProjectGenerationTask(state.project.generationTasks ?? [], taskId, resultUrl),
      });
    },
    [canvasStore, projectId],
  );

  const generationOptions = useCallback(
    (resultNodeId: string, signal: AbortSignal, resultSlotId?: string) => ({
      binding: { projectId, resultNodeId, resultSlotId },
      onBindingAccepted: persistGenerationBinding,
      onBindingCompleted: completeGenerationBinding,
      onBindingFailed: removeGenerationBinding,
      signal,
    }),
    [completeGenerationBinding, persistGenerationBinding, projectId, removeGenerationBinding],
  );

  useEffect(() => {
    if (!hydrated) return;
    setProjectLoaded(false);
    const project = openProject(projectId);
    if (!project) {
      integrations.onProjectMissing?.(projectId);
      integrations.navigateToDashboard();
      return;
    }

    const restore = async () => {
      const restoredNodes = (
        await hydrateCanvasImages(project.nodes, uploadCanvasImage, uploadCanvasMediaFile)
      ).map(ensureCanvasNodeMinimumSize);
      const restoredSessions = await hydrateAssistantImages(project.chatSessions || [], uploadCanvasImage);
      setNodes(restoredNodes);
      setConnections(project.connections);
      setChatSessions(restoredSessions);
      setActiveChatId(project.activeChatId || null);
      setBackgroundMode(project.backgroundMode);
      setShowImageInfo(project.showImageInfo || false);
      setViewport(project.viewport);
      historyRef.current = { past: [], future: [] };
      if (historyCommitTimerRef.current) {
        clearTimeout(historyCommitTimerRef.current);
        historyCommitTimerRef.current = null;
      }
      lastHistoryRef.current = {
        nodes: restoredNodes,
        connections: project.connections,
        chatSessions: restoredSessions,
        activeChatId: project.activeChatId || null,
        backgroundMode: project.backgroundMode,
        showImageInfo: project.showImageInfo || false,
      };
      setHistoryState({ canUndo: false, canRedo: false });
      setProjectLoaded(true);
    };
    void restore().catch((error) => {
      integrations.onError?.(error, 'hydrate-local-media');
      message.error(error instanceof Error ? error.message : i18n.assets.uploadFailed);
    });
  }, [hydrated, integrations, message, openProject, projectId, t, uploadCanvasImage, uploadCanvasMediaFile]);

  useEffect(() => {
    if (!projectLoaded || applyingHistoryRef.current || historyPausedRef.current) return;
    const next = createHistoryEntry();
    const previous = lastHistoryRef.current;
    if (
      previous?.nodes === next.nodes &&
      previous.connections === next.connections &&
      previous.chatSessions === next.chatSessions &&
      previous.activeChatId === next.activeChatId &&
      previous.backgroundMode === next.backgroundMode &&
      previous.showImageInfo === next.showImageInfo
    )
      return;

    if (historyCommitTimerRef.current) clearTimeout(historyCommitTimerRef.current);
    historyCommitTimerRef.current = setTimeout(() => {
      const current = createHistoryEntry();
      const last = lastHistoryRef.current;
      if (!last) return;
      historyRef.current.past = [...historyRef.current.past.slice(-49), last];
      historyRef.current.future = [];
      setHistoryState({ canUndo: true, canRedo: false });
      lastHistoryRef.current = current;
      historyCommitTimerRef.current = null;
    }, 180);

    return () => {
      if (historyCommitTimerRef.current) {
        clearTimeout(historyCommitTimerRef.current);
        historyCommitTimerRef.current = null;
      }
    };
  }, [
    activeChatId,
    backgroundMode,
    chatSessions,
    connections,
    createHistoryEntry,
    nodes,
    projectLoaded,
    showImageInfo,
  ]);

  useEffect(() => {
    if (!projectLoaded || historyPausedRef.current) return;
    updateProject(projectId, {
      nodes,
      connections,
      chatSessions,
      activeChatId,
      backgroundMode,
      showImageInfo,
      generationTasks: pendingProjectGenerationTasks(canvasStore.getState().project.generationTasks ?? [], nodes),
    });
  }, [
    activeChatId,
    backgroundMode,
    chatSessions,
    canvasStore,
    connections,
    nodes,
    projectId,
    projectLoaded,
    showImageInfo,
    updateProject,
  ]);

  useEffect(() => {
    if (!projectLoaded) return;
    const controller = new AbortController();
    // Recover each target independently so a long-running task cannot hold back completed media.
    for (const task of canvasStore.getState().project.generationTasks ?? []) {
      void recoverProjectBindings(projectId, [task], {
        onBindingCompleted: completeGenerationBinding,
        onBindingFailed: removeGenerationBinding,
        signal: controller.signal,
      }).then(async ([result]) => {
        if (!result || controller.signal.aborted) return;
        const canApplyResult = () => {
          if (controller.signal.aborted) return false;
          const currentTask = canvasStore.getState().project.generationTasks?.find(
            (candidate) =>
              candidate.resultNodeId === result.binding.resultNodeId &&
              candidate.resultSlotId === result.binding.resultSlotId,
          );
          return currentTask === undefined || currentTask.taskId === result.binding.taskId;
        };
        if (!canApplyResult()) return;
        if (result.kind === 'failed') {
          if (isGenerationCanceled(result.error)) return;
          const errorDetails = result.error instanceof Error ? result.error.message : t('canvas.projectPage.generationFailed');
          integrations.onError?.(result.error, 'recover-generation');
          setNodes((previous) =>
            previous.map((node) =>
              node.id === result.binding.resultNodeId
                ? { ...node, metadata: { ...node.metadata, errorDetails, status: NODE_STATUS_ERROR } }
                : node,
            ),
          );
          return;
        }
        if (result.kind === 'music') {
          setNodes((previous) => applyCanvasMusicResults(previous, result.binding.resultNodeId, result.binding.taskId, result.results, connectionsRef.current));
          setConnections((previous) => connectCanvasMusicResults(previous, result.binding.resultNodeId, result.results, nodesRef.current.find((node) => node.id === result.binding.resultNodeId)?.metadata?.musicSourceNodeId));
          return;
        }
        if (result.kind === '3d') {
          setNodes((previous) => previous.map((node) => node.id === result.binding.resultNodeId
            ? { ...node, metadata: { ...node.metadata, content: result.url, status: NODE_STATUS_SUCCESS, errorDetails: undefined } }
            : node));
          return;
        }
        if (result.kind === 'video' || result.kind === 'audio') {
          const media: UploadedFile = {
            bytes: 0,
            mimeType: result.kind === 'video' ? 'video/mp4' : 'audio/mpeg',
            storageKey: '',
            url: result.url,
          };
          setNodes((previous) =>
            previous.map((node) =>
              node.id === result.binding.resultNodeId
                ? {
                    ...node,
                    metadata: {
                      ...node.metadata,
                      ...(result.kind === 'video' ? videoMetadata(media) : audioMetadata(media)),
                    },
                  }
                : node,
            ),
          );
          return;
        }
        if (!result.url) return;
        try {
          const image = await uploadCanvasImage(result.url);
          if (!canApplyResult()) return;
          setNodes((previous) =>
            previous.map((node) => {
              if (node.id !== result.binding.resultNodeId) return node;
              const slotId = result.binding.resultSlotId;
              if (!slotId) return { ...node, metadata: { ...node.metadata, ...imageMetadata(image) } };
              const recoveredSlot: CanvasNodeImage = {
                bytes: image.bytes,
                content: image.url,
                id: slotId,
                mimeType: image.mimeType,
                naturalHeight: image.height,
                naturalWidth: image.width,
                status: NODE_STATUS_SUCCESS,
                storageKey: image.storageKey,
              };
              const images = node.metadata?.images?.map((slot) => (slot.id === slotId ? recoveredSlot : slot)) || [recoveredSlot];
              const makePrimary = !node.metadata?.content || node.metadata.primaryImageId === slotId;
              return {
                ...node,
                metadata: {
                  ...node.metadata,
                  ...(makePrimary ? imageMetadata(image) : { status: NODE_STATUS_SUCCESS }),
                  images,
                  primaryImageId: makePrimary ? slotId : node.metadata?.primaryImageId,
                },
              };
            }),
          );
        } catch (error) {
          if (!controller.signal.aborted) integrations.onError?.(error, 'recover-generation-media');
        }
      });
    }
    return () => controller.abort();
  }, [
    canvasStore,
    completeGenerationBinding,
    integrations,
    projectId,
    projectLoaded,
    recoverProjectBindings,
    removeGenerationBinding,
    t,
    uploadCanvasImage,
  ]);

  useEffect(() => {
    if (!dialogNodeId) setNodeImageSettingsOpen(false);
  }, [dialogNodeId]);

  useEffect(() => {
    if (!projectLoaded) return;
    if (viewportSaveTimerRef.current) clearTimeout(viewportSaveTimerRef.current);
    viewportSaveTimerRef.current = setTimeout(() => {
      updateProject(projectId, { viewport: viewportRef.current });
      viewportSaveTimerRef.current = null;
    }, 500);
    return () => {
      if (viewportSaveTimerRef.current) clearTimeout(viewportSaveTimerRef.current);
    };
  }, [projectId, projectLoaded, updateProject, viewport]);

  useLayoutEffect(() => {
    nodesRef.current = nodes;
    connectionsRef.current = connections;
    selectedNodeIdsRef.current = selectedNodeIds;
    viewportRef.current = viewport;
    connectingParamsRef.current = connectingParams;
    connectionTargetNodeIdRef.current = connectionTargetNodeId;
    pendingConnectionCreateRef.current = pendingConnectionCreate;
  }, [
    nodes,
    connections,
    selectedNodeIds,
    viewport,
    connectingParams,
    connectionTargetNodeId,
    pendingConnectionCreate,
  ]);

  useLayoutEffect(() => {
    selectionBoxRef.current = selectionBox;
  }, [selectionBox]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
      if (!didInitialCenterRef.current) {
        didInitialCenterRef.current = true;
        setViewport({ x: rect.width / 2, y: rect.height / 2, k: 1 });
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  const screenToCanvas = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const currentViewport = viewportRef.current;
    const localX = clientX - (rect?.left || 0);
    const localY = clientY - (rect?.top || 0);

    return {
      x: (localX - currentViewport.x) / currentViewport.k,
      y: (localY - currentViewport.y) / currentViewport.k,
    };
  }, []);

  const getCanvasCenter = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    return screenToCanvas(
      (rect?.left || 0) + (rect?.width || size.width) / 2,
      (rect?.top || 0) + (rect?.height || size.height) / 2,
    );
  }, [screenToCanvas, size.height, size.width]);

  const setConnecting = useCallback((next: ConnectionHandle | null) => {
    connectingParamsRef.current = next;
    setConnectingParams(next);
    if (!next) {
      connectionTargetNodeIdRef.current = null;
      setConnectionTargetNodeId(null);
    }
  }, []);

  const keepNodeToolbar = useCallback(
    (nodeId: string) => {
      if (nodeDraggingRef.current || nodeImageSettingsOpen || !selectedNodeIdsRef.current.has(nodeId)) return;
      setToolbarNodeId(nodeId);
    },
    [nodeImageSettingsOpen],
  );

  const hideNodeToolbar = useCallback(() => {}, []);

  const connectNodes = useCallback(
    (current: ConnectionHandle, targetNodeId: string) => {
      if (current.nodeId === targetNodeId) return;

      const connection = normalizeConnection(current.nodeId, targetNodeId, nodesRef.current, current.handleType);
      if (!connection) {
        message.warning(t('canvas.projectPage.configConnection'));
        return;
      }
      const { fromNodeId, toNodeId } = connection;
      const exists = connectionsRef.current.some(
        (conn) => conn.fromNodeId === fromNodeId && conn.toNodeId === toNodeId,
      );
      if (!exists) {
        setConnections((prev) => [...prev, { id: `conn-${Date.now()}`, fromNodeId, toNodeId }]);
      }
      setContextMenu(null);
    },
    [message, t],
  );

  const createConnectedNode = useCallback(
    (
      type:
        | CanvasNodeType.Image
        | CanvasNodeType.Text
        | CanvasNodeType.Config
        | CanvasNodeType.Video
        | CanvasNodeType.Audio,
      pending: PendingConnectionCreate,
    ) => {
      const metadata =
        type === CanvasNodeType.Config
          ? {
              model: effectiveConfig.imageModel || effectiveConfig.model,
              size: effectiveConfig.size,
              imageResolution: effectiveConfig.imageResolution,
              imageVersion: effectiveConfig.imageVersion,
              count: getGenerationCount(effectiveConfig.canvasImageCount || effectiveConfig.count),
            }
          : undefined;
      const newNode = createCanvasNode(type, pending.position, metadata);
      const connection = normalizeConnection(
        pending.connection.nodeId,
        newNode.id,
        [...nodesRef.current, newNode],
        pending.connection.handleType,
      );
      if (!connection) {
        message.warning(t('canvas.projectPage.configConnection'));
        return;
      }
      setNodes((prev) => [...prev, newNode]);
      setConnections((prev) => [...prev, { id: nanoid(), ...connection }]);
      setSelectedNodeIds(new Set([newNode.id]));
      setSelectedConnectionId(null);
      if (type !== CanvasNodeType.Text && type !== CanvasNodeType.Audio) setDialogNodeId(newNode.id);
      setPendingConnectionCreate(null);
      setConnecting(null);
    },
    [
      effectiveConfig.canvasImageCount,
      effectiveConfig.count,
      effectiveConfig.imageModel,
      effectiveConfig.imageResolution,
      effectiveConfig.imageVersion,
      effectiveConfig.model,
      effectiveConfig.size,
      message,
      setConnecting,
      t,
    ],
  );

  const cancelPendingConnectionCreate = useCallback(() => {
    setPendingConnectionCreate(null);
    setConnecting(null);
  }, [setConnecting]);

  const getConnectionDropTarget = useCallback(
    (clientX: number, clientY: number, current: ConnectionHandle): ConnectionDropTarget => {
      const world = screenToCanvas(clientX, clientY);
      const scale = Math.max(viewportRef.current.k, 0.05);
      const padding = CONNECTION_NODE_HIT_PADDING / scale;
      const handleRadius = CONNECTION_HANDLE_HIT_RADIUS / scale;
      let isNearNode = false;
      let bestNodeId: string | null = null;
      let bestPriority = Number.POSITIVE_INFINITY;

      [...nodesRef.current].reverse().forEach((node) => {
        const anchor = getConnectionTargetAnchor(node, current);
        const dx = world.x - anchor.x;
        const dy = world.y - anchor.y;
        const hitsHandle = dx * dx + dy * dy <= handleRadius * handleRadius;
        const hitsInside =
          world.x >= node.position.x &&
          world.x <= node.position.x + node.width &&
          world.y >= node.position.y &&
          world.y <= node.position.y + node.height;
        const hitsExpanded =
          world.x >= node.position.x - padding &&
          world.x <= node.position.x + node.width + padding &&
          world.y >= node.position.y - padding &&
          world.y <= node.position.y + node.height + padding;

        if (!hitsHandle && !hitsInside && !hitsExpanded) return;
        isNearNode = true;
        if (
          node.id === current.nodeId ||
          !normalizeConnection(current.nodeId, node.id, nodesRef.current, current.handleType)
        )
          return;

        const priority = hitsInside ? 0 : hitsHandle ? 1 : 2;
        if (priority < bestPriority) {
          bestNodeId = node.id;
          bestPriority = priority;
        }
      });

      return { nodeId: bestNodeId, isNearNode };
    },
    [screenToCanvas],
  );

  const visibleNodes = useMemo(() => {
    const padding = 280;
    const rect = containerRef.current?.getBoundingClientRect();
    const width = rect?.width || size.width;
    const height = rect?.height || size.height;
    const viewLeft = -viewport.x / viewport.k - padding;
    const viewTop = -viewport.y / viewport.k - padding;
    const viewRight = viewLeft + width / viewport.k + padding * 2;
    const viewBottom = viewTop + height / viewport.k + padding * 2;

    return nodes.filter(
      (node) =>
        node.position.x + node.width > viewLeft &&
        node.position.x < viewRight &&
        node.position.y + node.height > viewTop &&
        node.position.y < viewBottom,
    );
  }, [nodes, size.height, size.width, viewport.k, viewport.x, viewport.y]);

  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  // The toolbar follows a single selected node selected by click, creation, marquee, or keyboard.
  // It stays hidden for multi-selection and while isNodeDragging is true.
  const singleSelectedNodeId = selectedNodeIds.size === 1 ? Array.from(selectedNodeIds)[0] : null;
  const selectedMusicSource = singleSelectedNodeId ? nodeById.get(singleSelectedNodeId) : undefined;
  const currentMusicResultId = musicResultHighlight?.enabled === true && selectedMusicSource?.metadata?.musicResultSource
    ? connectedMusicResults(selectedMusicSource.id, nodes, connections).find(
      (result) => result.id === selectedMusicSource.metadata?.selectedMusicResultId && result.metadata?.status === 'success' && result.metadata?.content,
    )?.id
    : undefined;
  const toolbarNode =
    (toolbarNodeId ? nodeById.get(toolbarNodeId) || null : null) ||
    (singleSelectedNodeId ? nodeById.get(singleSelectedNodeId) || null : null);
  const infoNode = infoNodeId ? nodeById.get(infoNodeId) || null : null;
  const cropNode = cropNodeId ? nodeById.get(cropNodeId) || null : null;
  const maskEditNode = maskEditNodeId ? nodeById.get(maskEditNodeId) || null : null;
  const splitNode = splitNodeId ? nodeById.get(splitNodeId) || null : null;
  const upscaleNode = upscaleNodeId ? nodeById.get(upscaleNodeId) || null : null;
  const superResolveNode = superResolveNodeId ? nodeById.get(superResolveNodeId) || null : null;
  const angleNode = angleNodeId ? nodeById.get(angleNodeId) || null : null;
  const previewNode = previewNodeId ? nodeById.get(previewNodeId) || null : null;
  const hasMultipleSelectedNodes = selectedNodeIds.size > 1;
  const activeNodeId = hasMultipleSelectedNodes
    ? null
    : hoveredNodeId || (selectedNodeIds.size === 1 ? Array.from(selectedNodeIds)[0] : null);
  const groupChildCountById = useMemo(() => {
    const map = new Map<string, number>();
    nodes.forEach((node) => {
      const groupId = node.metadata?.groupId;
      if (groupId) map.set(groupId, (map.get(groupId) || 0) + 1);
    });
    return map;
  }, [nodes]);
  const relatedHighlight = useMemo(() => {
    const nodeIds = new Set<string>();
    const connectionIds = new Set<string>();

    if (!activeNodeId) return { nodeIds, connectionIds };

    nodeIds.add(activeNodeId);
    connections.forEach((connection) => {
      if (connection.fromNodeId !== activeNodeId && connection.toNodeId !== activeNodeId) return;
      connectionIds.add(connection.id);
      nodeIds.add(connection.fromNodeId);
      nodeIds.add(connection.toNodeId);
    });

    return { nodeIds, connectionIds };
  }, [activeNodeId, connections]);

  const configInputsById = useMemo(() => {
    const map = new Map<string, NodeGenerationInput[]>();
    nodes.forEach((node) => {
      if (node.type !== CanvasNodeType.Config) return;
      map.set(node.id, buildNodeGenerationInputs(node.id, nodes, connections));
    });
    return map;
  }, [connections, nodes]);
  const mentionReferencesByNodeId = useMemo(() => {
    const map = new Map<string, ReturnType<typeof buildNodeMentionReferences>>();
    nodes.forEach((node) => map.set(node.id, buildNodeMentionReferences(node, nodes, connections)));
    return map;
  }, [connections, nodes]);
  const storageKeyPrefix = useInfiniteCanvasStorageKeyPrefix();
  const { agentSnapshot, applyAgentOps } = useAgentBridge({
    projectId,
    title: currentProject?.title,
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
  });

  const { pluginHost, renderPluginPanel, buildNodeToolbarItems } = usePluginHost({
    effectiveConfig,
    isAiConfigReady,
    openConfigDialog,
    theme,
    nodesRef,
    connectionsRef,
    viewportRef,
    setNodes,
    setDialogNodeId,
    applyAgentOps,
  });
  const createNode = useCallback(
    (type: CanvasNodeTypeId, position?: Position, metadata?: CanvasNodeMetadata) => {
      const targetPosition = position || getCanvasCenter();
      const configMetadata =
        type === CanvasNodeType.Config
          ? {
              model: effectiveConfig.imageModel || effectiveConfig.model,
              size: effectiveConfig.size,
              count: getGenerationCount(effectiveConfig.canvasImageCount || effectiveConfig.count),
            }
          : undefined;
      const newNode = createCanvasNode(type, targetPosition, { ...configMetadata, ...metadata });

      setNodes((prev) => [...prev, newNode]);
      setSelectedNodeIds(new Set([newNode.id]));
      setSelectedConnectionId(null);
      const definition = getNodeDefinition(type);
      // Display-only plugin nodes with hidePanel do not open a panel; custom Panels require autoOpenPanel on creation.
      // Plugin nodes declaring useBuiltinPanel open the built-in generation panel on creation, like image nodes.
      // Built-in image, video, and config nodes retain their existing open-on-create behavior.
      // Music audio nodes open their generation panel immediately; uploaded audio keeps its existing behavior.
      const wantsPanel = definition?.hidePanel
        ? false
        : definition?.Panel
          ? Boolean(definition.autoOpenPanel)
          : definition?.useBuiltinPanel
            ? true
            : isBuiltinType(type) &&
              type !== CanvasNodeType.Text &&
              (type !== CanvasNodeType.Audio || metadata?.generationMode === 'music') &&
              type !== CanvasNodeType.Group;
      if (wantsPanel) setDialogNodeId(newNode.id);
    },
    [
      effectiveConfig.canvasImageCount,
      effectiveConfig.count,
      effectiveConfig.imageModel,
      effectiveConfig.model,
      effectiveConfig.size,
      getCanvasCenter,
    ],
  );

  const deleteNodes = useCallback(
    (ids: Set<string>) => {
      if (!ids.size) return;
      const allIds = new Set(ids);
      setNodes((prev) => {
        const next = prev.filter((node) => !allIds.has(node.id));
        return next.map((node) => {
          const groupId = node.metadata?.groupId;
          if (groupId && allIds.has(groupId)) return { ...node, metadata: { ...node.metadata, groupId: undefined } };
          return node;
        });
      });
      setConnections((prev) => prev.filter((conn) => !allIds.has(conn.fromNodeId) && !allIds.has(conn.toNodeId)));
      setSelectedNodeIds(new Set());
      setSelectedConnectionId(null);
      setHoveredNodeId((current) => (current && allIds.has(current) ? null : current));
      setToolbarNodeId((current) => (current && allIds.has(current) ? null : current));
      setDialogNodeId((current) => (current && allIds.has(current) ? null : current));
      setEditingNodeId((current) => (current && allIds.has(current) ? null : current));
      setInfoNodeId((current) => (current && allIds.has(current) ? null : current));
      setCropNodeId((current) => (current && allIds.has(current) ? null : current));
      setMaskEditNodeId((current) => (current && allIds.has(current) ? null : current));
      setAngleNodeId((current) => (current && allIds.has(current) ? null : current));
      setPreviewNodeId((current) => (current && allIds.has(current) ? null : current));
      setRunningNodeId((current) => (current && allIds.has(current) ? null : current));
      setContextMenu((current) => (current?.type === 'node' && allIds.has(current.nodeId) ? null : current));
    },
    [],
  );

  const deleteConnection = useCallback((connectionId: string) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== connectionId));
    setSelectedConnectionId((current) => (current === connectionId ? null : current));
    setContextMenu((current) =>
      current?.type === 'connection' && current.connectionId === connectionId ? null : current,
    );
  }, []);

  const deselectCanvas = useCallback(() => {
    cancelPendingConnectionCreate();
    setExpandedImageNodeId(null);
    setSelectedNodeIds(new Set());
    setSelectedConnectionId(null);
    setContextMenu(null);
    setSelectionBox(null);
    setHoveredNodeId(null);
    setToolbarNodeId(null);
    setDialogNodeId(null);
    setEditingNodeId(null);
  }, [cancelPendingConnectionCreate]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setConnections([]);
    setInfoNodeId(null);
    setCropNodeId(null);
    setMaskEditNodeId(null);
    setAngleNodeId(null);
    setPreviewNodeId(null);
    setRunningNodeId(null);
    deselectCanvas();
    setClearConfirmOpen(false);
  }, [deselectCanvas]);

  const duplicateNode = useCallback((nodeId: string) => {
    const source = nodesRef.current.find((node) => node.id === nodeId);
    if (!source) return;

    const id = `${source.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const next: CanvasNodeData = {
      ...source,
      id,
      title: `${source.title} Copy`,
      position: { x: source.position.x + 36, y: source.position.y + 36 },
    };

    setNodes((prev) => [...prev, next]);
    setSelectedNodeIds(new Set([id]));
    setSelectedConnectionId(null);
    if (next.type !== CanvasNodeType.Group) setDialogNodeId(id);
  }, []);

  const copySelectedNodes = useCallback(() => {
    const selectedIds = selectedNodeIdsRef.current;
    if (!selectedIds.size) return;

    const copiedNodes = nodesRef.current
      .filter((node) => selectedIds.has(node.id))
      .map((node) => ({
        ...node,
        position: { ...node.position },
        metadata: node.metadata ? { ...node.metadata } : undefined,
      }));

    if (!copiedNodes.length) return;

    clipboardRef.current = {
      nodes: copiedNodes,
      connections: connectionsRef.current
        .filter((connection) => selectedIds.has(connection.fromNodeId) && selectedIds.has(connection.toNodeId))
        .map((connection) => ({ ...connection })),
    };
  }, []);

  const pasteCopiedNodes = useCallback(() => {
    const clipboard = clipboardRef.current;
    if (!clipboard?.nodes.length) return false;

    const center = getCanvasCenter();
    const bounds = clipboard.nodes.reduce(
      (acc, node) => ({
        left: Math.min(acc.left, node.position.x),
        top: Math.min(acc.top, node.position.y),
        right: Math.max(acc.right, node.position.x + node.width),
        bottom: Math.max(acc.bottom, node.position.y + node.height),
      }),
      { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity },
    );
    const dx = center.x - (bounds.left + bounds.right) / 2;
    const dy = center.y - (bounds.top + bounds.bottom) / 2;
    const idMap = new Map<string, string>();
    const nextNodes = clipboard.nodes.map((node, index) => {
      const id = `${node.type}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`;
      idMap.set(node.id, id);
      return {
        ...node,
        id,
        title: node.title.endsWith(' Copy') ? node.title : `${node.title} Copy`,
        position: {
          x: node.position.x + dx,
          y: node.position.y + dy,
        },
        metadata: node.metadata ? { ...node.metadata } : undefined,
      };
    });

    const pastedNodes = nextNodes.map((node) => {
      const groupId = node.metadata?.groupId;
      if (!groupId) return node;
      return { ...node, metadata: { ...node.metadata, groupId: idMap.get(groupId) } };
    });

    const nextConnections = clipboard.connections.flatMap((connection, index) => {
      const fromNodeId = idMap.get(connection.fromNodeId);
      const toNodeId = idMap.get(connection.toNodeId);
      if (!fromNodeId || !toNodeId) return [];
      return [
        {
          ...connection,
          id: `conn-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
          fromNodeId,
          toNodeId,
        },
      ];
    });

    setNodes((prev) => [...prev, ...pastedNodes]);
    setConnections((prev) => [...prev, ...nextConnections]);
    setSelectedNodeIds(new Set(pastedNodes.map((node) => node.id)));
    setSelectedConnectionId(null);
    setContextMenu(null);
    setDialogNodeId(pastedNodes[0]?.type === CanvasNodeType.Group ? null : pastedNodes[0]?.id || null);
    return true;
  }, [getCanvasCenter]);

  const resetViewport = useCallback(() => {
    setViewport({ x: size.width / 2, y: size.height / 2, k: 1 });
    setContextMenu(null);
  }, [size.height, size.width]);

  const focusNode = useCallback(
    (nodeId: string) => {
      const node = nodesRef.current.find((item) => item.id === nodeId);
      if (!node) return;
      const worldX = node.position.x + node.width / 2;
      const worldY = node.position.y + node.height / 2;
      const k = Math.min(
        Math.max(Math.min((size.width * 0.6) / node.width, (size.height * 0.6) / node.height), 0.05),
        1,
      );
      const target = { x: size.width / 2 - worldX * k, y: size.height / 2 - worldY * k, k };
      setSelectedNodeIds(new Set([nodeId]));
      setSelectedConnectionId(null);
      setContextMenu(null);

      if (focusAnimRef.current) cancelAnimationFrame(focusAnimRef.current);
      const start = { ...viewportRef.current };
      const duration = 450;
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      let startTime: number | null = null;
      const step = (now: number) => {
        if (startTime === null) startTime = now;
        const progress = Math.min((now - startTime) / duration, 1);
        const t = easeOutCubic(progress);
        setViewport({
          x: start.x + (target.x - start.x) * t,
          y: start.y + (target.y - start.y) * t,
          k: start.k + (target.k - start.k) * t,
        });
        focusAnimRef.current = progress < 1 ? requestAnimationFrame(step) : null;
      };
      focusAnimRef.current = requestAnimationFrame(step);
    },
    [size.height, size.width],
  );

  useEffect(() => () => void (focusAnimRef.current && cancelAnimationFrame(focusAnimRef.current)), []);

  const setZoomScale = useCallback(
    (scale: number) => {
      const nextScale = Math.min(Math.max(scale, 0.05), 5);
      setViewport((prev) => ({
        x: size.width / 2 - ((size.width / 2 - prev.x) / prev.k) * nextScale,
        y: size.height / 2 - ((size.height / 2 - prev.y) / prev.k) * nextScale,
        k: nextScale,
      }));
      setContextMenu(null);
    },
    [size.height, size.width],
  );

  const applyHistory = useCallback((entry: CanvasHistoryEntry) => {
    if (historyCommitTimerRef.current) {
      clearTimeout(historyCommitTimerRef.current);
      historyCommitTimerRef.current = null;
    }
    applyingHistoryRef.current = true;
    setNodes(entry.nodes);
    setConnections(entry.connections);
    setChatSessions(entry.chatSessions);
    setActiveChatId(entry.activeChatId);
    setBackgroundMode(entry.backgroundMode);
    setShowImageInfo(entry.showImageInfo);
    setSelectedNodeIds(new Set());
    setSelectedConnectionId(null);
    setContextMenu(null);
    setTimeout(() => {
      lastHistoryRef.current = entry;
      applyingHistoryRef.current = false;
      setHistoryState({ canUndo: historyRef.current.past.length > 0, canRedo: historyRef.current.future.length > 0 });
    });
  }, []);

  const undoCanvas = useCallback(() => {
    const previous = historyRef.current.past.pop();
    const current = lastHistoryRef.current;
    if (!previous || !current) return;
    historyRef.current.future.push(current);
    applyHistory(previous);
  }, [applyHistory]);

  const redoCanvas = useCallback(() => {
    const next = historyRef.current.future.pop();
    const current = lastHistoryRef.current;
    if (!next || !current) return;
    historyRef.current.past.push(current);
    applyHistory(next);
  }, [applyHistory]);

  const createAndOpenProject = useCallback(() => {
    void projectActions
      .create(t('canvas.defaultTitle', { count: 1 }))
      .catch((error) => integrations.onError?.(error, 'create-project'));
  }, [integrations, projectActions, t]);

  const deleteCurrentProject = useCallback(() => {
    void projectActions.delete().catch((error) => integrations.onError?.(error, 'delete-project'));
  }, [integrations, projectActions]);

  const exportCurrentProject = useCallback(async () => {
    if (!currentProject) return message.error(t('canvas.projectPage.notFound'));
    const hide = message.loading(t('canvas.projectPage.exporting'), 0);
    try {
      await exportCanvasProjects([currentProject], currentProject.title || t('canvas.title'));
      message.success(t('canvas.projectPage.exported'));
    } catch (error) {
      console.error(error);
      message.error(t('canvas.sidePanel.exportFailed'));
    } finally {
      hide();
    }
  }, [currentProject, message, t]);

  const handleCanvasMouseDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      setContextMenu(null);
      setNodeCreatePosition(null);
      setExpandedImageNodeId(null);
      setHoveredNodeId(null);
      setToolbarNodeId(null);
      setDialogNodeId(null);
      setEditingNodeId(null);
      if (pendingConnectionCreateRef.current) cancelPendingConnectionCreate();
      if (event.button !== 0) return;

      const world = screenToCanvas(event.clientX, event.clientY);
      const nextSelectionBox = {
        startWorldX: world.x,
        startWorldY: world.y,
        currentWorldX: world.x,
        currentWorldY: world.y,
        additive: event.shiftKey,
        initialSelectedNodeIds: event.shiftKey ? Array.from(selectedNodeIdsRef.current) : [],
      };
      selectionBoxRef.current = nextSelectionBox;
      setSelectionBox(nextSelectionBox);
      if (!event.shiftKey) {
        setSelectedNodeIds(new Set());
      }

      setSelectedConnectionId(null);
    },
    [cancelPendingConnectionCreate, screenToCanvas],
  );

  // Selection-only logic shared by the bubbling drag entry point and outer capture handler.
  // Returns the single target ID after the click, or null for multi-selection or deselection, to sync the toolbar.
  const selectNodeByEvent = useCallback(
    (event: Pick<ReactMouseEvent, 'shiftKey' | 'metaKey' | 'ctrlKey'>, nodeId: string) => {
      const nextSelected = new Set(selectedNodeIdsRef.current);
      if (event.shiftKey || event.metaKey || event.ctrlKey) {
        if (nextSelected.has(nodeId)) nextSelected.delete(nodeId);
        else nextSelected.add(nodeId);
      } else if (!nextSelected.has(nodeId)) {
        nextSelected.clear();
        nextSelected.add(nodeId);
      }
      setSelectedNodeIds(nextSelected);
      const soloId = nextSelected.size === 1 && nextSelected.has(nodeId) ? nodeId : null;
      setToolbarNodeId(soloId);
      return { nextSelected, soloId };
    },
    [],
  );

  // Capture-phase selection lets any inner element, including textarea or iframe, select the node and show its toolbar.
  // It only selects; body onMouseDown still starts dragging, so text selection inside editors does not drag the node.
  // Cache the capture result for the following bubbling drag handler to avoid applying shift-selection twice.
  const pendingSelectionRef = useRef<Set<string> | null>(null);
  const handleNodeSelectCapture = useCallback(
    (event: ReactMouseEvent, nodeId: string) => {
      if (event.button !== 0) return;
      setContextMenu(null);
      setHoveredNodeId(null);
      setSelectedConnectionId(null);
      const { nextSelected } = selectNodeByEvent(event, nodeId);
      pendingSelectionRef.current = nextSelected;
    },
    [selectNodeByEvent],
  );

  const handleNodeMouseDown = useCallback((event: ReactMouseEvent, nodeId: string) => {
    event.stopPropagation();
    if (event.button !== 0) return;
    const target = event.target instanceof Element ? event.target : null;
    if (
      target?.closest(
        'button,a,input,textarea,select,option,[role="button"],[role="menuitem"],[contenteditable="true"],video,audio,[data-canvas-interactive]',
      )
    )
      return;
    // Capture already selected the node; this only starts dragging, with a fallback selection if capture did not run.
    const currentNodes = nodesRef.current;
    const nextSelected = pendingSelectionRef.current ?? selectNodeByEvent(event, nodeId).nextSelected;
    pendingSelectionRef.current = null;
    const dragIds = new Set(nextSelected);
    currentNodes.forEach((node) => {
      if (!nextSelected.has(node.id)) return;
      if (node.type === CanvasNodeType.Group) {
        currentNodes.forEach((child) => {
          if (child.metadata?.groupId === node.id) dragIds.add(child.id);
        });
      }
    });
    dragRef.current = {
      isDraggingNode: true,
      hasMoved: false,
      startX: event.clientX,
      startY: event.clientY,
      initialSelectedNodes: currentNodes
        .filter((node) => dragIds.has(node.id))
        .map((node) => ({ id: node.id, x: node.position.x, y: node.position.y })),
    };
    historyPausedRef.current = true;
    nodeDraggingRef.current = true;
    setIsNodeDragging(true);
  }, []);

  const finishNodeDrag = useCallback((clientX?: number, clientY?: number) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (!dragRef.current.isDraggingNode) return;

    const wasClick = !dragRef.current.hasMoved && dragRef.current.initialSelectedNodes.length === 1;
    const clickedNodeId = dragRef.current.initialSelectedNodes[0]?.id;
    const currentViewport = viewportRef.current;
    const dx = clientX == null ? 0 : (clientX - dragRef.current.startX) / currentViewport.k;
    const dy = clientY == null ? 0 : (clientY - dragRef.current.startY) / currentViewport.k;
    const initialPositions = dragRef.current.initialSelectedNodes;

    historyPausedRef.current = false;
    nodeDraggingRef.current = false;
    setIsNodeDragging(false);
    setDropTargetGroupId(null);
    if (dragRef.current.hasMoved && clientX != null && clientY != null) {
      const movedIds = new Set(initialPositions.map((item) => item.id));
      setNodes((prev) => {
        const moved = prev.map((node) => {
          const initial = initialPositions.find((item) => item.id === node.id);
          return initial ? { ...node, position: { x: initial.x + dx, y: initial.y + dy } } : node;
        });
        const targetGroup = findGroupDropTarget(movedIds, moved);
        if (targetGroup) return snapNodesIntoGroup(movedIds, moved, targetGroup);
        return moved.map((node) => {
          if (!movedIds.has(node.id) || node.type === CanvasNodeType.Group) return node;
          const groupId = findContainingGroupId(node, moved);
          if (node.metadata?.groupId === groupId) return node;
          return { ...node, metadata: { ...node.metadata, groupId } };
        });
      });
    }

    dragRef.current.isDraggingNode = false;
    dragRef.current.hasMoved = false;
    dragRef.current.initialSelectedNodes = [];
    if (wasClick && clickedNodeId) {
      const clickedNode = nodesRef.current.find((node) => node.id === clickedNodeId);
      const clickedDefinition = clickedNode ? getNodeDefinition(clickedNode.type) : undefined;
      if (clickedNode?.type === CanvasNodeType.Text) {
        setDialogNodeId((current) => (current === clickedNodeId ? current : null));
      } else if (clickedDefinition?.hidePanel || clickedNode?.type === '3d') {
        // Clicking a display-only plugin node selects it without opening a lower panel.
        setDialogNodeId((current) => (current === clickedNodeId ? current : null));
      } else if (clickedNode?.type !== CanvasNodeType.Group) {
        setDialogNodeId(clickedNodeId);
      }
    }
  }, []);

  const handleGlobalMouseMove = useCallback(
    (event: MouseEvent) => {
      const currentViewport = viewportRef.current;

      if (dragRef.current.isDraggingNode) {
        const dx = (event.clientX - dragRef.current.startX) / currentViewport.k;
        const dy = (event.clientY - dragRef.current.startY) / currentViewport.k;
        const initialPositions = dragRef.current.initialSelectedNodes;
        if (
          Math.abs(event.clientX - dragRef.current.startX) > 3 ||
          Math.abs(event.clientY - dragRef.current.startY) > 3
        ) {
          dragRef.current.hasMoved = true;
        }

        const movedIds = new Set(initialPositions.map((item) => item.id));
        const previewNodes = nodesRef.current.map((node) => {
          const initial = initialPositions.find((item) => item.id === node.id);
          return initial ? { ...node, position: { x: initial.x + dx, y: initial.y + dy } } : node;
        });
        setDropTargetGroupId(findGroupDropTarget(movedIds, previewNodes)?.id || null);

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          setNodes((prev) =>
            prev.map((node) => {
              const initial = initialPositions.find((item) => item.id === node.id);
              return initial ? { ...node, position: { x: initial.x + dx, y: initial.y + dy } } : node;
            }),
          );
          rafRef.current = null;
        });
        return;
      }

      if (connectingParamsRef.current && !pendingConnectionCreateRef.current) {
        const dropTarget = getConnectionDropTarget(event.clientX, event.clientY, connectingParamsRef.current);
        connectionTargetNodeIdRef.current = dropTarget.nodeId;
        setConnectionTargetNodeId(dropTarget.nodeId);
        setMouseWorld(screenToCanvas(event.clientX, event.clientY));
      }
    },
    [finishNodeDrag, getConnectionDropTarget, screenToCanvas],
  );

  const handleGlobalPointerMove = useCallback(
    (event: PointerEvent) => {
      const currentSelection = selectionBoxRef.current;
      if (!currentSelection) return;

      if (event.buttons === 0) {
        selectionBoxRef.current = null;
        setSelectionBox(null);
        return;
      }

      const world = screenToCanvas(event.clientX, event.clientY);
      const rectX = Math.min(currentSelection.startWorldX, world.x);
      const rectY = Math.min(currentSelection.startWorldY, world.y);
      const rectW = Math.abs(world.x - currentSelection.startWorldX);
      const rectH = Math.abs(world.y - currentSelection.startWorldY);
      const nextSelected = new Set<string>(currentSelection.additive ? currentSelection.initialSelectedNodeIds : []);

      nodesRef.current.forEach((node) => {
        const intersects =
          rectX < node.position.x + node.width &&
          rectX + rectW > node.position.x &&
          rectY < node.position.y + node.height &&
          rectY + rectH > node.position.y;

        if (intersects) nextSelected.add(node.id);
      });

      const nextSelectionBox = { ...currentSelection, currentWorldX: world.x, currentWorldY: world.y };
      selectionBoxRef.current = nextSelectionBox;
      setSelectionBox(nextSelectionBox);
      setSelectedNodeIds(nextSelected);
    },
    [screenToCanvas],
  );

  const handleGlobalMouseUp = useCallback(
    (event: MouseEvent) => {
      finishNodeDrag(event.clientX, event.clientY);

      selectionBoxRef.current = null;
      setSelectionBox(null);

      if (pendingConnectionCreateRef.current) return;

      const currentConnection = connectingParamsRef.current;
      if (currentConnection) {
        const dropTarget = getConnectionDropTarget(event.clientX, event.clientY, currentConnection);
        if (dropTarget.nodeId) {
          connectNodes(currentConnection, dropTarget.nodeId);
          setConnecting(null);
        } else if (dropTarget.isNearNode) {
          setConnecting(null);
        } else {
          setMouseWorld(screenToCanvas(event.clientX, event.clientY));
          setPendingConnectionCreate({
            connection: currentConnection,
            position: screenToCanvas(event.clientX, event.clientY),
          });
        }
      }
    },
    [connectNodes, finishNodeDrag, getConnectionDropTarget, screenToCanvas, setConnecting],
  );

  useEffect(() => {
    const handlePointerUp = (event: PointerEvent) => finishNodeDrag(event.clientX, event.clientY);
    const cancelNodeDrag = () => finishNodeDrag();
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', cancelNodeDrag);
    window.addEventListener('blur', cancelNodeDrag);
    window.addEventListener('pointermove', handleGlobalPointerMove);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', cancelNodeDrag);
      window.removeEventListener('blur', cancelNodeDrag);
      window.removeEventListener('pointermove', handleGlobalPointerMove);
    };
  }, [finishNodeDrag, handleGlobalMouseMove, handleGlobalMouseUp, handleGlobalPointerMove]);

  const createImageFileNode = useCallback(async (file: File, position: Position) => {
    const image = await uploadCanvasImage(file);
    const size = fitNodeSize(image.width, image.height);
    const id = `image-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newNode: CanvasNodeData = {
      id,
      type: CanvasNodeType.Image,
      title: file.name,
      position: { x: position.x - size.width / 2, y: position.y - size.height / 2 },
      width: size.width,
      height: size.height,
      metadata: imageMetadata(image),
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeIds(new Set([id]));
    setSelectedConnectionId(null);
    setDialogNodeId(id);
  }, [uploadCanvasImage]);

  const createVideoFileNode = useCallback(async (file: File, position: Position) => {
    const video = await uploadCanvasMediaFile(file, 'video');
    const size = fitNodeSize(video.width || 1280, video.height || 720, VIDEO_NODE_MAX_WIDTH, VIDEO_NODE_MAX_HEIGHT);
    const id = `video-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setNodes((prev) => [
      ...prev,
      {
        id,
        type: CanvasNodeType.Video,
        title: file.name,
        position: { x: position.x - size.width / 2, y: position.y - size.height / 2 },
        width: size.width,
        height: size.height,
        metadata: videoMetadata(video),
      },
    ]);
    setSelectedNodeIds(new Set([id]));
    setSelectedConnectionId(null);
    setDialogNodeId(id);
  }, [uploadCanvasMediaFile]);

  const createAudioFileNode = useCallback(async (file: File, position: Position) => {
    const audio = await uploadCanvasMediaFile(file, 'audio');
    const spec = NODE_DEFAULT_SIZE[CanvasNodeType.Audio];
    const id = `audio-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setNodes((prev) => [
      ...prev,
      {
        id,
        type: CanvasNodeType.Audio,
        title: file.name,
        position: { x: position.x - spec.width / 2, y: position.y - spec.height / 2 },
        width: spec.width,
        height: spec.height,
        metadata: audioMetadata(audio),
      },
    ]);
    setSelectedNodeIds(new Set([id]));
    setSelectedConnectionId(null);
  }, [uploadCanvasMediaFile]);

  const createLocalFileNode = useCallback(
    (file: File, position: Position) => {
      const mediaType = canvasMediaFileType(file);
      if (mediaType === 'audio') return createAudioFileNode(file, position);
      if (mediaType === 'video') return createVideoFileNode(file, position);
      return createImageFileNode(file, position);
    },
    [createAudioFileNode, createImageFileNode, createVideoFileNode],
  );

  const createTextNodeFromClipboard = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return false;

      const node = {
        ...createCanvasNode(CanvasNodeType.Text, getCanvasCenter(), { content: trimmed, status: NODE_STATUS_SUCCESS }),
        title: trimmed.slice(0, 32) || t('canvas.projectPage.clipboardText'),
      };

      setNodes((prev) => [...prev, node]);
      setSelectedNodeIds(new Set([node.id]));
      setSelectedConnectionId(null);
      setContextMenu(null);
      setDialogNodeId(node.id);
      return true;
    },
    [getCanvasCenter, t],
  );

  const pasteSystemClipboard = useCallback(async () => {
    try {
      const items = await navigator.clipboard?.read?.();
      const imageItem = items?.find((item) => item.types.some((type) => type.startsWith('image/')));
      if (imageItem) {
        const imageType = imageItem.types.find((type) => type.startsWith('image/'));
        if (!imageType) return;
        const blob = await imageItem.getType(imageType);
        const file = new File([blob], 'clipboard-image.png', { type: imageType });
        await createImageFileNode(file, getCanvasCenter());
        message.success(t('canvas.projectPage.clipboardImageAdded'));
        return;
      }
    } catch {
      // WebKit can deny ClipboardItem access in a Tauri WebView. Text still has a native command fallback below.
    }

    try {
      const text = await readClipboardText();
      if (createTextNodeFromClipboard(text)) message.success(t('canvas.projectPage.clipboardTextAdded'));
    } catch {
      // Clipboard permission failures are expected platform outcomes and must not escape as unhandled rejections.
    }
  }, [createImageFileNode, createTextNodeFromClipboard, getCanvasCenter, message, t]);

  const runDesktopEditCommand = useCallback(
    async (command: DesktopCanvasCommand) => {
      const activeElement = document.activeElement;
      const field =
        activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement ? activeElement : null;
      const editable = field || (activeElement instanceof HTMLElement && activeElement.isContentEditable ? activeElement : null);

      if (editable) {
        if (command === 'canvas_select_all') {
          if (field) field.select();
          else {
            const range = document.createRange();
            range.selectNodeContents(editable);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
          return;
        }
        if (command === 'canvas_paste') {
          try {
            const text = await readClipboardText();
            if (text) document.execCommand?.('insertText', false, text);
          } catch {
            // A denied clipboard read is a normal platform outcome; keep focus and leave the field unchanged.
          }
          return;
        }
        const editCommand = {
          canvas_undo: 'undo',
          canvas_redo: 'redo',
          canvas_cut: 'cut',
          canvas_copy: 'copy',
        }[command];
        if (editCommand) document.execCommand?.(editCommand);
        return;
      }

      if (command === 'canvas_undo') undoCanvas();
      else if (command === 'canvas_redo') redoCanvas();
      else if (command === 'canvas_copy') copySelectedNodes();
      else if (command === 'canvas_cut') {
        copySelectedNodes();
        deleteNodes(new Set(selectedNodeIdsRef.current));
      } else if (command === 'canvas_paste') {
        if (!pasteCopiedNodes()) await pasteSystemClipboard();
      } else if (command === 'canvas_select_all') {
        setSelectedNodeIds(new Set(nodesRef.current.map((node) => node.id)));
        setSelectedConnectionId(null);
        setContextMenu(null);
        setSelectionBox(null);
      }
    },
    [copySelectedNodes, deleteNodes, pasteCopiedNodes, pasteSystemClipboard, redoCanvas, undoCanvas],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        target?.closest("[contenteditable='true'],[data-canvas-no-zoom],[data-canvas-shortcuts-ignore]")
      )
        return;

      const key = event.key.toLowerCase();
      const isModifierShortcut = event.metaKey || event.ctrlKey;

      if (isModifierShortcut && key === 'c' && window.getSelection()?.toString()) return;

      if (isModifierShortcut && !event.altKey && key === 'z') {
        event.preventDefault();
        if (event.shiftKey) redoCanvas();
        else undoCanvas();
        return;
      }

      if (isModifierShortcut && !event.altKey && key === 'y') {
        event.preventDefault();
        redoCanvas();
        return;
      }

      if (isModifierShortcut && !event.altKey && key === 'a') {
        event.preventDefault();
        setSelectedNodeIds(new Set(nodesRef.current.map((node) => node.id)));
        setSelectedConnectionId(null);
        setContextMenu(null);
        setSelectionBox(null);
        return;
      }

      if (isModifierShortcut && !event.altKey && key === 'c') {
        event.preventDefault();
        copySelectedNodes();
        return;
      }

      if (isModifierShortcut && !event.altKey && key === 'v') {
        event.preventDefault();
        if (!pasteCopiedNodes()) void pasteSystemClipboard();
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNodeIdsRef.current.size) {
          deleteNodes(new Set(selectedNodeIdsRef.current));
        } else if (selectedConnectionId) {
          deleteConnection(selectedConnectionId);
        }
      }

      if (event.key === 'Escape') {
        setSelectedNodeIds(new Set());
        setSelectedConnectionId(null);
        setContextMenu(null);
        setNodeCreatePosition(null);
        setSelectionBox(null);
        setConnecting(null);
        setHoveredNodeId(null);
        setToolbarNodeId(null);
        setDialogNodeId(null);
        setEditingNodeId(null);
        setInfoNodeId(null);
        setCropNodeId(null);
        setMaskEditNodeId(null);
        setPendingConnectionCreate(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    copySelectedNodes,
    deleteConnection,
    deleteNodes,
    pasteCopiedNodes,
    pasteSystemClipboard,
    redoCanvas,
    selectedConnectionId,
    setConnecting,
    undoCanvas,
  ]);

  const handleConnectStart = useCallback(
    (event: ReactMouseEvent, nodeId: string, handleType: 'source' | 'target') => {
      event.stopPropagation();
      setMouseWorld(screenToCanvas(event.clientX, event.clientY));
      setConnecting({ nodeId, handleType });
      connectionTargetNodeIdRef.current = null;
      setConnectionTargetNodeId(null);
      setSelectedConnectionId(null);
    },
    [screenToCanvas, setConnecting],
  );

  const handleNodeResize = useCallback((nodeId: string, width: number, height: number, position?: Position) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, width, height, position: position || node.position } : node)),
    );
  }, []);

  const handleNodeResizeStart = useCallback(() => {
    setIsNodeResizing(true);
    setExpandedImageNodeId(null);
  }, []);
  const handleNodeResizeEnd = useCallback(() => setIsNodeResizing(false), []);

  const toggleNodeFreeResize = useCallback((nodeId: string) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id !== nodeId) return node;
        const freeResize = !node.metadata?.freeResize;
        if (freeResize || node.type !== CanvasNodeType.Image)
          return { ...node, metadata: { ...node.metadata, freeResize } };
        const ratio = (node.metadata?.naturalWidth || node.width) / (node.metadata?.naturalHeight || node.height || 1);
        const height = node.width / ratio;
        return {
          ...node,
          height,
          position: { x: node.position.x, y: node.position.y + node.height / 2 - height / 2 },
          metadata: { ...node.metadata, freeResize },
        };
      }),
    );
  }, []);

  const handleNodeContentChange = useCallback((nodeId: string, content: string) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, metadata: { ...node.metadata, content } } : node)),
    );
  }, []);

  const handleNodeTitleChange = useCallback((nodeId: string, title: string) => {
    setNodes((prev) => prev.map((node) => (node.id === nodeId ? { ...node, title } : node)));
  }, []);

  const toggleBatchExpanded = useCallback((nodeId: string) => {
    setExpandedImageNodeId((current) => (current === nodeId ? null : nodeId));
  }, []);

  const setBatchPrimary = useCallback((nodeId: string, imageId: string) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id !== nodeId) return node;
        const image = node.metadata?.images?.find((item) => item.id === imageId);
        if (!image?.content) return node;
        const edge = Math.max(node.width, node.height);
        const size = node.metadata?.freeResize
          ? { width: node.width, height: node.height }
          : fitNodeSize(image.naturalWidth, image.naturalHeight, edge, edge);
        return {
          ...node,
          position: {
            x: node.position.x + node.width / 2 - size.width / 2,
            y: node.position.y + node.height / 2 - size.height / 2,
          },
          ...size,
          metadata: {
            ...node.metadata,
            content: image.content,
            storageKey: image.storageKey,
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
            bytes: image.bytes,
            mimeType: image.mimeType,
            primaryImageId: image.id,
          },
        };
      }),
    );
  }, []);

  const duplicateBatchImage = useCallback((node: CanvasNodeData, imageId: string) => {
    const image = node.metadata?.images?.find((item) => item.id === imageId);
    if (!image?.content) return;
    const id = nanoid();
    const edge = Math.max(node.width, node.height);
    const size = fitNodeSize(image.naturalWidth, image.naturalHeight, edge, edge);
    const copy: CanvasNodeData = {
      id,
      type: CanvasNodeType.Image,
      title: node.title,
      position: { x: node.position.x + node.width * 2 + 96, y: node.position.y + node.height / 2 - size.height / 2 },
      ...size,
      metadata: {
        content: image.content,
        storageKey: image.storageKey,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        bytes: image.bytes,
        mimeType: image.mimeType,
        status: NODE_STATUS_SUCCESS,
        prompt: node.metadata?.prompt,
        generationType: node.metadata?.generationType,
        model: node.metadata?.model,
        size: node.metadata?.size,
        quality: node.metadata?.quality,
        imageResolution: node.metadata?.imageResolution,
        imageVersion: node.metadata?.imageVersion,
        background: node.metadata?.background,
        references: node.metadata?.references,
      },
    };
    setNodes((prev) => [...prev, copy]);
    setSelectedNodeIds(new Set([id]));
    setSelectedConnectionId(null);
    setDialogNodeId(id);
  }, []);

  const openTextEditor = useCallback((node: CanvasNodeData) => {
    if (node.type !== CanvasNodeType.Text) return;
    setSelectedNodeIds(new Set([node.id]));
    setSelectedConnectionId(null);
    setDialogNodeId(node.id);
    setEditingNodeId(node.id);
    setEditRequestNonce((value) => value + 1);
  }, []);

  const handleAudioDurationChange = useCallback((nodeId: string, url: string, durationMs: number) => {
    if (!Number.isFinite(durationMs) || durationMs <= 0) return;
    setNodes((previous) => previous.map((node) => node.id === nodeId && node.metadata?.content === url && node.metadata.durationMs !== durationMs
      ? { ...node, metadata: { ...node.metadata, durationMs } } : node));
  }, []);

  const handleNodePromptChange = useCallback((nodeId: string, prompt: string) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, metadata: { ...node.metadata, prompt } } : node)),
    );
  }, []);

  const handleConfigNodeChange = useCallback((nodeId: string, patch: Partial<CanvasNodeData['metadata']>) => {
    setNodes((prev) => prev.map((node) => (node.id === nodeId ? applyNodeConfigPatch(node, patch) : node)));
  }, []);

  const downloadNodeImage = useCallback(
    (node: CanvasNodeData) => {
      if (
        (node.type !== CanvasNodeType.Image &&
          node.type !== CanvasNodeType.Video &&
          node.type !== CanvasNodeType.Audio) ||
        !node.metadata?.content
      )
        return;
      void saveAs(
        node.metadata.content,
        `canvas-${node.type}-${node.id}.${node.type === CanvasNodeType.Video ? 'mp4' : node.type === CanvasNodeType.Audio ? audioExtension(node.metadata.mimeType) : imageExtension(node.metadata.content)}`,
      ).catch((error) => integrations.onError?.(error, 'download-canvas-media'));
    },
    [integrations],
  );

  const downloadBatchImage = useCallback(
    (node: CanvasNodeData, imageId: string) => {
      const image = node.metadata?.images?.find((item) => item.id === imageId);
      if (!image?.content) return;
      void saveAs(image.content, `canvas-image-${node.id}-${image.id}.${imageExtension(image.content)}`).catch((error) =>
        integrations.onError?.(error, 'download-canvas-media'),
      );
    },
    [integrations],
  );

  const saveNodeAsset = useCallback(
    async (node: CanvasNodeData) => {
      if (node.type === CanvasNodeType.Text) {
        const content = node.metadata?.content?.trim();
        if (!content) return message.error(t('canvas.projectPage.noTextToSave'));
        addAsset({
          kind: 'text',
          title: node.metadata?.prompt?.slice(0, 24) || node.title || t('canvas.projectPage.canvasText'),
          coverUrl: '',
          tags: [],
          source: 'Canvas',
          data: { content },
          metadata: { source: 'canvas', nodeId: node.id },
        });
        message.success(t('common.addedToAssets'));
        return;
      }
      if (node.type === CanvasNodeType.Video) {
        if (!node.metadata?.content) return message.error(t('canvas.projectPage.noVideoToSave'));
        addAsset({
          kind: 'video',
          title: node.metadata?.prompt?.slice(0, 24) || node.title || t('canvas.projectPage.canvasVideo'),
          coverUrl: '',
          tags: [],
          source: 'Canvas',
          data: {
            url: node.metadata.content,
            storageKey: node.metadata.storageKey,
            width: node.width,
            height: node.height,
            bytes: node.metadata.bytes || 0,
            mimeType: node.metadata.mimeType || 'video/mp4',
          },
          metadata: { source: 'canvas', nodeId: node.id, prompt: node.metadata?.prompt },
        });
        message.success(t('common.addedToAssets'));
        return;
      }
      if (!node.metadata?.content) return message.error(t('canvas.projectPage.noImageToSave'));
      const dataUrl = node.metadata.storageKey ? '' : node.metadata.content;
      addAsset({
        kind: 'image',
        title: node.metadata?.prompt?.slice(0, 24) || node.title || t('canvas.projectPage.canvasImage'),
        coverUrl: node.metadata.content,
        tags: [],
        source: 'Canvas',
        data: {
          dataUrl,
          storageKey: node.metadata.storageKey,
          width: node.metadata.naturalWidth || node.width,
          height: node.metadata.naturalHeight || node.height,
          bytes: node.metadata.bytes || getDataUrlByteSize(dataUrl),
          mimeType: node.metadata.mimeType || 'image/png',
        },
        metadata: { source: 'canvas', nodeId: node.id, prompt: node.metadata?.prompt },
      });
      message.success(t('common.addedToAssets'));
    },
    [addAsset, message, t],
  );

  const createImageReversePromptNodes = useCallback(
    (node: CanvasNodeData) => {
      if (node.type !== CanvasNodeType.Image || !node.metadata?.content) {
        message.warning(t('canvas.projectPage.emptyReverse'));
        return;
      }

      const gap = 96;
      const textSpec = NODE_DEFAULT_SIZE[CanvasNodeType.Text];
      const configSpec = NODE_DEFAULT_SIZE[CanvasNodeType.Config];
      const centerY = node.position.y + node.height / 2;
      const textNode = {
        ...createCanvasNode(
          CanvasNodeType.Text,
          { x: node.position.x + node.width + gap + textSpec.width / 2, y: centerY },
          {
            content: t('canvas.projectPage.reversePreset'),
            prompt: t('canvas.projectPage.reversePreset'),
            status: NODE_STATUS_SUCCESS,
            fontSize: 14,
          },
        ),
        title: t('canvas.projectPage.reverseTitle'),
      };
      const configNode = {
        ...createCanvasNode(
          CanvasNodeType.Config,
          { x: textNode.position.x + textNode.width + gap + configSpec.width / 2, y: centerY },
          {
            generationMode: 'text',
            model: effectiveConfig.textModel || effectiveConfig.model || defaultConfig.textModel,
            count: 1,
            composerContent: t('canvas.reverseComposer', { imageId: node.id, textId: textNode.id }),
          },
        ),
        title: t('canvas.projectPage.reverseConfigTitle'),
      };

      setNodes((prev) => [...prev, textNode, configNode]);
      setConnections((prev) => [
        ...prev,
        { id: nanoid(), fromNodeId: node.id, toNodeId: configNode.id },
        { id: nanoid(), fromNodeId: textNode.id, toNodeId: configNode.id },
      ]);
      setSelectedNodeIds(new Set([configNode.id]));
      setSelectedConnectionId(null);
      setDialogNodeId(configNode.id);
      setContextMenu(null);
    },
    [effectiveConfig.model, effectiveConfig.textModel, message, t],
  );

  const cropImageNode = useCallback(
    async (node: CanvasNodeData, crop: CanvasImageCropRect) => {
      if (!node.metadata?.content) return false;
      try {
        const cropped = await cropDataUrl(node.metadata.content, crop);
        const image = await uploadCanvasImage(cropped);
        const width = Math.min(node.width, Math.max(220, image.width));
        const childId = nanoid();
        const child: CanvasNodeData = {
          id: childId,
          type: CanvasNodeType.Image,
          title: 'Cropped Image',
          position: { x: node.position.x + node.width + 96, y: node.position.y },
          width,
          height: width * (image.height / image.width),
          metadata: {
            ...imageMetadata(image),
            prompt: node.metadata?.prompt,
          },
        };
        setNodes((prev) => [...prev, child]);
        setConnections((prev) => [...prev, { id: nanoid(), fromNodeId: node.id, toNodeId: childId }]);
        setSelectedNodeIds(new Set([childId]));
        setDialogNodeId(childId);
        return true;
      } catch (error) {
        integrations.onError?.(error, 'crop-image');
        message.error(error instanceof Error ? error.message : i18n.assets.uploadFailed);
        return false;
      }
    },
    [i18n.assets.uploadFailed, integrations, message, uploadCanvasImage],
  );

  const splitImageNode = useCallback(
    async (node: CanvasNodeData, params: CanvasImageSplitParams) => {
      if (!node.metadata?.content) return;
      setSplitNodeId(null);
      const pieces = await splitDataUrl(node.metadata.content, params);
      const gap = 16;
      const cellWidth = node.width / params.columns;
      const cellHeight = node.height / params.rows;
      const startX = node.position.x + node.width + 96;
      const startY = node.position.y;
      const childNodes = await Promise.all(
        pieces.map(async (piece) => {
          const image = await uploadCanvasImage(piece.dataUrl);
          const id = nanoid();
          return {
            id,
            type: CanvasNodeType.Image,
            title: t('canvas.projectPage.splitTitle', {
              name: node.title || t('assets.kinds.image'),
              row: piece.row + 1,
              column: piece.column + 1,
            }),
            position: { x: startX + piece.column * (cellWidth + gap), y: startY + piece.row * (cellHeight + gap) },
            width: cellWidth,
            height: cellHeight,
            metadata: {
              ...imageMetadata(image),
              prompt: node.metadata?.prompt,
            },
          } satisfies CanvasNodeData;
        }),
      );
      setNodes((prev) => [...prev, ...childNodes]);
      setConnections((prev) => [
        ...prev,
        ...childNodes.map((child) => ({ id: nanoid(), fromNodeId: node.id, toNodeId: child.id })),
      ]);
      setSelectedNodeIds(new Set(childNodes.map((child) => child.id)));
      setSelectedConnectionId(null);
      setDialogNodeId(null);
      message.success(t('canvas.projectPage.splitSuccess', { count: childNodes.length }));
    },
    [message, t, uploadCanvasImage],
  );

  const maskEditImageNode = useCallback(
    async (node: CanvasNodeData, payload: CanvasImageMaskEditPayload) => {
      if (!node.metadata?.content) return;
      const generationConfig = {
        ...buildGenerationConfig(effectiveConfig, node, 'image'),
        count: '1',
        size: node.metadata?.size || 'auto',
      };
      if (hasUnavailableMusicInput(nodeId, nodesRef.current, connectionsRef.current)) {
        message.error(t('music.selectAvailableResult'));
        return;
      }
      if (!isAiConfigReady(generationConfig, generationConfig.model)) {
        openConfigDialog(true);
        return;
      }
      const userPrompt = payload.prompt.trim();
      const prompt = t('canvas.projectPage.maskPrompt', { prompt: userPrompt });
      const childId = nanoid();
      const source = {
        id: node.id,
        name: `${node.title || node.id}.png`,
        type: node.metadata.mimeType || 'image/png',
        dataUrl: node.metadata.content,
        storageKey: node.metadata.storageKey,
      };
      const generationMetadata = buildImageGenerationMetadata('edit', generationConfig, 1, [source]);
      setMaskEditNodeId(null);
      setRunningNodeId(childId);
      setNodes((prev) => [
        ...prev,
        {
          id: childId,
          type: CanvasNodeType.Image,
          title: userPrompt.slice(0, 32) || t('canvas.projectPage.maskResult'),
          position: { x: node.position.x + node.width + 96, y: node.position.y },
          width: node.width,
          height: node.height,
          metadata: { prompt, status: NODE_STATUS_LOADING, ...generationMetadata },
        },
      ]);
      setConnections((prev) => [...prev, { id: nanoid(), fromNodeId: node.id, toNodeId: childId }]);
      setSelectedNodeIds(new Set([childId]));
      setSelectedConnectionId(null);
      setDialogNodeId(childId);
      const controller = startGenerationRequest(childId, node.id, childId);
      try {
        const image = await requestEdit(
          generationConfig,
          prompt,
          [source],
          { id: `${node.id}-mask`, name: 'mask.png', type: 'image/png', dataUrl: payload.maskDataUrl },
          generationOptions(childId, controller.signal),
        ).then((items) => items[0]);
        const uploaded = await uploadCanvasImage(image.dataUrl);
        const size = fitNodeSize(uploaded.width, uploaded.height, node.width, node.height);
        setNodes((prev) =>
          prev.map((item) =>
            item.id === childId
              ? {
                  ...item,
                  width: size.width,
                  height: size.height,
                  metadata: { ...item.metadata, ...imageMetadata(uploaded), prompt, ...generationMetadata },
                }
              : item,
          ),
        );
      } catch (error) {
        if (isGenerationCanceled(error)) return;
        const errorDetails = error instanceof Error ? error.message : t('canvas.projectPage.maskFailed');
        message.error(errorDetails);
        setNodes((prev) =>
          prev.map((item) =>
            item.id === childId
              ? { ...item, metadata: { ...item.metadata, status: NODE_STATUS_ERROR, errorDetails } }
              : item,
          ),
        );
      } finally {
        finishGenerationRequest(childId, controller);
        setRunningNodeId(null);
      }
    },
    [
      effectiveConfig,
      finishGenerationRequest,
      generationOptions,
      isAiConfigReady,
      message,
      openConfigDialog,
      startGenerationRequest,
      t,
      uploadCanvasImage,
    ],
  );

  const upscaleImageNode = useCallback(async (node: CanvasNodeData, params: CanvasImageUpscaleParams) => {
    if (!node.metadata?.content) return;
    setUpscaleNodeId(null);
    const upscaled = await upscaleDataUrl(node.metadata.content, params);
    const image = await uploadCanvasImage(upscaled);
    const size = fitNodeSize(image.width, image.height);
    const childId = nanoid();
    const child: CanvasNodeData = {
      id: childId,
      type: CanvasNodeType.Image,
      title: 'Upscaled Image',
      position: { x: node.position.x + node.width + 96, y: node.position.y },
      width: size.width,
      height: size.height,
      metadata: {
        ...imageMetadata(image),
        prompt: node.metadata?.prompt,
      },
    };
    setNodes((prev) => [...prev, child]);
    setConnections((prev) => [...prev, { id: nanoid(), fromNodeId: node.id, toNodeId: childId }]);
    setSelectedNodeIds(new Set([childId]));
    setDialogNodeId(childId);
  }, [uploadCanvasImage]);

  const generateAngleNode = useCallback(
    async (node: CanvasNodeData, params: CanvasImageAngleParams) => {
      if (!node.metadata?.content) return;
      const generationConfig = { ...buildGenerationConfig(effectiveConfig, node, 'image'), count: '1' };
      if (hasUnavailableMusicInput(nodeId, nodesRef.current, connectionsRef.current)) {
        message.error(t('music.selectAvailableResult'));
        return;
      }
      if (!isAiConfigReady(generationConfig, generationConfig.model)) {
        openConfigDialog(true);
        return;
      }
      const childId = nanoid();
      const imageConfig = NODE_DEFAULT_SIZE[CanvasNodeType.Image];
      const title = buildAngleLabel(params);
      const prompt = buildAnglePrompt(params);
      const generationMetadata = buildImageGenerationMetadata('edit', generationConfig, 1, [
        {
          id: node.id,
          name: `${node.title || node.id}.png`,
          type: node.metadata.mimeType || 'image/png',
          dataUrl: node.metadata.content,
          storageKey: node.metadata.storageKey,
        },
      ]);
      setAngleNodeId(null);
      setRunningNodeId(childId);
      setNodes((prev) => [
        ...prev,
        {
          id: childId,
          type: CanvasNodeType.Image,
          title,
          position: { x: node.position.x + node.width + 96, y: node.position.y },
          width: imageConfig.width,
          height: imageConfig.height,
          metadata: { prompt, status: NODE_STATUS_LOADING, ...generationMetadata },
        },
      ]);
      setConnections((prev) => [...prev, { id: nanoid(), fromNodeId: node.id, toNodeId: childId }]);
      setSelectedNodeIds(new Set([childId]));
      setDialogNodeId(childId);
      const controller = startGenerationRequest(childId, node.id, childId);
      try {
        const image = await requestEdit(
          generationConfig,
          prompt,
          [
            {
              id: node.id,
              name: `${node.title || node.id}.png`,
              type: node.metadata.mimeType || 'image/png',
              dataUrl: node.metadata.content,
              storageKey: node.metadata.storageKey,
            },
          ],
          undefined,
          generationOptions(childId, controller.signal),
        ).then((items) => items[0]);
        const uploaded = await uploadCanvasImage(image.dataUrl);
        const size = fitNodeSize(uploaded.width, uploaded.height, imageConfig.width, imageConfig.height);
        setNodes((prev) =>
          prev.map((item) =>
            item.id === childId
              ? {
                  ...item,
                  width: size.width,
                  height: size.height,
                  metadata: { ...item.metadata, ...imageMetadata(uploaded), prompt, ...generationMetadata },
                }
              : item,
          ),
        );
      } catch (error) {
        if (isGenerationCanceled(error)) return;
        const errorDetails = error instanceof Error ? error.message : t('canvas.projectPage.generationFailed');
        setNodes((prev) =>
          prev.map((item) =>
            item.id === childId
              ? { ...item, metadata: { ...item.metadata, status: NODE_STATUS_ERROR, errorDetails } }
              : item,
          ),
        );
      } finally {
        finishGenerationRequest(childId, controller);
        setRunningNodeId(null);
      }
    },
    [effectiveConfig, finishGenerationRequest, generationOptions, openConfigDialog, startGenerationRequest, t, uploadCanvasImage],
  );

  const handleFontSizeChange = useCallback((nodeId: string, fontSize: number) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, metadata: { ...node.metadata, fontSize } } : node)),
    );
  }, []);

  const handleUploadRequest = useCallback((nodeId?: string, position?: Position) => {
    const nodeType = nodeId ? nodesRef.current.find((node) => node.id === nodeId)?.type : undefined;
    uploadTargetRef.current = { nodeId, nodeType, position };
    if (imageInputRef.current) imageInputRef.current.accept = canvasMediaFileAccept(nodeType);
    imageInputRef.current?.click();
  }, []);

  const handleImageInputChange = useCallback(
    async (event: ReactChangeEvent<HTMLInputElement>) => {
      const target = uploadTargetRef.current;
      const files = Array.from(event.target.files || []).filter((file) => acceptsCanvasMediaFile(file, target?.nodeType));
      if (!files.length) {
        uploadTargetRef.current = null;
        event.target.value = '';
        return;
      }

      const targetNodeId = target?.nodeId;
      if (targetNodeId) {
        setNodes((prev) => startCanvasNodeUpload(prev, targetNodeId));
      }

      try {
        const basePosition =
          target?.position ||
          screenToCanvas(
            (containerRef.current?.getBoundingClientRect().left || 0) + size.width / 2,
            (containerRef.current?.getBoundingClientRect().top || 0) + size.height / 2,
          );
        const STAGGER = 40; // Offset between multiple imported files.

        // When replacing a target node, use the first file as the replacement and create the rest nearby.
        if (target?.nodeId) {
          const [first, ...rest] = files;

        // Replace the target node with the first file.
        const firstMediaType = canvasMediaFileType(first);
        if (firstMediaType === 'audio') {
          const audio = await uploadCanvasMediaFile(first, 'audio');
          const spec = NODE_DEFAULT_SIZE[CanvasNodeType.Audio];
          setNodes((prev) =>
            prev.map((node) =>
              node.id === target.nodeId
                ? {
                    ...node,
                    type: CanvasNodeType.Audio,
                    title: first.name,
                    position: {
                      x: node.position.x + node.width / 2 - spec.width / 2,
                      y: node.position.y + node.height / 2 - spec.height / 2,
                    },
                    width: spec.width,
                    height: spec.height,
                    metadata: {
                      ...node.metadata,
                      ...audioMetadata(audio),
                      errorDetails: undefined,
                    },
                  }
                : node,
            ),
          );
          setSelectedNodeIds(new Set([target.nodeId]));
          setSelectedConnectionId(null);
        } else if (firstMediaType === 'video') {
          const video = await uploadCanvasMediaFile(first, 'video');
          const nextSize = fitNodeSize(
            video.width || 1280,
            video.height || 720,
            VIDEO_NODE_MAX_WIDTH,
            VIDEO_NODE_MAX_HEIGHT,
          );
          setNodes((prev) =>
            prev.map((node) =>
              node.id === target.nodeId
                ? {
                    ...node,
                    type: CanvasNodeType.Video,
                    title: first.name,
                    position: {
                      x: node.position.x + node.width / 2 - nextSize.width / 2,
                      y: node.position.y + node.height / 2 - nextSize.height / 2,
                    },
                    width: nextSize.width,
                    height: nextSize.height,
                    metadata: {
                      ...node.metadata,
                      ...videoMetadata(video),
                      errorDetails: undefined,
                    },
                  }
                : node,
            ),
          );
          setSelectedNodeIds(new Set([target.nodeId]));
          setSelectedConnectionId(null);
        } else {
          const image = await uploadCanvasImage(first);
          const s = fitNodeSize(image.width, image.height);
          setNodes((prev) =>
            prev.map((node) =>
              node.id === target.nodeId
                ? {
                    ...node,
                    type: CanvasNodeType.Image,
                    title: first.name,
                    width: s.width,
                    height: s.height,
                    metadata: {
                      ...node.metadata,
                      ...imageMetadata(image),
                      errorDetails: undefined,
                      freeResize: false,
                      images: undefined,
                      generationType: undefined,
                      model: undefined,
                      size: undefined,
                      quality: undefined,
                      imageResolution: undefined,
                      imageVersion: undefined,
                      count: undefined,
                      references: undefined,
                      primaryImageId: undefined,
                    },
                  }
                : node,
            ),
          );
          setSelectedNodeIds(new Set([target.nodeId]));
          setSelectedConnectionId(null);
        }

          await Promise.all(
            rest.map((file, index) =>
              createLocalFileNode(file, {
                x: basePosition.x + (index + 1) * STAGGER,
                y: basePosition.y + (index + 1) * STAGGER,
              }),
            ),
          );
        } else {
          await Promise.all(
            files.map((file, index) =>
              createLocalFileNode(file, {
                x: basePosition.x + index * STAGGER,
                y: basePosition.y + index * STAGGER,
              }),
            ),
          );
        }
      } catch (error) {
        const errorDetails = error instanceof Error ? error.message : i18n.assets.uploadFailed;
        if (targetNodeId) {
          setNodes((prev) => failCanvasNodeUpload(prev, targetNodeId, errorDetails));
        }
        message.error(errorDetails);
      } finally {
        uploadTargetRef.current = null;
        event.target.value = '';
      }
    },
    [createLocalFileNode, message, screenToCanvas, size.height, size.width, t, uploadCanvasImage, uploadCanvasMediaFile],
  );

  const handleDrop = useCallback(
    async (event: ReactDragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const files = Array.from(event.dataTransfer.files).filter((item) => acceptsCanvasMediaFile(item));
      if (!files.length) return;

      const basePos = screenToCanvas(event.clientX, event.clientY);
      const STAGGER = 40;
      try {
        await Promise.all(
          files.map((file, index) =>
            createLocalFileNode(file, { x: basePos.x + index * STAGGER, y: basePos.y + index * STAGGER }),
          ),
        );
      } catch (error) {
        message.error(error instanceof Error ? error.message : i18n.assets.uploadFailed);
      }
    },
    [createLocalFileNode, message, screenToCanvas, t],
  );

  const startTitleEditing = useCallback(() => {
    setTitleDraft(currentProject?.title || t('canvas.projectPage.untitledCanvas'));
    setTitleEditing(true);
  }, [currentProject?.title, t]);

  const finishTitleEditing = useCallback(() => {
    const nextTitle = titleDraft.trim();
    if (nextTitle) {
      updateProject(projectId, { title: nextTitle });
      void projectActions.rename(nextTitle).catch((error) => integrations.onError?.(error, 'rename-project'));
    }
    setTitleEditing(false);
  }, [integrations, projectActions, projectId, titleDraft, updateProject]);

  const openCanvasContextMenu = useCallback((clientX: number, clientY: number) => {
    setNodeCreatePosition(null);
    setContextMenu({
      type: 'canvas',
      x: clientX,
      y: clientY,
      position: screenToCanvas(clientX, clientY),
    });
  }, [screenToCanvas]);

  const preventCanvasContextMenu = useCallback((event: ReactMouseEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('[data-node-id],[data-connection-id],[data-canvas-overlay],[data-canvas-no-zoom]')) return;
    event.preventDefault();
    openCanvasContextMenu(event.clientX, event.clientY);
  }, [openCanvasContextMenu]);

  const handleGenerateNode = useCallback(
    async (nodeId: string, mode: CanvasNodeGenerationMode, prompt: string) => {
      const sourceNode = nodesRef.current.find((node) => node.id === nodeId);
      const hasSourceVideoReference =
        mode === 'video' && sourceNode?.type === CanvasNodeType.Video && Boolean(sourceNode.metadata?.content);
      const baseGenerationConfig = buildGenerationConfig(effectiveConfig, sourceNode, mode);
      const adapter = effectiveConfig.modelAdapter;
      const configInputTypes =
        sourceNode?.type === CanvasNodeType.Config
          ? new Set(
              connectionsRef.current
                .filter((connection) => connection.toNodeId === nodeId)
                .map((connection) => nodesRef.current.find((node) => node.id === connection.fromNodeId)?.type)
                .filter((type): type is CanvasNodeTypeId => Boolean(type)),
            )
          : null;
      const usesReferenceVideoModel = Boolean(
        !adapter?.getUnavailableReason && mode === 'video' &&
          (hasSourceVideoReference || configInputTypes?.has(CanvasNodeType.Video)),
      );
      const referenceVideoModel = usesReferenceVideoModel
        ? resolveSourceReferenceVideoModel(baseGenerationConfig.model, adapter)
        : '';
      const referenceVideoDefaults = usesReferenceVideoModel
        ? getSourceVideoModelDefaults(
            referenceVideoModel,
            {
              hasImage: configInputTypes?.has(CanvasNodeType.Image) ?? false,
              hasVideoSubjects: true,
            },
            adapter,
          )
        : undefined;
      const needsReferenceVideoDefaults = Boolean(
        referenceVideoDefaults &&
          sourceModelName(baseGenerationConfig.model) !== sourceModelName(referenceVideoModel),
      );
      let generationConfig =
        needsReferenceVideoDefaults
            ? {
                ...baseGenerationConfig,
                model: referenceVideoModel,
                size: referenceVideoDefaults!.ratio,
                videoGenerateAudio: String(referenceVideoDefaults!.enableAudio),
                videoSeconds: referenceVideoDefaults!.duration,
                vquality: referenceVideoDefaults!.resolution,
              }
            : baseGenerationConfig;
      if (hasUnavailableMusicInput(nodeId, nodesRef.current, connectionsRef.current)) {
        message.error(t('music.selectAvailableResult'));
        return;
      }
      if (!isAiConfigReady(generationConfig, generationConfig.model)) {
        openConfigDialog(true);
        return;
      }

      // useBuiltinPanel.writeBackToSelf reuses built-in generation while writing the result back to the plugin node.
      // Image mode currently supports display-only nodes such as panoramas, with a useBuiltinPanel.promptPrefix.
      const builtinPanel = sourceNode ? getNodeDefinition(sourceNode.type)?.useBuiltinPanel : undefined;
      if (sourceNode && builtinPanel?.writeBackToSelf && builtinPanel.mode === 'image') {
        const scene = prompt.trim();
        if (!scene) return;
        setRunningNodeId(nodeId);
        const controller = startGenerationRequest(nodeId, nodeId, nodeId);
        setNodes((prev) =>
          prev.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  metadata: { ...node.metadata, prompt: scene, status: NODE_STATUS_LOADING, errorDetails: undefined },
                }
              : node,
          ),
        );
        try {
          const fullPrompt = (builtinPanel.promptPrefix || '') + scene;
          // Upstream image nodes become references; without them this is text-to-image.
          const upstreamNodes = connectionsRef.current
            .filter((conn) => conn.toNodeId === nodeId)
            .map((conn) => nodesRef.current.find((node) => node.id === conn.fromNodeId))
            .filter((node): node is CanvasNodeData => Boolean(node));
          const refs = upstreamNodes.flatMap((up) =>
            typeof up.metadata?.content === 'string' && up.metadata.content && up.type !== sourceNode.type
              ? [
                  {
                    id: up.id,
                    name: `${up.title || up.id}.png`,
                    type: up.metadata.mimeType || 'image/png',
                    dataUrl: up.metadata.content,
                    storageKey: up.metadata.storageKey,
                  },
                ]
              : [],
          );
          const image = refs.length
            ? await requestEdit(
                { ...generationConfig, count: '1' },
                fullPrompt,
                refs,
                undefined,
                generationOptions(nodeId, controller.signal),
              ).then((items) => items[0])
            : await requestGeneration(
                { ...generationConfig, count: '1' },
                fullPrompt,
                generationOptions(nodeId, controller.signal),
              ).then((items) => items[0]);
          const uploaded = await uploadCanvasImage(image.dataUrl);
          setNodes((prev) =>
            prev.map((node) =>
              node.id === nodeId
                ? {
                    ...node,
                    metadata: {
                      ...node.metadata,
                      ...imageMetadata(uploaded),
                      prompt: scene,
                      model: generationConfig.model,
                      status: NODE_STATUS_SUCCESS,
                      errorDetails: undefined,
                    },
                  }
                : node,
            ),
          );
          setDialogNodeId(null);
        } catch (error) {
          if (!isGenerationCanceled(error)) {
            const errorDetails = error instanceof Error ? error.message : t('canvas.projectPage.generationFailed');
            message.error(errorDetails);
            setNodes((prev) =>
              prev.map((node) =>
                node.id === nodeId
                  ? { ...node, metadata: { ...node.metadata, status: NODE_STATUS_ERROR, errorDetails } }
                  : node,
              ),
            );
          }
        } finally {
          finishGenerationRequest(nodeId, controller);
        }
        return;
      }

      setRunningNodeId(nodeId);
      const runController = startGenerationRequest(nodeId, nodeId, nodeId);
      const sourceTextContent =
        sourceNode?.type === CanvasNodeType.Text ? sourceNode.metadata?.content?.trim() || '' : '';
      const editingTextNode = mode === 'text' && Boolean(sourceTextContent);
      const rawGenerationContext = buildNodeGenerationContext(
        nodeId,
        nodesRef.current,
        connectionsRef.current,
        editingTextNode ? t('canvas.projectPage.editTextPrompt', { source: sourceTextContent, prompt }) : prompt,
      );
      const generationContext =
        mode === 'text' ? await hydrateNodeGenerationContext(rawGenerationContext) : rawGenerationContext;
      const connectedMusicText = mode === 'music' ? buildNodeGenerationInputs(nodeId, nodesRef.current, connectionsRef.current)
        .filter((input) => input.type === 'text').map((input) => input.text || '').join('\n\n') : '';
      if (mode === 'music') generationConfig = { ...generationConfig, musicConnectedText: connectedMusicText };
      const effectivePrompt = (mode === 'music' ? resolveMusicComposerPrompt(prompt, buildNodeGenerationInputs(nodeId, nodesRef.current, connectionsRef.current)) : generationContext.prompt).trim();
      if (runController.signal.aborted) {
        finishGenerationRequest(nodeId, runController);
        setRunningNodeId(null);
        return;
      }
      const isMusicResultSource = mode === 'music' && sourceNode?.type === CanvasNodeType.Audio && (sourceNode.metadata?.musicResultSource || (!sourceNode.metadata?.content && !sourceNode.metadata?.musicRecordId));
      const markSourceStatus = sourceNode?.type !== CanvasNodeType.Image && !editingTextNode && !isMusicResultSource;
      if (!effectivePrompt && (mode === 'text' || mode === 'audio')) {
        finishGenerationRequest(nodeId, runController);
        setRunningNodeId(null);
        return;
      }
      let pendingChildIds: string[] = [];
      if (markSourceStatus)
        setNodes((prev) =>
          prev.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  metadata: {
                    ...node.metadata,
                    ...(node.type === CanvasNodeType.Config ? {} : { prompt }),
                    status: NODE_STATUS_LOADING,
                    errorDetails: undefined,
                  },
                }
              : node,
          ),
        );

      try {
        if ((mode === 'image' || mode === 'video' || mode === 'music' || mode === 'lyrics') && generationConfig.modelAdapter?.getUnavailableReason) {
          const reason = generationConfig.modelAdapter.getUnavailableReason(generationConfig, { mode, prompt: effectivePrompt, connectedText: connectedMusicText,
            ...getInputSummary(buildNodeGenerationInputs(nodeId, nodesRef.current, connectionsRef.current)),
            imageCount: generationContext.imageCount, videoCount: generationContext.videoCount, audioCount: generationContext.audioCount });
          if (reason) throw new Error(reason);
        }
        if (mode === 'music' || mode === 'lyrics') {
          const resultId = nanoid();
          const previousResults = isMusicResultSource ? connectedMusicResults(nodeId, nodesRef.current, connectionsRef.current) : [];
          const outputY = previousResults.length ? Math.max(...previousResults.map((item) => item.position.y + item.height)) + 40 : sourceNode?.position.y ?? 0;
          const output: CanvasNodeData = { id: resultId, type: mode === 'music' ? CanvasNodeType.Audio : CanvasNodeType.Text,
            title: effectivePrompt.slice(0, 32), width: 400, height: 280,
            position: { x: (sourceNode?.position.x ?? 0) + (sourceNode?.width ?? 340) + 96, y: outputY },
            metadata: { musicSourceNodeId: mode === 'music' ? nodeId : undefined, prompt: effectivePrompt, model: generationConfig.model, generationMode: mode, music: generationConfig.music, status: NODE_STATUS_LOADING } };
          pendingChildIds = [resultId];
          setNodes((previous) => [...previous.map((node) => isMusicResultSource && node.id === nodeId ? { ...node, metadata: { ...node.metadata, musicResultSource: true, status: node.metadata?.content ? NODE_STATUS_SUCCESS : 'idle', errorDetails: undefined } } : node), output]);
          setConnections((previous) => [...previous, { id: nanoid(), fromNodeId: nodeId, toNodeId: resultId }]);
          if (mode === 'lyrics') {
            const content = await requestLyricsGeneration(generationConfig, effectivePrompt, { signal: runController.signal });
            setNodes((previous) => previous.map((node) => node.id === resultId ? { ...node, metadata: { ...node.metadata, content, status: NODE_STATUS_SUCCESS } } : node));
          } else {
            const result = await requestMusicGeneration(generationConfig, effectivePrompt, generationContext.referenceImages, generationContext.referenceAudios,
              generationOptions(resultId, runController.signal));
            setNodes((previous) => applyCanvasMusicResults(previous, resultId, result.taskId, result.results, connectionsRef.current));
            setConnections((previous) => connectCanvasMusicResults(previous, resultId, result.results, nodeId));
          }
          setNodes((previous) => previous.map((node) => node.id === nodeId ? { ...node, metadata: { ...node.metadata, status: NODE_STATUS_SUCCESS, errorDetails: undefined } } : node));
          return;
        }
        if (mode === '3d') {
          if (generationContext.videoCount || generationContext.audioCount)
            throw new Error(t('canvas.projectPage.generationFailed'));
          const resultId = sourceNode?.type === '3d' ? nodeId : nanoid();
          const references = sourceNode?.type === '3d'
            ? (sourceNode.metadata?.references || []).map((url, index) => ({ id: String(index), name: `reference-${index}.png`, type: 'image/png', dataUrl: url }))
            : generationContext.referenceImages;
          const resultNode: CanvasNodeData = {
            id: resultId,
            type: '3d',
            title: effectivePrompt.slice(0, 32) || effectiveConfig.modelAdapter?.threeD?.label || '3D',
            position: resultId === nodeId ? sourceNode!.position : {
              x: (sourceNode?.position.x ?? 0) + (sourceNode?.width ?? 340) + 96,
              y: sourceNode?.position.y ?? 0,
            },
            width: 480,
            height: 400,
            metadata: { prompt: effectivePrompt, model: generationConfig.model, status: NODE_STATUS_LOADING, references: references.map((reference) => reference.dataUrl) },
          };
          pendingChildIds = [resultId];
          setNodes((previous) => resultId === nodeId
            ? previous.map((node) => node.id === resultId ? resultNode : node)
            : [...previous, resultNode]);
          if (resultId !== nodeId)
            setConnections((previous) => [...previous, { id: nanoid(), fromNodeId: nodeId, toNodeId: resultId }]);
          const controller = startGenerationRequest(resultId, nodeId, nodeId, runController);
          let url: string;
          try {
            url = await requestThreeDGeneration(generationConfig, effectivePrompt, references, generationOptions(resultId, controller.signal));
          } finally {
            if (resultId !== nodeId) finishGenerationRequest(resultId, controller);
          }
          setNodes((previous) => previous.map((node) => node.id === resultId
            ? { ...node, metadata: { ...node.metadata, content: url, status: NODE_STATUS_SUCCESS, errorDetails: undefined } }
            : node.id === nodeId ? { ...node, metadata: { ...node.metadata, status: NODE_STATUS_SUCCESS, errorDetails: undefined } } : node));
          return;
        }
        if (mode === 'image') {
          const count = getGenerationCount(generationConfig.count);
          const isConfigNode = sourceNode?.type === CanvasNodeType.Config;
          const isImageNode = sourceNode?.type === CanvasNodeType.Image;
          const isEmptyImageNode = isImageNode && !sourceNode?.metadata?.content;
          const sourceReference =
            isImageNode && sourceNode?.metadata?.content
              ? [
                  {
                    id: sourceNode.id,
                    name: `${sourceNode.title || sourceNode.id}.png`,
                    type: sourceNode.metadata.mimeType || 'image/png',
                    dataUrl: sourceNode.metadata.content,
                    storageKey: sourceNode.metadata.storageKey,
                  },
                ]
              : [];
          const referenceImages = sourceReference.length ? sourceReference : generationContext.referenceImages;
          const generationType = referenceImages.length ? ('edit' as const) : ('generation' as const);
          const generationMetadata = buildImageGenerationMetadata(
            generationType,
            generationConfig,
            count,
            referenceImages,
          );
          const parentConfig =
            NODE_DEFAULT_SIZE[
              isConfigNode ? CanvasNodeType.Config : isImageNode ? CanvasNodeType.Image : CanvasNodeType.Text
            ];
          const imageConfig = NODE_DEFAULT_SIZE[CanvasNodeType.Image];
          const parentPosition = sourceNode?.position || { x: 0, y: 0 };
          const rootId = isEmptyImageNode ? nodeId : nanoid();
          const imageIds = Array.from({ length: count }, () => nanoid());
          pendingChildIds = [rootId];
          const rootNode: CanvasNodeData = {
            id: rootId,
            type: CanvasNodeType.Image,
            title: effectivePrompt.slice(0, 32) || 'Generated Image',
            position: {
              x: isEmptyImageNode ? parentPosition.x : parentPosition.x + parentConfig.width + 96,
              y: parentPosition.y + parentConfig.height / 2 - imageConfig.height / 2,
            },
            width: isEmptyImageNode ? sourceNode?.width || imageConfig.width : imageConfig.width,
            height: isEmptyImageNode ? sourceNode?.height || imageConfig.height : imageConfig.height,
            metadata: {
              prompt: effectivePrompt,
              status: NODE_STATUS_LOADING,
              images: imageIds.map((id) => ({
                id,
                status: NODE_STATUS_LOADING,
                content: '',
                storageKey: '',
                naturalWidth: 0,
                naturalHeight: 0,
                bytes: 0,
                mimeType: '',
              })),
              ...generationMetadata,
            },
          };

          setNodes((prev) => [
            ...prev.map((node) =>
              node.id === nodeId
                ? isConfigNode
                  ? {
                      ...node,
                      metadata: { ...node.metadata, status: NODE_STATUS_LOADING, errorDetails: undefined },
                    }
                  : isEmptyImageNode
                    ? {
                        ...node,
                        position: rootNode.position,
                        width: rootNode.width,
                        height: rootNode.height,
                        title: rootNode.title,
                        metadata: { ...node.metadata, ...rootNode.metadata, errorDetails: undefined },
                      }
                    : isImageNode
                      ? {
                          ...node,
                          metadata: { ...node.metadata, status: NODE_STATUS_SUCCESS, errorDetails: undefined },
                        }
                      : {
                          ...node,
                          type: CanvasNodeType.Text,
                          title: prompt.slice(0, 32) || 'Prompt',
                          width: parentConfig.width,
                          height: parentConfig.height,
                          metadata: {
                            ...node.metadata,
                            content: prompt,
                            prompt,
                            status: NODE_STATUS_SUCCESS,
                            fontSize: 14,
                            errorDetails: undefined,
                          },
                        }
                : node,
            ),
            ...(isEmptyImageNode ? [] : [rootNode]),
          ]);
          if (!isEmptyImageNode)
            setConnections((prev) => [...prev, { id: nanoid(), fromNodeId: nodeId, toNodeId: rootId }]);
          setSelectedNodeIds(new Set([nodeId]));
          setSelectedConnectionId(null);
          setDialogNodeId(nodeId);

          const controller =
            rootId === nodeId ? runController : startGenerationRequest(rootId, nodeId, nodeId, runController);
          let hasSuccess = false;
          let hasFailure = false;
          let firstError = '';
          await Promise.all(
            imageIds.map(async (imageId) => {
              try {
                const image = referenceImages.length
                  ? await requestEdit(
                      { ...generationConfig, count: '1' },
                      effectivePrompt,
                      referenceImages,
                      undefined,
                      generationOptions(rootId, controller.signal, imageId),
                    ).then((items) => items[0])
                  : await requestGeneration(
                      { ...generationConfig, count: '1' },
                      effectivePrompt,
                      generationOptions(rootId, controller.signal, imageId),
                    ).then((items) => items[0]);
                const uploaded = await uploadCanvasImage(image.dataUrl);
                const imageSize = fitNodeSize(uploaded.width, uploaded.height, imageConfig.width, imageConfig.height);
                const item: CanvasNodeImage = {
                  id: imageId,
                  status: NODE_STATUS_SUCCESS,
                  content: uploaded.url,
                  storageKey: uploaded.storageKey,
                  naturalWidth: uploaded.width,
                  naturalHeight: uploaded.height,
                  bytes: uploaded.bytes,
                  mimeType: uploaded.mimeType,
                };
                setNodes((prev) =>
                  prev.map((node) => {
                    if (node.id !== rootId) return node;
                    const images = node.metadata?.images?.map((image) => (image.id === imageId ? item : image)) || [];
                    if (node.metadata?.primaryImageId) return { ...node, metadata: { ...node.metadata, images } };
                    const center = { x: node.position.x + node.width / 2, y: node.position.y + node.height / 2 };
                    return {
                      ...node,
                      position: { x: center.x - imageSize.width / 2, y: center.y - imageSize.height / 2 },
                      ...imageSize,
                      metadata: {
                        ...node.metadata,
                        content: item.content,
                        storageKey: item.storageKey,
                        naturalWidth: item.naturalWidth,
                        naturalHeight: item.naturalHeight,
                        bytes: item.bytes,
                        mimeType: item.mimeType,
                        images,
                        primaryImageId: imageId,
                      },
                    };
                  }),
                );
                hasSuccess = true;
                if (isConfigNode)
                  setNodes((prev) =>
                    prev.map((node) =>
                      node.id === nodeId
                        ? {
                            ...node,
                            metadata: { ...node.metadata, status: NODE_STATUS_SUCCESS, errorDetails: undefined },
                          }
                        : node,
                    ),
                  );
                return true;
              } catch (error) {
                if (isGenerationCanceled(error)) return false;
                const errorDetails = error instanceof Error ? error.message : t('canvas.projectPage.generationFailed');
                if (!firstError) firstError = errorDetails;
                hasFailure = true;
                setNodes((prev) =>
                  prev.map((node) =>
                    node.id === rootId
                      ? {
                          ...node,
                          metadata: {
                            ...node.metadata,
                            images: node.metadata?.images?.map((image) =>
                              image.id === imageId ? { ...image, status: NODE_STATUS_ERROR, errorDetails } : image,
                            ),
                          },
                        }
                      : node,
                  ),
                );
              }
              return false;
            }),
          );
          if (rootId !== nodeId) finishGenerationRequest(rootId, controller);
          if (controller.signal.aborted) {
            setNodes((prev) =>
              prev.map((node) =>
                node.id === nodeId && isConfigNode && node.metadata?.status === NODE_STATUS_LOADING
                  ? { ...node, metadata: { ...node.metadata, status: NODE_STATUS_IDLE, errorDetails: undefined } }
                  : node,
              ),
            );
            return;
          }
          if (hasFailure) {
            message.error(
              hasSuccess
                ? t('canvas.projectPage.partialFailed')
                : firstError || t('canvas.projectPage.generationFailed'),
            );
          }
          setNodes((prev) =>
            prev.map((node) =>
              node.id === nodeId && isConfigNode
                ? {
                    ...node,
                    metadata: {
                      ...node.metadata,
                      status: hasSuccess ? NODE_STATUS_SUCCESS : NODE_STATUS_ERROR,
                      errorDetails: hasSuccess ? undefined : t('canvas.projectPage.generationFailed'),
                    },
                  }
                : node.id === rootId
                  ? {
                      ...node,
                      metadata: {
                        ...node.metadata,
                        status: hasSuccess ? NODE_STATUS_SUCCESS : NODE_STATUS_ERROR,
                        errorDetails: hasSuccess ? undefined : t('canvas.projectPage.allFailed'),
                      },
                    }
                  : node,
            ),
          );
          return;
        }

        if (mode === 'video') {
          const spec =
            nodeSizeFromRatio(
              generationConfig.size,
              NODE_DEFAULT_SIZE[CanvasNodeType.Video].width,
              NODE_DEFAULT_SIZE[CanvasNodeType.Video].height,
            ) || NODE_DEFAULT_SIZE[CanvasNodeType.Video];
          const isEmptyVideoNode = sourceNode?.type === CanvasNodeType.Video && !sourceNode.metadata?.content;
          const videoId = isEmptyVideoNode ? nodeId : nanoid();
          const parent = sourceNode?.position || { x: 0, y: 0 };
          const videoNode: CanvasNodeData = {
            id: videoId,
            type: CanvasNodeType.Video,
            title: effectivePrompt.slice(0, 32) || 'Generated Video',
            position: isEmptyVideoNode
              ? sourceNode.position
              : { x: parent.x + (sourceNode?.width || spec.width) + 96, y: parent.y },
            width: isEmptyVideoNode ? sourceNode.width : spec.width,
            height: isEmptyVideoNode ? sourceNode.height : spec.height,
            metadata: {
              prompt: effectivePrompt,
              status: NODE_STATUS_LOADING,
              model: generationConfig.model,
              size: generationConfig.size,
              seconds: generationConfig.videoSeconds,
              vquality: generationConfig.vquality,
              generateAudio: generationConfig.videoGenerateAudio,
              watermark: generationConfig.videoWatermark,
              ...buildAdvancedGenerationMetadata(generationConfig),
              references: generationReferenceUrls(generationContext),
            },
          };
          pendingChildIds = [videoId];
          setNodes((prev) =>
            isEmptyVideoNode
              ? prev.map((node) => (node.id === nodeId ? { ...node, ...videoNode } : node))
              : [
                  ...prev.map((node) =>
                    node.id === nodeId
                      ? { ...node, metadata: { ...node.metadata, status: NODE_STATUS_SUCCESS } }
                      : node,
                  ),
                  videoNode,
                ],
          );
          if (!isEmptyVideoNode)
            setConnections((prev) => [...prev, { id: nanoid(), fromNodeId: nodeId, toNodeId: videoId }]);
          const controller = startGenerationRequest(videoId, nodeId, nodeId, runController);
          try {
            const sourceVideoReferences: ReferenceVideo[] =
              hasSourceVideoReference && sourceNode?.metadata?.content
                ? [
                    {
                      id: sourceNode.id,
                      name: `${sourceNode.title || sourceNode.id}.mp4`,
                      type: sourceNode.metadata.mimeType || 'video/mp4',
                      url: sourceNode.metadata.content,
                      storageKey: sourceNode.metadata.storageKey,
                      bytes: sourceNode.metadata.bytes,
                      width: sourceNode.metadata.naturalWidth,
                      height: sourceNode.metadata.naturalHeight,
                      durationMs: sourceNode.metadata.durationMs,
                    },
                    ...generationContext.referenceVideos.filter((reference) => reference.id !== sourceNode.id),
                  ]
                : generationContext.referenceVideos;
            const video = await storeGeneratedVideo(
              await requestVideoGeneration(
                generationConfig,
                effectivePrompt,
                generationContext.referenceImages,
                sourceVideoReferences,
                generationContext.referenceAudios,
                generationOptions(videoId, controller.signal),
              ),
            );
            const videoSize = fitNodeSize(
              video.width || spec.width,
              video.height || spec.height,
              VIDEO_NODE_MAX_WIDTH,
              VIDEO_NODE_MAX_HEIGHT,
            );
            setNodes((prev) =>
              prev.map((node) =>
                node.id === videoId
                  ? {
                      ...node,
                      width: videoSize.width,
                      height: videoSize.height,
                      position: {
                        x: node.position.x + node.width / 2 - videoSize.width / 2,
                        y: node.position.y + node.height / 2 - videoSize.height / 2,
                      },
                      metadata: {
                        ...node.metadata,
                        ...videoMetadata(video),
                        prompt: effectivePrompt,
                        model: generationConfig.model,
                        size: generationConfig.size,
                        seconds: generationConfig.videoSeconds,
                        vquality: generationConfig.vquality,
                        generateAudio: generationConfig.videoGenerateAudio,
                        watermark: generationConfig.videoWatermark,
                        ...buildAdvancedGenerationMetadata(generationConfig),
                        references: generationReferenceUrls(generationContext),
                      },
                    }
                  : node,
              ),
            );
          } finally {
            finishGenerationRequest(videoId, controller);
          }
          return;
        }

        if (mode === 'audio') {
          const spec = NODE_DEFAULT_SIZE[CanvasNodeType.Audio];
          const isEmptyAudioNode = sourceNode?.type === CanvasNodeType.Audio && !sourceNode.metadata?.content;
          const audioId = isEmptyAudioNode ? nodeId : nanoid();
          const parent = sourceNode?.position || { x: 0, y: 0 };
          const audioNode: CanvasNodeData = {
            id: audioId,
            type: CanvasNodeType.Audio,
            title: effectivePrompt.slice(0, 32) || 'Generated Audio',
            position: isEmptyAudioNode
              ? sourceNode.position
              : {
                  x: parent.x + (sourceNode?.width || spec.width) + 96,
                  y: parent.y + ((sourceNode?.height || spec.height) - spec.height) / 2,
                },
            width: isEmptyAudioNode ? sourceNode.width : spec.width,
            height: isEmptyAudioNode ? sourceNode.height : spec.height,
            metadata: {
              prompt: effectivePrompt,
              status: NODE_STATUS_LOADING,
              ...buildAudioGenerationMetadata(generationConfig),
            },
          };
          pendingChildIds = [audioId];
          setNodes((prev) =>
            isEmptyAudioNode
              ? prev.map((node) => (node.id === nodeId ? { ...node, ...audioNode } : node))
              : [
                  ...prev.map((node) =>
                    node.id === nodeId
                      ? { ...node, metadata: { ...node.metadata, status: NODE_STATUS_SUCCESS } }
                      : node,
                  ),
                  audioNode,
                ],
          );
          if (!isEmptyAudioNode)
            setConnections((prev) => [...prev, { id: nanoid(), fromNodeId: nodeId, toNodeId: audioId }]);
          const controller = startGenerationRequest(audioId, nodeId, nodeId, runController);
          try {
            const audio = await storeGeneratedAudio(
              await requestAudioGeneration(generationConfig, effectivePrompt, { signal: controller.signal }),
              generationConfig.audioFormat,
            );
            setNodes((prev) =>
              prev.map((node) =>
                node.id === audioId
                  ? {
                      ...node,
                      metadata: {
                        ...node.metadata,
                        ...audioMetadata(audio),
                        prompt: effectivePrompt,
                        ...buildAudioGenerationMetadata(generationConfig),
                      },
                    }
                  : node,
              ),
            );
          } finally {
            finishGenerationRequest(audioId, controller);
          }
          return;
        }

        let streamed = '';
        const isConfigNode = sourceNode?.type === CanvasNodeType.Config;
        const textCount = isConfigNode ? getGenerationCount(generationConfig.count) : 1;
        const parentConfig = NODE_DEFAULT_SIZE[isConfigNode ? CanvasNodeType.Config : CanvasNodeType.Text];
        const textConfig = NODE_DEFAULT_SIZE[CanvasNodeType.Text];
        const parentPosition = sourceNode?.position || { x: 0, y: 0 };
        const childIds = isConfigNode || editingTextNode ? Array.from({ length: textCount }, () => nanoid()) : [];
        pendingChildIds = childIds;
        if (isConfigNode || editingTextNode) {
          const childNodes: CanvasNodeData[] = childIds.map((id, index) => ({
            id,
            type: CanvasNodeType.Text,
            title: effectivePrompt.slice(0, 32) || 'Generated Text',
            position: {
              x: parentPosition.x + parentConfig.width + 96,
              y:
                parentPosition.y +
                parentConfig.height / 2 -
                textConfig.height / 2 +
                (index - (textCount - 1) / 2) * (textConfig.height + 36),
            },
            width: textConfig.width,
            height: textConfig.height,
            metadata: {
              prompt: effectivePrompt,
              status: NODE_STATUS_LOADING,
              fontSize: 14,
              model: generationConfig.model,
              reasoningEffort: generationConfig.reasoningEffort,
            },
          }));
          setNodes((prev) => [
            ...prev.map((node) =>
              node.id === nodeId && isConfigNode
                ? { ...node, metadata: { ...node.metadata, status: NODE_STATUS_LOADING, errorDetails: undefined } }
                : node,
            ),
            ...childNodes,
          ]);
          setConnections((prev) => [
            ...prev,
            ...childIds.map((childId) => ({ id: nanoid(), fromNodeId: nodeId, toNodeId: childId })),
          ]);
        }

        const controller = runController;
        const textTargetIds = childIds.length ? childIds : [nodeId];
        textTargetIds.forEach((targetNodeId) => startGenerationRequest(targetNodeId, nodeId, nodeId, controller));
        const answers = await Promise.all(
          textTargetIds.map((targetNodeId) => {
            let localStreamed = '';
            return requestImageQuestion(
              generationConfig,
              buildNodeResponseMessages({ ...generationContext, prompt: effectivePrompt }),
              (text) => {
                localStreamed = text;
                streamed = text;
                if (isConfigNode) return;
                setNodes((prev) =>
                  prev.map((node) =>
                    node.id === targetNodeId
                      ? {
                          ...node,
                          type: CanvasNodeType.Text,
                          metadata: { ...node.metadata, content: text, status: NODE_STATUS_LOADING },
                        }
                      : node,
                  ),
                );
              },
              { signal: controller.signal },
            )
              .then((answer) => ({ nodeId: targetNodeId, content: answer || localStreamed }))
              .finally(() => finishGenerationRequest(targetNodeId, controller));
          }),
        );
        if (controller.signal.aborted) return;
        const answerByNodeId = new Map(answers.map((item) => [item.nodeId, item.content]));
        setNodes((prev) =>
          prev.map((node) =>
            childIds.includes(node.id)
              ? {
                  ...node,
                  metadata: {
                    ...node.metadata,
                    content: answerByNodeId.get(node.id) || streamed,
                    status: NODE_STATUS_SUCCESS,
                  },
                }
              : node.id === nodeId && isConfigNode
                ? { ...node, metadata: { ...node.metadata, status: NODE_STATUS_SUCCESS } }
                : node.id === nodeId && !editingTextNode
                  ? {
                      ...node,
                      type: CanvasNodeType.Text,
                      title: prompt.slice(0, 32) || 'Generated Text',
                      metadata: {
                        ...node.metadata,
                        content: answerByNodeId.get(node.id) || streamed,
                        model: generationConfig.model,
                        reasoningEffort: generationConfig.reasoningEffort,
                        status: NODE_STATUS_SUCCESS,
                      },
                    }
                  : node,
          ),
        );
      } catch (error) {
        if (isGenerationCanceled(error)) return;
        const errorDetails = error instanceof Error ? error.message : t('canvas.projectPage.generationFailed');
        message.error(errorDetails);
        setNodes((prev) =>
          prev.map((node) =>
            node.id === nodeId || pendingChildIds.includes(node.id)
              ? node.id === nodeId && !markSourceStatus
                ? node
                : { ...node, metadata: { ...node.metadata, status: NODE_STATUS_ERROR, errorDetails } }
              : node,
          ),
        );
      } finally {
        finishGenerationRequest(nodeId, runController);
        setRunningNodeId(null);
      }
    },
    [
      effectiveConfig,
      finishGenerationRequest,
      generationOptions,
      isAiConfigReady,
      message,
      openConfigDialog,
      requestThreeDGeneration,
      requestMusicGeneration,
      requestLyricsGeneration,
      startGenerationRequest,
      t,
      uploadCanvasImage,
    ],
  );
  useEffect(() => {
    generateNodeRef.current = handleGenerateNode;
  }, [handleGenerateNode]);

  const handleRetryNode = useCallback(
    async (node: CanvasNodeData, imageId?: string) => {
      if (node.metadata?.generationMode === 'music' || node.metadata?.generationMode === 'lyrics') {
        const task = canvasStore.getState().project.generationTasks?.find((item) => item.taskKind === 'music' &&
          (item.resultNodeId === node.id || connectionsRef.current.some((edge) => edge.fromNodeId === node.id && edge.toNodeId === item.resultNodeId)));
        if (task) {
          const controller = startGenerationRequest(task.resultNodeId, node.id);
          try {
            const [result] = await recoverProjectBindings(projectId, [task], generationOptions(task.resultNodeId, controller.signal));
            if (!result || controller.signal.aborted) return;
            if (result.kind === 'failed') throw result.error;
            if (result.kind === 'music') {
              setNodes((previous) => applyCanvasMusicResults(previous, task.resultNodeId, task.taskId, result.results, connectionsRef.current));
              setConnections((previous) => connectCanvasMusicResults(previous, task.resultNodeId, result.results, nodesRef.current.find((node) => node.id === task.resultNodeId)?.metadata?.musicSourceNodeId));
            }
          } catch (error) { if (!isGenerationCanceled(error)) integrations.onError?.(error, 'retry-music-observation'); }
          finally { finishGenerationRequest(task.resultNodeId, controller); }
          return;
        }
        const parentId = connectionsRef.current.find((edge) => edge.toNodeId === node.id)?.fromNodeId;
        const source = node.type === CanvasNodeType.Config ? node : nodesRef.current.find((item) => item.id === parentId);
        if (source) await handleGenerateNode(source.id, node.metadata.generationMode, source.metadata?.composerContent ?? source.metadata?.prompt ?? '');
        return;
      }
      if (node.type === '3d' || (node.type === CanvasNodeType.Config && node.metadata?.generationMode === '3d')) {
        const task = canvasStore.getState().project.generationTasks?.find((item) =>
          item.resultNodeId === node.id || (node.type === CanvasNodeType.Config && item.taskKind === '3d' &&
            nodesRef.current.some((result) => result.id === item.resultNodeId && result.metadata?.status === NODE_STATUS_ERROR) &&
            connectionsRef.current.some((connection) => connection.fromNodeId === node.id && connection.toNodeId === item.resultNodeId)),
        );
        if (task) {
          // A failed observation is not a failed paid task. Retry its read, never submit it again.
          const resultId = task.resultNodeId;
          const controller = startGenerationRequest(resultId, node.id);
          setNodes((previous) => previous.map((item) => item.id === node.id || item.id === resultId
            ? { ...item, metadata: { ...item.metadata, status: NODE_STATUS_LOADING, errorDetails: undefined } } : item));
          try {
            const [result] = await recoverProjectBindings(projectId, [task], generationOptions(resultId, controller.signal));
            if (!result || controller.signal.aborted) return;
            if (result.kind === 'failed') throw result.error;
            setNodes((previous) => previous.map((item) => item.id === resultId
              ? { ...item, metadata: { ...item.metadata, content: result.url, status: NODE_STATUS_SUCCESS, errorDetails: undefined } }
              : item.id === node.id ? { ...item, metadata: { ...item.metadata, status: NODE_STATUS_SUCCESS, errorDetails: undefined } } : item));
          } catch (error) {
            if (isGenerationCanceled(error)) return;
            const errorDetails = error instanceof Error ? error.message : t('canvas.projectPage.generationFailed');
            message.error(errorDetails);
            setNodes((previous) => previous.map((item) => item.id === node.id || item.id === resultId
              ? { ...item, metadata: { ...item.metadata, status: NODE_STATUS_ERROR, errorDetails } } : item));
          } finally {
            finishGenerationRequest(resultId, controller);
          }
          return;
        }
        await handleGenerateNode(node.id, '3d', node.metadata?.prompt || '');
        return;
      }
      const sourceNode = findRetrySourceNode(node.id, nodesRef.current, connectionsRef.current) || node;
      const savedImageMetadata = node.type === CanvasNodeType.Image ? node.metadata : undefined;
      const hasSavedImageMetadata = Boolean(savedImageMetadata?.generationType);
      const generationConfig =
        hasSavedImageMetadata && savedImageMetadata
          ? {
              ...effectiveConfig,
              model: savedImageMetadata.model || effectiveConfig.imageModel || effectiveConfig.model,
              quality: savedImageMetadata.quality || effectiveConfig.quality,
              imageResolution: savedImageMetadata.imageResolution || effectiveConfig.imageResolution,
              imageVersion: savedImageMetadata.imageVersion ?? savedImageMetadata.quality ?? effectiveConfig.imageVersion,
              size: savedImageMetadata.size || effectiveConfig.size,
              background: savedImageMetadata.background ?? effectiveConfig.background,
              seed: savedImageMetadata.seed ?? effectiveConfig.seed,
              negativePrompt: savedImageMetadata.negativePrompt ?? effectiveConfig.negativePrompt,
              isTranslate: savedImageMetadata.isTranslate ?? effectiveConfig.isTranslate,
              count: '1',
            }
          : {
              ...buildGenerationConfig(
                effectiveConfig,
                sourceNode,
                node.type === CanvasNodeType.Text
                  ? 'text'
                  : node.type === CanvasNodeType.Video
                    ? 'video'
                    : node.type === CanvasNodeType.Audio
                      ? 'audio'
                      : 'image',
              ),
              count: '1',
            };
      if (hasUnavailableMusicInput(sourceNode.id, nodesRef.current, connectionsRef.current)) {
        message.error(t('music.selectAvailableResult'));
        return;
      }
      if (!isAiConfigReady(generationConfig, generationConfig.model)) {
        openConfigDialog(true);
        return;
      }

      const rawContext = hasSavedImageMetadata
        ? null
        : buildNodeGenerationContext(
            sourceNode.id,
            nodesRef.current,
            connectionsRef.current,
            sourceNode.metadata?.prompt || node.metadata?.prompt || '',
          );
      const context = rawContext && node.type === CanvasNodeType.Text
        ? await hydrateNodeGenerationContext(rawContext)
        : rawContext;
      const prompt = (savedImageMetadata?.prompt || context?.prompt || '').trim();
      if (!prompt) {
        message.warning(t('canvas.projectPage.retryPromptMissing'));
        return;
      }
      const generationType = savedImageMetadata?.generationType;
      const useReferenceImages = generationType ? generationType === 'edit' : Boolean(context?.referenceImages.length);
      const retryReferenceImages =
        hasSavedImageMetadata && savedImageMetadata
          ? await resolveMetadataReferences(savedImageMetadata)
          : useReferenceImages
            ? context?.referenceImages.length
              ? context.referenceImages
              : sourceNodeReferenceImages(sourceNode)
            : [];
      if (useReferenceImages && !retryReferenceImages) {
        message.error(t('canvas.projectPage.referenceMissing'));
        setNodes((prev) =>
          prev.map((item) =>
            item.id === node.id
              ? {
                  ...item,
                  metadata: {
                    ...item.metadata,
                    status: item.metadata?.content ? NODE_STATUS_SUCCESS : NODE_STATUS_ERROR,
                    errorDetails: item.metadata?.content ? undefined : t('canvas.projectPage.referenceMissing'),
                    images: item.metadata?.images?.map((image) =>
                      image.id === imageId
                        ? {
                            ...image,
                            status: NODE_STATUS_ERROR,
                            errorDetails: t('canvas.projectPage.referenceMissing'),
                          }
                        : image,
                    ),
                  },
                }
              : item,
          ),
        );
        return;
      }
      const retryImages = retryReferenceImages || [];

      setRunningNodeId(node.id);
      setNodes((prev) =>
        prev.map((item) =>
          item.id === node.id
            ? {
                ...item,
                metadata: {
                  ...item.metadata,
                  status: NODE_STATUS_LOADING,
                  errorDetails: undefined,
                  images: item.metadata?.images?.map((image) =>
                    image.id === imageId ? { ...image, status: NODE_STATUS_LOADING, errorDetails: undefined } : image,
                  ),
                },
              }
            : item,
        ),
      );
      const controller = startGenerationRequest(node.id, sourceNode.id, node.id);

      try {
        if (node.type === CanvasNodeType.Text) {
          if (!context) return;
          let streamed = '';
          const answer = await requestImageQuestion(
            generationConfig,
            buildNodeResponseMessages({ ...context, prompt }),
            (text) => {
              streamed = text;
              setNodes((prev) =>
                prev.map((item) =>
                  item.id === node.id
                    ? {
                        ...item,
                        type: CanvasNodeType.Text,
                        metadata: { ...item.metadata, content: text, status: NODE_STATUS_LOADING },
                      }
                    : item,
                ),
              );
            },
            { signal: controller.signal },
          );
          setNodes((prev) =>
            prev.map((item) =>
              item.id === node.id
                ? {
                    ...item,
                    type: CanvasNodeType.Text,
                    metadata: { ...item.metadata, content: answer || streamed, prompt, status: NODE_STATUS_SUCCESS },
                  }
                : item,
            ),
          );
          return;
        }
        if (node.type === CanvasNodeType.Video) {
          const video = await storeGeneratedVideo(
            await requestVideoGeneration(
              generationConfig,
              prompt,
              retryImages,
              context?.referenceVideos || [],
              context?.referenceAudios || [],
              generationOptions(node.id, controller.signal),
            ),
          );
          const videoSize = fitNodeSize(
            video.width || node.width,
            video.height || node.height,
            VIDEO_NODE_MAX_WIDTH,
            VIDEO_NODE_MAX_HEIGHT,
          );
          setNodes((prev) =>
            prev.map((item) =>
              item.id === node.id
                ? {
                    ...item,
                    width: videoSize.width,
                    height: videoSize.height,
                    position: {
                      x: item.position.x + item.width / 2 - videoSize.width / 2,
                      y: item.position.y + item.height / 2 - videoSize.height / 2,
                    },
                    metadata: {
                      ...item.metadata,
                      ...videoMetadata(video),
                      prompt,
                      model: generationConfig.model,
                      size: generationConfig.size,
                      seconds: generationConfig.videoSeconds,
                      vquality: generationConfig.vquality,
                      generateAudio: generationConfig.videoGenerateAudio,
                      watermark: generationConfig.videoWatermark,
                      ...buildAdvancedGenerationMetadata(generationConfig),
                    },
                  }
                : item,
            ),
          );
          return;
        }
        if (node.type === CanvasNodeType.Audio) {
          const audio = await storeGeneratedAudio(
            await requestAudioGeneration(generationConfig, prompt, { signal: controller.signal }),
            generationConfig.audioFormat,
          );
          setNodes((prev) =>
            prev.map((item) =>
              item.id === node.id
                ? {
                    ...item,
                    metadata: {
                      ...item.metadata,
                      ...audioMetadata(audio),
                      prompt,
                      ...buildAudioGenerationMetadata(generationConfig),
                    },
                  }
                : item,
            ),
          );
          return;
        }

        const image = useReferenceImages
          ? await requestEdit(
              generationConfig,
              prompt,
              retryImages,
              undefined,
              generationOptions(node.id, controller.signal, imageId),
            ).then((items) => items[0])
          : await requestGeneration(
              generationConfig,
              prompt,
              generationOptions(node.id, controller.signal, imageId),
            ).then((items) => items[0]);
        const uploadedImage = await uploadCanvasImage(image.dataUrl);
        const imageConfig = NODE_DEFAULT_SIZE[CanvasNodeType.Image];
        const retryImage: CanvasNodeImage = {
          id: imageId || node.metadata?.primaryImageId || nanoid(),
          status: NODE_STATUS_SUCCESS,
          content: uploadedImage.url,
          storageKey: uploadedImage.storageKey,
          naturalWidth: uploadedImage.width,
          naturalHeight: uploadedImage.height,
          bytes: uploadedImage.bytes,
          mimeType: uploadedImage.mimeType,
        };
        const generationMetadata = savedImageMetadata?.generationType
          ? {
              generationType: savedImageMetadata.generationType,
              model: generationConfig.model,
              size: generationConfig.size,
              quality: generationConfig.quality,
              imageResolution: generationConfig.imageResolution,
              imageVersion: generationConfig.imageVersion,
              ...(generationConfig.background ? { background: generationConfig.background } : {}),
              count: savedImageMetadata.count || 1,
              references: savedImageMetadata.references,
            }
          : buildImageGenerationMetadata(useReferenceImages ? 'edit' : 'generation', generationConfig, 1, retryImages);
        setNodes((prev) =>
          prev.map((item) => {
            if (item.id !== node.id) return item;
            const makePrimary = !imageId || !item.metadata?.content;
            const edge = imageId ? Math.max(item.width, item.height) : 0;
            const imageSize =
              imageId && item.metadata?.freeResize
                ? { width: item.width, height: item.height }
                : imageId
                  ? fitNodeSize(uploadedImage.width, uploadedImage.height, edge, edge)
                  : fitNodeSize(uploadedImage.width, uploadedImage.height, imageConfig.width, imageConfig.height);
            return {
              ...item,
              type: CanvasNodeType.Image,
              ...(makePrimary
                ? {
                    width: imageSize.width,
                    height: imageSize.height,
                    ...(imageId
                      ? {
                          position: {
                            x: item.position.x + item.width / 2 - imageSize.width / 2,
                            y: item.position.y + item.height / 2 - imageSize.height / 2,
                          },
                        }
                      : {}),
                  }
                : {}),
              metadata: {
                ...item.metadata,
                ...(makePrimary ? imageMetadata(uploadedImage) : { status: NODE_STATUS_SUCCESS }),
                images: item.metadata?.images?.map((current) => (current.id === retryImage.id ? retryImage : current)),
                primaryImageId: makePrimary ? retryImage.id : item.metadata?.primaryImageId,
                prompt,
                ...generationMetadata,
              },
            };
          }),
        );
      } catch (error) {
        if (isGenerationCanceled(error)) return;
        const errorDetails = error instanceof Error ? error.message : t('canvas.projectPage.generationFailed');
        message.error(errorDetails);
        setNodes((prev) =>
          prev.map((item) =>
            item.id === node.id
              ? {
                  ...item,
                  metadata: {
                    ...item.metadata,
                    status: item.metadata?.content ? NODE_STATUS_SUCCESS : NODE_STATUS_ERROR,
                    errorDetails: item.metadata?.content ? undefined : errorDetails,
                    images: item.metadata?.images?.map((image) =>
                      image.id === imageId ? { ...image, status: NODE_STATUS_ERROR, errorDetails } : image,
                    ),
                  },
                }
              : item,
          ),
        );
      } finally {
        finishGenerationRequest(node.id, controller);
        setRunningNodeId(null);
      }
    },
    [
      effectiveConfig,
      finishGenerationRequest,
      generationOptions,
      handleGenerateNode,
      isAiConfigReady,
      message,
      openConfigDialog,
      canvasStore,
      projectId,
      recoverProjectBindings,
      startGenerationRequest,
      t,
      uploadCanvasImage,
    ],
  );

  const deleteBatchImage = useCallback((nodeId: string, imageId: string) => {
    const node = nodesRef.current.find((item) => item.id === nodeId);
    if ((node?.metadata?.images?.length || 0) <= 2) setExpandedImageNodeId(null);
    setNodes((prev) =>
      prev.map((item) => {
        if (item.id !== nodeId) return item;
        const images = item.metadata?.images?.filter((image) => image.id !== imageId) || [];
        return {
          ...item,
          metadata: {
            ...item.metadata,
            images,
            count: images.length,
            primaryImageId: item.metadata?.primaryImageId === imageId ? images[0]?.id : item.metadata?.primaryImageId,
          },
        };
      }),
    );
  }, []);

  const retryBatchImage = useCallback(
    (node: CanvasNodeData, imageId: string) => void handleRetryNode(node, imageId),
    [handleRetryNode],
  );

  const createGenerationConfigFromTextNode = useCallback(
    (node: CanvasNodeData, mode: TextGenerationConfigMode) => {
      const prompt = (node.metadata?.content || node.metadata?.prompt || '').trim();
      if (!prompt) {
        message.warning(t(mode === 'image' ? 'canvas.projectPage.emptyTextImage' : 'canvas.node.editText'));
        return;
      }
      const sourceNode = nodesRef.current.find((item) => item.id === node.id);
      if (!sourceNode) return;
      const nodeSize = getNodeSpec(CanvasNodeType.Config);
      const configNode = createCanvasNode(
        CanvasNodeType.Config,
        {
          x: sourceNode.position.x + sourceNode.width + 96 + nodeSize.width / 2,
          y: sourceNode.position.y + sourceNode.height / 2,
        },
        {
          ...buildTextGenerationConfigMetadata(
            mode,
            effectiveConfig,
            getGenerationCount(effectiveConfig.canvasImageCount || effectiveConfig.count),
          ),
        },
      );
      const connection = { id: nanoid(), fromNodeId: sourceNode.id, toNodeId: configNode.id };
      const nextNodes = nodesRef.current
        .map((item) =>
          item.id === sourceNode.id
            ? { ...item, metadata: { ...item.metadata, content: prompt, prompt, status: NODE_STATUS_SUCCESS } }
            : item,
        )
        .concat(configNode);
      const nextConnections = [...connectionsRef.current, connection];
      nodesRef.current = nextNodes;
      connectionsRef.current = nextConnections;
      setNodes(nextNodes);
      setConnections(nextConnections);
      setSelectedNodeIds(new Set([configNode.id]));
      setSelectedConnectionId(null);
      setDialogNodeId(configNode.id);
    },
    [effectiveConfig, message, t],
  );

  const generateImageFromTextNode = useCallback(
    (node: CanvasNodeData) => createGenerationConfigFromTextNode(node, 'image'),
    [createGenerationConfigFromTextNode],
  );

  const generateVideoFromTextNode = useCallback(
    (node: CanvasNodeData) => createGenerationConfigFromTextNode(node, 'video'),
    [createGenerationConfigFromTextNode],
  );

  const insertAssistantImage = useCallback(
    async (image: CanvasAssistantImage) => {
      const storedImage = await uploadCanvasImage(image.dataUrl);
      const meta = storedImage;
      const config = fitNodeSize(meta.width, meta.height);
      const center = screenToCanvas(
        (containerRef.current?.getBoundingClientRect().left || 0) + size.width / 2,
        (containerRef.current?.getBoundingClientRect().top || 0) + size.height / 2,
      );
      const id = `image-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const node: CanvasNodeData = {
        id,
        type: CanvasNodeType.Image,
        title: image.prompt.slice(0, 32) || 'Generated Image',
        position: { x: center.x - config.width / 2, y: center.y - config.height / 2 },
        width: config.width,
        height: config.height,
        metadata: {
          ...imageMetadata({ ...storedImage, width: meta.width, height: meta.height }),
          prompt: image.prompt,
        },
      };

      setNodes((prev) => [...prev, node]);
      setSelectedNodeIds(new Set([id]));
      setSelectedConnectionId(null);
      setDialogNodeId(id);
    },
    [screenToCanvas, size.height, size.width, uploadCanvasImage],
  );

  const insertAssistantText = useCallback(
    (text: string, title?: string) => {
      const center = screenToCanvas(
        (containerRef.current?.getBoundingClientRect().left || 0) + size.width / 2,
        (containerRef.current?.getBoundingClientRect().top || 0) + size.height / 2,
      );
      const node = {
        ...createCanvasNode(CanvasNodeType.Text, center, { content: text, status: NODE_STATUS_SUCCESS }),
        title: title || text.slice(0, 32) || 'Assistant Text',
      };

      setNodes((prev) => [...prev, node]);
      setSelectedNodeIds(new Set([node.id]));
      setSelectedConnectionId(null);
    },
    [screenToCanvas, size.height, size.width],
  );

  const handleAssetInsert = useCallback(
    async (payload: InsertAssetPayload) => {
      try {
        if (payload.kind === 'text') {
          insertAssistantText(payload.content, payload.title);
        } else if (payload.kind === 'video') {
          const spec = NODE_DEFAULT_SIZE[CanvasNodeType.Video];
          const center = screenToCanvas(
            (containerRef.current?.getBoundingClientRect().left || 0) + size.width / 2,
            (containerRef.current?.getBoundingClientRect().top || 0) + size.height / 2,
          );
          const media =
            !payload.storageKey && /^https?:\/\//i.test(payload.url)
              ? {
                  url: payload.url,
                  storageKey: '',
                  width: payload.width,
                  height: payload.height,
                  bytes: 0,
                  mimeType: 'video/mp4',
                }
              : await uploadCanvasMediaFile(payload.url, 'video');
          const id = `video-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const nextSize = fitNodeSize(
            media.width || spec.width,
            media.height || spec.height,
            VIDEO_NODE_MAX_WIDTH,
            VIDEO_NODE_MAX_HEIGHT,
          );
          setNodes((prev) => [
            ...prev,
            {
              id,
              type: CanvasNodeType.Video,
              title: payload.title,
              position: { x: center.x - nextSize.width / 2, y: center.y - nextSize.height / 2 },
              width: nextSize.width,
              height: nextSize.height,
              metadata: videoMetadata(media),
            },
          ]);
          setSelectedNodeIds(new Set([id]));
        } else {
          await insertAssistantImage({
            id: `asset-${Date.now()}`,
            prompt: payload.title,
            dataUrl: payload.dataUrl,
            storageKey: payload.storageKey,
          });
        }
        setAssetPickerOpen(false);
      } catch (error) {
        message.error(error instanceof Error ? error.message : i18n.assets.uploadFailed);
      }
    },
    [
      insertAssistantImage,
      insertAssistantText,
      message,
      screenToCanvas,
      size.height,
      size.width,
      t,
      uploadCanvasMediaFile,
    ],
  );

  // Memoize every callback and render function passed to CanvasNode.
  // CanvasNode uses React.memo, but new prop references would invalidate it on every render and rerender every node
  // during click, hover, or viewport changes, which is especially expensive for Markdown. These useCallback values
  // and their memoized map/handler dependencies remain stable during interaction, so unchanged nodes do not rerender.
  const handleNodeHoverStart = useCallback((nodeId: string) => {
    if (nodeDraggingRef.current) return;
    setHoveredNodeId(nodeId);
  }, []);
  const handleNodeHoverEnd = useCallback((nodeId: string) => {
    setHoveredNodeId((current) => (current === nodeId ? null : current));
  }, []);
  const handleNodeViewImage = useCallback((node: CanvasNodeData) => setPreviewNodeId(node.id), []);
  const handleNodeRetry = useCallback((node: CanvasNodeData) => void handleRetryNode(node), [handleRetryNode]);
  const handleNodeContextMenu = useCallback((event: ReactMouseEvent, nodeId: string) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('input,textarea,select,[contenteditable="true"]')) return;
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ type: 'node', x: event.clientX, y: event.clientY, nodeId });
  }, []);

  useEffect(() => {
    const onCommand = (event: Event) => {
      const command = (event as CustomEvent<DesktopCanvasCommand>).detail;
      if (command === 'canvas_save') void projectActions.saveNow();
      else if (command === 'canvas_import') handleUploadRequest();
      else if (command === 'canvas_export') void exportCurrentProject();
      else if (command === 'canvas_reset_view') resetViewport();
      else void runDesktopEditCommand(command);
    };
    window.addEventListener(DESKTOP_CANVAS_COMMAND_EVENT, onCommand);
    return () => window.removeEventListener(DESKTOP_CANVAS_COMMAND_EVENT, onCommand);
  }, [exportCurrentProject, handleUploadRequest, projectActions, resetViewport, runDesktopEditCommand]);

  const renderNodePanel = useCallback(
    (panelNode: CanvasNodeData) =>
      getNodeDefinition(panelNode.type)?.Panel ? (
        renderPluginPanel(panelNode)
      ) : panelNode.type === CanvasNodeType.Config ? (
        <CanvasConfigComposer
          musicConfig={buildGenerationConfig(effectiveConfig, panelNode, 'music')}
          onMusicChange={(music) => handleConfigNodeChange(panelNode.id, { music })}
          value={panelNode.metadata?.composerContent ?? panelNode.metadata?.prompt ?? ''}
          inputs={configInputsById.get(panelNode.id) || []}
          mode={visibleConfigGenerationMode(panelNode.metadata?.generationMode)}
          onChange={(composerContent) => handleConfigNodeChange(panelNode.id, { composerContent })}
          onClose={() => setDialogNodeId(null)}
        />
      ) : (
        <CanvasNodePromptPanel
          node={panelNode}
          unavailableMusicInput={hasUnavailableMusicInput(panelNode.id, nodes, connections)}
          priceInputSummary={getGenerationPriceInputSummary(
            panelNode, buildNodeGenerationInputs(panelNode.id, nodesRef.current, connectionsRef.current),
          )}
          isRunning={runningNodeId === panelNode.id}
          mentionReferences={mentionReferencesByNodeId.get(panelNode.id) || EMPTY_REFERENCES}
          onPromptChange={handleNodePromptChange}
          onContentChange={handleNodeContentChange}
          onConfigChange={handleConfigNodeChange}
          onGenerate={handleGenerateNode}
          modeOverride={getNodeDefinition(panelNode.type)?.useBuiltinPanel?.mode}
          onImageSettingsOpenChange={(open) => {
            setNodeImageSettingsOpen(open);
            if (open) setToolbarNodeId(null);
          }}
        />
      ),
    [
      configInputsById,
      nodes,
      connections,
      effectiveConfig,
      integrations.renderGenerationPrice,
      handleConfigNodeChange,
      handleGenerateNode,
      handleNodeContentChange,
      handleNodePromptChange,
      mentionReferencesByNodeId,
      renderPluginPanel,
      runningNodeId,
    ],
  );

  const renderNodeContentPanel = useCallback(
    (contentNode: CanvasNodeData) => contentNode.metadata?.musicResultSource ? (
      <CanvasMusicResultList source={contentNode} results={connectedMusicResults(contentNode.id, nodes, connections)}
        onSelect={(selectedMusicResultId) => handleConfigNodeChange(contentNode.id, { selectedMusicResultId })}
        onDurationChange={handleAudioDurationChange} />
    ) : contentNode.type === '3d' ? (
      <div className='h-full w-full cursor-default' onPointerDown={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()} onWheel={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}>
        {contentNode.metadata?.content && integrations.renderThreeDPreview?.({ url: contentNode.metadata.content, title: contentNode.title })}
      </div>
    ) : (
      <CanvasConfigNodePanel
        node={contentNode}
        unavailableMusicInput={hasUnavailableMusicInput(contentNode.id, nodes, connections)}
        prompt={contentNode.metadata?.generationMode === 'music' ? resolveMusicComposerPrompt(contentNode.metadata?.composerContent ?? contentNode.metadata?.prompt ?? '', configInputsById.get(contentNode.id) || []) : buildNodeGenerationContext(contentNode.id, nodes, connections, contentNode.metadata?.composerContent ?? contentNode.metadata?.prompt ?? '').prompt}
        connectedText={(configInputsById.get(contentNode.id) || []).filter((input) => input.type === 'text').map((input) => input.text || '').join('\n\n')}
        isRunning={runningNodeId === contentNode.id}
        inputSummary={getInputSummary(configInputsById.get(contentNode.id) || [])}
        onConfigChange={handleConfigNodeChange}
        onComposerToggle={() => setDialogNodeId((current) => (current === contentNode.id ? null : contentNode.id))}
        onGenerate={(nodeId) => {
          const target = nodesRef.current.find((item) => item.id === nodeId);
          void handleGenerateNode(
            nodeId,
            visibleConfigGenerationMode(target?.metadata?.generationMode),
            target?.metadata?.composerContent ?? target?.metadata?.prompt ?? '',
          );
        }}
      />
    ),
    [configInputsById, connections, nodes, handleConfigNodeChange, handleGenerateNode, integrations.renderThreeDPreview, runningNodeId, handleAudioDurationChange],
  );

  if (!projectLoaded) return <CanvasRefreshShell />;

  return (
    <main
      className='flex h-full min-h-0 overflow-hidden'
      style={{ background: theme.canvas.background, color: theme.node.text }}
    >
      <CanvasSidePanel
        nodes={nodes}
        selectedNodeIds={selectedNodeIds}
        onFocusNode={focusNode}
        onPreviewNode={setPreviewNodeId}
        onInsertAsset={handleAssetInsert}
      />
      <section className='relative min-w-0 flex-1 overflow-hidden'>
        {/* Plugin marketplace entry is temporarily hidden; keep the manager mounted for a later release. */}
        <CanvasTopBar
          title={currentProject?.title || t('canvas.projectPage.untitledCanvas')}
          titleDraft={titleDraft}
          isTitleEditing={titleEditing}
          onTitleDraftChange={setTitleDraft}
          onStartTitleEditing={startTitleEditing}
          onFinishTitleEditing={finishTitleEditing}
          onCancelTitleEditing={() => setTitleEditing(false)}
          canUndo={historyState.canUndo}
          canRedo={historyState.canRedo}
          hasUnsavedChanges={projectActions.saveState.dirty}
          isSaving={projectActions.saveState.saving}
          lastSavedAt={projectActions.saveState.lastSavedAt}
          onChangeLocale={(locale) => void projectActions.changeLocale(locale)}
          onHome={() => void projectActions.navigateToHome()}
          onDocs={() => void projectActions.navigateToDocs()}
          onProjects={() => void projectActions.navigateToDashboard()}
          onCreateProject={createAndOpenProject}
          onDeleteProject={deleteCurrentProject}
          onExportProject={exportCurrentProject}
          onImportImage={() => handleUploadRequest()}
          onUndo={undoCanvas}
          onRedo={redoCanvas}
          onSave={() => void projectActions.saveNow()}
        />

        <InfiniteCanvas
          containerRef={containerRef}
          viewport={viewport}
          tool={canvasTool}
          backgroundMode={backgroundMode}
          onViewportChange={(next) => {
            setViewport(next);
            setContextMenu(null);
            closeContextActions();
          }}
          onCanvasMouseDown={handleCanvasMouseDown}
          onCanvasDeselect={deselectCanvas}
          onCanvasDoubleClick={(event) => {
            setContextMenu(null);
            setNodeCreatePosition(screenToCanvas(event.clientX, event.clientY));
          }}
          onContextMenu={preventCanvasContextMenu}
          onCanvasContextMenuRequest={openCanvasContextMenu}
          onDrop={handleDrop}
        >
          <svg
            className='absolute left-0 top-0 h-[10000px] w-[10000px] overflow-visible'
            style={{ pointerEvents: 'none', transform: 'translateZ(0)', zIndex: 0 }}
          >
            {connections.map((connection) => {
              const from = nodeById.get(connection.fromNodeId);
              const to = nodeById.get(connection.toNodeId);
              if (!from || !to) return null;

              return (
                <ConnectionPath
                  key={connection.id}
                  connection={connection}
                  from={from}
                  to={to}
                  musicResultHighlight={musicResultHighlight}
                  isCurrentMusicResult={connection.fromNodeId === singleSelectedNodeId && connection.toNodeId === currentMusicResultId}
                  active={selectedConnectionId === connection.id || relatedHighlight.connectionIds.has(connection.id)}
                  onSelect={() => {
                    setSelectedConnectionId(connection.id);
                    setSelectedNodeIds(new Set());
                    setContextMenu(null);
                  }}
                  onContextMenu={(event) => {
                    setSelectedConnectionId(connection.id);
                    setSelectedNodeIds(new Set());
                    setContextMenu({
                      type: 'connection',
                      x: event.clientX,
                      y: event.clientY,
                      connectionId: connection.id,
                    });
                  }}
                />
              );
            })}
            {connectingParams ? (
              <ActiveConnectionPath
                node={nodeById.get(connectingParams.nodeId)}
                handle={connectingParams}
                mouseWorld={mouseWorld}
                target={connectionTargetNodeId ? nodeById.get(connectionTargetNodeId) : undefined}
              />
            ) : null}
          </svg>

          {visibleNodes.map((node) => (
            <CanvasNode
              key={node.id}
              data={node}
              scale={viewport.k}
              isSelected={selectedNodeIds.has(node.id)}
              musicResultHighlight={musicResultHighlight}
              isCurrentMusicResult={node.id === currentMusicResultId}
              isRelated={relatedHighlight.nodeIds.has(node.id)}
              isFocusRelated={activeNodeId === node.id}
              isConnectionTarget={connectionTargetNodeId === node.id}
              isConnecting={Boolean(connectingParams)}
              editRequestNonce={editingNodeId === node.id ? editRequestNonce : 0}
              showPanel={dialogNodeId === node.id && !selectionBox && !getNodeDefinition(node.type)?.hidePanel}
              groupChildCount={groupChildCountById.get(node.id) || 0}
              isGroupDropTarget={dropTargetGroupId === node.id}
              batchExpanded={expandedImageNodeId === node.id}
              showImageInfo={showImageInfo}
              mentionReferences={mentionReferencesByNodeId.get(node.id) || EMPTY_REFERENCES}
              pluginHost={pluginHost}
              registryVersion={nodeRegistryVersion}
              renderPanel={renderNodePanel}
              renderNodeContent={renderNodeContentPanel}
              onMouseDown={handleNodeMouseDown}
              onSelectCapture={handleNodeSelectCapture}
              onHoverStart={handleNodeHoverStart}
              onHoverEnd={handleNodeHoverEnd}
              onConnectStart={handleConnectStart}
              onResizeStart={handleNodeResizeStart}
              onResize={handleNodeResize}
              onResizeEnd={handleNodeResizeEnd}
              onContentChange={handleNodeContentChange}
              onAudioDurationChange={handleAudioDurationChange}
              onTitleChange={handleNodeTitleChange}
              onToggleBatch={toggleBatchExpanded}
              onSetBatchPrimary={setBatchPrimary}
              onDuplicateBatchImage={duplicateBatchImage}
              onDownloadBatchImage={downloadBatchImage}
              onRetryBatchImage={retryBatchImage}
              onDeleteBatchImage={deleteBatchImage}
              onRetry={handleNodeRetry}
              onGenerateImage={generateImageFromTextNode}
              onGenerateVideo={generateVideoFromTextNode}
              onViewImage={handleNodeViewImage}
              onContextMenu={handleNodeContextMenu}
            />
          ))}

          {selectionBox ? (
            <svg
              className='pointer-events-none absolute z-[100] overflow-visible'
              style={{
                left: Math.min(selectionBox.startWorldX, selectionBox.currentWorldX),
                top: Math.min(selectionBox.startWorldY, selectionBox.currentWorldY),
                width: Math.abs(selectionBox.currentWorldX - selectionBox.startWorldX),
                height: Math.abs(selectionBox.currentWorldY - selectionBox.startWorldY),
              }}
            >
              <rect
                width='100%'
                height='100%'
                fill={theme.canvas.selectionFill}
                stroke={theme.canvas.selectionStroke}
                strokeOpacity={0.55}
                strokeWidth={1 / viewport.k}
                strokeDasharray={`${6 / viewport.k} ${4 / viewport.k}`}
              />
            </svg>
          ) : null}
          {pendingConnectionCreate ? (
            <ConnectionCreateMenu
              pending={pendingConnectionCreate}
              onCreate={(type) => createConnectedNode(type, pendingConnectionCreate)}
              onClose={cancelPendingConnectionCreate}
            />
          ) : null}
          {nodeCreatePosition ? (
            <NodeCreateMenu
              position={nodeCreatePosition}
              onCreate={(type) => {
                createNode(type, nodeCreatePosition);
                setNodeCreatePosition(null);
              }}
              onClose={() => setNodeCreatePosition(null)}
            />
          ) : null}
        </InfiniteCanvas>

        {audioHistorySourceId && integrations.audioHistory?.enabled === true && (
          <CanvasAudioHistoryDialog history={integrations.audioHistory} onClose={() => setAudioHistorySourceId(null)} onError={integrations.onError}
            onSelect={(item) => {
              const next = attachCanvasAudioHistory(nodesRef.current, connectionsRef.current, audioHistorySourceId, item, nanoid(), nanoid());
              setNodes(next.nodes);
              setConnections(next.connections);
              setAudioHistorySourceId(null);
            }} />
        )}
        <CanvasNodeHoverToolbar
          node={isNodeDragging || isNodeResizing || nodeImageSettingsOpen || expandedImageNodeId ? null : toolbarNode}
          viewport={viewport}
          extraTools={toolbarNode ? buildNodeToolbarItems(toolbarNode) : undefined}
          onKeep={keepNodeToolbar}
          onLeave={hideNodeToolbar}
          onInfo={(node) => setInfoNodeId(node.id)}
          onEditText={openTextEditor}
          onDecreaseFont={(node) => handleFontSizeChange(node.id, Math.max(10, (node.metadata?.fontSize || 14) - 2))}
          onIncreaseFont={(node) => handleFontSizeChange(node.id, Math.min(32, (node.metadata?.fontSize || 14) + 2))}
          onToggleDialog={(node) => setDialogNodeId((current) => (current === node.id ? null : node.id))}
          onGenerateImage={generateImageFromTextNode}
          onGenerateVideo={generateVideoFromTextNode}
          onAudioHistory={integrations.audioHistory?.enabled === true ? (node) => setAudioHistorySourceId(node.id) : undefined}
          onUpload={(node) => handleUploadRequest(node.id)}
          onDownload={downloadNodeImage}
          onSaveAsset={(node) => void saveNodeAsset(node)}
          onMaskEdit={(node) => setMaskEditNodeId(node.id)}
          onCrop={(node) => setCropNodeId(node.id)}
          onSplit={(node) => setSplitNodeId(node.id)}
          onUpscale={(node) => setUpscaleNodeId(node.id)}
          onSuperResolve={(node) => setSuperResolveNodeId(node.id)}
          onAngle={(node) => setAngleNodeId(node.id)}
          onViewImage={(node) => setPreviewNodeId(node.id)}
          onReversePrompt={createImageReversePromptNodes}
          onRetry={(node) => void handleRetryNode(node)}
          onToggleFreeResize={(node) => toggleNodeFreeResize(node.id)}
          onDelete={(node) => deleteNodes(new Set([node.id]))}
        />

        <CanvasToolbar
          selectedCount={selectedNodeIds.size}
          canvasTool={canvasTool}
          canUndo={historyState.canUndo}
          canRedo={historyState.canRedo}
          backgroundMode={backgroundMode}
          showImageInfo={showImageInfo}
          onAddImage={() => createNode(CanvasNodeType.Image)}
          onAddVideo={() => createNode(CanvasNodeType.Video)}
          music={effectiveConfig.modelAdapter?.music ? {
            label: effectiveConfig.modelAdapter.music.label,
            onAdd: () => createNode(CanvasNodeType.Audio, undefined, {
              ...getSourceModelMetadataPatch(effectiveConfig.modelAdapter!.music!.defaultModel, 'music', {}, effectiveConfig.modelAdapter),
              generationMode: 'music',
            }),
          } : undefined}
          threeD={hasCanvasThreeDModels(effectiveConfig.modelAdapter) && integrations.renderThreeDPreview ? {
            label: effectiveConfig.modelAdapter.threeD.label,
            onAdd: () => createNode(CanvasNodeType.Config, undefined, {
              generationMode: '3d',
              model: effectiveConfig.modelAdapter!.threeD!.defaultModel,
              count: 1,
            }),
          } : undefined}
          onAddText={() => createNode(CanvasNodeType.Text)}
          onAddConfig={() => createNode(CanvasNodeType.Config)}
          onAddGroup={() => createNode(CanvasNodeType.Group)}
          onAddExtensionNode={(type) => createNode(type)}
          onUndo={undoCanvas}
          onRedo={redoCanvas}
          onUpload={() => handleUploadRequest()}
          onDelete={() => deleteNodes(new Set(selectedNodeIds))}
          onClear={() => setClearConfirmOpen(true)}
          onCanvasToolChange={setCanvasTool}
          onBackgroundModeChange={setBackgroundMode}
          onShowImageInfoChange={setShowImageInfo}
        />

        {isMiniMapOpen ? (
          <Minimap nodes={nodes} viewport={viewport} viewportSize={size} onViewportChange={setViewport} />
        ) : null}

        <CanvasZoomControls
          scale={viewport.k}
          onScaleChange={setZoomScale}
          onReset={resetViewport}
          isMiniMapOpen={isMiniMapOpen}
          onToggleMiniMap={() => setIsMiniMapOpen((value) => !value)}
        />

        {contextMenu ? (
          <CanvasNodeContextMenu
            menu={contextMenu}
            onClose={() => setContextMenu(null)}
            onDuplicate={() => {
              if (contextMenu.type !== 'node') return;
              duplicateNode(contextMenu.nodeId);
              setContextMenu(null);
            }}
            onDelete={() => {
              if (contextMenu.type === 'node') {
                deleteNodes(new Set([contextMenu.nodeId]));
              } else if (contextMenu.type === 'connection') {
                deleteConnection(contextMenu.connectionId);
              }
              setContextMenu(null);
            }}
            onCreate={(type, position) => {
              createNode(type, position);
              setContextMenu(null);
            }}
            onImport={(position) => {
              handleUploadRequest(undefined, position);
              setContextMenu(null);
            }}
            onResetView={resetViewport}
            onExportMedia={contextMenu.type === 'node' && nodesRef.current.some((node) => node.id === contextMenu.nodeId && node.metadata?.content && [CanvasNodeType.Image, CanvasNodeType.Video, CanvasNodeType.Audio].includes(node.type)) ? () => {
              const node = nodesRef.current.find((item) => item.id === contextMenu.nodeId);
              if (node) downloadNodeImage(node);
            } : undefined}
          />
        ) : null}

        <input
          ref={imageInputRef}
          type='file'
          multiple
          accept={CANVAS_MEDIA_FILE_ACCEPT}
          className='hidden'
          onChange={handleImageInputChange}
        />

        <CanvasNodeInfoModal node={infoNode} open={Boolean(infoNode)} onClose={() => setInfoNodeId(null)} />
        <CanvasPluginManagerModal open={pluginManagerOpen} onClose={() => setPluginManagerOpen(false)} />

        {cropNode?.metadata?.content ? (
          <CanvasNodeCropDialog
            dataUrl={cropNode.metadata.content}
            open={Boolean(cropNode)}
            onClose={() => setCropNodeId(null)}
            onConfirm={(crop) => cropImageNode(cropNode!, crop)}
          />
        ) : null}

        {maskEditNode?.metadata?.content ? (
          <CanvasNodeMaskEditDialog
            dataUrl={maskEditNode.metadata.content}
            open={Boolean(maskEditNode)}
            onClose={() => setMaskEditNodeId(null)}
            onConfirm={(payload) => void maskEditImageNode(maskEditNode!, payload)}
          />
        ) : null}

        {splitNode?.metadata?.content ? (
          <CanvasNodeSplitDialog
            dataUrl={splitNode.metadata.content}
            open={Boolean(splitNode)}
            onClose={() => setSplitNodeId(null)}
            onConfirm={(params) => void splitImageNode(splitNode!, params)}
          />
        ) : null}

        {upscaleNode?.metadata?.content ? (
          <CanvasNodeUpscaleDialog
            dataUrl={upscaleNode.metadata.content}
            open={Boolean(upscaleNode)}
            onClose={() => setUpscaleNodeId(null)}
            onConfirm={(params) => void upscaleImageNode(upscaleNode!, params)}
          />
        ) : null}

        <Modal
          title={t('canvas.projectPage.superResolve')}
          open={Boolean(superResolveNode?.metadata?.content)}
          centered
          footer={null}
          onCancel={() => setSuperResolveNodeId(null)}
        >
          <div className='py-8 text-center text-base font-medium'>{t('canvas.projectPage.notImplemented')}</div>
        </Modal>

        {angleNode?.metadata?.content ? (
          <CanvasNodeAngleDialog
            dataUrl={angleNode.metadata.content}
            open={Boolean(angleNode)}
            onClose={() => setAngleNodeId(null)}
            onConfirm={(params) => void generateAngleNode(angleNode!, params)}
          />
        ) : null}

        <Modal
          title={t('canvas.projectPage.imageDetails')}
          open={Boolean(previewNode?.metadata?.content)}
          centered
          onCancel={() => setPreviewNodeId(null)}
          footer={null}
          width='auto'
          styles={{
            body: { padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', maxHeight: '80vh' },
          }}
        >
          {previewNode?.metadata?.content ? (
            <img
              src={previewNode.metadata.content}
              alt={previewNode.title || t('assets.kinds.image')}
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
            />
          ) : null}
        </Modal>

        <Modal
          title={t('canvas.projectPage.clearTitle')}
          open={clearConfirmOpen}
          centered
          onCancel={() => setClearConfirmOpen(false)}
          footer={
            <>
              <Button onClick={() => setClearConfirmOpen(false)}>{t('common.cancel')}</Button>
              <Button danger type='primary' onClick={clearCanvas}>
                {t('canvas.projectPage.clear')}
              </Button>
            </>
          }
        >
          <p className='text-sm opacity-60'>{t('canvas.projectPage.clearDescription')}</p>
        </Modal>

        <AssetPickerModal
          open={assetPickerOpen}
          onInsert={handleAssetInsert}
          onClose={() => setAssetPickerOpen(false)}
        />
      </section>
      {canvasAgentEnabled ? (
        <Suspense fallback={null}>
          <CanvasAgentOptIn
            applyOps={applyAgentOps}
            endpoint={canvasAgentEndpoint}
            snapshot={agentSnapshot}
            storageKeyPrefix={storageKeyPrefix}
          />
        </Suspense>
      ) : null}
    </main>
  );
}
