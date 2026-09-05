'use server';

import { cookies } from 'next/headers';
import { defaultLocale, languages } from '@/i18n/languages';

function getContentLanguage(code?: string): string {
  return languages.find((item) => item.lang === code)?.backendValue || defaultLocale;
}

export interface ServerOpenApiConfig {
  baseUrl: string;
  clientKey: string;
}

export function buildServerOpenApiHeaders(clientKey: string, init?: HeadersInit, locale?: string): HeadersInit {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${clientKey}`,
    'Content-Type': 'application/json',
    'Content-Language': getContentLanguage(locale),
    ...init,
  };
}

export async function serverFetch<T = Response>({
  endpoint,
  options,
}: {
  endpoint: string;
  options?: Parameters<typeof fetch>[1];
}): Promise<T> {
  const cookieStore = await cookies();
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Language': getContentLanguage(cookieStore?.get('NEXT_LOCALE')?.value),
      ...options?.headers,
    },
  });

  return (await res.json()) as T;
}

export async function serverOpenApiFetchJson<TResponse>(
  config: ServerOpenApiConfig,
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const cookieStore = await cookies();
  const baseUrl = config.baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(`${baseUrl}${normalizedPath}`, {
    ...init,
    headers: buildServerOpenApiHeaders(config.clientKey, init?.headers, cookieStore?.get('NEXT_LOCALE')?.value),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.error?.message || res.statusText || 'Server Open API request failed';
    throw new Error(message);
  }

  return data as TResponse;
}

export default serverFetch;
