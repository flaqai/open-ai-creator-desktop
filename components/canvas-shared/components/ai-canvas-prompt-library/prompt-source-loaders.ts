import type { PromptLibraryItem, PromptLibrarySource } from '@/components/canvas-shared/components/ai-canvas-prompt-library/ai-canvas-prompt-library.types';

export const PROMPT_LIBRARY_SOURCES = [
  {
    id: 'awesome-nano-banana-prompts',
    name: 'Awesome Nano Banana Pro Prompts',
    homepage: 'https://github.com/flaqai/awesome-nano-banana-prompts',
    itemCount: 100,
  },
  {
    id: 'banana-prompt-quicker',
    name: 'Banana Prompt Quicker',
    homepage: 'https://glidea.github.io/banana-prompt-quicker/',
    itemCount: 323,
  },
  {
    id: 'davidwu-gpt-image2-prompts',
    name: 'DavidWu GPT Image 2',
    homepage: 'https://github.com/davidwuw0811-boop/awesome-gpt-image2-prompts',
    itemCount: 494,
  },
  {
    id: 'freestylefly-gpt-image-2',
    name: 'Freestylefly GPT Image 2',
    homepage: 'https://github.com/freestylefly/awesome-gpt-image-2',
    itemCount: 541,
  },
  {
    id: 'awesome-gpt-image',
    name: 'Awesome GPT Image',
    homepage: 'https://github.com/ZeroLu/awesome-gpt-image',
    itemCount: 53,
  },
  {
    id: 'awesome-gpt4o-image-prompts',
    name: 'Awesome GPT-4o',
    homepage: 'https://github.com/ImgEdify/Awesome-GPT4o-Image-Prompts',
    itemCount: 76,
  },
  {
    id: 'youmind-gpt-image-2',
    name: 'YouMind GPT Image 2',
    homepage: 'https://github.com/YouMind-OpenLab/awesome-gpt-image-2',
    itemCount: 126,
  },
  {
    id: 'youmind-nano-banana-pro',
    name: 'YouMind Nano Banana Pro',
    homepage: 'https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts',
    itemCount: 129,
  },
] as const satisfies readonly PromptLibrarySource[];

export type PromptLibrarySourceId = (typeof PROMPT_LIBRARY_SOURCES)[number]['id'];
export type PromptSourceLoader = () => Promise<readonly PromptLibraryItem[]>;

export const PROMPT_SOURCE_LOADERS: Readonly<Record<PromptLibrarySourceId, PromptSourceLoader>> = {
  'banana-prompt-quicker': () => import('./data/sources/banana-prompt-quicker').then((module) => module.default),
  'davidwu-gpt-image2-prompts': () =>
    import('./data/sources/davidwu-gpt-image2-prompts').then((module) => module.default),
  'freestylefly-gpt-image-2': () => import('./data/sources/freestylefly-gpt-image-2').then((module) => module.default),
  'awesome-gpt-image': () => import('./data/sources/awesome-gpt-image').then((module) => module.default),
  'awesome-gpt4o-image-prompts': () =>
    import('./data/sources/awesome-gpt4o-image-prompts').then((module) => module.default),
  'youmind-gpt-image-2': () => import('./data/sources/youmind-gpt-image-2').then((module) => module.default),
  'youmind-nano-banana-pro': () => import('./data/sources/youmind-nano-banana-pro').then((module) => module.default),
  'awesome-nano-banana-prompts': () =>
    import('./data/sources/awesome-nano-banana-prompts').then((module) => module.default),
};

function isPromptLibrarySourceId(sourceId: string): sourceId is PromptLibrarySourceId {
  return Object.hasOwn(PROMPT_SOURCE_LOADERS, sourceId);
}

export function loadPromptSource(sourceId: string): Promise<readonly PromptLibraryItem[]> {
  if (!isPromptLibrarySourceId(sourceId)) return Promise.reject(new Error(`Unknown prompt source: ${sourceId}`));
  return PROMPT_SOURCE_LOADERS[sourceId]();
}
