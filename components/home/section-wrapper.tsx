import { cn } from '@/lib/utils';

export default function SectionWrapper({
  children,
  className,
  innerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <section className={cn('flex w-full items-center gap-3 px-3 py-[60px] lg:px-0 lg:py-[120px]', className)}>
      <div className={cn('max-w-pc mx-auto flex w-full flex-col items-center gap-5 lg:gap-10', innerClassName)}>
        {children}
      </div>
    </section>
  );
}
