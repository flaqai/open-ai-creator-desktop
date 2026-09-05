import { redirect } from '@/i18n/navigation';

export default async function CatchAllPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Redirect to /404 route, using /404 page's metadata
  redirect({ href: '/404', locale });
}
