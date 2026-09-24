import { Suspense } from 'react';
import { locales } from '@/i18n/languages';
import { setRequestLocale } from 'next-intl/server';

import CanvasEditorEntry from '@/components/infinite-canvas/integration/canvas-editor-entry';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function CanvasEditorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={null}>
      <CanvasEditorEntry />
    </Suspense>
  );
}
