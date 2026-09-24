'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { InfiniteCanvasI18n } from '../../infinite-canvas.types';
import { configureInfiniteCanvasTranslation } from './infinite-canvas-translation';

const InfiniteCanvasI18nContext = createContext<InfiniteCanvasI18n | null>(null);

export function InfiniteCanvasI18nProvider({
  children,
  i18n,
}: {
  readonly children: ReactNode;
  readonly i18n: InfiniteCanvasI18n;
}) {
  configureInfiniteCanvasTranslation(i18n);
  return <InfiniteCanvasI18nContext.Provider value={i18n}>{children}</InfiniteCanvasI18nContext.Provider>;
}

export function useInfiniteCanvasI18n(): InfiniteCanvasI18n {
  const i18n = useContext(InfiniteCanvasI18nContext);
  if (i18n === null) throw new Error('Infinite Canvas components require their private i18n provider.');
  return i18n;
}
