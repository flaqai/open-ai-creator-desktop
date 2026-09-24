// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
export type ReferenceVideo = {
  id: string;
  name: string;
  type: string;
  url: string;
  storageKey?: string;
  bytes?: number;
  width?: number;
  height?: number;
  durationMs?: number;
};

export type ReferenceAudio = {
  id: string;
  name: string;
  type: string;
  url: string;
  storageKey?: string;
  durationMs?: number;
};
