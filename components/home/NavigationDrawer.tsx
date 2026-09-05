'use client';

/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Fragment, useEffect, useState } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { NAV_LINKS, UTM_SOURCE } from '@/lib/constants';
import { openExternalUrl } from '@/lib/platform/navigation';
import { cn } from '@/lib/utils';

function NavDrawerItem({
  isActive,
  name,
  hasChild,
  isExpanded,
  isChild,
}: {
  isActive: boolean;
  name: string;
  hasChild?: boolean;
  isExpanded?: boolean;
  isChild?: boolean;
}) {
  if (isChild) {
    return (
      <div
        className={cn(
          'flex h-10 w-full items-center rounded-lg pr-3 pl-6 transition-colors',
          isActive ? 'bg-color-main text-white' : 'text-white/60 hover:bg-white/5',
        )}
      >
        <span className='truncate text-sm whitespace-nowrap'>{name}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-11 w-full items-center justify-between rounded-lg px-3 transition-colors',
        isActive && !hasChild ? 'bg-color-main text-white' : 'text-white/80 hover:bg-white/5',
      )}
    >
      <span className='truncate text-base font-medium whitespace-nowrap'>{name}</span>
      {hasChild && (
        <ChevronDown
          className={cn('size-5 shrink-0 text-white/40 transition-transform duration-200', isExpanded && 'rotate-180')}
        />
      )}
    </div>
  );
}

export default function NavigationDrawer({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(open);
  const router = useRouter();

  const getInitialExpandedItems = () => {
    const expanded: string[] = [];
    NAV_LINKS.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) => pathname.includes(child.href as string));
        if (isChildActive) {
          expanded.push(item.code);
        }
      }
    });
    return expanded;
  };

  const [expandedItems, setExpandedItems] = useState<string[]>(getInitialExpandedItems());

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    setExpandedItems(getInitialExpandedItems());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const NavLinks = NAV_LINKS.map((item) => ({
    ...item,
    label: t(`${item.code}`),
    children:
      item.children &&
      item.children
        ?.filter((el) => el.code !== 'dream-ai-video')
        .map((child) => ({
          ...child,
          label: t(`${child.code}`),
          description: t(`${child.code}-content`),
        })),
  }));

  const onClose = () => {
    setOpen(false);
    setIsOpen(false);
  };

  const onRoute = (route: string, target?: string) => {
    if (route.startsWith('http')) {
      const url = new URL(route);
      url.searchParams.set('utm_source', UTM_SOURCE);
      void openExternalUrl(url.toString(), target || '_blank').catch((error) => toast.error(String(error)));
      return;
    }

    router.push(route);
    onClose();
  };

  const toggleExpanded = (code: string) => {
    setExpandedItems((prev) => (prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]));
  };

  const handleItemClick = (item: { code: string; href?: string; children?: unknown[] }) => {
    if (item.children) {
      toggleExpanded(item.code);
      return;
    }
    if (item.href) {
      onRoute(item.href);
    }
  };

  return (
    <>
      <div
        className={cn('fixed z-50 h-screen w-screen overflow-hidden bg-black/60', isOpen ? 'block' : 'hidden')}
        onClick={onClose}
      />
      <div
        inert={!isOpen}
        aria-hidden={!isOpen}
        className={cn(
          'fixed top-16 right-0 z-[99999] h-[calc(100%-64px)] w-[276px] transform overflow-auto bg-black shadow-lg transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className='flex flex-col gap-1 px-3 pt-4'>
          {NavLinks.map((item) => (
            <Fragment key={item.code}>
              <button type='button' onClick={() => handleItemClick(item)}>
                <NavDrawerItem
                  name={item.label}
                  hasChild={!!item.children}
                  isExpanded={expandedItems.includes(item.code)}
                  isActive={pathname === item.href || (pathname.includes(item.href as string) && item.href !== '/')}
                />
                <span className='sr-only'>{item.label}</span>
              </button>
              {item.children && expandedItems.includes(item.code) && (
                <div className='flex flex-col gap-0.5'>
                  {item.children.map((child) => (
                    <button
                      key={child.code}
                      type='button'
                      onClick={() => onRoute(child.href as string)}
                      className='w-full'
                    >
                      <NavDrawerItem
                        name={child.label}
                        isChild
                        isActive={pathname === child.href || pathname.includes(child.href as string)}
                      />
                      <span className='sr-only'>{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </Fragment>
          ))}
          <div className='h-60 shrink-0' aria-hidden='true' />
        </div>
      </div>
    </>
  );
}
