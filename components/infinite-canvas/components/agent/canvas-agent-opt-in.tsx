'use client';

import { useState } from 'react';

import type {
  CanvasAgentOp as SourceCanvasAgentOp,
  CanvasAgentSnapshot as SourceCanvasAgentSnapshot,
} from '../../lib/canvas/canvas-agent-ops';
import type { CanvasAgentOp } from '../../runtime/extensions/agent-canvas-ops';
import LocalAgentPanel from './local-agent-panel';

const DEFAULT_CANVAS_AGENT_ENDPOINT = 'http://127.0.0.1:17371';

export default function CanvasAgentOptIn({
  applyOps,
  endpoint,
  snapshot,
  storageKeyPrefix,
}: {
  readonly applyOps: (ops?: SourceCanvasAgentOp[]) => SourceCanvasAgentSnapshot;
  readonly endpoint?: string;
  readonly snapshot: SourceCanvasAgentSnapshot;
  readonly storageKeyPrefix: string;
}) {
  const [resolvedEndpoint] = useState(() => endpoint || readStoredEndpoint(storageKeyPrefix));
  return (
    <LocalAgentPanel
      endpoint={resolvedEndpoint}
      storageKeyPrefix={storageKeyPrefix}
      snapshot={snapshot}
      onApplyOps={(ops) => applyOps([...ops] as CanvasAgentOp[] as SourceCanvasAgentOp[])}
    />
  );
}

function readStoredEndpoint(storageKeyPrefix: string): string {
  try {
    const value = JSON.parse(
      window.localStorage.getItem(`${storageKeyPrefix}:infinite-canvas:v1:agent-config`) ?? 'null',
    ) as { readonly endpoint?: unknown } | null;
    return typeof value?.endpoint === 'string' && value.endpoint ? value.endpoint : DEFAULT_CANVAS_AGENT_ENDPOINT;
  } catch {
    return DEFAULT_CANVAS_AGENT_ENDPOINT;
  }
}
