import { useInfiniteCanvasTranslation } from '../../runtime/i18n/infinite-canvas-translation';
// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { useEffect, useRef, useState, type RefObject } from 'react';
import { Settings2 } from 'lucide-react';
import { createPortal } from 'react-dom';

import { canvasThemes } from '../../lib/canvas-theme';
import { Button } from '../../runtime/ui/source-ui';
import type { AiConfig } from '../../stores/use-config-store';
import type { CanvasMusicValues } from '../../music.types';
import { useThemeStore } from '../../stores/use-theme-store';
import { CanvasMusicSettings } from './canvas-music-settings';

type CanvasMusicSettingsPopoverProps = {
  config: AiConfig;
  audioCount?: number;
  onConfigChange: (music: CanvasMusicValues) => void;
  buttonClassName?: string;
  placement?: 'topLeft' | 'top' | 'topRight' | 'bottomLeft' | 'bottom' | 'bottomRight';
};

export function CanvasMusicSettingsPopover({
  config,
  audioCount,
  onConfigChange,
  buttonClassName,
  placement = 'topLeft',
}: CanvasMusicSettingsPopoverProps) {
  const { t } = useInfiniteCanvasTranslation();
  const theme = canvasThemes[useThemeStore((state) => state.theme)];
  const buttonRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!open) return;
    const syncPosition = () => setButtonRect(buttonRef.current?.getBoundingClientRect() || null);
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    syncPosition();
    window.addEventListener('resize', syncPosition);
    window.addEventListener('scroll', syncPosition, true);
    window.addEventListener('pointerdown', closeOnOutsidePointer, true);
    return () => {
      window.removeEventListener('resize', syncPosition);
      window.removeEventListener('scroll', syncPosition, true);
      window.removeEventListener('pointerdown', closeOnOutsidePointer, true);
    };
  }, [open]);

  const panel =
    open && buttonRect ? (
      <MusicSettingsPortal
        buttonRect={buttonRect}
        panelRef={panelRef}
        placement={placement}
        theme={theme}
        config={config}
        audioCount={audioCount}
        onConfigChange={onConfigChange}
      />
    ) : null;

  if (!config.modelAdapter?.music?.getParameters(config, { audioCount: audioCount ?? 0 }).length) return null;

  return (
    <>
      <span ref={buttonRef} className='inline-flex min-w-0'>
        <Button
          size='small'
          type='text'
          className={buttonClassName || '!h-8 !max-w-[170px] !justify-start !rounded-full !px-2.5'}
          style={{ background: theme.node.fill, color: theme.node.text }}
          icon={<Settings2 className='size-3.5' />}
          onClick={() => setOpen((current) => !current)}
        >
          <span className='truncate'>
            {t('music.settings')}
          </span>
        </Button>
      </span>
      {panel}
    </>
  );
}

function MusicSettingsPortal({
  buttonRect,
  panelRef,
  placement,
  theme,
  config,
  audioCount,
  onConfigChange,
}: {
  buttonRect: DOMRect;
  panelRef: RefObject<HTMLDivElement | null>;
  placement: CanvasMusicSettingsPopoverProps['placement'];
  theme: (typeof canvasThemes)[keyof typeof canvasThemes];
  config: AiConfig;
  audioCount?: number;
  onConfigChange: (music: CanvasMusicValues) => void;
}) {
  const width = 356;
  const gap = 8;
  const margin = 12;
  const alignRight = placement?.endsWith('Right');
  const alignCenter = placement === 'top' || placement === 'bottom';
  const left = alignCenter
    ? buttonRect.left + buttonRect.width / 2 - width / 2
    : alignRight
      ? buttonRect.right - width
      : buttonRect.left;
  const spaceAbove = Math.max(0, buttonRect.top - margin - gap);
  const spaceBelow = Math.max(0, window.innerHeight - buttonRect.bottom - margin - gap);
  const topPlacement = placement?.startsWith('top') ? spaceAbove >= 320 || spaceAbove >= spaceBelow : spaceBelow < 320 && spaceAbove > spaceBelow;
  const style = {
    position: 'fixed',
    zIndex: 1200,
    width: Math.min(width, window.innerWidth - margin * 2),
    boxSizing: 'border-box',
    left: Math.max(margin, Math.min(window.innerWidth - width - margin, left)),
    ...(topPlacement
      ? { bottom: window.innerHeight - buttonRect.top + gap, maxHeight: spaceAbove }
      : {
          top: buttonRect.bottom + gap,
          maxHeight: spaceBelow,
        }),
    background: theme.toolbar.panel,
    borderRadius: 18,
    boxShadow: '0 18px 54px rgba(28, 25, 23, 0.16)',
    padding: 18,
    overflowY: 'auto',
    color: theme.node.text,
  } as const;

  return createPortal(
    <div
      ref={panelRef}
      className='canvas-image-settings-popover custom-scrollbar'
      style={style}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      {config.modelAdapter?.music ? <CanvasMusicSettings
        adapter={config.modelAdapter.music}
        config={config}
        audioCount={audioCount}
        onChange={onConfigChange}
      /> : null}
    </div>,
    document.body,
  );
}
