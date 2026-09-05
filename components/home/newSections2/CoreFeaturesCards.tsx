import { getTranslations } from 'next-intl/server';

import LinkBtn from '@/components/home/new-section/link-btn';
import ScrollButton from '@/components/home/new-section/ScrollButton';
import SubHeading from '@/components/internal-page/sub-heading';
import {
  AdvantageIcon,
  ArticleIcon,
  ExampleIcon,
  FaqIcon,
  ManualIcon,
  UseCaseIcon,
} from '@/components/svg/section/common';

type IconType = 'advantage' | 'manual' | 'article' | 'faq' | 'useCase' | 'example';
type CardStyle = 'normal' | 'square';

const iconMap = {
  advantage: AdvantageIcon,
  manual: ManualIcon,
  article: ArticleIcon,
  faq: FaqIcon,
  useCase: UseCaseIcon,
  example: ExampleIcon,
};

const getRowLayoutClass = (count: number) => {
  if (count <= 3) return 'grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3';
  return 'grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4';
};

export default async function CoreFeaturesCards({
  title,
  description,
  buttonText,
  buttonHref,
  features,
  cardsLayout = 'column',
  iconType = 'advantage',
  centered = false,
  cardStyle = 'normal',
}: {
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
  features: {
    title: string;
    description: string;
  }[];
  cardsLayout?: 'column' | 'grid' | 'row';
  iconType?: IconType;
  centered?: boolean;
  cardStyle?: CardStyle;
}) {
  const tc = await getTranslations('Common');
  const finalButtonText = buttonText ?? (buttonHref ? tc('tryNow') : undefined);

  const IconComponent = iconMap[iconType];

  const gridClass =
    cardsLayout === 'grid'
      ? 'grid grid-cols-1 gap-3 sm:grid-cols-2'
      : cardsLayout === 'row'
        ? getRowLayoutClass(features.length)
        : 'flex flex-col gap-3';

  return (
    <div className='container-centered container-py'>
      <div
        className={
          finalButtonText && buttonHref
            ? 'mb-8 flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between'
            : 'mb-8'
        }
      >
        <SubHeading
          icon={centered ? undefined : <IconComponent className='hidden lg:block' />}
          title={title}
          description={description}
          className='text-center lg:text-left'
        />

        {finalButtonText && buttonHref && (
          <div className='flex w-full justify-center lg:w-auto lg:justify-end lg:self-end'>
            {buttonHref === '#' ? (
              <ScrollButton className='w-fit whitespace-nowrap'>{finalButtonText}</ScrollButton>
            ) : (
              <LinkBtn href={buttonHref} className='w-fit whitespace-nowrap'>
                {finalButtonText}
              </LinkBtn>
            )}
          </div>
        )}
      </div>

      <div className={gridClass}>
        {features.map((feature, index) => (
          <div
            key={index}
            className={
              cardStyle === 'square'
                ? 'bg-color-card relative flex flex-col gap-0 overflow-hidden rounded-[12px] p-3 md:p-4 2xl:aspect-square'
                : 'bg-color-card flex w-full flex-col gap-0 rounded-[12px] p-3 md:p-4'
            }
          >
            {cardStyle === 'square' ? (
              <h3 className='text-color-t1 relative z-10 mb-2 text-[18px] leading-[28px] md:text-[20px]'>
                {feature.title}
              </h3>
            ) : (
              <div className='mb-2 flex items-center gap-2'>
                <div className='bg-color-main h-[20px] w-[4px] flex-shrink-0 rounded-full' />
                <h3 className='text-color-t1 text-[18px] leading-[28px] md:text-[20px]'>{feature.title}</h3>
              </div>
            )}

            {cardStyle === 'normal' && <div className='bg-color-card-2 mb-3 h-px w-full flex-shrink-0' />}

            <p
              className={
                cardStyle === 'square'
                  ? 'text-color-t2 relative z-10 flex-1 text-sm leading-[22px]'
                  : 'text-color-t2 flex-1 text-sm leading-[22px]'
              }
            >
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
