import type { MetadataRoute } from 'next';

import { BASE_URL } from '@/lib/env';

const PRIVATE_PATHS = ['/*/social-callback/', '/api/', '/404', '/500'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/llms.txt', '/llms-full.txt'],
      disallow: PRIVATE_PATHS,
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
