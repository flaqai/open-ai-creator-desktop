'use client';

import useCookieDialogStore from '@/store/dialog/useCookieDialogStore';
import { useTranslations } from 'next-intl';

export default function CookieConsentDialog() {
  const t = useTranslations('cookie');

  const open = useCookieDialogStore((state) => state.open);
  const setOpen = useCookieDialogStore((state) => state.setOpen);

  if (!open) return null;

  return (
    <div data-cookie-consent className='fixed bottom-5 z-50 w-full px-3 lg:right-5 lg:w-[351px] lg:px-0'>
      <div className='flex min-h-[150px] flex-col justify-between gap-3 rounded-xl bg-[#373737B2] p-3 text-sm text-[#D9D9D9] backdrop-blur-lg'>
        <p>{t('content')}</p>
        <button
          type='button'
          onClick={() => setOpen(false)}
          className='mx-auto flex h-8 w-fit min-w-24 items-center justify-center rounded-lg bg-[#DFDFDF] px-2 text-black'
        >
          {t('confirm')}
        </button>
      </div>
    </div>
  );
}
