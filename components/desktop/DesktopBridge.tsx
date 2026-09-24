'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

import { isDesktopRuntime, isNativeDesktop } from '@/lib/desktop/runtime';
import { openExternalUrl } from '@/lib/platform/navigation';
import DesktopContextMenu from './DesktopContextMenu';

export default function DesktopBridge() {
  useEffect(() => {
    if (!isDesktopRuntime()) return undefined;

    document.body.classList.add('desktop-app');

    const handleExternalLink = async (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest<HTMLAnchorElement>('a[href]');
      if (!anchor) return;
      if (!isNativeDesktop() || anchor.hasAttribute('download') || event.defaultPrevented) return;

      const url = new URL(anchor.href, window.location.href);
      if (!['http:', 'https:'].includes(url.protocol) || url.origin === window.location.origin) return;

      event.preventDefault();
      try {
        await openExternalUrl(url.toString());
      } catch (error) {
        toast.error(String(error));
      }
    };

    document.addEventListener('click', handleExternalLink);
    return () => {
      document.body.classList.remove('desktop-app');
      document.removeEventListener('click', handleExternalLink);
    };
  }, []);

  return <DesktopContextMenu />;
}
