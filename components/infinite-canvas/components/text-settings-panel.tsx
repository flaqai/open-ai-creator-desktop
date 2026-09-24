// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { type ReactNode } from 'react';

import i18n from '../i18n';
import { type CanvasTheme } from '../lib/canvas-theme';
import { useInfiniteCanvasTranslation } from '../runtime/i18n/infinite-canvas-translation';
import type { AiConfig, ReasoningEffort } from '../stores/use-config-store';
import { ImageSettingsTheme } from './image-settings-panel';

const reasoningEffortOptions: ReasoningEffort[] = ['auto', 'low', 'medium', 'high', 'xhigh'];

type TextSettingsPanelProps = {
  config: AiConfig;
  onConfigChange: (key: 'reasoningEffort', value: ReasoningEffort) => void;
  theme: CanvasTheme;
  className?: string;
};

export function TextSettingsPanel({ config, onConfigChange, theme, className = 'space-y-4' }: TextSettingsPanelProps) {
  const { t } = useInfiniteCanvasTranslation();
  return (
    <ImageSettingsTheme theme={theme}>
      <div className={className} style={{ color: theme.node.text }} onMouseDown={(event) => event.stopPropagation()}>
        <div className='text-lg font-semibold'>{t('settingsPanels.text.title')}</div>
        <div className='space-y-2.5'>
          <div className='text-sm font-medium' style={{ color: theme.node.muted }}>
            {t('settingsPanels.text.reasoning')}
          </div>
          <div className='grid grid-cols-5 gap-2'>
            {reasoningEffortOptions.map((value) => (
              <OptionPill
                key={value}
                selected={config.reasoningEffort === value}
                theme={theme}
                onClick={() => onConfigChange('reasoningEffort', value)}
              >
                {t(`settingsPanels.common.${value}`)}
              </OptionPill>
            ))}
          </div>
        </div>
      </div>
    </ImageSettingsTheme>
  );
}

export function reasoningEffortLabel(value: ReasoningEffort) {
  return reasoningEffortOptions.includes(value) ? i18n.t(`settingsPanels.common.${value}`) : value;
}

function OptionPill({
  selected,
  theme,
  onClick,
  children,
}: {
  selected: boolean;
  theme: CanvasTheme;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type='button'
      className='h-9 cursor-pointer rounded-full border px-2 text-sm transition hover:opacity-80'
      style={{
        background: 'transparent',
        borderColor: selected ? theme.node.text : theme.node.stroke,
        color: theme.node.text,
      }}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
