import { writeDesktopLog, type DesktopLogLevel } from '@/lib/desktop/logging';
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

type ConnectionTestLogger = (level: DesktopLogLevel, scope: string, message: string) => Promise<void>;

const CONNECTION_SCOPE = 'api-connection';
const KEY_STATUS_PATH = '/api/v1/key/status';

async function safeLog(logger: ConnectionTestLogger, level: DesktopLogLevel, message: string): Promise<void> {
  try {
    await logger(level, CONNECTION_SCOPE, message);
  } catch {
    // Diagnostics must never change the connection result.
  }
}

function describeTransportError(error: unknown, clientKey: string): string {
  const name = error instanceof Error ? error.name : 'Error';
  let message = error instanceof Error ? error.message : String(error);
  if (clientKey) message = message.split(clientKey).join('<REDACTED>');
  message = message
    .replace(/Bearer\s+\S+/gi, 'Bearer <REDACTED>')
    .replace(/(["']?client_key["']?\s*[:=]\s*["']?)[^\s,"'}]+/gi, '$1<REDACTED>');
  return `${name}: ${message}`.slice(0, 500);
}

export async function testApiConnection(
  config: OpenApiConfig,
  transport: FetchTransport = platformFetch,
  logger: ConnectionTestLogger = writeDesktopLog,
) {
  const startedAt = Date.now();
  await safeLog(logger, 'info', `POST ${KEY_STATUS_PATH} started`);

  let response: Response;
  try {
    response = await fetchWithTimeout(
      buildOpenApiUrl(config.baseUrl, KEY_STATUS_PATH),
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
  } catch (error) {
    await safeLog(
      logger,
      'error',
      `POST ${KEY_STATUS_PATH} failed before response in ${Date.now() - startedAt}ms (${describeTransportError(error, config.clientKey)})`,
    );
    throw error;
  }

  const payload = (await response.json().catch(() => null)) as KeyStatusResponse | null;
  const message = payload?.msg || payload?.message || response.statusText;
  const authorized = response.ok && payload?.data?.status === 1;
  const rejected = response.status === 401 || response.status === 403 || payload?.data?.status === 0;
  const details = [
    `HTTP ${response.status}`,
    `in ${Date.now() - startedAt}ms`,
    `code=${payload?.code ?? 'unknown'}`,
    `keyStatus=${payload?.data?.status ?? 'unknown'}`,
  ].join(' ');
  await safeLog(
    logger,
    authorized ? 'info' : rejected ? 'warn' : 'error',
    `POST ${KEY_STATUS_PATH} returned ${details}`,
  );

  if (response.status === 401 || response.status === 403) {
    throw new Error(message || 'Authentication failed.');
  }
  if (!response.ok) throw new Error(`${response.status}: ${message || 'Key status request failed.'}`);
  if (payload?.data?.status !== 1) throw new Error(message || 'Client key is not authorized.');
  return 'verified' as const;
}
