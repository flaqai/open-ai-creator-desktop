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
