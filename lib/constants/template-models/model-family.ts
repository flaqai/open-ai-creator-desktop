import type { TemplateModelConfig } from './types';

const VIDEO_VARIANT_SUFFIX = /-(?:text|image|reference|start-end)-to-video$/;
const VIDEO_LABEL_SUFFIX = / (?:Text|Image|Reference|Start End) to Video$/;

/** A model family is the public choice; its variants remain distinct API models. */
export function getTemplateModelFamilyId(model: TemplateModelConfig): string {
  // Client endpoints are intentionally outside the family-routing change.
  const id = model.id.endsWith('-client')
    ? model.id
    : model.mediaType === 'video'
      ? model.id.replace(VIDEO_VARIANT_SUFFIX, '')
      : model.id.replace(/-edit$/, '');
  return `${model.mediaType}:${model.provider ?? ''}:${id}`;
}

export function getTemplateModelFamilyLabel(model: TemplateModelConfig): string {
  if (model.id.endsWith('-client')) return model.label;
  return model.mediaType === 'video' ? model.label.replace(VIDEO_LABEL_SUFFIX, '') : model.label.replace(/ Edit$/, '');
}

/** Choose the concrete request model after the user chooses a family and frame mode. */
export function preferredVideoVariant<
  T extends { options: { endFrame?: { isSupported: boolean; required: boolean } } },
>(variants: readonly T[], enableEndFrame: boolean): T | undefined {
  return (
    variants.find((model) =>
      enableEndFrame ? model.options.endFrame?.isSupported : !model.options.endFrame?.required,
    ) || variants[0]
  );
}
