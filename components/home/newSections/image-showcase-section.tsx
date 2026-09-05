'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CopyBtn from '@/components/CopyBtn';

import SubHeading from '../../internal-page/sub-heading';

interface ShowcaseItem {
  id: string;
  imgSrc: string;
  imgAlt: string;
  isPrompt?: boolean;
  promptContent?: string;
}

function Showcase({ title, dataList }: { title: string; dataList: ShowcaseItem[] }) {
  const t = useTranslations('Common');
  const imgCount = dataList.length;

  return (
    <div className='flex w-full flex-col gap-5 rounded-xl border border-[#2f2f2f] bg-[#141516] p-5 lg:p-8'>
      <h3 className='text-2xl font-semibold text-white/70'>{title}</h3>
      <div
        className={cn(
          'grid grid-cols-1 gap-5',
          imgCount === 1 && 'lg:grid-cols-1',
          imgCount === 2 && 'lg:grid-cols-2',
          imgCount === 3 && 'lg:grid-cols-3',
        )}
      >
        {dataList.map((el) => (
          <div key={el.id} className='flex flex-col gap-5'>
            <div className='overflow-hidden rounded-lg'>
              <img src={el.imgSrc} alt={el.imgAlt} className='h-auto w-full' />
            </div>
            {el.isPrompt ? (
              <div className='flex flex-col gap-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium text-white/70'>
                    {el.promptContent ? (el.imgAlt ? `${el.imgAlt} (${t('prompt')})` : t('prompt')) : t('prompt')}
                  </span>
                  <CopyBtn content={el.promptContent || el.imgAlt} className='text-white/70' />
                </div>
                {(el.promptContent || el.imgAlt) && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className='line-clamp-5 cursor-help text-base leading-6 font-normal whitespace-pre-line text-white/70'>
                          {el.promptContent || el.imgAlt}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent className='max-w-md break-words'>
                        <p className='text-sm whitespace-pre-line'>{el.promptContent || el.imgAlt}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            ) : (
              <p className='line-clamp-5 text-base leading-6 font-normal text-white/70'>{el.imgAlt}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ImageShowcaseSectionProps {
  title: string;
  description: string;
  dataList: {
    title: string;
    imgList: ShowcaseItem[];
  }[];
}

export default function ImageShowcaseSection({ title, description, dataList }: ImageShowcaseSectionProps) {
  return (
    <div className='container-py container-centered container-gap'>
      <SubHeading title={title} description={description} />
      {dataList.map((el) => (
        <Showcase key={el.title} title={el.title} dataList={el.imgList} />
      ))}
    </div>
  );
}
