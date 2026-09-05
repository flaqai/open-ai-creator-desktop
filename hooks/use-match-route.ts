import { useCallback } from 'react';
import { usePathname } from '@/i18n/navigation';

export default function useMatchRoute(): (route: string) => boolean {
  const pathname = usePathname();

  const matchRoute = useCallback((route: string) => pathname.includes(`${route}/`), [pathname]);

  return matchRoute;
}
