import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createLocalizedMetadata } from '@/lib/seo/metadata';
import DesktopFeatureInfo from '@/components/desktop/DesktopFeatureInfo';

import ReferenceToVideoForm from './_components/ReferenceToVideoForm';
import ReferenceToVideoPublicSections from './_components/ReferenceToVideoPublicSections';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.reference-to-video',
  });

  return createLocalizedMetadata({
    locale,
    pathname: '/reference-to-video',
    title: t('title'),
    description: t('description'),
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className='relative w-full flex-1'>
      <div className='container-centered pt-3 pb-10 lg:py-10'>
        <ReferenceToVideoForm />
      </div>
      <DesktopFeatureInfo>
        <ReferenceToVideoPublicSections />
      </DesktopFeatureInfo>
    </div>
  );
}
