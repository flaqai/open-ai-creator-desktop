import type { Metadata } from 'next';
import { generateLanguagePaths, languages } from '@/i18n/languages';

import { BASE_URL } from '@/lib/env';

const SITE_NAME = 'Flaq SaaS Template';
const SOCIAL_IMAGE = `${BASE_URL}/images/home/home-page.jpg`;

type LocalizedMetadataOptions = {
  locale: string;
  pathname?: string;
  title: string;
  description: string;
  keywords?: string | string[];
};

export function createLocalizedMetadata({
  locale,
  pathname = '',
  title,
  description,
  keywords,
}: LocalizedMetadataOptions): Metadata {
  const seoDescription = description.length > 160 ? `${description.slice(0, 157).trimEnd()}…` : description;
  const languagePaths = generateLanguagePaths(BASE_URL, pathname);
  const languageCode = languages.find(({ lang }) => lang === locale)?.code ?? 'en';
  const canonical = languagePaths[languageCode] ?? languagePaths.en;
  const resolvedKeywords = keywords ?? [
    title,
    'free AI generator',
    'open source AI generator',
    'free to use AI template',
    'no signup required AI generator',
    'AI tools without registration',
    'Flaq AI API',
    'AIGC',
  ];

  return {
    applicationName: SITE_NAME,
    title,
    description: seoDescription,
    keywords: resolvedKeywords,
    category: 'technology',
    alternates: {
      canonical,
      languages: {
        'x-default': languagePaths.en,
        ...languagePaths,
      },
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description: seoDescription,
      siteName: SITE_NAME,
      images: [
        {
          url: SOCIAL_IMAGE,
          secureUrl: SOCIAL_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: seoDescription,
      images: [{ url: SOCIAL_IMAGE, alt: title }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
}
