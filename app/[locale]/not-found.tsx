/* eslint-disable @next/next/no-img-element */
'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

/**
 * NOTE: If you see a warning like:
 * The resource <URL> was preloaded using link preload but not used within a few seconds from the window's load event...
 * This is likely caused by preloading the 404 image without an appropriate `as` attribute or preloading it but not using it immediately.
 * To avoid this warning, ensure your preload uses correct `as` (e.g., `as="image"` in <link>), and that you intend for this image to be loaded on the error page.
 *
 * See: https://developer.chrome.com/docs/lighthouse/performance/preload-important-resources/#resources-were-preloaded-but-not-used
 */

export default function NotFound() {
  const t = useTranslations('error-page.not-found');
  // No preload management here: ensure any <link rel="preload"> for this image in _document or layout has as="image"
  return (
    <div className='flex w-[100vw] flex-1 items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        <img
          src='images/404.png'
          className='aspect-square w-[248px] -translate-x-4 rounded-full'
          alt='404'
          loading='lazy'
          fetchPriority='low'
        />
        <h1 className='text-foreground/40 text-sm'>{t('title')}</h1>
        <Link
          href='/'
          className='border-foreground/40 text-foreground/40 flex h-9 items-center justify-center rounded-full border px-2.5 text-sm uppercase hover:cursor-pointer hover:opacity-80'
        >
          {t('goHome')}
        </Link>
      </div>
    </div>
  );
}
