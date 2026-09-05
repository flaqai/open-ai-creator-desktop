'use client';

import useBusinessDialogStore from '@/store/useBusinessDialogStore';

interface BusinessButtonProps {
  children: React.ReactNode;
  className?: string;
}

export default function BusinessButton({ children, className }: BusinessButtonProps) {
  const { setOpen } = useBusinessDialogStore();

  return (
    <button type='button' onClick={() => setOpen(true)} className={className}>
      {children}
    </button>
  );
}
