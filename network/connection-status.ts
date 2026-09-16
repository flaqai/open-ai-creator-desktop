import { getSecureItem } from '@/lib/utils/secureStorage';

import { OPEN_API_CLIENT_KEY_STORAGE_KEY } from './clientFetch';

export const OPEN_API_AUTHORIZED_STORAGE_KEY = 'FLAQ-SAAS-TEMPLATE-open-api-authorized';

export function setApiConnectionAuthorized(authorized: boolean, remember: boolean) {
  sessionStorage.removeItem(OPEN_API_AUTHORIZED_STORAGE_KEY);
  localStorage.removeItem(OPEN_API_AUTHORIZED_STORAGE_KEY);
  if (authorized) (remember ? localStorage : sessionStorage).setItem(OPEN_API_AUTHORIZED_STORAGE_KEY, 'true');
}

export async function isApiConnectionAuthorized() {
  const authorized =
    sessionStorage.getItem(OPEN_API_AUTHORIZED_STORAGE_KEY) === 'true' ||
    localStorage.getItem(OPEN_API_AUTHORIZED_STORAGE_KEY) === 'true';
  if (!authorized) return false;
  return Boolean(await getSecureItem(OPEN_API_CLIENT_KEY_STORAGE_KEY));
}
