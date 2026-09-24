import JSZip from 'jszip';

import type { CanvasProject } from '@/components/infinite-canvas/types/project';
import type { UploadHandler, UploadPurpose } from '@/components/infinite-canvas/types/upload';

import type { InfiniteCanvasModelAdapter } from '../../infinite-canvas-model-adapter';
import type { InfiniteCanvasExportResult } from '../../infinite-canvas.types';
import { resolveCanvasMediaBlob } from './canvas-media-cache';
import type { CanvasArchiveAsset } from './project-archive-validation';
import { parseCanvasProject } from './project-codec';

export class InvalidCanvasArchiveError extends TypeError {
  constructor(cause: unknown) {
    super('Invalid or incompatible Infinite Canvas archive', { cause });
    this.name = 'InvalidCanvasArchiveError';
  }
}

interface CanvasExportFile {
  readonly app: 'infinite-canvas';
  readonly version: 3;
  readonly exportedAt: string;
  readonly projects: readonly { readonly project: CanvasProject; readonly files: readonly CanvasArchiveAsset[] }[];
}

interface MediaReference {
  readonly key: string;
  readonly url: string;
}

function safeFileName(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, '_');
}

function extensionForMimeType(mimeType: string): string {
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('jpeg')) return 'jpg';
  if (mimeType.includes('webp')) return 'webp';
  if (mimeType.includes('gif')) return 'gif';
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('wav')) return 'wav';
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('mpeg')) return 'mp3';
  return 'bin';
}

function collectMediaReferences(project: CanvasProject): readonly MediaReference[] {
  const references = new Map<string, MediaReference>();
  for (const node of project.nodes) {
    const metadata = node.metadata;
    if (metadata?.content && /^(?:https?:)?\//.test(metadata.content)) {
      const key = metadata.storageKey || metadata.content;
      references.set(key, { key, url: metadata.content });
    }
    for (const image of metadata?.images ?? []) {
      if (!image.content || !/^(?:https?:)?\//.test(image.content)) continue;
      const key = image.storageKey || image.content;
      references.set(key, { key, url: image.content });
    }
  }
  return [...references.values()];
}

export async function exportCanvasProjects(
  projects: readonly CanvasProject[],
  fileName: string,
  fetchImplementation: typeof globalThis.fetch = globalThis.fetch,
): Promise<InfiniteCanvasExportResult> {
  const zip = new JSZip();
  const exportedProjects = await Promise.all(
    projects.map(async (project) => {
      const files = await Promise.all(
        collectMediaReferences(project).map(async (reference, index): Promise<CanvasArchiveAsset> => {
          const blob = await resolveCanvasMediaBlob(reference.url, fetchImplementation);
          const path = `projects/${project.id}/files/${index}-${safeFileName(reference.key)}.${extensionForMimeType(blob.type)}`;
          zip.file(path, await blob.arrayBuffer());
          return {
            bytes: blob.size,
            mimeType: blob.type || 'application/octet-stream',
            path,
            storageKey: reference.key,
          };
        }),
      );
      return { files, project };
    }),
  );
  const manifest: CanvasExportFile = {
    app: 'infinite-canvas',
    exportedAt: new Date().toISOString(),
    projects: exportedProjects,
    version: 3,
  };
  zip.file('projects.json', JSON.stringify(manifest, null, 2));
  return {
    blob: await zip.generateAsync({ type: 'blob', compression: 'STORE' }),
    fileName: `${safeFileName(fileName)}.zip`,
    projectIds: projects.map((project) => project.id),
  };
}

function purposeForMimeType(mimeType: string): UploadPurpose {
  if (mimeType.startsWith('video/')) return 'video-source';
  if (mimeType.startsWith('audio/')) return 'audio-reference';
  return 'image-reference';
}

function rewriteMedia(value: unknown, replacements: ReadonlyMap<string, string>): unknown {
  if (Array.isArray(value)) return value.map((item) => rewriteMedia(item, replacements));
  if (value === null || typeof value !== 'object') return value;
  const record = value as Readonly<Record<string, unknown>>;
  const storageKey = typeof record.storageKey === 'string' ? record.storageKey : undefined;
  const content = typeof record.content === 'string' ? record.content : undefined;
  const replacement = (storageKey && replacements.get(storageKey)) || (content && replacements.get(content));
  return Object.fromEntries(
    Object.entries(record).map(([key, child]) => {
      if (key === 'content' && replacement !== undefined) return [key, replacement];
      return [key, rewriteMedia(child, replacements)];
    }),
  );
}

async function prepareCanvasArchive(file: Blob, modelAdapter?: Pick<InfiniteCanvasModelAdapter, 'models'>) {
  try {
    const zip = await JSZip.loadAsync(file, { checkCRC32: true });
    const manifestEntry = zip.file('projects.json');
    if (manifestEntry === null) throw new TypeError('Infinite Canvas archive is missing projects.json');
    const manifest: unknown = JSON.parse(await manifestEntry.async('string'));
    // Keep model catalogs off the Dashboard's initial render path.
    const { validateCanvasArchive } = await import('./project-archive-validation');
    const projects = validateCanvasArchive(manifest, zip, modelAdapter);
    return await Promise.all(
      projects.map(async (item) => {
        const grouped = new Map<UploadPurpose, CanvasArchiveAsset[]>();
        for (const asset of item.files) {
          const purpose = purposeForMimeType(asset.mimeType);
          grouped.set(purpose, [...(grouped.get(purpose) ?? []), asset]);
        }
        const groups = await Promise.all(
          [...grouped].map(async ([purpose, assets]) => ({
            purpose,
            assets,
            files: await Promise.all(
              assets.map(async (asset) => {
                const blob = await zip.file(asset.path)!.async('blob');
                if (blob.size !== asset.bytes) throw new TypeError('Infinite Canvas archive media size mismatch');
                return new File([blob], asset.path.split('/').at(-1) ?? 'asset', { type: asset.mimeType });
              }),
            ),
          })),
        );
        return { project: item.project, groups };
      }),
    );
  } catch (error) {
    throw new InvalidCanvasArchiveError(error);
  }
}

export async function importCanvasProjects(
  file: Blob,
  upload: UploadHandler,
  modelAdapter?: Pick<InfiniteCanvasModelAdapter, 'models'>,
): Promise<readonly CanvasProject[]> {
  const projects = await prepareCanvasArchive(file, modelAdapter);

  return Promise.all(
    projects.map(async (item) => {
      const replacements = new Map<string, string>();
      const uploadedGroups = await Promise.all(
        item.groups.map(async ({ purpose, assets, files }) => {
          const uploaded = await upload({ files, purpose });
          if (uploaded.status !== 'success' || uploaded.files.length !== assets.length) {
            throw new Error('Infinite Canvas archive media upload failed');
          }
          return assets.map((asset, index) => [asset.storageKey, uploaded.files[index]!.url] as const);
        }),
      );
      for (const [storageKey, url] of uploadedGroups.flat()) replacements.set(storageKey, url);
      const rewritten = rewriteMedia(item.project, replacements) as CanvasProject;
      return parseCanvasProject({ ...rewritten, id: '', createdAt: '', updatedAt: '' });
    }),
  );
}
