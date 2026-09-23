import { isNativeDesktop } from './runtime';

export type DesktopLogLevel = 'info' | 'warn' | 'error';
export type DesktopLogger = (level: DesktopLogLevel, scope: string, message: string) => Promise<void> | void;

export function sanitizeDesktopLogText(value: string, maxLength = 300) {
  const normalized = value
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}…` : normalized;
}

export function formatPromptForDesktopLog(prompt: string) {
  return JSON.stringify(sanitizeDesktopLogText(prompt));
}

export function formatErrorForDesktopLog(error: unknown) {
  const raw = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return sanitizeDesktopLogText(
    raw.replace(/Bearer\s+[^\s]+/gi, 'Bearer <REDACTED>').replace(/(https?:\/\/[^\s?#]+)\?[^\s)]+/gi, '$1?<REDACTED>'),
    500,
  );
}

async function invokeCommand<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(command, args);
}

export function openDesktopLogDirectory() {
  return invokeCommand<void>('open_log_directory');
}

/** Log bounded diagnostics only. Never include credentials, signed URLs or complete request bodies. */
export async function writeDesktopLog(level: DesktopLogLevel, scope: string, message: string) {
  if (!isNativeDesktop()) return;
  try {
    await invokeCommand<void>('write_desktop_log', { level, scope, message });
  } catch {
    // Logging must never break generation or UI interactions.
  }
}
