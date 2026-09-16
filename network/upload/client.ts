import { isDesktopRuntime } from '@/lib/desktop/runtime';
import { getUploadProvider, R2_PUBLIC_DOMAIN_STORAGE_KEY } from '@/lib/desktop/storage';
import { getSecureItem } from '@/lib/utils/secureStorage';

export interface CreateSignedUrlRequest {
  mineType: string[];
  isForever?: boolean;
}

export interface SignedUrlItem {
  signedUrl?: string;
  uploadUrl?: string;
  fileUrl?: string;
  url?: string;
  fileName?: string;
  mimeType?: string;
}

export interface CreateSignedUrlResponse {
  rows: SignedUrlItem[];
}

/** R2 signing adapter used before generation requests submit public media URLs. */
export interface UploadAdapter {
  createSignedUrl(input: CreateSignedUrlRequest): Promise<SignedUrlItem[]>;
}

export async function createSignedUrl(mineType: string[], isForever?: boolean): Promise<CreateSignedUrlResponse> {
  if (typeof window === 'undefined') {
    throw new Error('createSignedUrl can only be called from the browser.');
  }

  if (isDesktopRuntime()) {
    const provider = getUploadProvider();
    if (provider === 'custom-r2') {
      const { createDesktopSignedUrls, getCustomDesktopR2Config } = await import('./desktop-r2');
      return createDesktopSignedUrls(mineType, await getCustomDesktopR2Config());
    }
    const { createFlaqSignedUrls } = await import('./flaq-storage');
    return createFlaqSignedUrls(mineType, isForever);
  }

  const publicDomain = await getSecureItem(R2_PUBLIC_DOMAIN_STORAGE_KEY);
  if (!publicDomain) {
    throw new Error('Custom R2 is not configured. Open Settings → Image Hosting.');
  }

  const response = await fetch('/api/upload/presigned-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mimeTypes: mineType, publicDomain }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || 'Failed to create signed URL');
  }

  return response.json();
}
