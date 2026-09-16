'use client';

import { useSyncExternalStore } from 'react';

import { isDesktopRuntime } from '@/lib/desktop/runtime';

const subscribe = () => () => {};
const serverSnapshot = () =>
  process.env.NEXT_PUBLIC_FLAQ_DESKTOP_BUILD === 'true' || process.env.NEXT_PUBLIC_FLAQ_DESKTOP_RUNTIME === 'true';

/** Keep server/client desktop markup consistent without a marketing-page flash. */
export function useDesktopRuntime() {
  return useSyncExternalStore(subscribe, isDesktopRuntime, serverSnapshot);
}
