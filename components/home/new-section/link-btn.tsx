import { Link } from '@/i18n/navigation';

import { cn } from '@/lib/utils';

export default function LinkBtn({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'bg-color-main flex items-center justify-center rounded-lg px-8 py-2.5 font-semibold backdrop-blur-sm hover:cursor-pointer hover:opacity-80',
        className,
      )}
    >
      {children}
    </Link>
  );
}
