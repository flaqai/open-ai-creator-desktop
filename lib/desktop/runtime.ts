export const OPEN_DESKTOP_SETTINGS_EVENT = 'flaq:open-desktop-settings';
export const DESKTOP_ONBOARDING_KEY = 'flaq-creator-desktop-onboarding-complete';

function isLocalDesktopPreview() {
  const location = typeof window === 'undefined' ? undefined : window.location;
  return (
    location !== undefined &&
    ['localhost', '127.0.0.1'].includes(location.hostname) &&
    new URLSearchParams(location.search).has('desktop-preview')
  );
}

export function isNativeDesktop() {
  if (typeof window === 'undefined') return false;
  if (isLocalDesktopPreview()) return false;
  return (
    process.env.NEXT_PUBLIC_FLAQ_NATIVE_DESKTOP === 'true' ||
    process.env.NEXT_PUBLIC_FLAQ_DESKTOP_BUILD === 'true' ||
    process.env.NEXT_PUBLIC_FLAQ_DESKTOP_RUNTIME === 'true' ||
    '__TAURI_INTERNALS__' in window ||
    window.location?.protocol === 'tauri:' ||
    window.location?.hostname === 'tauri.localhost'
  );
}

export function isDesktopRuntime() {
  if (typeof window === 'undefined') return false;
  return (
    process.env.NEXT_PUBLIC_FLAQ_DESKTOP_BUILD === 'true' ||
    process.env.NEXT_PUBLIC_FLAQ_DESKTOP_RUNTIME === 'true' ||
    isNativeDesktop() ||
    isLocalDesktopPreview()
  );
}

export function openDesktopSettings() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(OPEN_DESKTOP_SETTINGS_EVENT));
}
