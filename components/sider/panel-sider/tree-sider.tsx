'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { ChevronUpIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import useMatchRoute from '@/hooks/use-match-route';

type SiderGroupType = {
  icon?: React.ReactNode;
  id: string;
  title: string;
  items: { id: string; icon?: React.ReactNode; title: string; href: string }[];
};

function SiderItem({ title, icon, href, isActive }: SiderGroupType['items'][number] & { isActive: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'group text-foreground/70 hover:bg-foreground/5 flex items-center gap-2 rounded-lg p-2 text-sm font-normal',
        isActive && 'bg-foreground/10 font-medium',
      )}
    >
      {icon && <span className={cn('shrink-0', isActive && 'text-color-main')}>{icon}</span>}
      <div className={cn('min-w-0 truncate', isActive && 'text-color-main')}>{title}</div>
    </Link>
  );
}

function SiderGroup({ title, items, icon }: SiderGroupType) {
  const matchRoute = useMatchRoute();

  const hasActiveItem = items.some((item) => matchRoute(item.href));
  const [shouldOpen, setOpen] = useState(hasActiveItem);

  useEffect(() => {
    if (hasActiveItem) setOpen(true);
  }, [hasActiveItem]);

  const handleClick = () => {
    setOpen((open) => !open);
  };

  return (
    <div className='flex w-full flex-col gap-0.5'>
      <button
        type='button'
        aria-expanded={shouldOpen}
        onClick={handleClick}
        className='text-foreground/80 hover:bg-foreground/5 mx-1 flex items-center gap-1 rounded-md p-2 text-sm font-medium hover:cursor-pointer'
      >
        <span>{icon}</span>
        <div>{title}</div>
        {items.length > 0 && (
          <ChevronUpIcon
            className={cn('text-foreground/60 ms-auto h-4 w-4 rotate-0 transition-all', shouldOpen && 'rotate-180')}
          />
        )}
      </button>
      {items.length > 0 && (
        <div
          inert={!shouldOpen}
          aria-hidden={!shouldOpen}
          className={cn(
            'grid transition-[grid-template-rows] duration-150 ease-in-out',
            shouldOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className='overflow-hidden'>
            <div className='px-5'>
              <div className='border-foreground/10 border-s ps-3'>
                <div className='flex flex-col gap-1'>
                  {items.map((item) => (
                    <SiderItem key={item.id} {...item} isActive={matchRoute(item.href)} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TreeSider({
  group,
  primaryItems = [],
}: {
  group: SiderGroupType[];
  primaryItems?: SiderGroupType['items'];
}) {
  const matchRoute = useMatchRoute();

  return (
    <div className='flex flex-col gap-0.5 pb-32 text-sm'>
      {primaryItems.map((item) => (
        <div key={item.id} className='mx-1'>
          <SiderItem {...item} isActive={matchRoute(item.href)} />
        </div>
      ))}
      {primaryItems.length > 0 && <div className='border-color-b1 mx-3 my-1 border-t' />}
      {group.map((item) => (
        <SiderGroup key={item.id} {...item} />
      ))}
    </div>
  );
}
