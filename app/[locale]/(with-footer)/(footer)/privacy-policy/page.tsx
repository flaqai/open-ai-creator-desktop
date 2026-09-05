import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createLocalizedMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'FooterNavigation.privacyPolicy' });

  return createLocalizedMetadata({
    locale,
    pathname: '/privacy-policy',
    title: t('1-h1'),
    description: t('1-p'),
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'FooterNavigation.privacyPolicy' });

  return (
    <div className='prose prose-headings:text-gray-200 mx-auto p-6 text-gray-200'>
      <h1>{t('1-h1')}</h1>
      <p>{t('1-p')}</p>

      <h2>{t('2-h2')}</h2>
      <p>{t('2-p')}</p>

      <h2>{t('3-h2')}</h2>
      <p>{t('3-p')}</p>

      <h2>{t('4-h2')}</h2>
      <p>{t('4-p')}</p>

      <h2>{t('5-h2')}</h2>
      <p>{t('5-p-1')}</p>
      <ul>
        <li>{t('5-li-1')}</li>
        <li>{t('5-li-2')}</li>
        <li>{t('5-li-3')}</li>
        <li>{t('5-li-4')}</li>
      </ul>
      <p>{t('5-p-2')}</p>

      <h2>{t('6-h2')}</h2>
      <p>{t('6-p')}</p>

      <h2>{t('7-h2')}</h2>
      <p>{t('7-p')}</p>

      <h2>{t('8-h2')}</h2>
      <p>{t('8-p')}</p>

      <h2>{t('9-h2')}</h2>
      <p>{t('9-p')}</p>
    </div>
  );
}
