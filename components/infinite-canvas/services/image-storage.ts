// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
import { nanoid } from 'nanoid';

import i18n from '../i18n';
import { readImageMeta } from '../lib/image-utils';
import type { CanvasUploadFiles } from '../runtime/upload/use-canvas-upload-files';

export type UploadedImage = {
  url: string;
  storageKey: string;
  width: number;
  height: number;
  bytes: number;
  mimeType: string;
};

export async function uploadImage(input: string | Blob, uploadFiles: CanvasUploadFiles): Promise<UploadedImage> {
  if (typeof input === 'string' && /^https?:\/\//i.test(input)) {
    const meta = await readImageMeta(input);
    return {
      url: input,
      storageKey: '',
      width: meta.width,
      height: meta.height,
      bytes: 0,
      mimeType: meta.mimeType,
    };
  }
  const blob = typeof input === 'string' ? await (await fetch(input)).blob() : input;
  const file =
    blob instanceof File
      ? blob
      : new File([blob], `canvas-image-${nanoid()}.${imageExtension(blob.type)}`, {
          type: blob.type || 'image/png',
        });
  const [meta, result] = await Promise.all([readBlobMeta(blob), uploadFiles([file], 'image-reference', 'image')]);
  if (result.status !== 'success' || result.files.length !== 1 || !result.files[0]?.url) {
    throw uploadFailure(result);
  }
  const uploaded = result.files[0];
  return {
    url: uploaded.url,
    storageKey: '',
    width: meta.width,
    height: meta.height,
    bytes: uploaded.size,
    mimeType: uploaded.mimeType || blob.type || meta.mimeType,
  };
}

async function readBlobMeta(blob: Blob) {
  const url = URL.createObjectURL(blob);
  try {
    return await readImageMeta(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function imageExtension(mimeType: string): string {
  return mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
}

function uploadFailure(result: Awaited<ReturnType<CanvasUploadFiles>>): Error {
  if (result.status === 'error') return new Error(result.error.message, { cause: result.error.cause });
  if (result.status === 'rejected') return new Error(`Infinite Canvas image upload rejected: ${result.reason}`);
  return new Error('Infinite Canvas image upload returned no durable URL.');
}

export async function imageToDataUrl(image: { url?: string; dataUrl?: string; storageKey?: string }) {
  const url = image.dataUrl || image.url || '';
  if (!url || url.startsWith('data:')) return url;
  return blobToDataUrl(await (await fetch(url)).blob());
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(i18n.t('common.imageReadFailed')));
    reader.readAsDataURL(blob);
  });
}
