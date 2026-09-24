'use client';

import { useMemo } from 'react';

import type { InfiniteCanvasI18n } from '../../infinite-canvas.types';
import { useInfiniteCanvasI18n } from './infinite-canvas-context';

export type InfiniteCanvasTranslate = (key: string, values?: Readonly<Record<string, unknown>>) => string;

function interpolate(value: string, values?: Readonly<Record<string, unknown>>): string {
  if (values === undefined) return value;
  return value.replaceAll(/\{\{(\w+)\}\}/g, (_match, name: string) => String(values[name] ?? ''));
}

function flattenStrings(value: object, prefix = '', result = new Map<string, string>()): Map<string, string> {
  for (const [key, entry] of Object.entries(value)) {
    const path = prefix === '' ? key : `${prefix}.${key}`;
    if (typeof entry === 'string') result.set(path, entry);
    else if (typeof entry === 'object' && entry !== null) flattenStrings(entry, path, result);
  }
  return result;
}

let activeStrings: ReadonlyMap<string, string> | null = null;

function missingMessage(key: string): string {
  return `InfiniteCanvas.${key}`;
}

export function configureInfiniteCanvasTranslation(i18n: InfiniteCanvasI18n): void {
  activeStrings = flattenStrings(i18n);
}

export function translateInfiniteCanvasMessage(key: string, values?: Readonly<Record<string, unknown>>): string {
  const value = activeStrings?.get(key);
  return interpolate(value ?? missingMessage(key), values);
}

const nonReactMessageFormatter = { t: translateInfiniteCanvasMessage };

export function useInfiniteCanvasTranslation() {
  const i18n = useInfiniteCanvasI18n();
  const strings = useMemo(() => flattenStrings(i18n), [i18n]);
  const t = useMemo<InfiniteCanvasTranslate>(
    () => (key, values) => interpolate(strings.get(key) ?? missingMessage(key), values),
    [strings],
  );

  return { i18n, t };
}

export default nonReactMessageFormatter;
