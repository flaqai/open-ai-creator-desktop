import type JSZip from 'jszip';

import type { CanvasProject } from '@/components/infinite-canvas/types/project';

import type { InfiniteCanvasModelAdapter } from '../../infinite-canvas-model-adapter';
import { SOURCE_APPROVED_MODELS, sourceModelName } from '../generation/source-model-data';
import { parseCanvasProject } from './project-codec';

export interface CanvasArchiveAsset {
  readonly storageKey: string;
  readonly path: string;
  readonly mimeType: string;
  readonly bytes: number;
}

interface CanvasArchiveProject {
  readonly project: CanvasProject;
  readonly files: readonly CanvasArchiveAsset[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function invalidArchive(): never {
  throw new TypeError('Invalid or incompatible Infinite Canvas archive');
}

/** Validate every project before any archive media is uploaded. Never normalize model IDs. */
export function validateCanvasArchive(
  manifest: unknown,
  zip: JSZip,
  modelAdapter?: Pick<InfiniteCanvasModelAdapter, 'models'>,
): readonly CanvasArchiveProject[] {
  if (
    !isRecord(manifest) ||
    manifest.app !== 'infinite-canvas' ||
    manifest.version !== 3 ||
    !Array.isArray(manifest.projects) ||
    manifest.projects.length === 0
  )
    invalidArchive();

  const models = new Map((modelAdapter?.models ?? SOURCE_APPROVED_MODELS).map((model) => [model.name, model]));
  return manifest.projects.map((item) => {
    if (!isRecord(item) || !Array.isArray(item.files)) invalidArchive();
    const project = parseCanvasProject(item.project);
    for (const node of project.nodes) {
      const metadata: unknown = node.metadata;
      if (metadata === undefined) continue;
      if (!isRecord(metadata)) invalidArchive();
      if (metadata.model === undefined || metadata.model === '') continue;
      if (typeof metadata.model !== 'string') invalidArchive();
      const model = models.get(sourceModelName(metadata.model));
      if (model === undefined || model.disabled) invalidArchive();
      if (
        node.type === 'config' &&
        metadata.generationMode !== undefined &&
        metadata.generationMode !== model.capability &&
        !(metadata.generationMode === 'lyrics' && model.capability === 'music')
      ) {
        invalidArchive();
      }
    }

    const storageKeys = new Set<string>();
    const files = item.files.map((asset) => {
      if (
        !isRecord(asset) ||
        typeof asset.storageKey !== 'string' ||
        !asset.storageKey ||
        typeof asset.path !== 'string' ||
        !asset.path ||
        typeof asset.mimeType !== 'string' ||
        !asset.mimeType ||
        typeof asset.bytes !== 'number' ||
        !Number.isSafeInteger(asset.bytes) ||
        asset.bytes < 0 ||
        storageKeys.has(asset.storageKey) ||
        zip.file(asset.path) === null
      )
        invalidArchive();
      storageKeys.add(asset.storageKey);
      return { storageKey: asset.storageKey, path: asset.path, mimeType: asset.mimeType, bytes: asset.bytes };
    });
    return { project, files };
  });
}
