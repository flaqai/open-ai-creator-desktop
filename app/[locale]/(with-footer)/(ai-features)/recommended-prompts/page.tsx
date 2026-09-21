import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import RecommendedPrompts from '@/components/prompts/RecommendedPrompts';

export const metadata: Metadata = {
  title: 'Prompt Media Library — Flaq Creator',
  description: 'Browse complete prompts with matching images and videos for four creative AI models.',
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RecommendedPrompts />;
}
