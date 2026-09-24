export type PromptLibraryMode = 'sidebar' | 'dialog';

export interface PromptLibraryItem {
  readonly id: string;
  readonly sourceId: string;
  readonly title: string;
  readonly prompt: string;
  readonly description: string;
  readonly coverUrl: string;
  readonly referenceImageUrls: readonly string[];
  readonly tags: readonly string[];
  readonly author: string;
  readonly sourceUrl: string;
  readonly createdAt: string;
  readonly imageMode: string;
  readonly imageModel: string;
  readonly preview?: string;
  readonly updatedAt?: string;
  readonly imageSize?: string;
  readonly imageCount?: number;
}

export interface PromptLibrarySource {
  readonly id: string;
  readonly name: string;
  readonly homepage: string;
  readonly itemCount: number;
}

export interface AiCanvasPromptLibraryProps {
  readonly mode?: PromptLibraryMode;
  readonly enabledSourceIds?: readonly string[];
  readonly onInsertPrompt?: (prompt: PromptLibraryItem) => void;
  readonly onSelectPrompt?: (prompt: PromptLibraryItem) => void;
}
