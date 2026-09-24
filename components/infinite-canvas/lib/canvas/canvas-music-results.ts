import type { InfiniteCanvasAudioHistoryItem } from '../../infinite-canvas.types';
import type { CanvasMusicTaskResult } from '@/components/infinite-canvas/types/project';
import { CanvasNodeType, type CanvasNodeData, type CanvasConnection } from '../../types/canvas';

export function connectCanvasMusicResults(connections: CanvasConnection[], rootId: string, results: readonly CanvasMusicTaskResult[], sourceId?: string): CanvasConnection[] {
  const source = connections.find((edge) => edge.toNodeId === rootId && (!sourceId || edge.fromNodeId === sourceId))?.fromNodeId;
  if (!source) return connections;
  const additions = results.slice(1).map((result) => ({ id: `${rootId}:${result.id}:edge`, fromNodeId: source, toNodeId: `${rootId}:${result.id}` }));
  return [...connections, ...additions.filter((edge) => !connections.some((existing) => existing.id === edge.id))];
}

/** Adopt the complete batch atomically, preserving independent result identities. */
export function applyCanvasMusicResults(
  nodes: CanvasNodeData[],
  rootId: string,
  taskId: string,
  results: readonly CanvasMusicTaskResult[],
  connections: readonly CanvasConnection[] = [],
): CanvasNodeData[] {
  const root = nodes.find((node) => node.id === rootId);
  if (!root || results.length === 0) return nodes;
  const outputs = results.map((result, index): CanvasNodeData => ({
    ...root,
    id: index === 0 ? rootId : `${rootId}:${result.id}`,
    type: CanvasNodeType.Audio,
    width: Math.max(root.width, 400),
    height: Math.max(root.height, 280),
    title: result.title,
    position: { x: root.position.x, y: root.position.y + index * (Math.max(root.height, 280) + 40) },
    metadata: {
      ...root.metadata,
      content: result.url,
      mimeType: 'audio/mpeg',
      musicRecordId: result.id,
      musicCompletedTask: taskId,
      lyrics: result.lyrics,
      music: { ...root.metadata?.music, lyrics: result.lyrics, lyricsEdited: true, title: result.title },
      coverUrl: result.coverUrl,
      coverThumbnailUrl: result.coverThumbnailUrl,
      status: result.status === 'completed' ? 'success' : 'error',
      errorDetails: result.error || undefined,
    },
  }));
  const byId = new Map(outputs.map((node) => [node.id, node]));
  const sourceIds = new Set(connections.filter((edge) => edge.toNodeId === rootId).map((edge) => edge.fromNodeId));
  return [...nodes.map((node): CanvasNodeData => byId.get(node.id) || (sourceIds.has(node.id) && node.metadata?.status === 'loading'
    ? { ...node, metadata: { ...node.metadata, status: 'success', errorDetails: undefined } } : node)),
    ...outputs.filter((output) => !nodes.some((node) => node.id === output.id))];
}

/** Old saved results keep lyrics in result metadata until the user edits that input. */
export function resolveCanvasMusicValues(node?: CanvasNodeData) {
  const metadata = node?.metadata;
  return metadata?.musicRecordId && !metadata.music?.lyricsEdited
    ? { ...metadata.music, lyrics: metadata.lyrics || '', lyricsEdited: true, title: metadata.music?.title || node!.title }
    : metadata?.music;
}

/** Result links define membership; ordinary downstream links never become playlist items. */
export function connectedMusicResults(sourceId: string, nodes: CanvasNodeData[], connections: readonly CanvasConnection[]) {
  const source = nodes.find((node) => node.id === sourceId);
  const legacySource = source?.type === CanvasNodeType.Audio && source.metadata?.generationMode === 'music'
    && !source.metadata.musicRecordId && !source.metadata.content;
  const ids = new Set(connections.filter((edge) => edge.fromNodeId === sourceId).map((edge) => edge.toNodeId));
  return nodes.filter((node) => ids.has(node.id) && node.type === CanvasNodeType.Audio
    && (node.metadata?.musicSourceNodeId === sourceId || (legacySource && !node.metadata?.musicSourceNodeId && Boolean(node.metadata?.musicRecordId))));
}

