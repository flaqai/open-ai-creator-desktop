export type UnifiedGeneratorReferenceMediaKind = 'image' | 'video' | 'audio';

export interface UnifiedGeneratorReferenceMediaAsset {
  id: string;
  kind: UnifiedGeneratorReferenceMediaKind;
  source: File | string;
  originalFile?: File;
  name?: string;
  duration?: number;
  trimRange?: {
    startTime: number;
    endTime: number;
  };
}

export function hasReferenceMediaSource(value: unknown): value is UnifiedGeneratorReferenceMediaAsset {
  if (!value || typeof value !== 'object') return false;
  const asset = value as Partial<UnifiedGeneratorReferenceMediaAsset>;
  return (
    typeof asset.id === 'string' &&
    ['image', 'video', 'audio'].includes(String(asset.kind)) &&
    (asset.source instanceof File || (typeof asset.source === 'string' && asset.source.trim().length > 0))
  );
}

export interface UnifiedGeneratorReferencePromptNode {
  type?: string;
  text?: string;
  attrs?: {
    id?: string;
    assetId?: string;
    label?: string;
    kind?: UnifiedGeneratorReferenceMediaKind;
    previewUrl?: string;
    missing?: boolean;
  };
  content?: UnifiedGeneratorReferencePromptNode[];
}
