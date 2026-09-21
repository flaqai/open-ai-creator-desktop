import { writeDesktopLog, type DesktopLogLevel } from './logging';
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

type MediaDirectoryAdapter = {
  read: () => Promise<MediaStorageSettings>;
  choose: () => Promise<string | null>;
  persist: (directory?: string) => Promise<MediaStorageSettings>;
  open: () => Promise<void>;
};

const nativeMediaDirectoryAdapter: MediaDirectoryAdapter = {
  read: () => invokeCommand<MediaStorageSettings>('get_media_storage_settings'),
  choose: () => invokeCommand<string | null>('choose_media_storage_directory'),
  persist: (directory) =>
    invokeCommand<MediaStorageSettings>('set_media_storage_directory', { directory: directory || null }),
  open: () => invokeCommand<void>('open_media_storage_directory'),
};

/** User-intent seam for media-directory settings; native command ordering stays private. */
export function createMediaDirectoryPreferences(adapter: MediaDirectoryAdapter = nativeMediaDirectoryAdapter) {
  return {
    load: () => adapter.read(),
    async choose(): Promise<MediaStorageSettings | null> {
      const directory = await adapter.choose();
      if (!directory) return null;
      return adapter.persist(directory);
    },
    reset: () => adapter.persist(),
    open: () => adapter.open(),
  };
}

export const mediaDirectoryPreferences = createMediaDirectoryPreferences();

export function archiveGeneratedMedia(input: ArchiveMediaInput) {
  return invokeCommand<string>('archive_generated_media', input);
}

export type MediaArchiveOutcome =
  | { status: 'skipped' }
  | { status: 'saved'; localPath: string }
  | { status: 'failed'; error: unknown };

export async function attemptMediaArchive(
  input: ArchiveMediaInput,
  dependencies?: {
    native?: boolean;
    archive?: (value: ArchiveMediaInput) => Promise<string>;
    log?: (level: DesktopLogLevel, scope: string, message: string) => Promise<void> | void;
  },
): Promise<MediaArchiveOutcome> {
  const native = dependencies?.native ?? isNativeDesktop();
  if (!native) return { status: 'skipped' };
  try {
    const localPath = await (dependencies?.archive || archiveGeneratedMedia)(input);
    return { status: 'saved', localPath };
  } catch (error) {
    const raw = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    const redacted = raw.replace(/https?:\/\/[^\s)]+/gi, '<URL>');
    const safeTaskId = input.taskId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 180);
    try {
      await (dependencies?.log || writeDesktopLog)(
        'error',
        'media-archive',
        `Failed to archive ${input.mediaType} task ${safeTaskId}: ${redacted}`,
      );
    } catch {
      // Logging must not replace the archive failure the caller is handling.
    }
    return { status: 'failed', error };
  }
}
