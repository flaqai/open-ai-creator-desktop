'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const TopLoadingBar = dynamic(() => import('@/components/top-loading-bar'), { ssr: false });
const CookieConsentDialog = dynamic(() => import('@/components/dialog/CookieConsentDialog'), { ssr: false });
const GlobalTaskPolling = dynamic(() => import('@/components/GlobalTaskPolling'), { ssr: false });
const BusinessDialog = dynamic(() => import('@/components/dialog/BusinessDialog'), { ssr: false });
const DesktopBridge = dynamic(() => import('@/components/desktop/DesktopBridge'), { ssr: false });
const DesktopOnboarding = dynamic(() => import('@/components/desktop/DesktopOnboarding'), { ssr: false });

export default function LazyGlobalUI() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <>
      <DesktopBridge />
      <DesktopOnboarding />
      <CookieConsentDialog />
      <TopLoadingBar />
      <GlobalTaskPolling />
      <BusinessDialog />
    </>
  );
}
