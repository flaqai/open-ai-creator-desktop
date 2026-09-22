export type RestrictedMediaKind = 'image' | 'video';

export const DEFAULT_IMAGE_UPLOAD_FORMATS = ['jpg', 'jpeg', 'png', 'webp'] as const;
export const DEFAULT_VIDEO_UPLOAD_FORMATS = ['mp4', 'mov', 'webm'] as const;

const MIME_TYPES_BY_FORMAT: Record<string, string[]> = {
  jpg: ['image/jpeg', 'image/jpg'],
  jpeg: ['image/jpeg', 'image/jpg'],
  png: ['image/png'],
  webp: ['image/webp'],
  bmp: ['image/bmp', 'image/x-bmp', 'image/x-ms-bmp'],
  mp4: ['video/mp4'],
  mov: ['video/quicktime'],
  webm: ['video/webm'],
};

export function normalizeMediaFormats(kind: RestrictedMediaKind, formats?: readonly string[]) {
  const defaults = kind === 'image' ? DEFAULT_IMAGE_UPLOAD_FORMATS : DEFAULT_VIDEO_UPLOAD_FORMATS;
  const source = formats?.length ? formats : defaults;
  return [...new Set(source.map((format) => format.trim().toLowerCase().replace(/^\./, '')).filter(Boolean))];
}

export function getMediaInputAccept(kind: RestrictedMediaKind, formats?: readonly string[]) {
  return normalizeMediaFormats(kind, formats)
    .map((format) => `.${format}`)
    .join(',');
}

export function getMediaDropzoneAccept(
  kind: RestrictedMediaKind,
  formats?: readonly string[],
): Record<string, string[]> {
  return normalizeMediaFormats(kind, formats).reduce<Record<string, string[]>>((result, format) => {
    const mimeType = MIME_TYPES_BY_FORMAT[format]?.[0] || `${kind}/*`;
    result[mimeType] = [...(result[mimeType] || []), `.${format}`];
    return result;
  }, {});
}

export function getFileExtension(fileName: string) {
  const cleanName = fileName.split(/[?#]/, 1)[0];
  const dotIndex = cleanName.lastIndexOf('.');
  return dotIndex > -1 ? cleanName.slice(dotIndex + 1).toLowerCase() : '';
}

export function isAcceptedMediaFile(
  file: Pick<File, 'name' | 'type'>,
  kind: RestrictedMediaKind,
  formats?: readonly string[],
) {
  const extension = getFileExtension(file.name);
  if (!normalizeMediaFormats(kind, formats).includes(extension)) return false;

  const mimeType = file.type.trim().toLowerCase();
  if (!mimeType || mimeType === 'application/octet-stream') return true;

  const expectedMimeTypes = MIME_TYPES_BY_FORMAT[extension];
  return expectedMimeTypes ? expectedMimeTypes.includes(mimeType) : mimeType.startsWith(`${kind}/`);
}

export function filterAcceptedMediaFiles<T extends Pick<File, 'name' | 'type'>>(
  files: T[],
  kind: RestrictedMediaKind,
  formats?: readonly string[],
) {
  return files.filter((file) => isAcceptedMediaFile(file, kind, formats));
}
