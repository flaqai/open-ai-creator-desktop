'use client';

import { useEffect } from 'react';
import { OPEN_API_CONFIG_CHANGED_EVENT } from '@/network/clientFetch';
import { restorePendingTaskPolling, stopAllTaskPolling } from '@/network/task-polling';

export default function GlobalTaskPolling() {
  useEffect(() => {
    restorePendingTaskPolling();
    const restart = () => {
      stopAllTaskPolling();
      restorePendingTaskPolling();
    };
    window.addEventListener(OPEN_API_CONFIG_CHANGED_EVENT, restart);

    return () => {
      stopAllTaskPolling();
      window.removeEventListener(OPEN_API_CONFIG_CHANGED_EVENT, restart);
    };
  }, []);

  return null;
}
