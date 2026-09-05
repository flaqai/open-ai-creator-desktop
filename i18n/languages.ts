export const defaultLocale = 'en';

type Language = {
  code: string;
  lang: string;
  backendValue: string;
  label: string;
  englishLabel?: string;
  direction?: 'ltr' | 'rtl';
};

export const languages: Language[] = [
  {
    code: 'en',
    lang: 'en',
    backendValue: 'en',
    label: 'English',
  },
  {
    code: 'ja-JP',
    lang: 'ja',
    backendValue: 'ja',
    label: '日本語',
    englishLabel: 'Japanese',
  },
  {
    code: 'id-ID',
    lang: 'id',
    backendValue: 'id',
    label: 'Bahasa Indonesia',
    englishLabel: 'Indonesian',
  },
  {
    code: 'it-IT',
    lang: 'it',
    backendValue: 'it',
    label: 'Italiano',
    englishLabel: 'Italian',
  },
  {
    code: 'pt-BR',
    lang: 'pt',
    backendValue: 'pt',
    label: 'Português (Brasil)',
    englishLabel: 'Portuguese (Brazil)',
  },
  {
    code: 'es-ES',
    lang: 'es',
    backendValue: 'es',
    label: 'Español',
    englishLabel: 'Spanish',
  },
  {
    code: 'de-DE',
    lang: 'de',
    backendValue: 'de',
    label: 'Deutsch',
    englishLabel: 'German',
  },
  {
    code: 'ru-RU',
    lang: 'ru',
    backendValue: 'ru',
    label: 'Русский',
    englishLabel: 'Russian',
  },
  {
    code: 'fr-FR',
    lang: 'fr',
    backendValue: 'fr',
    label: 'Français',
    englishLabel: 'French',
  },
  {
    code: 'zh-CN',
    lang: 'zh',
    backendValue: 'zh',
    label: '简体中文',
    englishLabel: 'Simplified Chinese',
  },
  {
    code: 'zh-TW',
    lang: 'tw',
    backendValue: 'tw',
    label: '繁體中文',
    englishLabel: 'Traditional Chinese',
  },
  {
    code: 'ko-KR',
    lang: 'ko',
    backendValue: 'ko',
    label: '한국어',
    englishLabel: 'Korean',
  },
  {
    code: 'th-TH',
    lang: 'th',
    backendValue: 'th',
    label: 'ไทย',
    englishLabel: 'Thai',
  },
  {
    code: 'vi-VN',
    lang: 'vi',
    backendValue: 'vi',
    label: 'Tiếng Việt',
    englishLabel: 'Vietnamese',
  },
  {
    code: 'ar-SA',
    lang: 'ar',
    backendValue: 'ar',
    label: 'العربية',
    englishLabel: 'Arabic',
    direction: 'rtl',
  },
];

export const generateLanguagePaths = (baseRoute: string, route: string) => {
  const normalizedBase = baseRoute.replace(/\/$/, '');
  const normalizedRoute = route.replace(/^\//, '').replace(/\/$/, '');
  const routePath = normalizedRoute ? `/${normalizedRoute}/` : '/';

  return languages.reduce<Record<string, string>>(
    (paths, { code, lang }) => ({
      ...paths,
      [code]: `${normalizedBase}${lang === defaultLocale ? '' : `/${lang}`}${routePath}`,
    }),
    {},
  );
};

export const getLanguagePaths = () => languages.map(({ lang }) => (lang === defaultLocale ? '/' : `/${lang}/`));

export const locales = languages.map((lang) => lang.lang);

export const getLanguageDirection = (locale: string) =>
  languages.find(({ lang }) => lang === locale)?.direction ?? 'ltr';
