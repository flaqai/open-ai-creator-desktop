import { isDesktopRuntime, isNativeDesktop } from '@/lib/desktop/runtime';

import { platformFetch } from './http';

export function mediaRequestUrl(url: string, desktop = isDesktopRuntime()) {
  if (desktop || !/^https?:\/\//i.test(url)) return url;
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

export async function fetchMedia(url: string) {
  const response = await platformFetch(mediaRequestUrl(url));
  if (!response.ok) throw new Error(`Media request failed (${response.status})`);
  return response;
}

export function mediaFileName(url: string, fallback = 'asset') {
  const path = new URL(url, 'https://local.invalid').pathname;
  try {
    return decodeURIComponent(path.split('/').pop() || fallback).replace(/[\\/:*?"<>|]/g, '_');
  } catch {
    return fallback;
  }
}

export async function saveBlob(blob: Blob, filename: string): Promise<boolean> {
  if (isNativeDesktop()) {
    const [{ save }, { writeFile }] = await Promise.all([
      import('@tauri-apps/plugin-dialog'),
      import('@tauri-apps/plugin-fs'),
    ]);
    const path = await save({ defaultPath: filename });
    if (!path) return false;
    await writeFile(path, new Uint8Array(await blob.arrayBuffer()));
    return true;
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Do not revoke until the browser has consumed the download navigation.
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
  return true;
}

export async function downloadBlob(blob: Blob, filename: string): Promise<boolean> {
  if (isNativeDesktop()) {
    const [{ downloadDir, join }, { writeFile }] = await Promise.all([
      import('@tauri-apps/api/path'),
      import('@tauri-apps/plugin-fs'),
    ]);
    const path = await join(await downloadDir(), filename);
    await writeFile(path, new Uint8Array(await blob.arrayBuffer()));
    return true;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
  return true;
}

export async function downloadMedia(url: string, filename: string): Promise<boolean> {
  return downloadBlob(await (await fetchMedia(url)).blob(), filename);
}

export async function saveMedia(url: string, filename: string): Promise<boolean> {
  if (isNativeDesktop() && /^https?:\/\//i.test(url)) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<boolean>('save_media', { url, filename });
  }
  return saveBlob(await (await fetchMedia(url)).blob(), filename);
}
