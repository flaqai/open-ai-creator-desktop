'use client';

import { defaultLocale, languages } from '@/i18n/languages';

import { STORE_PREFIX } from '@/lib/constants/config';
import { loadConnectionSettings } from '@/lib/desktop/connection-settings';
import { writeDesktopLog } from '@/lib/desktop/logging';
import { fetchWithTimeout } from '@/lib/platform/http';
import { clientSideGetCookie } from '@/lib/utils/stringUtils';

export type OpenApiTaskStatus = 'submitted' | 'processing' | 'succeed' | 'failed';

export interface OpenApiConfig {
  baseUrl: string;
  clientKey: string;
}

export interface OpenApiErrorPayload {
  code?: number | string;
  message?: string;
  error?: {
    code?: string;
    message?: string;
    param?: string;
    type?: string;
  };
}

export class OpenApiHttpError extends Error {
  readonly status: number;
  readonly code?: number | string;

  constructor(message: string, status: number, code?: number | string) {
    super(message);
    this.name = 'OpenApiHttpError';
    this.status = status;
    this.code = code;
  }
}

type OpenApiRequestOptions = {
  transportRetries?: number;
  retryDelayMs?: number;
};

export interface OpenApiSubmitResponse {
  code: number;
  message: string;
  data: {
    task_id: string;
    task_status: OpenApiTaskStatus;
    response_url: string;
  };
}

export interface OpenApiPollResponse<TResult> {
  code: number;
  message: string;
  data: {
    task_id: string;
    task_status: OpenApiTaskStatus;
    task_status_msg: null | string;
    response_url: string;
    task_result: null | TResult;
  };
}

export interface TaskCreditResult {
  credit?: number;
  credits?: number;
}

export const DEFAULT_OPEN_API_BASE_URL = 'https://api.flaq.ai';
export const OPEN_API_CONFIG_CHANGED_EVENT = 'flaq:api-config-changed';
export class MissingApiKeyError extends Error {
  constructor() {
    super('Please configure your Flaq client key first.');
  }
}

export const OPEN_API_BASE_URL_STORAGE_KEY = `${STORE_PREFIX}-open-api-base-url`;
export const OPEN_API_CLIENT_KEY_STORAGE_KEY = `${STORE_PREFIX}-open-api-client-key`;

function getContentLanguage(code?: string): string {
  return languages.find((item) => item.lang === code)?.backendValue || defaultLocale;
}

export function normalizeBaseUrl(baseUrl: string) {
  const url = new URL(baseUrl.trim());
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('Enter an HTTP(S) API base URL without credentials, query, or fragment.');
  }
  return url.toString().replace(/\/+$/, '');
}

export function buildOpenApiUrl(baseUrl: string, path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizeBaseUrl(baseUrl)}${normalizedPath}`;
}

export function createOpenApiHeaders(clientKey: string, init?: HeadersInit): HeadersInit {
  const headers = new Headers(init);
  headers.set('Accept', 'application/json');
  headers.set('Authorization', `Bearer ${clientKey}`);
  headers.set('Content-Type', 'application/json');
  return headers;
}

function redactTransportError(error: unknown, clientKey: string) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return clientKey ? message.replaceAll(clientKey, '<REDACTED>') : message;
}

function waitForRetry(delayMs: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, delayMs);
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
  });
}

export async function openApiFetchJson<TResponse>(
  config: OpenApiConfig,
  path: string,
  init?: RequestInit,
  options: OpenApiRequestOptions = {},
): Promise<TResponse> {
  const method = init?.method || 'GET';
  let res: Response;
  const retries = Math.max(0, options.transportRetries || 0);
  for (let attempt = 0; ; attempt++) {
    try {
      res = await fetchWithTimeout(buildOpenApiUrl(config.baseUrl, path), {
        ...init,
        headers: createOpenApiHeaders(config.clientKey, init?.headers),
      });
      break;
    } catch (error) {
      const retrying = !init?.signal?.aborted && attempt < retries;
      const detail = redactTransportError(error, config.clientKey);
      void writeDesktopLog(
        retrying ? 'warn' : 'error',
        'open-api',
        retrying
          ? `${method} ${path} transport failed before response; retrying (${attempt + 1}/${retries}): ${detail}`
          : `${method} ${path} failed before receiving a response after ${attempt + 1} attempt(s): ${detail}`,
      );
      if (!retrying) throw error;
      await waitForRetry((options.retryDelayMs ?? 750) * 2 ** attempt, init?.signal || undefined);
    }
  }

  const data = (await res.json().catch(() => null)) as null | TResponse | OpenApiErrorPayload;

  if (!res.ok) {
    const errorPayload = data as OpenApiErrorPayload | null;
    const errorMessage =
      errorPayload?.error?.message || errorPayload?.message || res.statusText || 'Open API request failed';
    void writeDesktopLog('error', 'open-api', `${method} ${path} returned HTTP ${res.status}: ${errorMessage}`);
    throw new OpenApiHttpError(errorMessage, res.status, errorPayload?.code || errorPayload?.error?.code);
  }

  if (!data || typeof data !== 'object') {
    void writeDesktopLog('error', 'open-api', `${method} ${path} returned HTTP ${res.status} with invalid JSON`);
    throw new Error('Open API returned an invalid JSON response.');
  }
  return data as TResponse;
}

export async function getClientOpenApiConfigAsync(): Promise<OpenApiConfig> {
  const envBaseUrl =
    process.env.NEXT_PUBLIC_BASE_OPEN_API || process.env.NEXT_PUBLIC_OPEN_API_BASE_URL || DEFAULT_OPEN_API_BASE_URL;

  if (typeof window === 'undefined') {
    return {
      baseUrl: envBaseUrl,
      clientKey: '',
    };
  }

  const settings = await loadConnectionSettings();
  const baseUrl = settings?.baseUrl || envBaseUrl;
  const clientKey = settings?.clientKey || '';

  if (!clientKey) {
    throw new MissingApiKeyError();
  }

  return {
    baseUrl,
    clientKey,
  };
}

export function getClientContentLanguage() {
  return getContentLanguage(clientSideGetCookie('NEXT_LOCALE') || defaultLocale);
}
