import { fetchWithTimeout, platformFetch, type FetchTransport } from '@/lib/platform/http';

import { buildOpenApiUrl, type OpenApiConfig } from './clientFetch';

type KeyStatusResponse = {
  code?: number;
  msg?: string;
  message?: string;
  data?: {
    status?: number;
  };
};

export async function testApiConnection(config: OpenApiConfig, transport: FetchTransport = platformFetch) {
  const response = await fetchWithTimeout(
    buildOpenApiUrl(config.baseUrl, '/api/v1/key/status'),
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ client_key: config.clientKey }),
    },
    15_000,
    transport,
  );
  const payload = (await response.json().catch(() => null)) as KeyStatusResponse | null;
  const message = payload?.msg || payload?.message || response.statusText;

  if (response.status === 401 || response.status === 403) {
    throw new Error(message || 'Authentication failed.');
  }
  if (!response.ok) throw new Error(`${response.status}: ${message || 'Key status request failed.'}`);
  if (payload?.data?.status !== 1) throw new Error(message || 'Client key is not authorized.');
  return 'verified' as const;
}
