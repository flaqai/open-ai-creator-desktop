import { FLUX_VIDEO_MODELS } from './flux';
import { HAPPYHORSE_VIDEO_MODELS } from './happyhorse';
import { KLING_VIDEO_MODELS } from './kling';
import { MINIMAX_VIDEO_MODELS } from './minimax';
import { SEEDANCE_VIDEO_MODELS } from './seedance';
import { VEO_VIDEO_MODELS } from './veo';
import { VIDU_VIDEO_MODELS } from './vidu';
import { WAN_VIDEO_MODELS } from './wan';

export { FLUX_VIDEO_MODELS } from './flux';
export { HAPPYHORSE_VIDEO_MODELS } from './happyhorse';
export { KLING_VIDEO_MODELS } from './kling';
export { MINIMAX_VIDEO_MODELS } from './minimax';
export { SEEDANCE_VIDEO_MODELS } from './seedance';
export { VEO_VIDEO_MODELS } from './veo';
export { VIDU_VIDEO_MODELS } from './vidu';
export { WAN_VIDEO_MODELS } from './wan';

export const TEMPLATE_VIDEO_MODELS = [
  ...KLING_VIDEO_MODELS,
  ...SEEDANCE_VIDEO_MODELS,
  ...FLUX_VIDEO_MODELS,
  ...MINIMAX_VIDEO_MODELS,
  ...HAPPYHORSE_VIDEO_MODELS,
  ...VEO_VIDEO_MODELS,
  ...VIDU_VIDEO_MODELS,
  ...WAN_VIDEO_MODELS,
];
