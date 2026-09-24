import { useSyncExternalStore } from 'react';

// Keep the interactive surface in sync with the dashboard's Tailwind sm breakpoint.
const MOBILE_QUERY = '(max-width: 639px)';

function subscribe(onChange: () => void) {
  const query = window.matchMedia?.(MOBILE_QUERY);
  query?.addEventListener('change', onChange);
  return () => query?.removeEventListener('change', onChange);
}

function getSnapshot() {
  return window.matchMedia?.(MOBILE_QUERY).matches ?? false;
}

function getServerSnapshot() {
  return false;
}

export function useDashboardMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