export function selectedMusicResult(source: CanvasNodeData, results: readonly CanvasNodeData[]) {
  const playable = results.filter((node) => node.metadata?.status === 'success' && Boolean(node.metadata.content));
  return playable.find((node) => node.id === source.metadata?.selectedMusicResultId) || playable[0];
}

export function reconcileMusicResultSources(nodes: CanvasNodeData[], connections: readonly CanvasConnection[]): CanvasNodeData[] {
  let changed = false;
  const owners = new Map<string, string>();
  const next = nodes.map((node) => {
    if (node.type !== CanvasNodeType.Audio || node.metadata?.musicRecordId) return node;
    const results = connectedMusicResults(node.id, nodes, connections);
    if (!node.metadata?.musicResultSource && (node.metadata?.content || !results.length)) return node;
    results.forEach((result) => owners.set(result.id, node.id));
    const selected = selectedMusicResult(node, results);
    const patch = {
      musicResultSource: true, selectedMusicResultId: selected?.id,
      content: selected?.metadata?.content || '', durationMs: selected?.metadata?.durationMs,
      mimeType: selected?.metadata?.mimeType, coverUrl: selected?.metadata?.coverUrl,
      coverThumbnailUrl: selected?.metadata?.coverThumbnailUrl, lyrics: selected?.metadata?.lyrics,
      status: selected ? 'success' as const : 'idle' as const, errorDetails: undefined,
    };
    if (Object.entries(patch).every(([key, value]) => node.metadata?.[key as keyof typeof node.metadata] === value)) return node;
    changed = true;
    return { ...node, metadata: { ...node.metadata, ...patch } };
  }).map((node) => {
    const owner = owners.get(node.id);
    if (!owner || node.metadata?.musicSourceNodeId === owner) return node;
    changed = true;
    return { ...node, metadata: { ...node.metadata, musicSourceNodeId: owner } };
  });
  return changed ? next : nodes;
}

export function hasUnavailableMusicInput(nodeId: string, nodes: CanvasNodeData[], connections: readonly CanvasConnection[]) {
  const target = nodes.find((node) => node.id === nodeId);
  return connections.some((edge) => {
    if (edge.toNodeId !== nodeId || target?.metadata?.musicSourceNodeId === edge.fromNodeId) return false;
    const source = nodes.find((node) => node.id === edge.fromNodeId);
    return source?.metadata?.musicResultSource && !selectedMusicResult(source, connectedMusicResults(source.id, nodes, connections));
  });
}

/** History is a material association: preserve the source draft and select the independent result. */
export function attachCanvasAudioHistory(nodes: CanvasNodeData[], connections: CanvasConnection[], sourceId: string, item: InfiniteCanvasAudioHistoryItem, resultId: string, connectionId: string) {
  const source = nodes.find((node) => node.id === sourceId && node.type === CanvasNodeType.Audio);
  if (!source || !item.available || !item.url) return { nodes, connections };
  const results = connectedMusicResults(sourceId, nodes, connections);
  const result: CanvasNodeData = {
    id: resultId, type: CanvasNodeType.Audio, title: item.title, width: 400, height: 280,
    position: { x: source.position.x + source.width + 160, y: results.length ? Math.max(...results.map((node) => node.position.y + node.height)) + 40 : source.position.y },
    metadata: { musicSourceNodeId: sourceId, musicRecordId: item.id, content: item.url, durationMs: item.durationMs,
      coverUrl: item.coverUrl, coverThumbnailUrl: item.coverThumbnailUrl, lyrics: item.lyrics, status: 'success' },
  };
  const nextConnections = [...connections, { id: connectionId, fromNodeId: sourceId, toNodeId: resultId }];
  const nextNodes = [...nodes.map((node) => node.id === sourceId ? { ...node, metadata: { ...node.metadata, musicResultSource: true, musicRecordId: undefined, selectedMusicResultId: resultId } } : node), result];
  return { nodes: reconcileMusicResultSources(nextNodes, nextConnections), connections: nextConnections };
}
