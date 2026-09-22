'use client';

import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Toaster as Sonner, ToasterProps } from 'sonner';

import { BRAND_COLOR_CSS } from '@/lib/theme/colors';

const CONFETTI = [
  { x: '-18px', y: '-18px', r: '-35deg', color: BRAND_COLOR_CSS.primary, delay: '0ms' },
  { x: '2px', y: '-24px', r: '28deg', color: '#f59e0b', delay: '30ms' },
  { x: '19px', y: '-16px', r: '68deg', color: '#06b6d4', delay: '65ms' },
  { x: '23px', y: '3px', r: '115deg', color: '#ec4899', delay: '20ms' },
  { x: '-21px', y: '5px', r: '-72deg', color: BRAND_COLOR_CSS.primarySoft, delay: '75ms' },
  { x: '-12px', y: '19px', r: '-18deg', color: '#10b981', delay: '45ms' },
] as const;

function ToastGlyph({ type }: { type: 'success' | 'error' }) {
  const Icon = type === 'success' ? Check : X;
  return (
    <span className={`flaq-toast-glyph flaq-toast-glyph-${type}`} aria-hidden='true'>
      <span className='flaq-toast-glyph-core'>
        <Icon className='size-[17px]' strokeWidth={3} />
      </span>
      {type === 'success'
        ? CONFETTI.map((piece, index) => (
            <span
              key={index}
              className='flaq-toast-confetti'
              style={
                {
                  '--confetti-x': piece.x,
                  '--confetti-y': piece.y,
                  '--confetti-r': piece.r,
                  '--confetti-color': piece.color,
                  '--confetti-delay': piece.delay,
                } as React.CSSProperties
              }
            />
          ))
        : null}
    </span>
  );
}

const Toaster = ({ icons, toastOptions, className, style, ...props }: ToasterProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  useEffect(() => {
    const update = () => setTheme(document.documentElement.classList.contains('light') ? 'light' : 'dark');
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <Sonner
      {...props}
      theme={theme as ToasterProps['theme']}
      className={`flaq-toaster toaster group ${className || ''}`}
      icons={{
        success: <ToastGlyph type='success' />,
        error: <ToastGlyph type='error' />,
        ...icons,
      }}
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast: 'flaq-toast',
          success: 'flaq-toast-success',
          error: 'flaq-toast-error',
          title: 'flaq-toast-title',
          description: 'flaq-toast-description',
          closeButton: 'flaq-toast-close',
          ...toastOptions?.classNames,
        },
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          ...style,
        } as React.CSSProperties
      }
    />
  );
};

export { Toaster };
