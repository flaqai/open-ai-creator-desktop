// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { type ReactNode } from 'react';

import i18n from '../i18n';
import { type CanvasTheme } from '../lib/canvas-theme';
import {
  getSourceVideoParameterState,
  type SourceVideoInputContext,
} from '../runtime/generation/source-model-data';
import { useInfiniteCanvasTranslation } from '../runtime/i18n/infinite-canvas-translation';
import { Switch } from '../runtime/ui/source-ui';
import { type AiConfig } from '../stores/use-config-store';
import { ImageSettingsTheme } from './image-settings-panel';

type VideoSettingsPanelProps = {
  config: AiConfig;
  inputContext?: SourceVideoInputContext;
  onConfigChange: (key: 'vquality' | 'size' | 'videoSeconds' | 'videoGenerateAudio', value: string) => void;
  theme: CanvasTheme;
  showTitle?: boolean;
  className?: string;
};

export function VideoSettingsPanel({
  config,
  inputContext,
  onConfigChange,
  theme,
  showTitle = true,
  className = 'w-[320px] space-y-4 rounded-2xl px-1 py-0.5',
}: VideoSettingsPanelProps) {
  const { t } = useInfiniteCanvasTranslation();
  const modelConfig = getSourceVideoParameterState(
    config.model,
    {
      duration: config.videoSeconds,
      enableAudio: config.videoGenerateAudio === 'true',
      ratio: config.size,
      resolution: config.vquality,
    },
    inputContext,
    config.modelAdapter,
  );
  const { durations, ratios, resolutions, audioDisabled, showAudioToggle } = modelConfig.ui;

  return (
    <ImageSettingsTheme theme={theme}>
      <div className={className} style={{ color: theme.node.text }} onMouseDown={(event) => event.stopPropagation()}>
        {showTitle ? <div className='text-lg font-semibold'>{t('settingsPanels.video.title')}</div> : null}
        {resolutions.length ? (
          <SettingGroup title={t('settingsPanels.video.resolution')} color={theme.node.muted}>
            <div className='grid grid-cols-3 gap-2.5'>
              {resolutions.map((option) => (
                <OptionPill
                  key={option.value}
                  disabled={option.disabled}
                  selected={modelConfig.resolution === option.value}
                  theme={theme}
                  onClick={() => onConfigChange('vquality', option.value)}
                >
                  {option.name}
                </OptionPill>
              ))}
            </div>
          </SettingGroup>
        ) : null}
        {durations.length ? (
          <SettingGroup title={t('settingsPanels.video.duration')} color={theme.node.muted}>
            <div className='grid grid-cols-4 gap-2.5'>
              {durations.map((option) => (
                <OptionPill
                  key={option.value}
                  disabled={option.disabled}
                  selected={modelConfig.duration === option.value}
                  theme={theme}
                  onClick={() => onConfigChange('videoSeconds', option.value)}
                >
                  {option.name}
                </OptionPill>
              ))}
            </div>
          </SettingGroup>
        ) : null}
        {ratios.length ? (
          <SettingGroup title={t('settingsPanels.video.ratio')} color={theme.node.muted}>
            <div className='grid grid-cols-3 gap-2.5'>
              {ratios.map((option) => (
                <RatioOption
                  key={option.value}
                  disabled={option.disabled}
                  label={option.name}
                  value={option.value}
                  selected={modelConfig.ratio === option.value}
                  theme={theme}
                  onClick={() => onConfigChange('size', option.value)}
                />
              ))}
            </div>
          </SettingGroup>
        ) : null}
        {showAudioToggle ? (
          <SettingGroup title={t('settingsPanels.video.output')} color={theme.node.muted}>
            <div className='grid gap-2 rounded-xl border p-2.5' style={{ borderColor: theme.node.stroke }}>
              <SwitchRow
                label={t('settingsPanels.video.generateAudio')}
                checked={modelConfig.enableAudio}
                disabled={audioDisabled}
                theme={theme}
                onChange={(checked) => onConfigChange('videoGenerateAudio', String(checked))}
              />
            </div>
          </SettingGroup>
        ) : null}
      </div>
    </ImageSettingsTheme>
  );
}

export function videoResolutionLabel(value: string) {
  return value || i18n.t('settingsPanels.common.auto');
}

export function videoSizeLabel(value: string) {
  return value || i18n.t('settingsPanels.common.auto');
}

export function videoSecondsLabel(value: string) {
  return value || i18n.t('settingsPanels.common.auto');
}

function OptionPill({
  selected,
  disabled = false,
  theme,
  onClick,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  theme: CanvasTheme;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type='button'
      disabled={disabled}
      className='h-9 cursor-pointer rounded-full border px-2 text-sm transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-35'
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

function RatioOption({
  label,
  value,
  selected,
  disabled,
  theme,
  onClick,
}: {
  label: string;
  value: string;
  selected: boolean;
  disabled?: boolean;
  theme: CanvasTheme;
  onClick: () => void;
}) {
  const [width, height] = value.split(':').map(Number);
  return (
    <button
      type='button'
      disabled={disabled}
      className='flex h-[68px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border bg-transparent px-1 text-sm transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-35'
      style={{ borderColor: selected ? theme.node.text : theme.node.stroke, color: theme.node.text }}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={onClick}
    >
      <SizePreview width={width} height={height} color={theme.node.text} />
      <span>{label}</span>
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

function SizePreview({ width, height, color }: { width: number; height: number; color: string }) {
  if (!width || !height) return null;
  const longSide = Math.max(width, height);
  const previewWidth = Math.max(10, Math.round((width / longSide) * 26));
  const previewHeight = Math.max(10, Math.round((height / longSide) * 26));
  return (
    <span
      className='rounded-[3px] border-2'
      style={{ width: previewWidth, height: previewHeight, borderColor: color }}
    />
  );
}

function SwitchRow({
  label,
  checked,
  disabled,
  theme,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  theme: CanvasTheme;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className='flex h-8 items-center justify-between gap-3' style={{ opacity: disabled ? 0.45 : 1 }}>
      <span className='text-sm' style={{ color: theme.node.text }}>
        {label}
      </span>
      <span onMouseDown={(event) => event.stopPropagation()}>
        <Switch size='small' checked={checked} disabled={disabled} onChange={onChange} />
      </span>
    </div>
  );
}
