import type { ReactNode } from 'react';

export interface InfiniteCanvasLandingI18n {
  readonly locale: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly titleHighlight: string;
  readonly description: string;
  readonly docsCta: string;
  readonly createCta: string;
  readonly dashboardCta: string;
  readonly capabilities: string;
  readonly recentTitle: string;
  readonly viewAll: string;
  readonly newProject: string;
  readonly newProjectDescription: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  readonly updated: string;
  readonly loading: string;
  readonly loadError: string;
  readonly retry: string;
  readonly untitled: string;
  readonly open: string;
  readonly nodeCount: string;
  readonly connectionCount: string;
}

export interface InfiniteCanvasLandingIntegrations {
  readonly navigateToDocs: () => void;
  readonly navigateToDashboard: () => void;
  readonly navigateToEditor: (projectId: string) => void;
  readonly onError?: (error: unknown, operation: string) => void;
  readonly onAnalytics?: (event: string, data?: Readonly<Record<string, string | number | boolean>>) => void;
}

export interface InfiniteCanvasLandingProps {
  readonly entryForm?: ReactNode;
  readonly i18n: InfiniteCanvasLandingI18n;
  readonly integrations: InfiniteCanvasLandingIntegrations;
  /** Optional consumer-owned image shown in every recent-project card at a 16:9 aspect ratio. */
  readonly projectImageUrl?: string;
}
