import {
  getClientContentLanguage,
  getClientOpenApiConfigAsync,
  openApiFetchJson,
  type OpenApiConfig,
} from '@/network/clientFetch';

import { writeDesktopLog } from '@/lib/desktop/logging';

import type { CreateSignedUrlResponse, SignedUrlItem } from './types';

const DEFAULT_FLAQ_UPLOAD_SITE = 'online';

interface FlaqPresignedUrlResponse {
  code: number;
  msg?: string;
  total?: number;
  rows?: SignedUrlItem[];
}

interface FlaqStorageOptions {
  config?: OpenApiConfig;
  site?: string;
}

/** Request short-lived upload URLs without exposing the shared Flaq R2 credentials. */
export async function createFlaqSignedUrls(
  mimeTypes: string[],
  isForever = false,
  options: FlaqStorageOptions = {},
): Promise<CreateSignedUrlResponse> {
  if (mimeTypes.length === 0) return { rows: [] };

  const config = options.config || (await getClientOpenApiConfigAsync());
  const site = options.site?.trim() || process.env.SITE_ID?.trim() || DEFAULT_FLAQ_UPLOAD_SITE;
  const contentLanguage = typeof document === 'undefined' ? undefined : getClientContentLanguage();
  const response = await openApiFetchJson<FlaqPresignedUrlResponse>(config, '/image/presignedUrl', {
    method: 'POST',
    headers: contentLanguage ? { 'content-language': contentLanguage } : undefined,
    body: JSON.stringify({ mineType: mimeTypes, site, isForever }),
  });

  if (![0, 200].includes(response.code)) {
    void writeDesktopLog(
      'error',
      'flaq-storage',
      `Presigned URL request returned business code ${response.code}: ${response.msg || 'Unknown error'}`,
    );
    throw new Error(response.msg || 'Flaq upload authorization failed.');
  }
  if (
    !Array.isArray(response.rows) ||
    response.rows.length !== mimeTypes.length ||
    response.rows.some((row) => !row.signedUrl || !row.url)
  ) {
    void writeDesktopLog(
      'error',
      'flaq-storage',
      `Presigned URL response was incomplete: expected ${mimeTypes.length} row(s), received ${response.rows?.length || 0}`,
    );
    throw new Error('Flaq upload service returned incomplete upload URLs.');
  }

  void writeDesktopLog(
    'info',
    'flaq-storage',
    `Created ${response.rows.length} presigned upload URL(s) using site ${site}`,
  );

  return {
    rows: response.rows.map((row, index) => ({ ...row, mimeType: row.mimeType || mimeTypes[index] })),
  };
}
