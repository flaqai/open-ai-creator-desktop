import { CanvasNodeType } from '../../types/canvas';

export const CANVAS_MEDIA_FILE_ACCEPT = 'image/*,video/*,audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac';

export function canvasMediaFileAccept(nodeType?: CanvasNodeType): string {
  if (nodeType === CanvasNodeType.Image) return 'image/*';
  if (nodeType === CanvasNodeType.Video) return 'video/*';
  if (nodeType === CanvasNodeType.Audio) return 'audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac';
  return CANVAS_MEDIA_FILE_ACCEPT;
}

export function acceptsCanvasMediaFile(file: File, nodeType?: CanvasNodeType): boolean {
  const mediaType = canvasMediaFileType(file);
  if (nodeType === CanvasNodeType.Image) return mediaType === 'image';
  if (nodeType === CanvasNodeType.Video) return mediaType === 'video';
  if (nodeType === CanvasNodeType.Audio) return mediaType === 'audio';
  return mediaType !== null;
}

export function canvasMediaFileType(file: Pick<File, 'name' | 'type'>): 'image' | 'video' | 'audio' | null {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension && ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'heic', 'heif'].includes(extension)) return 'image';
  if (extension && ['mp4', 'mov', 'webm', 'm4v', 'avi', 'mkv'].includes(extension)) return 'video';
  if (extension && ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'].includes(extension)) return 'audio';
  return null;
}
