// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { type ReactNode } from 'react';

import {
  audioVoiceOptions,
  normalizeAudioVoiceValue,
} from '../lib/audio-generation';
import { type CanvasTheme } from '../lib/canvas-theme';
import { useInfiniteCanvasTranslation } from '../runtime/i18n/infinite-canvas-translation';
import type { AiConfig } from '../stores/use-config-store';
import { ImageSettingsTheme } from './image-settings-panel';

type AudioSettingKey = 'audioVoice';

type AudioSettingsPanelProps = {
  config: AiConfig;
  onConfigChange: (key: AudioSettingKey, value: string) => void;
  theme: CanvasTheme;
  showTitle?: boolean;
  className?: string;
};

export function AudioSettingsPanel({
  config,
  onConfigChange,
  theme,
  showTitle = true,
  className = 'w-[320px] space-y-4 rounded-2xl px-1 py-0.5',
}: AudioSettingsPanelProps) {
  const { t } = useInfiniteCanvasTranslation();
  const voice = normalizeAudioVoiceValue(config.audioVoice);

  return (
    <ImageSettingsTheme theme={theme}>
      <div className={className} style={{ color: theme.node.text }} onMouseDown={(event) => event.stopPropagation()}>
        {showTitle ? <div className='text-lg font-semibold'>{t('settingsPanels.audio.title')}</div> : null}
        <SettingGroup title={t('settingsPanels.audio.voice')} color={theme.node.muted}>
          <div className='grid grid-cols-3 gap-2.5'>
            {audioVoiceOptions.map((item) => (
              <OptionPill
                key={item.value}
                selected={voice === item.value}
                theme={theme}
                onClick={() => onConfigChange('audioVoice', item.value)}
              >
                {item.label}
              </OptionPill>
            ))}
          </div>
        </SettingGroup>
      </div>
    </ImageSettingsTheme>
  );
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

function SettingGroup({ title, color, children }: { title: string; color: string; children: ReactNode }) {
  return (
    <div className='space-y-2.5'>
      <div className='text-xs font-medium' style={{ color }}>
        {title}
      </div>
      {children}
    </div>
  );
}
