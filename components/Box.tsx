import { cn } from '@/lib/utils';

type BoxVariant = 'panel' | 'control' | 'input';

const VARIANT_CLASS_MAP: Record<BoxVariant, string> = {
  panel: 'w-full bg-[#1F1D25] px-3 py-4',
  control: 'flex h-9 shrink-0 items-center justify-center rounded border border-border bg-card text-sm text-foreground',
  input: 'flex h-9 items-center justify-center rounded border border-border bg-card px-3 text-sm text-muted-foreground',
};

export default function Box({
  children,
  className,
  variant = 'panel',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: BoxVariant;
}) {
  return <div className={cn(VARIANT_CLASS_MAP[variant], className)}>{children}</div>;
}
