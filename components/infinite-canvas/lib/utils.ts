// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { clsx, type ClassValue } from 'clsx';
import { nanoid } from 'nanoid';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique id.
 *
 * Avoid `crypto.randomUUID`, which is only exposed in secure contexts (HTTPS or
 * localhost) — over plain HTTP it is undefined and throws. `nanoid` works in any
 * context.
 */
export function randomId(): string {
  return nanoid();
}
