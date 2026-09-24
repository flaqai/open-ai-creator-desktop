// -nocheck
// Pinned OSS source; application routing and locale switching are compatibility substitutions.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import type { CSSProperties } from 'react';
import { BookOpen, Globe2, Keyboard, Puzzle, Settings2, Workflow } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { canvasThemes } from '../../lib/canvas-theme';
import { useInfiniteCanvasI18n } from '../../runtime/i18n/infinite-canvas-context';
import { useInfiniteCanvasIntegrations } from '../../runtime/integrations/infinite-canvas-integrations-context';
import { Tooltip } from '../../runtime/ui/source-ui';
import { useConfigStore } from '../../stores/use-config-store';
import { useThemeStore } from '../../stores/use-theme-store';
import { AnimatedThemeToggler } from '../ui/animated-theme-toggler';
import { isDesktopRuntime } from '@/lib/desktop/runtime';

type UserStatusActionsProps = {
  showConfig?: boolean;
  variant?: 'default' | 'canvas';
  onOpenShortcuts?: () => void;
  onOpenPlugins?: () => void;
  onHome?: () => void;
  onDashboard?: () => void;
  onDocs?: () => void;
  onChangeLocale?: (locale: string) => void;
};

export function UserStatusActions({
  showConfig = true,
  variant = 'default',
  onOpenShortcuts,
  onOpenPlugins,
  onHome,
  onDashboard,
  onDocs,
  onChangeLocale,
}: UserStatusActionsProps) {
  const i18n = useInfiniteCanvasI18n();
  const integrations = useInfiniteCanvasIntegrations();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const openConfigDialog = useConfigStore((state) => state.openConfigDialog);
  const canvasTheme = canvasThemes[theme];
  const naturalIconClass =
    'inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-canvas-text/70 transition-colors hover:bg-canvas-muted-accent/10 hover:text-canvas-accent [&_svg]:size-4';
  const iconStyle: CSSProperties | undefined = variant === 'canvas' ? { color: canvasTheme.node.text } : undefined;
  const currentLocale = i18n.locales.find((locale) => locale.value === i18n.locale);

  return (
    <div className='inline-flex shrink-0 items-center gap-1'>
      {onOpenPlugins ? (
        <button
          type='button'
          className={naturalIconClass}
          style={iconStyle}
          onClick={onOpenPlugins}
          aria-label={i18n.navigation.plugins}
          title={i18n.navigation.plugins}
        >
          <Puzzle aria-hidden='true' />
        </button>
      ) : null}
      {onHome ? (
        <button
          type='button'
          onClick={onHome}
          className={naturalIconClass}
          style={iconStyle}
          aria-label={i18n.navigation.landing}
          title={i18n.navigation.landing}
        >
          <CanvasHomeIcon theme={theme} />
        </button>
      ) : null}
      {onDashboard ? (
        <button
          type='button'
          onClick={onDashboard}
          className={naturalIconClass}
          style={iconStyle}
          aria-label={i18n.navigation.dashboard}
          title={i18n.navigation.dashboard}
        >
          <Workflow aria-hidden='true' />
        </button>
      ) : null}
      <button
        type='button'
        onClick={onDocs ?? integrations.navigateToDocs}
        className={naturalIconClass}
        style={iconStyle}
        aria-label={i18n.navigation.docs}
        title={i18n.navigation.docs}
      >
        <BookOpen aria-hidden='true' />
      </button>
      {showConfig ? (
        <button
          type='button'
          className={naturalIconClass}
          style={iconStyle}
          onClick={() => openConfigDialog(false)}
          aria-label={i18n.navigation.dashboard}
          title={i18n.navigation.dashboard}
        >
          <Settings2 aria-hidden='true' />
        </button>
      ) : null}
      <Select value={i18n.locale} onValueChange={onChangeLocale ?? integrations.changeLocale}>
        <Tooltip title={i18n.navigation.switchLanguage} mouseEnterDelay={0.2}>
          <SelectTrigger
            className='h-8 w-auto min-w-16 gap-1 border-0 bg-transparent px-2 text-xs text-canvas-text/70 shadow-none hover:bg-canvas-muted-accent/10 hover:text-canvas-accent'
            aria-label={i18n.navigation.switchLanguage}
          >
            <Globe2 className='size-4' aria-hidden='true' />
            <SelectValue>{currentLocale?.shortLabel ?? i18n.locale.toUpperCase()}</SelectValue>
          </SelectTrigger>
        </Tooltip>
        <SelectContent className='z-[140] border-canvas-border bg-canvas-panel text-canvas-text'>
          {i18n.locales.map((locale) => (
            <SelectItem key={locale.value} value={locale.value}>
              {locale.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!isDesktopRuntime() && <AnimatedThemeToggler
        theme={theme}
        onThemeChange={setTheme}
        className={naturalIconClass}
        style={iconStyle}
        aria-label={theme === 'dark' ? i18n.navigation.lightTheme : i18n.navigation.darkTheme}
        title={theme === 'dark' ? i18n.navigation.lightTheme : i18n.navigation.darkTheme}
      />}
      {onOpenShortcuts ? (
        <button
          type='button'
          className={naturalIconClass}
          style={iconStyle}
          onClick={onOpenShortcuts}
          aria-label={i18n.navigation.shortcuts}
          title={i18n.navigation.shortcuts}
        >
          <Keyboard aria-hidden='true' />
        </button>
      ) : null}
    </div>
  );
}

function CanvasHomeIcon({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke={theme === 'dark' ? '#E8E8EA' : '#202124'}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      focusable='false'
    >
      <path d='M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8' />
      <path d='M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
    </svg>
  );
}
