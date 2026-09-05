import type { FileType } from '@/lib/utils/fileUtils';
import { fetchWithRetry } from '@/lib/utils/promiseUtils';

import { createSignedUrl } from './client';

/** Limit parallel transfers while preserving reference ordering for multi-input models. */
export async function uploadFiles(
  files: FileType[],
  options?: { isForever?: boolean },
  dependencies = { sign: createSignedUrl, put: fetchWithRetry },
): Promise<string[]> {
  if (!files.length) return [];
  if (files.some((file) => !file.data)) throw new Error('An upload file is missing.');
  const { rows } = await dependencies.sign(
    files.map((file) => file.type),
    options?.isForever,
  );
  if (rows.length !== files.length || rows.some((row) => !row.signedUrl || !row.url)) {
    throw new Error('Upload service returned incomplete upload URLs.');
  }
  let next = 0;
  let failure: unknown;
  await Promise.all(
    Array.from({ length: Math.min(3, files.length) }, async () => {
      while (next < files.length && !failure) {
        const index = next++;
        try {
          await dependencies.put(rows[index].signedUrl!, {
            method: 'PUT',
            body: files[index].data,
            headers: { 'Content-Type': files[index].type },
          });
        } catch (error) {
          failure = error;
        }
      }
    }),
  );
  if (failure) throw failure;
  return rows.map((row) => row.url!);
}
