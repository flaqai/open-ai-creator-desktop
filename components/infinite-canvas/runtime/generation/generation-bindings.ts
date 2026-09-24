import { type CanvasProjectGenerationTask, type CanvasNodeData } from '@/components/infinite-canvas/types/project';

export class CanvasClientKeyRequiredError extends Error {
  constructor() {
    super('Please configure your Flaq client key first.');
    this.name = 'CanvasClientKeyRequiredError';
  }
}

export type CanvasObservationFailureKind = 'transient' | 'client-key-required' | 'aborted';

export function classifyCanvasObservationFailure(error: unknown): CanvasObservationFailureKind {
  if (error instanceof DOMException && error.name === 'AbortError') return 'aborted';
  if (error instanceof CanvasClientKeyRequiredError) return 'client-key-required';
  return 'transient';
}

export interface CanvasGenerationBinding extends CanvasProjectGenerationTask {
  readonly projectId: string;
}

export function toCanvasGenerationBinding(
  projectId: string,
  task: CanvasProjectGenerationTask,
): CanvasGenerationBinding {
  return { ...task, projectId };
}

export function upsertProjectGenerationTask(
  tasks: readonly CanvasProjectGenerationTask[],
  binding: CanvasGenerationBinding,
): readonly CanvasProjectGenerationTask[] {
  const { projectId: _projectId, ...task } = binding;
  return [
    ...tasks.filter(
      (candidate) =>
        candidate.taskId !== task.taskId &&
        (candidate.resultNodeId !== task.resultNodeId || candidate.resultSlotId !== task.resultSlotId),
    ),
    task,
  ];
}

export function removeProjectGenerationTask(
  tasks: readonly CanvasProjectGenerationTask[],
  taskId: string,
): readonly CanvasProjectGenerationTask[] {
  return tasks.filter((task) => task.taskId !== taskId);
}

export function completeProjectGenerationTask(
  tasks: readonly CanvasProjectGenerationTask[],
  taskId: string,
  resultUrl: string,
): readonly CanvasProjectGenerationTask[] {
  return tasks.map((task) => (task.taskId === taskId ? { ...task, resultUrl } : task));
}

export function pendingProjectGenerationTasks(
  tasks: readonly CanvasProjectGenerationTask[],
  nodes: readonly CanvasNodeData[],
): readonly CanvasProjectGenerationTask[] {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  return tasks.filter((task) => {
    const node = nodesById.get(task.resultNodeId);
    if (node === undefined) return false;
    if (task.taskKind === 'music') return node.metadata?.musicCompletedTask !== task.taskId;
    const media = task.resultSlotId
      ? node.metadata?.images?.find((image) => image.id === task.resultSlotId)
      : node.metadata;
    if (task.resultSlotId && media === undefined) return false;
    return (
      !/^https?:\/\//i.test(task.resultUrl ?? '') || media?.status !== 'success' || media.content !== task.resultUrl
    );
  });
}

export function applyTextEventSequence(
  current: { readonly text: string; readonly sequence: number },
  event: { readonly sequence: number; readonly delta?: string; readonly text?: string },
) {
  if (event.sequence <= current.sequence) return current;
  return {
    sequence: event.sequence,
    text: event.text ?? `${current.text}${event.delta ?? ''}`,
  };
}
