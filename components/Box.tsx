import { cn } from '@/lib/utils';

type BoxVariant = 'panel' | 'control' | 'input';

const VARIANT_CLASS_MAP: Record<BoxVariant, string> = {
  panel: 'w-full bg-[#1F1D25] px-3 py-4',
  control:
    'flex h-9 shrink-0 items-center justify-center rounded border border-[#2a2b2f] bg-[#1c1d20] text-sm text-white',
  input:
    'flex h-9 items-center justify-center rounded border border-[#2a2b2f] bg-[#1c1d20] px-3 text-sm text-[#b8b8b8]',
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
