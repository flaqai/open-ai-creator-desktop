'use client';

import { defaultLocale, languages } from '@/i18n/languages';

import { STORE_PREFIX } from '@/lib/constants/config';
import { fetchWithTimeout } from '@/lib/platform/http';
import { getSecureItem } from '@/lib/utils/secureStorage';
import { clientSideGetCookie } from '@/lib/utils/stringUtils';

export type OpenApiTaskStatus = 'submitted' | 'processing' | 'succeed' | 'failed';

export interface OpenApiConfig {
  baseUrl: string;
  clientKey: string;
}

export interface OpenApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
    param?: string;
    type?: string;
  };
}

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

const OLD_OPEN_API_BASE_URL_STORAGE_KEY = 'flaq_open_api_base_url';
const OLD_OPEN_API_CLIENT_KEY_STORAGE_KEY = 'flaq_open_api_client_key';

export const OPEN_API_BASE_URL_STORAGE_KEY = `${STORE_PREFIX}-open-api-base-url`;
export const OPEN_API_CLIENT_KEY_STORAGE_KEY = `${STORE_PREFIX}-open-api-client-key`;

function migrateOldApiKeys() {
  if (typeof window === 'undefined') return;

  const oldBaseUrl = localStorage.getItem(OLD_OPEN_API_BASE_URL_STORAGE_KEY);
  const oldClientKey = localStorage.getItem(OLD_OPEN_API_CLIENT_KEY_STORAGE_KEY);

  if (oldBaseUrl && !localStorage.getItem(OPEN_API_BASE_URL_STORAGE_KEY)) {
    localStorage.setItem(OPEN_API_BASE_URL_STORAGE_KEY, oldBaseUrl);
    localStorage.removeItem(OLD_OPEN_API_BASE_URL_STORAGE_KEY);
  }

  if (oldClientKey && !localStorage.getItem(OPEN_API_CLIENT_KEY_STORAGE_KEY)) {
    localStorage.setItem(OPEN_API_CLIENT_KEY_STORAGE_KEY, oldClientKey);
    localStorage.removeItem(OLD_OPEN_API_CLIENT_KEY_STORAGE_KEY);
  }
}

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

export async function openApiFetchJson<TResponse>(
  config: OpenApiConfig,
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const res = await fetchWithTimeout(buildOpenApiUrl(config.baseUrl, path), {
    ...init,
    headers: createOpenApiHeaders(config.clientKey, init?.headers),
  });

  const data = (await res.json().catch(() => null)) as null | TResponse | OpenApiErrorPayload;

  if (!res.ok) {
    const errorMessage =
      (data as OpenApiErrorPayload | null)?.error?.message || res.statusText || 'Open API request failed';
    throw new Error(errorMessage);
  }

  if (!data || typeof data !== 'object') throw new Error('Open API returned an invalid JSON response.');
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

  migrateOldApiKeys();

  // Try to get from secure storage (encrypted)
  const baseUrl = (await getSecureItem(OPEN_API_BASE_URL_STORAGE_KEY)) || envBaseUrl;
  const clientKey = (await getSecureItem(OPEN_API_CLIENT_KEY_STORAGE_KEY)) || '';

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
