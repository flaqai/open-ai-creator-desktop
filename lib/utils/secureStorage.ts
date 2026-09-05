import { DESKTOP_R2_STORAGE_KEYS } from '@/lib/desktop/storage';

import { decryptValue, encryptValue } from './cryptoUtils';

const REMEMBER_ME_KEY = 'FLAQ-SAAS-TEMPLATE-remember-me';

/**
 * Storage utility that supports both sessionStorage and localStorage with encryption
 */
export async function setSecureItem(key: string, value: string, remember: boolean = false): Promise<void> {
  const encrypted = await encryptValue(value);
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(key, encrypted);
  // A preference change must not leave an older value shadowing the new one.
  (remember ? sessionStorage : localStorage).removeItem(key);

  // Store remember preference
  if (remember) {
    localStorage.setItem(REMEMBER_ME_KEY, 'true');
  } else {
    localStorage.removeItem(REMEMBER_ME_KEY);
  }
}

/**
 * Get secure item from storage (checks both localStorage and sessionStorage)
 */
export async function getSecureItem(key: string): Promise<string | null> {
  // Check sessionStorage first (current session)
  let encrypted = sessionStorage.getItem(key);

  // If not in session, check localStorage (remembered)
  if (!encrypted) {
    encrypted = localStorage.getItem(key);
  }

  if (!encrypted) return null;

  return await decryptValue(encrypted);
}

/**
 * Remove item from both storages
 */
export function removeSecureItem(key: string): void {
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
}

/**
 * Check if user has enabled "remember me"
 */
export function isRememberMeEnabled(): boolean {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
}

/**
 * Clear all secure storage
 */
export function clearAllSecureStorage(): void {
  // Clear specific keys
  const keys = [
    'FLAQ-SAAS-TEMPLATE-open-api-base-url',
    'FLAQ-SAAS-TEMPLATE-open-api-client-key',
    ...DESKTOP_R2_STORAGE_KEYS,
    REMEMBER_ME_KEY,
  ];

  keys.forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
}
