'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { SourceGenerationRuntime } from './source-generation-runtime';

const SourceGenerationContext = createContext<SourceGenerationRuntime | null>(null);

export function SourceGenerationProvider({
  children,
  runtime,
}: {
  readonly children: ReactNode;
  readonly runtime: SourceGenerationRuntime;
}) {
  return <SourceGenerationContext.Provider value={runtime}>{children}</SourceGenerationContext.Provider>;
}

export function useSourceGenerationRuntime(): SourceGenerationRuntime {
  const runtime = useContext(SourceGenerationContext);
  if (runtime === null) throw new Error('Infinite Canvas source generation requires its private Network runtime.');
  return runtime;
}
