import { ArrowRight } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';

import { getFlaqResourceUrl } from '@/lib/constants/resource-entry';

const AFFILIATE_PROMOTION_VIDEO = '/images/resource-entry/affiliate/hero.mp4';
const AFFILIATE_PROMOTION_POSTER = '/images/resource-entry/affiliate/hero.webp';

export default async function AffiliatePromotionSection() {
  const locale = await getLocale();
  const t = await getTranslations('ResourceEntrySections.affiliate');

  return (
    <section className='relative isolate mt-[60px] w-full overflow-hidden bg-[radial-gradient(circle_at_78%_30%,rgba(85,72,255,0.24),transparent_32%),linear-gradient(135deg,#111116,#08080b)]'>
      <div className='container-centered'>
        <div className='grid min-h-[420px] items-center lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.85fr)]'>
          <div className='relative z-10 py-8 lg:py-10'>
            <p className='text-color-main text-sm font-semibold tracking-wider uppercase'>{t('eyebrow')}</p>
            <h2 className='mt-4 max-w-2xl text-2xl font-medium text-white lg:text-[32px] lg:leading-[40px]'>
              {t('title')}
            </h2>
            <p className='mt-5 max-w-2xl text-base leading-7 text-white/70'>{t('description')}</p>
            <a
              href={getFlaqResourceUrl('/affiliate-program', locale)}
              target='_blank'
              rel='noopener noreferrer'
              className='bg-color-main mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 md:text-base'
            >
              {t('button')}
              <ArrowRight className='size-4' />
            </a>
          </div>

          <div className='relative min-h-[320px] self-stretch lg:min-h-full'>
            <video
              src={AFFILIATE_PROMOTION_VIDEO}
              poster={AFFILIATE_PROMOTION_POSTER}
              className='absolute inset-0 size-full object-contain object-center mix-blend-screen'
              autoPlay
              muted
              loop
              playsInline
              preload='metadata'
              aria-hidden='true'
            />
          </div>
        </div>
      </div>
    </section>
  );
}
