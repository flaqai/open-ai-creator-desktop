import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createLocalizedMetadata } from '@/lib/seo/metadata';
import { numberList } from '@/lib/utils/arrayUtils';
import DesktopFeatureInfo from '@/components/desktop/DesktopFeatureInfo';
import Faq from '@/components/Faq';
import ExampleShowcaseSection from '@/components/home/new-section/ExampleShowcaseSection';
import CoreFeaturesCards from '@/components/home/newSections2/CoreFeaturesCards';
import ImageForm from '@/components/image-ui-form/image-form';
import Heading from '@/components/internal-page/heading';
import ResourceEntrySections from '@/components/resource-entry/ResourceEntrySections';

const DEFAULT_PRIORITY = {
  aspectRatio: ['16:9', '1:1'],
  resolution: ['2k'],
  quality: ['medium', 'high', 'low'],
};

const DEFAULT_VALUES = {
  prompt: '',
  images: [],
  modelVersion: 'gpt-image-2',
  aspectRatio: '16:9',
  resolution: '2k',
  quality: 'medium',
};

const exampleCardsConfig = [
  {
    images: [
      {
        src: '/flaqai_saas_asserts/text_to_image/feature/1_1.webp',
        prompt:
          'A sleek red Ferrari F40 sports car, angled front-left view on a road, action of being prominently displayed on a vintage magazine cover, dynamic low-angle shot, sun-drenched lighting with soft shadows, pop art color scheme with dominant reds, blues, and browns, retro graphic design style mixed with flat illustration, urban street scene in the background with trees, houses, and utility poles, smooth polished car body, detailed chrome accents, vibrant energetic mood, high-quality vector art, sharp crisp lines.',
      },
      {
        src: '/flaqai_saas_asserts/text_to_image/feature/1_2.webp',
        prompt:
          'Realistic Style, Place Monkey D. Luffy next to the man, smiling widely with his straw hat tilted. Use a Thousand Sunny deck background with bright blue sky. Keep the selfie composition intact and integrate both characters naturally.',
      },
      {
        src: '/flaqai_saas_asserts/text_to_image/feature/1_3.webp',
        prompt:
          'A photorealistic ESC keycap scene shows a miniature cozy living room setup. Inside: a glowing red Netflix screen, a plush red couch, popcorn bowl, and throw blanket. A small figure lounges with feet up, watching content. The red “N” logo glows from behind like mood lighting. Outside: cool tech-blue reflections on F1, Shift, and Q keys. The word “ESC” is subtly present in a glassy fog on top of the cap.',
      },
    ],
  },
  {
    images: [
      {
        src: '/flaqai_saas_asserts/text_to_image/feature/2_1.webp',
        prompt:
          'Create a grid of 6 different hairstyles for this women. List the name of each hairstyle and the brief history about the hairstyle. They can be from any era.',
      },
      {
        src: '/flaqai_saas_asserts/text_to_image/feature/2_2.webp',
        prompt:
          'Create a detailed visual chart showing the full evolution of “Super Saiyan–style transformations”, using an original Saiyan-inspired warrior, depicted in multiple stages from base form to divine transformations.',
      },
      {
        src: '/flaqai_saas_asserts/text_to_image/feature/2_3.webp',
        prompt:
          'A high-angle, wide-angle real-world photograph of **[SPace X]** serves as the background, overlaid with detailed white technical engineering schematics and blueprint lines. The style resembles white hand-drawn chalk or pencil sketches drawn directly onto the photograph.\n\nKey elements include: dimension lines with measurement values labeling **[key dimensions of the subject]**, directional arrows indicating **[forces, motion, or flow]**, detailed cross-section diagrams of **[internal components]**, and exploded views of **[complex assemblies]**. Key features are annotated with neat, handwritten text labels.\n\nAesthetic style: educational science diagrams, industrial design analysis, clean, precise, mixed-media.\n\nIn the lower-left corner, include a hand-drawn, blueprint-style logo inside a sketched frame, with the text “**[Space X]**”.',
      },
    ],
  },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata.text-to-image' });

  return createLocalizedMetadata({
    locale,
    pathname: '/text-to-image',
    title: t('title'),
    description: t('description'),
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'text-to-image' });

  return (
    <div className='flex-1'>
      <div className='container-centered container-gap'>
        <div className='flex w-full flex-col gap-5'>
          <ImageForm
            imageFormType='text-to-image'
            formTitle={t('form.title')}
            submitBtnId='text-to-image-submit'
            defaultValuePriority={DEFAULT_PRIORITY}
            defaultValues={DEFAULT_VALUES}
          />
        </div>
        <div className='desktop-marketing-heading'>
          <Heading title={t('heading.title')} description={t('heading.description')} />
        </div>
      </div>
      <DesktopFeatureInfo title={t('heading.title')} description={t('heading.description')}>
        <ExampleShowcaseSection
          title={t('examples.title')}
          description={t('examples.description')}
          cards={exampleCardsConfig.map((card, idx) => {
            const cardNum = idx + 1;
            return {
              id: cardNum.toString(),
              title: t(`examples.${cardNum}.title`),
              examples: card.images.map((image, imgIdx) => {
                const captionNum = imgIdx + 1;
                const captionKey = `examples.${cardNum}.captions.${captionNum}`;
                return {
                  id: `${cardNum}-${captionNum}`,
                  imgSrc: image.src,
                  caption: t.has(captionKey) ? t(captionKey) : '',
                  isPrompt: !!image.prompt,
                  promptContent: image.prompt,
                };
              }),
            };
          })}
        />
        <ResourceEntrySections />
        <CoreFeaturesCards
          title={t('advantage.title')}
          description={t('advantage.description')}
          buttonText={t('advantage.button-text')}
          buttonHref='#'
          features={numberList(4).map((num) => ({
            title: t(`advantage.${num}.title`),
            description: t(`advantage.${num}.description`),
          }))}
        />
        <CoreFeaturesCards
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
        <CoreFeaturesCards
          title={t('manual.title')}
          description={t('manual.content')}
          cardsLayout='row'
          features={numberList(3).map((num) => ({
            title: t(`manual.${num}.title`),
            description: t(`manual.${num}.description`),
          }))}
        />
        <Faq
          title={t('faq.title')}
          faqList={numberList(5).map((num) => ({
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
