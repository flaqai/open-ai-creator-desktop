import { getSourceModelMetadataPatch } from '../../runtime/generation/source-model-data';
import { defaultConfig, type AiConfig } from '../../stores/use-config-store';
import type { CanvasNodeMetadata } from '../../types/canvas';

export type TextGenerationConfigMode = 'image' | 'video';

export function buildTextGenerationConfigMetadata(
  mode: TextGenerationConfigMode,
  config: AiConfig,
  imageCount: number,
): CanvasNodeMetadata {
  if (mode === 'video') {
    const model = config.videoModel || defaultConfig.videoModel;
    return {
      generationMode: 'video',
      prompt: '',
      count: 1,
      ...getSourceModelMetadataPatch(model, 'video', {}, config.modelAdapter),
    };
  }

  return {
    generationMode: 'image',
    prompt: '',
    model: config.imageModel || config.model,
    size: config.size,
    count: imageCount,
  };
}
