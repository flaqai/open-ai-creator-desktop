import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import MediaLibrary from '@/components/media-library/MediaLibrary';

export const metadata: Metadata = {
  title: 'Media Library — Flaq Creator',
  description: 'Browse uploaded references and generated images, videos, audio, and files on this device.',
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MediaLibrary />;
}
