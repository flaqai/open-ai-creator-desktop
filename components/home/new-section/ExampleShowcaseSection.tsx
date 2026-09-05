'use client';

import { useTranslations } from 'next-intl';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CopyBtn from '@/components/CopyBtn';
import SubHeading from '@/components/internal-page/sub-heading';
import { ExampleIcon } from '@/components/svg/section/common';

// Unified color values, consistent with image-showcase-section, reference file_context_0
const BG_COLOR = 'bg-[#141516]';
const TEXT_COLOR = 'text-white/70';
const BORDER_COLOR = 'border border-[#2f2f2f]';

interface ExampleCard {
  id: string;
  title: string;
  examples: {
    id: string;
    imgSrc: string;
    caption: string;
    isPrompt?: boolean;
    promptContent?: string;
  }[];
}

interface ExampleShowcaseSectionProps {
  title: string;
  description: string;
  cards: ExampleCard[];
}

function ExampleShowcaseCard({ card }: { card: ExampleCard }) {
  const t = useTranslations('Common');
  const exampleCount = card.examples.length;
  const gridColsClass = exampleCount === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';

  return (
    <div className={`flex w-full flex-col gap-5 rounded-xl ${BORDER_COLOR} ${BG_COLOR} p-5 lg:p-8`}>
      <h3 className={`text-2xl font-semibold ${TEXT_COLOR}`}>{card.title}</h3>
      <div className={`grid grid-cols-1 gap-5 ${gridColsClass}`}>
        {card.examples.map((example) => (
          <div key={example.id} className='flex flex-col gap-5'>
            <div className='relative h-[280px] w-full overflow-hidden rounded-xl lg:h-[373px]'>
              <img
                src={example.imgSrc}
                alt={example.caption}
                className='absolute top-1/2 left-1/2 h-full w-auto max-w-none -translate-x-1/2 -translate-y-1/2 object-cover'
                loading='lazy'
                fetchPriority='low'
                decoding='async'
              />
            </div>
            {example.isPrompt ? (
              <div className='flex flex-col gap-2'>
                <div className='flex items-center gap-2'>
                  <span className={`text-sm font-medium ${TEXT_COLOR}`}>
                    {example.caption ? `${example.caption} (${t('prompt')})` : t('prompt')}
                  </span>
                  <CopyBtn content={example.promptContent || example.caption} className={TEXT_COLOR} />
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className={`line-clamp-5 cursor-help text-base leading-6 font-normal ${TEXT_COLOR}`}>
                        {example.promptContent || example.caption}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent className='max-w-md break-words'>
                      <p className='text-sm'>{example.promptContent || example.caption}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ) : (
              example.caption && (
                <p className={`line-clamp-5 text-base leading-6 font-normal ${TEXT_COLOR}`}>{example.caption}</p>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExampleShowcaseSection({ title, description, cards }: ExampleShowcaseSectionProps) {
  return (
    <div className='container-centered container-py container-gap'>
      <SubHeading icon={<ExampleIcon />} title={title} description={description} />
      {cards.map((card) => (
        <ExampleShowcaseCard key={card.id} card={card} />
      ))}
    </div>
  );
}
