'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { InfiniteCanvasIntegrations } from '../../infinite-canvas.types';

const InfiniteCanvasIntegrationsContext = createContext<InfiniteCanvasIntegrations | null>(null);

export function InfiniteCanvasIntegrationsProvider({
  children,
  integrations,
}: {
  readonly children: ReactNode;
  readonly integrations: InfiniteCanvasIntegrations;
}) {
  return (
    <InfiniteCanvasIntegrationsContext.Provider value={integrations}>
      {children}
    </InfiniteCanvasIntegrationsContext.Provider>
  );
}

export function useInfiniteCanvasIntegrations(): InfiniteCanvasIntegrations {
  const integrations = useContext(InfiniteCanvasIntegrationsContext);
  if (integrations === null) throw new Error('Infinite Canvas components require their private integrations provider.');
  return integrations;
}

export function useOptionalInfiniteCanvasIntegrations(): InfiniteCanvasIntegrations | null {
  return useContext(InfiniteCanvasIntegrationsContext);
}
