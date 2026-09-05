export const OPEN_DESKTOP_SETTINGS_EVENT = 'flaq:open-desktop-settings';
export const DESKTOP_ONBOARDING_KEY = 'flaq-creator-desktop-onboarding-complete';

export function isNativeDesktop() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export function isDesktopRuntime() {
  if (typeof window === 'undefined') return false;
  const isLocalPreview =
    ['localhost', '127.0.0.1'].includes(window.location.hostname) &&
    new URLSearchParams(window.location.search).has('desktop-preview');
  return process.env.NEXT_PUBLIC_FLAQ_DESKTOP_BUILD === 'true' || isNativeDesktop() || isLocalPreview;
}

export function openDesktopSettings() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(OPEN_DESKTOP_SETTINGS_EVENT));
}
