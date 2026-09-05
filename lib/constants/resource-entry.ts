import { UTM_SOURCE } from './navigation';

export const FLAQ_SITE_URL = 'https://flaq.ai';

export function getFlaqResourceUrl(path: string, locale = 'en') {
  const localePrefix = locale === 'en' ? '' : `/${locale}`;
  return `${FLAQ_SITE_URL}${localePrefix}${path}?utm_source=${UTM_SOURCE}`;
}
