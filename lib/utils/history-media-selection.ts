import type {
  UnifiedGeneratorReferenceMediaAsset,
  UnifiedGeneratorReferenceMediaKind,
} from '@/lib/constants/unified-generator/types';

function normalizeExtension(value: string) {
  return value.trim().toLowerCase().replace(/^\./, '');
}

export function getMediaSourceExtension(source: File | string) {
  const value = source instanceof File ? source.name : source;
  const withoutQuery = value.split(/[?#]/, 1)[0];
  const filename = withoutQuery.split('/').pop() || '';
  const dotIndex = filename.lastIndexOf('.');
  return dotIndex > -1 ? normalizeExtension(filename.slice(dotIndex + 1)) : '';
}

export function filterCompatibleHistoryAssets(
  assets: UnifiedGeneratorReferenceMediaAsset[],
  kind: UnifiedGeneratorReferenceMediaKind,
  acceptedFormats?: string[],
) {
  const formats = new Set((acceptedFormats || []).map(normalizeExtension).filter(Boolean));

  return assets.filter((asset) => {
    if (asset.kind !== kind) return false;
    if (formats.size === 0) return true;
    const extension = getMediaSourceExtension(asset.source);
    // History records do not always retain a filename. Keep typed records when
    // compatibility cannot be disproved; the existing validator checks metadata.
    return extension === '' || formats.has(extension);
  });
}
