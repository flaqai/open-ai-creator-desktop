import { getConfiguredCustomR2 } from '@/lib/desktop/image-hosting-settings';
import { isDesktopRuntime } from '@/lib/desktop/runtime';
import { getUploadProvider, R2_PUBLIC_DOMAIN_STORAGE_KEY, type UploadProvider } from '@/lib/desktop/storage';
import { getSecureItem } from '@/lib/utils/secureStorage';

import { createDesktopSignedUrls } from './desktop-r2';
import { createFlaqSignedUrls } from './flaq-storage';
import type { CreateSignedUrlResponse, R2Config } from './types';

type UploadPolicyDependencies = {
  desktop: () => boolean;
  provider: () => UploadProvider;
  customConfig: () => Promise<R2Config>;
  directR2: (mimeTypes: string[], config: R2Config) => Promise<CreateSignedUrlResponse>;
  flaq: (mimeTypes: string[], isForever?: boolean) => Promise<CreateSignedUrlResponse>;
  web: (mimeTypes: string[]) => Promise<CreateSignedUrlResponse>;
};

async function createWebSignedUrls(mimeTypes: string[]): Promise<CreateSignedUrlResponse> {
  const publicDomain = await getSecureItem(R2_PUBLIC_DOMAIN_STORAGE_KEY);
  if (!publicDomain) throw new Error('Custom R2 is not configured. Open Settings → Image Hosting.');
  const response = await fetch('/api/upload/presigned-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mimeTypes, publicDomain }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || 'Failed to create signed URL');
  }
  return response.json();
}

const defaultDependencies: UploadPolicyDependencies = {
  desktop: isDesktopRuntime,
  provider: getUploadProvider,
  customConfig: getConfiguredCustomR2,
  directR2: createDesktopSignedUrls,
  flaq: createFlaqSignedUrls,
  web: createWebSignedUrls,
};

export function createUploadAuthorizer(overrides: Partial<UploadPolicyDependencies> = {}) {
  const dependencies = { ...defaultDependencies, ...overrides };
  return async (mimeTypes: string[], isForever = false) => {
    if (typeof window === 'undefined') throw new Error('Media uploads can only be authorized in the client app.');
    if (!dependencies.desktop()) return dependencies.web(mimeTypes);
    if (dependencies.provider() === 'custom-r2') {
      return dependencies.directR2(mimeTypes, await dependencies.customConfig());
    }
    return dependencies.flaq(mimeTypes, isForever);
  };
}

export const authorizeUploads = createUploadAuthorizer();
