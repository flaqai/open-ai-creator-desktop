import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

export default function HeroSection({ className }: { className?: string }) {
  const t = useTranslations('Home.heading');

  return (
    <div className={cn('flex min-h-[calc(100vh-70px)] items-center justify-center', className)}>
      <div className='container-centered container-gap flex flex-col gap-4 py-12 lg:gap-6 lg:py-20'>
        {/* Title Section */}
        <div className='relative w-full'>
          <div className='relative flex w-full flex-col items-center justify-center gap-3 p-0'>
            <h1 className='text-center text-[32px] leading-tight font-semibold tracking-[1.5px] text-white capitalize sm:text-[40px] sm:leading-[48px] lg:text-[48px] lg:leading-[58px] 2xl:text-[72px] 2xl:leading-[85px] 2xl:tracking-[2.88px]'>
              {t('title')}
            </h1>
          </div>
        </div>

        {/* Description */}
        <div className='w-full px-4 text-center text-[16px] leading-[24px] font-normal text-[#ffffff] capitalize'>
          {t('description')}
        </div>

        {/* Buttons Section */}
        <div className='relative flex w-full justify-center'>
          <div className='relative flex flex-col items-center justify-center gap-3 p-0 sm:flex-row'>
            <Link
              href='https://flaq.ai/models/google/veo3-1-fast-image-to-video'
              target='_blank'
              rel='nofollow noopener noreferrer'
              className='bg-color-main hover:bg-color-main/80 w-full rounded-lg px-6 py-2.5 text-[14px] leading-[21px] font-semibold whitespace-nowrap text-white capitalize backdrop-blur backdrop-filter transition-colors sm:w-auto sm:px-8 sm:py-3 sm:text-[16px] sm:leading-[24px]'
            >
              {t('try-now-video')}
            </Link>
            <Link
              href='https://flaq.ai/models/google/nano-banana-pro-edit'
              target='_blank'
              rel='nofollow noopener noreferrer'
              className='text-color-main w-full rounded-lg bg-white px-6 py-2.5 text-[14px] leading-[21px] font-semibold whitespace-nowrap capitalize backdrop-blur backdrop-filter transition-colors hover:bg-white/80 sm:w-auto sm:px-8 sm:py-3 sm:text-[16px] sm:leading-[24px]'
            >
              {t('try-now-image')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
