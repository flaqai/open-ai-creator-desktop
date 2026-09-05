import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getFlaqResourceUrl } from '@/lib/constants/resource-entry';

const MODEL_MARKET_IMAGE = '/images/resource-entry/model-market/market.webp';

export default async function ModelMarketPromotionSection() {
  const t = await getTranslations('ResourceEntrySections.modelMarket');

  return (
    <section className='container-centered py-[60px]'>
      <div className='border-color-b1 relative isolate overflow-hidden rounded-lg border bg-[radial-gradient(circle_at_18%_18%,rgba(74,116,255,0.2),transparent_32%),linear-gradient(145deg,#12141b,#090a0f)]'>
        <div className='grid min-h-[390px] lg:grid-cols-[minmax(340px,0.95fr)_minmax(0,1.05fr)]'>
          <div className='relative min-h-[260px] overflow-hidden lg:min-h-full'>
            <img
              src={MODEL_MARKET_IMAGE}
              alt=''
              className='absolute inset-0 size-full object-cover'
              loading='lazy'
              decoding='async'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-[#0b0c11] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0b0c11]' />
          </div>

          <div className='relative z-10 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 lg:py-14'>
            <p className='text-color-main text-sm font-semibold tracking-wider uppercase'>{t('eyebrow')}</p>
            <h2 className='mt-3 max-w-2xl text-2xl font-medium text-white lg:text-[32px] lg:leading-[40px]'>
              {t('title')}
            </h2>
            <p className='mt-5 max-w-2xl text-base leading-7 text-white/70'>{t('description')}</p>
            <a
              href={getFlaqResourceUrl('/model-market')}
              target='_blank'
              rel='noopener noreferrer'
              className='mt-8 inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-lg border border-white/15 bg-white px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 md:text-base'
            >
              {t('button')}
              <ArrowRight className='size-4' />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
