import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { isDesktopServerRender } from '@/lib/desktop/server';
import { createLocalizedMetadata } from '@/lib/seo/metadata';
import { numberList } from '@/lib/utils/arrayUtils';
import DesktopFeatureInfo from '@/components/desktop/DesktopFeatureInfo';
import { DesktopImageToVideoForm } from '@/components/desktop/DesktopVideoForms';
import Faq from '@/components/Faq';
import CoreFeaturesCards from '@/components/home/newSections2/CoreFeaturesCards';
import VideoCarousel from '@/components/home/video-carousel';
import Heading from '@/components/internal-page/heading';
import ResourceEntrySections from '@/components/resource-entry/ResourceEntrySections';

import Form from './form';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.image-to-video',
  });

  return createLocalizedMetadata({
    locale,
    pathname: '/image-to-video',
    title: t('title'),
    description: t('description'),
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'image-to-video',
  });

  return (
    <div className='flex-1'>
      <div className='container-centered container-gap'>
        <div className='flex w-full flex-col gap-5'>
          {isDesktopServerRender ? <DesktopImageToVideoForm /> : <Form />}
        </div>
        <div className='desktop-marketing-heading'>
          <Heading title={t('heading.title')} description={t('heading.description')} />
        </div>
      </div>
      <DesktopFeatureInfo title={t('heading.title')} description={t('heading.description')}>
        <VideoCarousel
          title={t('example.title')}
          description={t('example.description')}
          list={numberList(2).map((num) => ({
            id: num.toString(),
            prompt: t(`example.${num}.prompt`),
            imgSrc: `/flaqai_saas_asserts/image_to_video/example/${num}.webp`,
            videoSrc: `/flaqai_saas_asserts/image_to_video/example/${num}.mp4`,
          }))}
        />
        <ResourceEntrySections />
        <CoreFeaturesCards
          iconType='example'
          cardStyle='square'
          title={t('core-feature.title')}
          description={t('core-feature.description')}
          buttonHref='#'
          cardsLayout='row'
          features={numberList(3).map((num) => ({
            title: t(`core-feature.${num}.title`),
            description: t(`core-feature.${num}.description`),
          }))}
        />
        <CoreFeaturesCards
          iconType='useCase'
          title={t('advantage.title')}
          description={t('advantage.description')}
          buttonText={t('advantage.try-now')}
          buttonHref='#'
          cardsLayout='grid'
          features={numberList(4).map((num) => ({
            title: t(`advantage.${num}.title`),
            description: t(`advantage.${num}.description`),
          }))}
        />
        <CoreFeaturesCards
          iconType='manual'
          title={t('manual.title')}
          description={t('manual.content')}
          buttonHref='#'
          cardsLayout='row'
          features={numberList(3).map((num) => ({
            title: t(`manual.${num}.title`),
            description: t(`manual.${num}.description`),
          }))}
        />

        <Faq
          title={t('faq.title')}
          faqList={numberList(6).map((num) => ({
            id: num,
            question: t(`faq.${num}.question`),
            answer: t(`faq.${num}.answer`),
          }))}
          className='py-[60px] lg:py-[120px]'
        />
      </DesktopFeatureInfo>
    </div>
  );
}
