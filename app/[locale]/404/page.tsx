import { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('error-page.not-found');

  return {
    title: t('title'),
    description: t('title'),
    alternates: {
      canonical: '/404',
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function Page() {
  const t = await getTranslations('error-page.not-found');

  return (
    <div className='flex w-[100vw] flex-1 items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        <img
          src='images/404.png'
          className='mx-auto aspect-square w-[248px] rounded-full'
          alt='404'
          loading='eager'
          decoding='async'
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
