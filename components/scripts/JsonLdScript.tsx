import { languages } from '@/i18n/languages';
import type { Organization, SoftwareSourceCode, WebSite, WithContext } from 'schema-dts';

import { BASE_URL } from '@/lib/env';

type JsonLdScriptProps = {
  locale: string;
  title: string;
  description: string;
};

export default function JsonLdScript({ locale, title, description }: JsonLdScriptProps) {
  const languageCode = languages.find(({ lang }) => lang === locale)?.code ?? locale;
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_US_EMAIL;

  const organizationJsonLd: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Flaq AI',
    url: 'https://flaq.ai',
    logo: `${BASE_URL}/images/logo.png`,
    description,
    ...(contactEmail
      ? {
          contactPoint: {
            '@type': 'ContactPoint' as const,
            email: contactEmail,
            contactType: 'Technical support',
          },
        }
      : {}),
  };

  const websiteJsonLd: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Flaq SaaS Template',
    alternateName: title,
    url: BASE_URL,
    description,
    image: `${BASE_URL}/images/home/home-page.jpg`,
    inLanguage: languageCode,
    publisher: {
      '@type': 'Organization',
      name: 'Flaq AI',
      logo: `${BASE_URL}/images/logo.png`,
    },
  };

  const sourceCodeJsonLd: WithContext<SoftwareSourceCode> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: 'Flaq SaaS Template',
    headline: title,
    description,
    url: BASE_URL,
    codeRepository: 'https://github.com/flaqai/flaq-saas-template',
    license: 'https://opensource.org/license/mit',
    programmingLanguage: ['TypeScript', 'JavaScript', 'CSS'],
    runtimePlatform: 'Next.js 16',
    isAccessibleForFree: true,
    inLanguage: languageCode,
  };

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify([websiteJsonLd, organizationJsonLd, sourceCodeJsonLd]) }}
    />
  );
}
