export const R2_UPLOAD_ROOT = 'uploads';

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/mp4': 'm4a',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'application/pdf': 'pdf',
  'application/json': 'json',
  'text/plain': 'txt',
};

type R2PathOptions = {
  now?: Date;
  id?: string;
};

/** Create one shared object-key format for browser, desktop and server uploads. */
export function generateR2Path(mimeType: string, options: R2PathOptions = {}): string {
  const now = options.now ?? new Date();
  const datePath = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('/');
  const id = options.id ?? crypto.randomUUID().replaceAll('-', '').slice(0, 20);
  const extension = MIME_EXTENSIONS[mimeType] ?? 'bin';

  return `${R2_UPLOAD_ROOT}/${datePath}/${id}.${extension}`;
}
