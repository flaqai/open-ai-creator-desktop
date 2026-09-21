import { loadConnectionSettings, setConnectionAuthorization } from '@/lib/desktop/connection-settings';

export const OPEN_API_AUTHORIZED_STORAGE_KEY = 'FLAQ-SAAS-TEMPLATE-open-api-authorized';

export async function setApiConnectionAuthorized(authorized: boolean, remember: boolean) {
  await setConnectionAuthorization(authorized, remember);
}

export async function isApiConnectionAuthorized() {
  const settings = await loadConnectionSettings();
  return Boolean(settings?.authorized && settings.clientKey);
}
