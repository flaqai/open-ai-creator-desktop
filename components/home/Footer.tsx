'use client';

import { generateLanguagePaths, languages } from '@/i18n/languages';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { IMAGE_CHILDREN_LIST, VIDEO_CHILDREN_LIST } from '@/lib/constants';
import { BASE_URL } from '@/lib/env';

import Github from '../svg/footer/Github';
import BusinessButton from './BusinessButton';

function InfoList({
  title,
  dataList,
  prefetch = true,
}: {
  title: string;
  dataList: Array<{
    title: string;
    href?: string;
    target?: React.HTMLAttributeAnchorTarget;
    type?: string;
    isBusinessButton?: boolean;
  }>;
  prefetch?: boolean;
}) {
  return (
    <div className='min-w-0'>
      <p className='text-foreground/55 mb-4 text-xs font-semibold tracking-[0.18em] uppercase'>{title}</p>
      <ul className='flex flex-col items-start gap-1.5'>
        {dataList.map((el, index) => (
          <li key={el.href || index}>
            {el.isBusinessButton ? (
              <BusinessButton className='text-foreground/65 hover:text-foreground focus-visible:text-foreground inline-flex min-h-8 items-center text-start text-sm transition-colors focus-visible:outline-none'>
                {el.title}
              </BusinessButton>
            ) : (
              <Link
                href={el.href!}
                title={el.title}
                className='text-foreground/65 hover:text-foreground focus-visible:text-foreground inline-flex min-h-8 items-center text-sm transition-colors focus-visible:outline-none'
                target={el.target}
                type={el.type}
                prefetch={prefetch}
              >
                {el.title}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const t = useTranslations('Footer');
  const locale = useLocale();
  const currentYear = new Date().getFullYear();
  const languagePaths = generateLanguagePaths(BASE_URL, '');
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_US_EMAIL;

  const FEATURE_LINK = [
    { code: 'ai-create', href: '/ai-media-creator' },
    ...VIDEO_CHILDREN_LIST,
    ...IMAGE_CHILDREN_LIST,
  ]
    .filter((r) => !r.hideInFooter)
    .map((r) => ({ title: t(`feature.${r.code}`), href: r.href }));

  const INFO_LIST = [
    {
      title: t('docs'),
      href: 'https://flaq.ai/docs',
      target: '_blank' as const,
    },
    {
      title: t('flaq'),
      href: 'https://flaq.ai',
      target: '_blank' as const,
    },
    {
      title: t('business'),
      isBusinessButton: true,
    },
    {
      title: t('privacy'),
      href: '/privacy-policy',
    },
    {
      title: t('termsConditions'),
      href: '/terms-of-service',
    },
    {
      title: t('refundPolicy'),
      href: '/refund-policy',
    },
  ];

  const supportLinks = contactEmail
    ? [
        ...INFO_LIST,
        {
          title: t('contactUs'),
          href: `mailto:${contactEmail}`,
          type: 'email',
        },
      ]
    : INFO_LIST;

  return (
    <footer className='border-foreground/10 text-foreground/70 relative isolate w-full overflow-hidden border-t bg-[#070708]'>
      <div aria-hidden='true' className='footer-brand-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-64' />

      <div className='max-w-pc mx-auto px-5 sm:px-8 xl:px-0'>
        <div className='grid gap-10 py-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(160px,0.7fr)_minmax(160px,0.7fr)] lg:gap-14 lg:py-16'>
          <div className='max-w-2xl'>
            <Link href='/' className='mb-6 inline-flex items-center gap-3' aria-label='Flaq SaaS Template'>
              <span className='border-foreground/10 bg-foreground/[0.06] flex size-11 items-center justify-center rounded-2xl border shadow-[0_12px_36px_rgba(0,0,0,0.25)]'>
                <img
                  src='/images/logo.png'
                  alt=''
                  className='size-7'
                  fetchPriority='low'
                  loading='lazy'
                  decoding='async'
                />
              </span>
              <span className='text-foreground/80 text-sm font-semibold tracking-[0.12em] uppercase'>
                Flaq SaaS Template
              </span>
            </Link>
            <p className='text-foreground max-w-xl text-2xl leading-tight font-semibold text-balance sm:text-3xl'>
              {t('title')}
            </p>
            <p className='text-foreground/50 mt-4 max-w-xl text-sm leading-6'>{t('subTitle')}</p>
          </div>

          <div className='grid grid-cols-2 gap-x-8 gap-y-10 sm:gap-x-14 lg:contents'>
            <InfoList title={t('feature-link')} dataList={FEATURE_LINK} />
            <InfoList title={t('support')} dataList={supportLinks} />
          </div>
        </div>

        <nav aria-label='Languages' className='border-foreground/10 border-t py-6'>
          <div className='flex flex-wrap gap-2'>
            {languages.map((language) => {
              const isActive = language.lang === locale;

              return (
                <a
                  href={languagePaths[language.code]}
                  key={language.code}
                  hrefLang={language.code}
                  lang={language.code}
                  aria-current={isActive ? 'page' : undefined}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-none ${
                    isActive
                      ? 'border-foreground/25 bg-foreground/10 text-foreground'
                      : 'border-foreground/10 bg-foreground/[0.025] text-foreground/50 hover:border-foreground/20 hover:bg-foreground/[0.06] hover:text-foreground'
                  }`}
                >
                  {language.label}
                </a>
              );
            })}
          </div>
        </nav>

        <div className='border-foreground/10 flex flex-col-reverse items-center justify-between gap-5 border-t py-6 sm:flex-row'>
          <div className='text-foreground/50 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs sm:justify-start sm:text-start'>
            <span>© {currentYear} Flaq AI.</span>
            <span>Flaq SaaS Template.</span>
          </div>

          <div className='flex items-center gap-2'>
            <a
              href='https://flaq.ai/'
              target='_blank'
              rel='noopener noreferrer nofollow'
              className='border-foreground/10 bg-foreground/[0.035] hover:border-foreground/20 hover:bg-foreground/[0.08] flex size-10 items-center justify-center rounded-xl border transition-colors focus-visible:outline-none'
              title='Flaq AI'
              aria-label='Flaq AI'
            >
              <img src='/images/flaq-logo.svg' alt='' className='size-6' loading='lazy' decoding='async' />
            </a>
            <a
              href='https://github.com/flaqai/flaq-saas-template'
              target='_blank'
              rel='noopener noreferrer'
              className='border-foreground/10 bg-foreground/[0.035] hover:border-foreground/20 hover:bg-foreground/[0.08] flex size-10 items-center justify-center rounded-xl border transition-colors focus-visible:outline-none'
              title='GitHub Repository'
              aria-label='GitHub Repository'
            >
              <Github className='size-5' />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
