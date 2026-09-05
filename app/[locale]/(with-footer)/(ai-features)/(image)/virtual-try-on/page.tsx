import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createLocalizedMetadata } from '@/lib/seo/metadata';
import { numberList } from '@/lib/utils/arrayUtils';
import DesktopFeatureInfo from '@/components/desktop/DesktopFeatureInfo';
import Faq from '@/components/Faq';
import ImageShowcaseSection from '@/components/home/newSections/image-showcase-section';
import CoreFeaturesCards from '@/components/home/newSections2/CoreFeaturesCards';
import Heading from '@/components/internal-page/heading';
import ResourceEntrySections from '@/components/resource-entry/ResourceEntrySections';

import Form from './form';

const exampleImageList = [
  ['/flaqai_saas_asserts/virtual_try_on/feature/1_1.webp', '/flaqai_saas_asserts/virtual_try_on/feature/1_2.webp'],
  ['/flaqai_saas_asserts/virtual_try_on/feature/2_1.webp', '/flaqai_saas_asserts/virtual_try_on/feature/2_2.webp'],
  ['/flaqai_saas_asserts/virtual_try_on/feature/3_1.webp', '/flaqai_saas_asserts/virtual_try_on/feature/3_2.webp'],
];

const TRY_ON_PROMPT =
  "Dress the person from the first image in the clothing from the second image. Exactly maintain the clothing's original proportions, length, and design. Preserve the character's identical pose and body shape. The outfit must flatter the figure — subtly slimming and contouring the body for a more elegant silhouette — while staying slim, lightweight, and non-bulky. No excessive volume, no puffiness, realistic fabric behavior and natural folds, photorealistic integration.";

const HINTS_PRESETS = [
  {
    id: 1,
    subject: '/flaqai_saas_asserts/virtual_try_on/template/1_1.webp',
    object: [
      '/flaqai_saas_asserts/virtual_try_on/template/1_2.webp',
      '/flaqai_saas_asserts/virtual_try_on/template/1_3.webp',
      '/flaqai_saas_asserts/virtual_try_on/template/1_4.webp',
      '/flaqai_saas_asserts/virtual_try_on/template/1_5.webp',
    ],
    aiGeneration: '/flaqai_saas_asserts/virtual_try_on/template/1.webp',
    prompt: '',
  },
  {
    id: 2,
    subject: '/flaqai_saas_asserts/virtual_try_on/template/2_1.webp',
    object: [
      '/flaqai_saas_asserts/virtual_try_on/template/2_2.webp',
      '/flaqai_saas_asserts/virtual_try_on/template/2_3.webp',
      '/flaqai_saas_asserts/virtual_try_on/template/2_4.webp',
      '/flaqai_saas_asserts/virtual_try_on/template/2_5.webp',
    ],
    aiGeneration: '/flaqai_saas_asserts/virtual_try_on/template/2.webp',
    prompt: '',
  },
  {
    id: 3,
    subject: '/flaqai_saas_asserts/virtual_try_on/template/3_1.webp',
    object: [
      '/flaqai_saas_asserts/virtual_try_on/template/3_2.webp',
      '/flaqai_saas_asserts/virtual_try_on/template/3_3.webp',
      '/flaqai_saas_asserts/virtual_try_on/template/3_4.webp',
    ],
    aiGeneration: '/flaqai_saas_asserts/virtual_try_on/template/3.webp',
    prompt: '',
  },
  {
    id: 4,
    subject: '/flaqai_saas_asserts/virtual_try_on/template/4_1.webp',
    object: [
      '/flaqai_saas_asserts/virtual_try_on/template/4_2.webp',
      '/flaqai_saas_asserts/virtual_try_on/template/4_3.webp',
      '/flaqai_saas_asserts/virtual_try_on/template/4_4.webp',
      '/flaqai_saas_asserts/virtual_try_on/template/4_5.webp',
      '/flaqai_saas_asserts/virtual_try_on/template/4_6.webp',
    ],
    aiGeneration: '/flaqai_saas_asserts/virtual_try_on/template/4.webp',
    prompt: '',
  },
  {
    id: 5,
    subject: '/flaqai_saas_asserts/virtual_try_on/template/5_1.webp',
    object: [
      '/flaqai_saas_asserts/virtual_try_on/template/5_2.webp',
      '/flaqai_saas_asserts/virtual_try_on/template/5_3.webp',
    ],
    aiGeneration: '/flaqai_saas_asserts/virtual_try_on/template/5.webp',
    prompt: '',
  },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata.virtual-try-on' });
  return createLocalizedMetadata({
    locale,
    pathname: '/virtual-try-on',
    title: t('title'),
    description: t('description'),
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'virtual-try-on' });

  return (
    <div className='flex-1'>
      <div className='container-centered container-gap'>
        <div className='flex w-full flex-col gap-5'>
          <Form hintsPresets={HINTS_PRESETS} />
        </div>
        <div className='desktop-marketing-heading'>
          <Heading title={t('heading.title')} description={t('heading.description')} />
        </div>
      </div>
      <DesktopFeatureInfo title={t('heading.title')} description={t('heading.description')}>
        <ImageShowcaseSection
          title={t('examples.title')}
          description={t('examples.description')}
          dataList={exampleImageList.map((imgList, idx) => ({
            title: t(`examples.${idx + 1}.title`),
            imgList: imgList.map((imgSrc, imgIdx) => ({
              id: imgIdx.toString(),
              imgSrc,
              imgAlt: t(`examples.${idx + 1}.${imgIdx + 1}.title`),
              isPrompt: imgIdx === 1,
              promptContent: TRY_ON_PROMPT,
            })),
          }))}
        />
        <ResourceEntrySections />
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
          features={numberList(4).map((num) => ({
            title: t(`manual.${num}.title`),
            description: t(`manual.${num}.description`),
          }))}
        />
        <CoreFeaturesCards
          iconType='useCase'
          title={t('use-cases.title')}
          description={t('use-cases.description')}
          buttonText={t('use-cases.try-now')}
          buttonHref='#'
          cardsLayout='grid'
          features={numberList(4).map((num) => ({
            title: t(`use-cases.${num}.title`),
            description: t(`use-cases.${num}.description`),
          }))}
        />
        <Faq
          title={t('faq.title')}
          faqList={numberList(8).map((num) => ({
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
