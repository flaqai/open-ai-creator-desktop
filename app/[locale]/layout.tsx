import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { getLanguageDirection } from '@/i18n/languages';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import { Toaster } from '@/components/ui/sonner';

import './globals.css';

import { locales } from '@/i18n/languages';
import { NavigationGuardProvider } from 'next-navigation-guard';

import { createLocalizedMetadata } from '@/lib/seo/metadata';
import JsonLdScript from '@/components/scripts/JsonLdScript';

import LazyGlobalUI from './LazyGlobalUI';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

const din = localFont({
  src: [
    {
      path: '../../public/fonts/DIN-Medium.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-din',
});

const notoSans = localFont({
  src: [
    {
      path: '../../public/fonts/noto-sans-v42-latin-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/noto-sans-v42-latin-500.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/noto-sans-v42-latin-600.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/noto-sans-v42-latin-700.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-noto-sans',
  display: 'swap',
});

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;
  setRequestLocale(locale);

  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return createLocalizedMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
  });
}

export default async function RootLayout(props: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const { locale } = params;

  const { children } = props;

  setRequestLocale(locale);

  const messages = await getMessages({ locale });
  const metadata = await getTranslations({ locale, namespace: 'Metadata.home' });

  return (
    <html lang={locale} dir={getLanguageDirection(locale)} suppressHydrationWarning className='dark'>
      <head>
        {process.env.FLAQ_DESKTOP_BUILD !== 'true' && <link rel='describedby' href='/llms.txt' type='text/markdown' />}
        <JsonLdScript locale={locale} title={metadata('title')} description={metadata('description')} />
      </head>
      <body
        className={`${process.env.FLAQ_DESKTOP_BUILD === 'true' ? 'desktop-app' : ''} ${notoSans.className} ${din.variable} ${notoSans.variable} relative mx-auto flex min-h-screen flex-col bg-black text-white`}
      >
        <NavigationGuardProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <Toaster
              duration={2000}
              icons={{
                success: <span className='sr-only'>icon</span>,
                error: <span className='sr-only'>icon</span>,
              }}
              position='top-center'
              toastOptions={{
                classNames: {
                  success: 'text-color-green border-color-green',
                  error: 'text-color-red border-color-red',
                },
              }}
            />
            <LazyGlobalUI />
            {children}
          </NextIntlClientProvider>
        </NavigationGuardProvider>
      </body>
    </html>
  );
}
