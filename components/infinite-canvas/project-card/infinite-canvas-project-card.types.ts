import type { ReactNode } from 'react';

import type { CanvasProjectSummary } from '@/components/infinite-canvas/types/project';

interface InfiniteCanvasProjectCardLabels {
  readonly open: string;
  readonly nodeCount: string;
  readonly connectionCount: string;
  readonly updated: string;
}

interface InfiniteCanvasProjectCardActions {
  readonly renameLabel: string;
  readonly exportLabel: string;
  readonly deleteLabel: string;
  readonly onRename: () => void;
  readonly onExport: () => void;
  readonly onDelete: () => void;
}

export interface InfiniteCanvasProjectCardProps {
  readonly project: CanvasProjectSummary;
  readonly imageUrl?: string;
  readonly preview?: ReactNode;
  readonly variant: number;
  readonly locale: string;
  readonly labels: InfiniteCanvasProjectCardLabels;
  readonly selected?: boolean;
  readonly onSelectedChange?: (selected: boolean) => void;
  readonly onOpen: () => void;
  readonly actions?: InfiniteCanvasProjectCardActions;
  readonly mobileActions?: {
    readonly label: string;
    readonly onOpen: () => void;
  };
}
