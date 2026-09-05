import { isNativeDesktop } from '@/lib/desktop/runtime';

/** Programmatic links use the same system-browser boundary as normal anchors. */
export async function openExternalUrl(value: string, target = '_blank') {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Only HTTP(S) links are supported.');
  if (isNativeDesktop()) {
    const { openUrl } = await import('@tauri-apps/plugin-opener');
    await openUrl(url.href);
  } else {
    window.open(url.href, target, 'noopener,noreferrer');
  }
}
