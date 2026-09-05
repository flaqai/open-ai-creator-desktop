import { defineRouting } from 'next-intl/routing';

import { defaultLocale, locales } from './languages';

const isDesktopBuild = process.env.NEXT_PUBLIC_FLAQ_DESKTOP_BUILD === 'true';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: locales,

  // Used when no locale matches
  defaultLocale: defaultLocale,
  localePrefix: isDesktopBuild ? 'always' : 'as-needed',
});
