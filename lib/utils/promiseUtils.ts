import { fetchWithTimeout, platformFetch, type FetchTransport } from '@/lib/platform/http';

export class HttpStatusError extends Error {
  constructor(public readonly status: number) {
    super(`HTTP request failed (${status})`);
  }
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: { maxRetries?: number; delay?: number; timeOut?: number } = {},
  transport: FetchTransport = platformFetch,
): Promise<Response> {
  const { maxRetries = 3, delay = 1000, timeOut = 120_000 } = retryOptions;
  for (let attempt = 0; ; attempt++) {
    if (options.signal?.aborted) throw options.signal.reason;
    try {
      const response = await fetchWithTimeout(url, options, timeOut, transport);
      if (!response.ok) throw new HttpStatusError(response.status);
      return response;
    } catch (error) {
      const permanent = error instanceof HttpStatusError && error.status < 500 && error.status !== 429;
      if (options.signal?.aborted || permanent || attempt >= maxRetries) throw error;
      await new Promise<void>((resolve, reject) => {
        const abort = () => {
          clearTimeout(timer);
          reject(options.signal?.reason);
        };
        const timer = setTimeout(
          () => {
            options.signal?.removeEventListener('abort', abort);
            resolve();
          },
          delay * 2 ** attempt,
        );
        options.signal?.addEventListener('abort', abort, { once: true });
        if (options.signal?.aborted) abort();
      });
    }
  }
}
