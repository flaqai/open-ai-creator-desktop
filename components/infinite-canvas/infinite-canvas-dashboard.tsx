'use client';

import { useState, type ReactNode } from 'react';

import { InfiniteCanvasDashboardContent } from './dashboard/infinite-canvas-dashboard-content';
import type { InfiniteCanvasDashboardProps } from './infinite-canvas.types';
import { InfiniteCanvasI18nProvider } from './runtime/i18n/infinite-canvas-context';
import { InfiniteCanvasIntegrationsProvider } from './runtime/integrations/infinite-canvas-integrations-context';

export function InfiniteCanvasDashboard({
  i18n,
  integrations,
  modelAdapter,
  onPageChange,
  page,
  projectImageUrl,
  projectPreview,
}: InfiniteCanvasDashboardProps): ReactNode {
  const [fixedModelAdapter] = useState(modelAdapter);
  return (
    <InfiniteCanvasI18nProvider i18n={i18n}>
      <InfiniteCanvasIntegrationsProvider integrations={integrations}>
        <InfiniteCanvasDashboardContent
          page={page}
          onPageChange={onPageChange}
          modelAdapter={fixedModelAdapter}
          projectImageUrl={projectImageUrl}
          projectPreview={projectPreview}
        />
      </InfiniteCanvasIntegrationsProvider>
    </InfiniteCanvasI18nProvider>
  );
}
