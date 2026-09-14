'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { languages } from '@/i18n/languages';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

import { isDesktopRuntime } from '@/lib/desktop/runtime';
import { isEmptyObject } from '@/lib/utils/objectUtils';
import { objToQueryStr } from '@/lib/utils/stringUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import Icon from './image/Icon';

export default function LocaleSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [localeVal, setLocaleVal] = useState(currentLocale);

  const onValueChange = (newLocale: string) => {
    let url = pathname;
    const querysObj = Object.fromEntries(searchParams.entries());
    if (!isEmptyObject(querysObj)) {
      url = objToQueryStr(pathname, querysObj);
    }

    setLocaleVal(newLocale);
    if (isDesktopRuntime()) {
      try {
        localStorage.setItem('flaq-desktop-locale', newLocale);
      } catch {
        toast.error(currentLocale === 'zh' ? '语言设置无法保存' : 'Could not save language preference');
        return;
      }
    }
    router.replace(url, { locale: newLocale });
  };

  return (
    <Select value={localeVal} defaultValue={currentLocale} onValueChange={onValueChange}>
      <SelectTrigger className='text-foreground/40 flex h-8 w-[80px] items-center gap-1 rounded-lg border-none bg-transparent! px-2 lg:h-11'>
        <Icon src='/icons/global.svg' />
        <SelectValue placeholder='locale'>{localeVal.toUpperCase()}</SelectValue>
      </SelectTrigger>
      <SelectContent className='bg-color-5 max-h-[min(70vh,28rem)] overflow-y-auto border-none shadow-2xl backdrop-blur-sm'>
        {languages.map((language) => (
          <SelectItem
            value={language.lang}
            key={language.code}
            className='text-foreground/40 hover:bg-foreground/40! focus:bg-card hover:cursor-pointer'
          >
            {language.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
