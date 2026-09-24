export type UploadPurpose = 'image-reference' | 'video-reference' | 'video-source' | 'audio-reference';

export interface UploadInput {
  readonly files: readonly File[];
  readonly purpose: UploadPurpose;
  readonly signal?: AbortSignal;
}

export interface UploadedFileResult {
  readonly name: string;
  readonly mimeType: string;
  readonly size: number;
  readonly url: string;
}

export interface UploadError {
  readonly code: 'invalid-response' | 'compression-failed' | 'network-error' | 'upload-failed';
  readonly message: string;
  readonly cause?: unknown;
}

export type UploadResult =
  | { readonly status: 'success'; readonly files: readonly UploadedFileResult[] }
  | { readonly status: 'rejected'; readonly reason: 'cancelled' }
  | { readonly status: 'error'; readonly error: UploadError };

export interface UploadHandler {
  (input: UploadInput): Promise<UploadResult>;
}
