import { GEMINI_IMAGE_MODELS } from './gemini';
import { GPT_IMAGE_MODELS } from './gpt';
import { QWEN_IMAGE_MODELS } from './qwen';
import { SEEDREAM_IMAGE_MODELS } from './seedream';

export { GEMINI_IMAGE_MODELS } from './gemini';
export { GPT_IMAGE_MODELS } from './gpt';
export { QWEN_IMAGE_MODELS } from './qwen';
export { SEEDREAM_IMAGE_MODELS } from './seedream';

export const TEMPLATE_IMAGE_MODELS = [
  ...GEMINI_IMAGE_MODELS,
  ...GPT_IMAGE_MODELS,
  ...QWEN_IMAGE_MODELS,
  ...SEEDREAM_IMAGE_MODELS,
];
