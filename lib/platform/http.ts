import { isNativeDesktop } from '@/lib/desktop/runtime';

export type FetchTransport = (url: string, init?: RequestInit) => Promise<Response>;

/**
 * Tauri's HTTP plugin wraps request bodies in a WebKit Request before sending
 * them to Rust. WebKit can fail to reload File/Blob bodies restored from
 * IndexedDB with "Blob loading failed". Materialize those bodies first so the
 * plugin receives owned bytes instead of a temporary Blob backing store.
 */
export async function prepareNativeRequestInit(init?: RequestInit): Promise<RequestInit | undefined> {
  if (!init || !(init.body instanceof Blob)) return init;
  try {
    return { ...init, body: await init.body.arrayBuffer() };
  } catch (error) {
    throw new Error('The selected local media is no longer readable. Remove it and select the file again.', {
      cause: error,
    });
  }
}

/** External requests use native networking in Tauri, independent of WebView CORS. */
export const platformFetch: FetchTransport = async (url, init) => {
  if (isNativeDesktop() && /^https?:\/\//i.test(url)) {
    const { fetch } = await import('@tauri-apps/plugin-http');
    return fetch(url, await prepareNativeRequestInit(init));
  }
  return fetch(url, init);
};

export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 30_000,
  transport: FetchTransport = platformFetch,
) {
  const controller = new AbortController();
  const abort = () => controller.abort(init.signal?.reason);
  if (init.signal?.aborted) abort();
  else init.signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(() => controller.abort(new DOMException('Request timed out', 'TimeoutError')), timeoutMs);
  try {
    return await transport(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
    init.signal?.removeEventListener('abort', abort);
  }
}
