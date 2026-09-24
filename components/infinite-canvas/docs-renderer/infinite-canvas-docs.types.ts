import type { ReactNode } from 'react';

export interface InfiniteCanvasDocsNavigationItem {
  readonly href: string;
  readonly title: string;
  readonly description?: string;
}

export interface InfiniteCanvasDocsNavigationSection {
  readonly title: string;
  readonly items: readonly InfiniteCanvasDocsNavigationItem[];
}

export interface InfiniteCanvasDocsTableOfContentsItem {
  readonly href: string;
  readonly title: string;
  readonly level: 2 | 3;
}

export interface InfiniteCanvasDocsLabels {
  readonly browse: string;
  readonly onThisPage: string;
  readonly backToCanvas: string;
  readonly openDashboard: string;
  readonly previous: string;
  readonly next: string;
}

export interface InfiniteCanvasDocsProps {
  readonly activeHref: string;
  readonly backToCanvasHref: string;
  readonly children: ReactNode;
  readonly description: string;
  readonly dashboardHref: string;
  readonly labels: InfiniteCanvasDocsLabels;
  readonly navigation: readonly InfiniteCanvasDocsNavigationSection[];
  readonly next?: InfiniteCanvasDocsNavigationItem;
  readonly previous?: InfiniteCanvasDocsNavigationItem;
  readonly tableOfContents: readonly InfiniteCanvasDocsTableOfContentsItem[];
  readonly title: string;
}
