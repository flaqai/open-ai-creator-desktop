import { locales } from '@/i18n/languages';
import { setRequestLocale } from 'next-intl/server';

import CanvasClientMount from '@/components/infinite-canvas/integration/canvas-client-mount';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function CanvasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CanvasClientMount />;
}
