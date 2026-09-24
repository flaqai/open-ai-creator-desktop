// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
import i18n from '../../i18n';
import type { CanvasProject as NetworkCanvasProject } from '@/components/infinite-canvas/types/project';
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { saveAs } from '../../runtime/files/source-download';
import { exportCanvasProjects as createProjectArchive } from '../../runtime/persistence/project-archive';
import { resolveCanvasMediaBlob } from '../../runtime/persistence/canvas-media-cache';
import type { CanvasProject } from '../../stores/canvas/use-canvas-store';
import { CanvasNodeType, type CanvasNodeData } from '../../types/canvas';
import { createZip } from '../zip';

export async function exportCanvasProjects(
  projects: CanvasProject[],
  fileName = i18n.t('canvas.export.defaultProjectName'),
) {
  const archive = await createProjectArchive(projects as unknown as NetworkCanvasProject[], fileName);
  await saveAs(archive.blob, archive.fileName);
}

export async function exportCanvasNodes(nodes: CanvasNodeData[], fileName = i18n.t('canvas.export.defaultNodesName')) {
  const zipFiles: { name: string; data: BlobPart }[] = [];
  const used = new Set<string>();
  const uniqueName = (base: string, ext: string) => {
    const safe = safeFileName(base) || i18n.t('canvas.export.item');
    let name = `${safe}.${ext}`;
    for (let i = 1; used.has(name); i += 1) name = `${safe}-${i}.${ext}`;
    used.add(name);
    return name;
  };

  await Promise.all(
    nodes.map(async (node) => {
      const title = node.title || node.type;
      if (node.type === CanvasNodeType.Text)
        return void zipFiles.push({
          name: uniqueName(title, 'txt'),
          data: node.metadata?.content || node.metadata?.prompt || '',
        });
      const content = node.metadata?.content;
      if (content && (/^https?:\/\//i.test(content) || content.startsWith('data:'))) {
        const blob = content.startsWith('data:') ? await (await fetch(content)).blob() : await resolveCanvasMediaBlob(content);
        return void zipFiles.push({ name: uniqueName(title, fileExtension(blob.type)), data: blob });
      }
      zipFiles.push({ name: uniqueName(title, 'json'), data: JSON.stringify(node, null, 2) });
    }),
  );

  const zip = await createZip(zipFiles);
  await saveAs(zip, `${safeFileName(fileName)}.zip`);
}

function safeFileName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, '_');
}

function fileExtension(mimeType: string) {
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('jpeg')) return 'jpg';
  if (mimeType.includes('webp')) return 'webp';
  if (mimeType.includes('gif')) return 'gif';
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('mpeg') || mimeType.includes('mp3')) return 'mp3';
  if (mimeType.includes('wav')) return 'wav';
  if (mimeType.includes('ogg')) return 'ogg';
  return 'bin';
}
