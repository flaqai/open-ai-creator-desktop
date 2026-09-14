import { cn } from '@/lib/utils';

export default function SubHeading({
  icon,
  title,
  description,
  className,
  titleClassName,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 text-balance',
        icon ? 'items-start text-left' : 'mx-auto items-center text-center',
        className,
      )}
    >
      <div className={cn('flex w-full items-center gap-3', icon ? '' : 'justify-center')}>
        {icon && <div className='flex items-center'>{icon}</div>}
        <h2
          className={cn(
            'text-foreground text-2xl font-semibold md:text-[32px] md:leading-[48px] md:tracking-[1.44px]',
            titleClassName,
          )}
        >
          {title}
        </h2>
      </div>
      {description && (
        <p
          className={cn(
            'text-muted-foreground text-sm font-normal md:text-[16px] md:leading-[24px]',
            icon ? 'w-full text-left' : 'text-center',
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
