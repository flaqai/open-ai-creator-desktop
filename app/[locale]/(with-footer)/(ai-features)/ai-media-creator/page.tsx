import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createLocalizedMetadata } from '@/lib/seo/metadata';
import DesktopFeatureInfo from '@/components/desktop/DesktopFeatureInfo';
import CreatorHistory from '@/components/unified-generator/CreatorHistory';
import UnifiedGeneratorForm from '@/components/unified-generator/UnifiedGeneratorForm';

import AIMediaCreatorPublicSections from './_components/AIMediaCreatorPublicSections';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.ai-media-creator',
  });

  return createLocalizedMetadata({
    locale,
    pathname: '/ai-media-creator',
    title: t('title'),
    description: t('description'),
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className='relative w-full flex-1'>
      <div className='container-centered space-y-10 pt-3 pb-10 lg:py-10'>
        <UnifiedGeneratorForm />
        <CreatorHistory />
      </div>
      <DesktopFeatureInfo>
        <AIMediaCreatorPublicSections />
      </DesktopFeatureInfo>
    </main>
  );
}
