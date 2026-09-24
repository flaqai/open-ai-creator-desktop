'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';

import CanvasClientMount from './canvas-client-mount';

export default function CanvasEditorEntry() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('id');

  useEffect(() => {
    if (!projectId) router.replace('/ai-canvas');
  }, [projectId, router]);

  return projectId ? <CanvasClientMount projectId={projectId} /> : null;
}
