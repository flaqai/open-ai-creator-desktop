import { isNativeDesktop } from './runtime';

export type MediaKind = 'image' | 'video';
export type MediaArchiveStatus = 'pending' | 'saved' | 'failed';

export type MediaStorageSettings = {
  directory: string;
  isDefault: boolean;
};

export type ArchiveMediaInput = {
  url: string;
  mediaType: MediaKind;
  taskId: string;
  completedAt: number;
};

async function invokeCommand<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(command, args);
}

export function getMediaStorageSettings() {
  return invokeCommand<MediaStorageSettings>('get_media_storage_settings');
}

export function chooseMediaStorageDirectory() {
  return invokeCommand<string | null>('choose_media_storage_directory');
}

export function setMediaStorageDirectory(directory?: string) {
  return invokeCommand<MediaStorageSettings>('set_media_storage_directory', { directory: directory || null });
}

export function openMediaStorageDirectory() {
  return invokeCommand<void>('open_media_storage_directory');
}

export function archiveGeneratedMedia(input: ArchiveMediaInput) {
  return invokeCommand<string>('archive_generated_media', input);
}

export type MediaArchiveOutcome =
  | { status: 'skipped' }
  | { status: 'saved'; localPath: string }
  | { status: 'failed'; error: unknown };

export async function attemptMediaArchive(
  input: ArchiveMediaInput,
  dependencies?: { native?: boolean; archive?: (value: ArchiveMediaInput) => Promise<string> },
): Promise<MediaArchiveOutcome> {
  const native = dependencies?.native ?? isNativeDesktop();
  if (!native) return { status: 'skipped' };
  try {
    const localPath = await (dependencies?.archive || archiveGeneratedMedia)(input);
    return { status: 'saved', localPath };
  } catch (error) {
    return { status: 'failed', error };
  }
}
