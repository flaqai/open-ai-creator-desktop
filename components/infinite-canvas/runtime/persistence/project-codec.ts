import type { CanvasProject, JsonValue } from '@/components/infinite-canvas/types/project';

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function createEmptyCanvasProject(
  id: string,
  title: string,
  timestamp = new Date().toISOString(),
): CanvasProject {
  return {
    activeChatId: null,
    backgroundMode: 'lines',
    chatSessions: [],
    connections: [],
    createdAt: timestamp,
    generationTasks: [],
    id,
    nodes: [],
    showImageInfo: true,
    title,
    updatedAt: timestamp,
    viewport: { k: 1, x: 0, y: 0 },
  };
}

export function parseCanvasProject(value: unknown): CanvasProject {
  if (!isRecord(value)) throw new TypeError('Canvas project must be a JSON object');
  if (
    typeof value.id !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.createdAt !== 'string' ||
    typeof value.updatedAt !== 'string' ||
    !Array.isArray(value.nodes) ||
    !Array.isArray(value.connections) ||
    !Array.isArray(value.chatSessions) ||
    (value.activeChatId !== null && typeof value.activeChatId !== 'string') ||
    (value.backgroundMode !== 'dots' && value.backgroundMode !== 'lines' && value.backgroundMode !== 'blank') ||
    typeof value.showImageInfo !== 'boolean' ||
    !isRecord(value.viewport) ||
    !isFiniteNumber(value.viewport.x) ||
    !isFiniteNumber(value.viewport.y) ||
    !isFiniteNumber(value.viewport.k) ||
    value.viewport.k <= 0
  ) {
    throw new TypeError('Canvas project is missing required serializable fields');
  }

  for (const node of value.nodes) {
    if (
      !isRecord(node) ||
      typeof node.id !== 'string' ||
      typeof node.type !== 'string' ||
      node.type.length === 0 ||
      typeof node.title !== 'string' ||
      !isRecord(node.position) ||
      !isFiniteNumber(node.position.x) ||
      !isFiniteNumber(node.position.y) ||
      !isFiniteNumber(node.width) ||
      !isFiniteNumber(node.height) ||
      node.width <= 0 ||
      node.height <= 0
    ) {
      throw new TypeError('Canvas project contains an invalid node');
    }
  }
  for (const connection of value.connections) {
    if (
      !isRecord(connection) ||
      typeof connection.id !== 'string' ||
      typeof connection.fromNodeId !== 'string' ||
      typeof connection.toNodeId !== 'string'
    ) {
      throw new TypeError('Canvas project contains an invalid connection');
    }
  }
  if (value.generationTasks !== undefined) {
    if (!Array.isArray(value.generationTasks)) throw new TypeError('Canvas project contains invalid generation tasks');
    for (const task of value.generationTasks) {
      if (
        !isRecord(task) ||
        typeof task.taskId !== 'string' ||
        !task.taskId ||
        (task.taskKind !== 'image' &&
          task.taskKind !== 'video' &&
          task.taskKind !== 'music' &&
          task.taskKind !== '3d') ||
        typeof task.resultNodeId !== 'string' ||
        !task.resultNodeId ||
        (task.resultSlotId !== undefined && typeof task.resultSlotId !== 'string') ||
        (task.resultUrl !== undefined && typeof task.resultUrl !== 'string') ||
        typeof task.createdAt !== 'string'
      ) {
        throw new TypeError('Canvas project contains an invalid generation task');
      }
    }
  }
  return value as unknown as CanvasProject;
}

function nonJsonValue(path: string): TypeError {
  return new TypeError(`Canvas project contains non-JSON runtime value at ${path}`);
}

function toJsonValue(value: unknown, path: string, ancestors: Set<object>): JsonValue | undefined {
  if (value === undefined) return undefined;
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw nonJsonValue(path);
    return value;
  }
  if (typeof value !== 'object') throw nonJsonValue(path);
  if (ancestors.has(value)) throw nonJsonValue(path);

  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      return value.map((item, index) => {
        const normalized = toJsonValue(item, `${path}[${index}]`, ancestors);
        if (normalized === undefined) throw nonJsonValue(`${path}[${index}]`);
        return normalized;
      });
    }
    if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) {
      throw nonJsonValue(path);
    }

    const result: Record<string, JsonValue> = {};
    for (const [key, item] of Object.entries(value)) {
      const normalized = toJsonValue(item, `${path}.${key}`, ancestors);
      if (normalized !== undefined) result[key] = normalized;
    }
    return result;
  } finally {
    ancestors.delete(value);
  }
}

export function toSerializableCanvasProject(project: CanvasProject): CanvasProject {
  const normalized = toJsonValue(project, '$', new Set());
  if (normalized === undefined) throw nonJsonValue('$');
  return parseCanvasProject(normalized);
}

export function assertSerializableProject(project: CanvasProject): void {
  void toSerializableCanvasProject(project);
}
