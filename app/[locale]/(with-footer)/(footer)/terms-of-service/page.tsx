import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createLocalizedMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'FooterNavigation.termsConditions' });

  return createLocalizedMetadata({
    locale,
    pathname: '/terms-of-service',
    title: t('1-h1'),
    description: t('1-p'),
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'FooterNavigation.termsConditions' });

  return (
    <div className='prose prose-headings:text-gray-200 mx-auto p-6 text-gray-200'>
      <h1>{t('1-h1')}</h1>
      <p>{t('1-p')}</p>

      <h2>{t('2-h2')}</h2>
      <ul>
        <li>{t('2-p')}</li>
      </ul>

      <h2>{t('3-h2')}</h2>
      <ul>
        <li>{t('3-p')}</li>
      </ul>

      <h2>{t('4-h2')}</h2>
      <ul>
        <li>
          {t('4-p')}{' '}
          <Link href='/terms-of-service' className='text-foreground hover:text-foreground font-bold'>
            {t('terms-of-service')}
          </Link>
        </li>
      </ul>

      <h2>{t('5-h2')}</h2>
      <ul>
        <li>{t('5-p')}</li>
      </ul>

      <h2>{t('6-h2')}</h2>
      <ul>
        <li>{t('6-p')}</li>
      </ul>

      <h2>{t('7-h2')}</h2>
      <ul>
        <li>{t('7-p')}</li>
      </ul>
      <h2>{t('8-h2')}</h2>
      <ul>
        <li>{t('8-p')}</li>
      </ul>
      <h2>{t('9-h2')}</h2>
      <ul>
        <li>{t('9-p')}</li>
      </ul>
      <h2>{t('10-h2')}</h2>
      <ul>
        <li>{t('10-p')}</li>
      </ul>
      <h2>{t('11-h2')}</h2>
      <ul>
        <li>{t('11-p')}</li>
      </ul>
      <h2>{t('12-h2')}</h2>
      <ul>
        <li>{t('12-p')}</li>
      </ul>
      <h2>{t('13-h2')}</h2>
      <ul>
        <li>{t('13-p')}</li>
      </ul>
      <h2>{t('14-h2')}</h2>
      <ul>
        <li>{t('14-p')}</li>
      </ul>
      <h2>{t('15-h2')}</h2>
      <ul>
        <li>{t('15-p')}</li>
      </ul>
      <h2>{t('16-h2')}</h2>
      <ul>
        <li>{t('16-p')}</li>
      </ul>
      <h2>{t('17-h2')}</h2>
      <ul>
        <li>{t('17-p')}</li>
      </ul>
      <h2>{t('18-h2')}</h2>
      <ul>
        <li>{t('18-p')}</li>
      </ul>
      <h2>{t('19-h2')}</h2>
      <ul>
        <li>{t('19-p')}</li>
      </ul>
      <h2>{t('20-h2')}</h2>
      <ul>
        <li>{t('20-p')}</li>
      </ul>
      <h2>{t('21-h2')}</h2>
      <ul>
        <li>{t('21-p')}</li>
      </ul>
      <h2>{t('22-h2')}</h2>
      <ul>
        <li>{t('22-p')}</li>
      </ul>
      <h2>{t('23-h2')}</h2>
      <ul>
        <li>{t('23-p')}</li>
      </ul>
      <h2>{t('24-h2')}</h2>
      <ul>
        <li>{t('24-p')}</li>
      </ul>
      <h2>{t('25-h2')}</h2>
      <ul>
        <li>{t('25-p')}</li>
      </ul>
      <h2>{t('26-h2')}</h2>
      <ul>
        <li>{t('26-p')}</li>
      </ul>
      <h2>{t('27-h2')}</h2>
      <ul>
        <li>{t('27-p')}</li>
      </ul>
      <h2>{t('28-h2')}</h2>
      <ul>
        <li>{t('28-p')}</li>
      </ul>
      <h2>{t('29-h2')}</h2>
      <ul>
        <li>{t('29-p')}</li>
      </ul>
    </div>
  );
}
