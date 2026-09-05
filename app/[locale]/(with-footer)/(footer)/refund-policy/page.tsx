import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createLocalizedMetadata } from '@/lib/seo/metadata';
import { numberList } from '@/lib/utils/arrayUtils';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'FooterNavigation.refundPolicy' });

  return createLocalizedMetadata({
    locale,
    pathname: '/refund-policy',
    title: t('title'),
    description: t('1.description'),
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'FooterNavigation.refundPolicy' });

  return (
    <div className='prose prose-headings:text-gray-200 mx-auto py-[60px] text-gray-200 lg:py-[120px]'>
      <h1>{t('title')}</h1>
      {numberList(6).map((num) => (
        <div key={num}>
          <h2 className='text-2xl font-bold'>{t(`${num}.title`)}</h2>
          <p className='whitespace-pre-line'>{t(`${num}.description`)}</p>
        </div>
      ))}
    </div>
  );
}
