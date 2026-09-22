import {
  getClientContentLanguage,
  getClientOpenApiConfigAsync,
  openApiFetchJson,
  OpenApiHttpError,
  type OpenApiConfig,
} from '@/network/clientFetch';

import { writeDesktopLog } from '@/lib/desktop/logging';

import type { CreateSignedUrlResponse, SignedUrlItem } from './types';

const FLAQ_PRESIGNED_URL_PATH = '/api/v1/files/presignedUrl';
const MAX_FILES_PER_REQUEST = 10;

interface FlaqPresignedUrlResponse {
  code: number;
  message?: string;
  data?: Array<{
    signed_url?: string;
    url?: string;
  }>;
}

interface FlaqStorageOptions {
  config?: OpenApiConfig;
}

/** Request short-lived upload URLs without exposing the shared Flaq R2 credentials. */
export async function createFlaqSignedUrls(
  mimeTypes: string[],
  isForever = false,
  options: FlaqStorageOptions = {},
): Promise<CreateSignedUrlResponse> {
  if (mimeTypes.length === 0) return { rows: [] };
  // Object retention is now a server policy; keep the argument for callers that
  // also support custom/web storage without sending it to the Flaq endpoint.
  void isForever;
  if (mimeTypes.length > MAX_FILES_PER_REQUEST) {
    throw new Error(`Flaq storage accepts at most ${MAX_FILES_PER_REQUEST} files per upload request.`);
  }

  const config = options.config || (await getClientOpenApiConfigAsync());
  const contentLanguage = typeof document === 'undefined' ? undefined : getClientContentLanguage();
  let response: FlaqPresignedUrlResponse;
  try {
    response = await openApiFetchJson<FlaqPresignedUrlResponse>(config, FLAQ_PRESIGNED_URL_PATH, {
      method: 'POST',
      headers: contentLanguage ? { 'content-language': contentLanguage } : undefined,
      body: JSON.stringify({ files: mimeTypes.map((mimeType) => ({ mime_type: mimeType })) }),
    });
  } catch (error) {
    if (error instanceof OpenApiHttpError && [401, 403].includes(error.status)) {
      void writeDesktopLog(
        'warn',
        'flaq-storage',
        `Presigned URL authorization was rejected with HTTP ${error.status}`,
      );
      throw new Error('Your Flaq Client Key is not authorized to upload media. Reconnect Flaq in Settings.');
    }
    throw error;
  }

  if (![0, 200].includes(response.code)) {
    void writeDesktopLog(
      'error',
      'flaq-storage',
      `Presigned URL request returned business code ${response.code}: ${response.message || 'Unknown error'}`,
    );
    throw new Error(response.message || 'Flaq upload authorization failed.');
  }
  if (
    !Array.isArray(response.data) ||
    response.data.length !== mimeTypes.length ||
    response.data.some((row) => !row.signed_url || !row.url)
  ) {
    void writeDesktopLog(
      'error',
      'flaq-storage',
      `Presigned URL response was incomplete: expected ${mimeTypes.length} row(s), received ${response.data?.length || 0}`,
    );
    throw new Error('Flaq upload service returned incomplete upload URLs.');
  }

  void writeDesktopLog(
    'info',
    'flaq-storage',
    `Created ${response.data.length} short-lived presigned upload URL(s) through the Flaq service`,
  );

  return {
    rows: response.data.map<SignedUrlItem>((row, index) => ({
      signedUrl: row.signed_url,
      url: row.url,
      mimeType: mimeTypes[index],
    })),
  };
}
