import { getTranslations } from 'next-intl/server';

import { numberList } from '@/lib/utils/arrayUtils';
import Faq from '@/components/Faq';
import CoreFeaturesCards from '@/components/home/newSections2/CoreFeaturesCards';
import Heading from '@/components/internal-page/heading';
import ResourceEntrySections from '@/components/resource-entry/ResourceEntrySections';

export default async function ReferenceToVideoPublicSections() {
  const t = await getTranslations('reference-to-video');

  return (
    <>
      <div className='container-centered container-py'>
        <Heading title={t('heading.title')} description={t('heading.description')} />
      </div>
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
    </>
  );
}
