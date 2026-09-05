import crypto from 'crypto';

/**
 * Generate R2 storage path with date folder structure
 * @param originalFileName Original file name
 * @param mimeType File MIME type
 * @returns Path in format: YYYY/MM/DD/{hash}.{ext}
 */
export function generateR2Path(originalFileName: string, mimeType: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  // Generate hash from filename + timestamp
  const hash = crypto.createHash('sha256').update(`${originalFileName}-${Date.now()}`).digest('hex').slice(0, 16);

  // Extract extension from MIME type
  const ext = getExtensionFromMimeType(mimeType);

  return `${year}/${month}/${day}/${hash}.${ext}`;
}

/**
 * Map MIME type to file extension
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeMap: Record<string, string> = {
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
  };
  return mimeMap[mimeType] ?? 'bin';
}
