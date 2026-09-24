export async function saveAs(
  source: Blob | string,
  fileName: string,
  fetchImplementation: typeof globalThis.fetch = globalThis.fetch,
): Promise<void> {
  const blob = typeof source === 'string' ? await fetchSource(source, fetchImplementation) : source;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function fetchSource(source: string, fetchImplementation: typeof globalThis.fetch): Promise<Blob> {
  const response = await fetchImplementation(source);
  if (!response.ok) throw new Error(`Unable to download Infinite Canvas media (${response.status}).`);
  return response.blob();
}
