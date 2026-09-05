import { TEMPLATE_IMAGE_MODELS } from './image';
import { TEMPLATE_VIDEO_MODELS } from './video';

export * from './types';
export * from './image';
export * from './video';

export const TEMPLATE_MODELS = [...TEMPLATE_IMAGE_MODELS, ...TEMPLATE_VIDEO_MODELS];

export const TEMPLATE_MODELS_BY_ID = Object.fromEntries(TEMPLATE_MODELS.map((model) => [model.id, model])) as Record<
  string,
  (typeof TEMPLATE_MODELS)[number]
>;
