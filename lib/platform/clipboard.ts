import { isNativeDesktop } from '@/lib/desktop/runtime';

export async function readClipboardText() {
  if (isNativeDesktop()) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<string>('read_clipboard_text');
  }
  return navigator.clipboard.readText();
}

export async function writeClipboardText(text: string) {
  if (isNativeDesktop()) {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('write_clipboard_text', { text });
  } else {
    await navigator.clipboard.writeText(text);
  }
}
