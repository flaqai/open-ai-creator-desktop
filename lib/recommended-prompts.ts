import snapshot from './recommended-prompts.snapshot.json';

export type RecommendedPromptMedia = { type: 'image'; image: string } | { type: 'video'; image: string; url: string };

export type RecommendedPrompt = {
  id: string;
  title: string;
  prompt: string;
  media: RecommendedPromptMedia;
};

export type PromptCollection = {
  id: string;
  model: string;
  type: 'image' | 'video';
  sourceUrl: string;
  toolHref: '/text-to-image' | '/text-to-video';
  description: { zh: string; en: string };
  prompts: RecommendedPrompt[];
};

export const PROMPT_SNAPSHOT_VERSION = snapshot.version;
export const PROMPT_SNAPSHOT_DATE = snapshot.snapshotDate;
export const PROMPT_COLLECTIONS = snapshot.collections as PromptCollection[];
