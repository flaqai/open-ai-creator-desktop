import { fetchWithTimeout, platformFetch, type FetchTransport } from '@/lib/platform/http';

import { buildOpenApiUrl, createOpenApiHeaders, type OpenApiConfig } from './clientFetch';

export async function testApiConnection(config: OpenApiConfig, transport: FetchTransport = platformFetch) {
  const response = await fetchWithTimeout(
    buildOpenApiUrl(config.baseUrl, '/api/v1/image/00000000-0000-0000-0000-000000000000'),
    { headers: createOpenApiHeaders(config.clientKey) },
    15_000,
    transport,
  );
  const payload = await response.json().catch(() => null);
  const message = payload?.error?.message || payload?.message || payload?.msg || response.statusText;
  if (!payload || typeof payload !== 'object') throw new Error('API did not return a JSON response.');
  if (
    response.status === 401 ||
    response.status === 403 ||
    /unauthori|invalid.*key|authentication|鉴权|未认证/i.test(message)
  ) {
    throw new Error(message || 'Authentication failed.');
  }
  if (response.ok && payload.data && typeof payload.data === 'object') return 'verified' as const;
  // A known task-not-found response proves reachability, not credential validity.
  if (response.status === 404 && /task|任务/i.test(message) && /not found|不存在|未找到/i.test(message)) {
    return 'reachable' as const;
  }
  throw new Error(`${response.status}: ${message || 'Unexpected API response'}`);
}
