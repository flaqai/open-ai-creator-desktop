'use client';

const HISTORY_EVENT_PREFIX = 'flaq-local-history:';

function getHistoryEventName(key: string) {
  return `${HISTORY_EVENT_PREFIX}${key}`;
}

export function readLocalHistory<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLocalHistory<T>(key: string, items: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new Event(getHistoryEventName(key)));
}

export function subscribeLocalHistory(key: string, callback: () => void) {
  if (typeof window === 'undefined') return () => {};

  const eventName = getHistoryEventName(key);
  const onCustom = () => callback();
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) callback();
  };

  window.addEventListener(eventName, onCustom);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(eventName, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}

export function notifyLocalHistory(key: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(getHistoryEventName(key)));
}
