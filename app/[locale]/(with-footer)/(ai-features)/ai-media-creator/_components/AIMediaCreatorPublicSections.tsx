import { getTranslations } from 'next-intl/server';

import { numberList } from '@/lib/utils/arrayUtils';
import Faq from '@/components/Faq';
import CoreFeaturesCards from '@/components/home/newSections2/CoreFeaturesCards';
import Heading from '@/components/internal-page/heading';
import ResourceEntrySections from '@/components/resource-entry/ResourceEntrySections';

export default async function AIMediaCreatorPublicSections() {
  const t = await getTranslations('ai-media-creator');

  return (
    <div className='flex w-full flex-col items-center overflow-hidden'>
      <div className='container-centered container-py'>
        <Heading title={t('heading.title')} description={t('heading.description')} align='left' />
      </div>
      <ResourceEntrySections />
      <CoreFeaturesCards
        iconType='example'
        cardStyle='square'
        title={t('core-feature.title')}
        description={t('core-feature.description')}
        buttonHref='#'
        cardsLayout='row'
        features={numberList(4).map((num) => ({
          title: t(`core-feature.${num}.title`),
          description: t(`core-feature.${num}.description`),
        }))}
      />
      <CoreFeaturesCards
        iconType='useCase'
        title={t('use-cases.title')}
        description={t('use-cases.description')}
        buttonText={t('use-cases.button-text')}
        buttonHref='#'
        cardsLayout='grid'
        features={numberList(4).map((num) => ({
          title: t(`use-cases.${num}.title`),
          description: t(`use-cases.${num}.description`),
        }))}
      />
      <CoreFeaturesCards
        iconType='manual'
        title={t('manual.title')}
        description={t('manual.description')}
        buttonText={t('manual.button-text')}
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
    </div>
  );
}
