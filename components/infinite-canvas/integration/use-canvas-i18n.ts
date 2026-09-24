'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { languages } from '@/i18n/languages';
import type { InfiniteCanvasI18n } from '../infinite-canvas.types';
import { INFINITE_CANVAS_MESSAGE_KEYS } from '../runtime/i18n/infinite-canvas-message-keys';

export function useCanvasI18n(): InfiniteCanvasI18n {
  const t = useTranslations('InfiniteCanvas');
  const locale = useLocale();
  return useMemo(() => {
    const read = (value: unknown): unknown => typeof value === 'string'
      ? t.has(value) ? t.raw(value) : `InfiniteCanvas.${value}`
      : Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, read(child)]));
    return {
      ...(read(INFINITE_CANVAS_MESSAGE_KEYS) as InfiniteCanvasI18n), locale,
      locales: languages.map((language) => ({ value: language.lang, label: language.label, shortLabel: language.lang.toUpperCase() })),
    };
  }, [locale, t]);
}
