import { STORE_PREFIX } from '@/lib/constants/config';

import { clearAllSecureStorage, getSecureItem, isRememberMeEnabled, setSecureItem } from '../utils/secureStorage';
import { writeDesktopLog } from './logging';
import { isNativeDesktop } from './runtime';

const BASE_URL_KEY = `${STORE_PREFIX}-open-api-base-url`;
const CLIENT_KEY_KEY = `${STORE_PREFIX}-open-api-client-key`;
const AUTHORIZED_KEY = `${STORE_PREFIX}-open-api-authorized`;
const OLD_BASE_URL_KEY = 'flaq_open_api_base_url';
const OLD_CLIENT_KEY_KEY = 'flaq_open_api_client_key';

export type ConnectionSettings = {
  version: 1;
  baseUrl: string;
  clientKey: string;
  remember: boolean;
  authorized: boolean;
  updatedAt: string;
};

type SaveConnectionSettingsInput = Pick<ConnectionSettings, 'baseUrl' | 'clientKey' | 'remember' | 'authorized'>;

let nativeSettingsCache: ConnectionSettings | null | undefined;

function usesNativeStorageAdapter() {
  if (typeof window === 'undefined') return false;
  const location = window.location;
  const browserPreview =
    location !== undefined &&
    ['localhost', '127.0.0.1'].includes(location.hostname) &&
    new URLSearchParams(location.search).has('desktop-preview');
  if (browserPreview) return false;
  return (
    process.env.NEXT_PUBLIC_FLAQ_NATIVE_DESKTOP === 'true' ||
    process.env.NEXT_PUBLIC_FLAQ_DESKTOP_BUILD === 'true' ||
    process.env.NEXT_PUBLIC_FLAQ_DESKTOP_RUNTIME === 'true' ||
    isNativeDesktop()
  );
}

async function invokeCommand<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(command, args);
}

function migrateLegacyBrowserKeys() {
  const oldBaseUrl = localStorage.getItem(OLD_BASE_URL_KEY);
  const oldClientKey = localStorage.getItem(OLD_CLIENT_KEY_KEY);
  if (oldBaseUrl && !localStorage.getItem(BASE_URL_KEY)) localStorage.setItem(BASE_URL_KEY, oldBaseUrl);
  if (oldClientKey && !localStorage.getItem(CLIENT_KEY_KEY)) localStorage.setItem(CLIENT_KEY_KEY, oldClientKey);
}

function hasSessionConnectionSettings() {
  return Boolean(sessionStorage.getItem(BASE_URL_KEY) || sessionStorage.getItem(CLIENT_KEY_KEY));
}

function setBrowserAuthorization(authorized: boolean, remember: boolean) {
  sessionStorage.removeItem(AUTHORIZED_KEY);
  localStorage.removeItem(AUTHORIZED_KEY);
  if (authorized) (remember ? localStorage : sessionStorage).setItem(AUTHORIZED_KEY, 'true');
}

function browserAuthorization() {
  return sessionStorage.getItem(AUTHORIZED_KEY) === 'true' || localStorage.getItem(AUTHORIZED_KEY) === 'true';
}

async function loadBrowserSettings(): Promise<ConnectionSettings | null> {
  migrateLegacyBrowserKeys();
  const [baseUrl, clientKey] = await Promise.all([getSecureItem(BASE_URL_KEY), getSecureItem(CLIENT_KEY_KEY)]);
  if (!clientKey) return null;
  return {
    version: 1,
    baseUrl: baseUrl || 'https://api.flaq.ai',
    clientKey,
    remember: isRememberMeEnabled(),
    authorized: browserAuthorization(),
    updatedAt: '',
  };
}

async function saveBrowserSettings(settings: SaveConnectionSettingsInput) {
  await Promise.all([
    setSecureItem(BASE_URL_KEY, settings.baseUrl, settings.remember),
    setSecureItem(CLIENT_KEY_KEY, settings.clientKey, settings.remember),
  ]);
  setBrowserAuthorization(settings.authorized, settings.remember);
}

/**
 * Load connection settings through the platform seam. Native desktop persistence
 * is tied to the application identifier and is therefore independent of WebView ports.
 * Remembered desktop values are stored as readable JSON in auth.json.
 */
export async function loadConnectionSettings(): Promise<ConnectionSettings | null> {
  if (!usesNativeStorageAdapter()) return loadBrowserSettings();

  // A genuine session-only choice wins over disk. If the old remember flag is
  // present, the WebView values are migration input rather than a session override.
  if (hasSessionConnectionSettings() && !isRememberMeEnabled()) return loadBrowserSettings();
  if (nativeSettingsCache !== undefined) return nativeSettingsCache;

  const stored = await invokeCommand<ConnectionSettings | null>('load_connection_settings');
  if (stored) {
    nativeSettingsCache = stored;
    void writeDesktopLog('info', 'connection-settings', 'Loaded remembered connection settings from auth.json');
    return stored;
  }

  // One-time migration for credentials that belong to the current WebView origin.
  const legacy = await loadBrowserSettings();
  if (!legacy?.remember) {
    nativeSettingsCache = null;
    return legacy;
  }

  const migrated = await invokeCommand<ConnectionSettings>('save_connection_settings', {
    settings: {
      baseUrl: legacy.baseUrl,
      clientKey: legacy.clientKey,
      authorized: legacy.authorized,
    },
  });
  clearAllSecureStorage();
  nativeSettingsCache = migrated;
  void writeDesktopLog('info', 'connection-settings', 'Migrated remembered connection settings to auth.json');
  return migrated;
}

export async function saveConnectionSettings(settings: SaveConnectionSettingsInput): Promise<ConnectionSettings> {
  if (!usesNativeStorageAdapter()) {
    await saveBrowserSettings(settings);
    return { version: 1, ...settings, updatedAt: new Date().toISOString() };
  }

  if (!settings.remember) {
    await invokeCommand<void>('clear_connection_settings');
    clearAllSecureStorage();
    await saveBrowserSettings(settings);
    nativeSettingsCache = null;
    void writeDesktopLog('info', 'connection-settings', 'Stored connection settings for the current session only');
    return { version: 1, ...settings, updatedAt: new Date().toISOString() };
  }

  const stored = await invokeCommand<ConnectionSettings>('save_connection_settings', {
    settings: {
      baseUrl: settings.baseUrl,
      clientKey: settings.clientKey,
      authorized: settings.authorized,
    },
  });
  clearAllSecureStorage();
  nativeSettingsCache = stored;
  void writeDesktopLog('info', 'connection-settings', 'Saved and verified remembered connection settings in auth.json');
  return stored;
}

export async function setConnectionAuthorization(authorized: boolean, remember: boolean) {
  const settings = await loadConnectionSettings();
  if (!settings) {
    setBrowserAuthorization(false, remember);
    return;
  }
  await saveConnectionSettings({
    baseUrl: settings.baseUrl,
    clientKey: settings.clientKey,
    remember,
    authorized,
  });
}

export async function clearConnectionSettings() {
  clearAllSecureStorage();
  if (usesNativeStorageAdapter()) await invokeCommand<void>('clear_connection_settings');
  nativeSettingsCache = null;
  void writeDesktopLog('info', 'connection-settings', 'Cleared saved connection settings');
}
