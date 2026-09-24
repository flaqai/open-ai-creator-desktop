'use client';

import dynamic from 'next/dynamic';

const CanvasWorkspace = dynamic(() => import('./canvas-workspace').then((module) => module.CanvasWorkspace), {
  ssr: false,
});

export default function CanvasClientMount({ projectId }: { readonly projectId?: string }) {
  return <CanvasWorkspace projectId={projectId} />;
}
