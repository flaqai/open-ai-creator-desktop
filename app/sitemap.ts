import type { MetadataRoute } from 'next';
import { generateLanguagePaths, languages } from '@/i18n/languages';

import { ALL_FEATURE_ROUTES, SUPPORT_LINKS } from '@/lib/constants';
import { BASE_URL } from '@/lib/env';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapRoutes = [
    { url: '', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    ...ALL_FEATURE_ROUTES.map((r) => ({
      url: r.href.slice(1),
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })),
    ...SUPPORT_LINKS.map((r) => ({
      url: r.href.slice(1),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ] satisfies MetadataRoute.Sitemap;

  return sitemapRoutes.flatMap((route) => {
    const languagePaths = generateLanguagePaths(BASE_URL, route.url);

    return languages.map(({ code }) => {
      return {
        ...route,
        url: languagePaths[code],
        alternates: {
          languages: {
            'x-default': languagePaths.en,
            ...languagePaths,
          },
        },
      };
    });
  });
}
