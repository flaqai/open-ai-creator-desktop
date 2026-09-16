import { isNativeDesktop } from './runtime';

export type DesktopLogLevel = 'info' | 'warn' | 'error';

async function invokeCommand<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(command, args);
}

export function openDesktopLogDirectory() {
  return invokeCommand<void>('open_log_directory');
}

/** Log only operational metadata. Callers must not include keys, request bodies or signed URLs. */
export async function writeDesktopLog(level: DesktopLogLevel, scope: string, message: string) {
  if (!isNativeDesktop()) return;
  try {
    await invokeCommand<void>('write_desktop_log', { level, scope, message });
  } catch {
    // Logging must never break generation or UI interactions.
  }
}
