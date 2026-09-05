import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import Footer from '@/components/home/Footer';
import Navigation from '@/components/home/Navigation';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main className='mx-auto flex w-full flex-1'>{children}</main>
      <Footer />
    </>
  );
}
