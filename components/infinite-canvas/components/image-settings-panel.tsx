// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { type ReactNode } from 'react';

import i18n from '../i18n';
import { type CanvasTheme } from '../lib/canvas-theme';
import { getSourceImageModelParameters } from '../runtime/generation/source-model-data';
import { useInfiniteCanvasTranslation } from '../runtime/i18n/infinite-canvas-translation';
import type { AiConfig } from '../stores/use-config-store';

type ImageSettingsPanelProps = {
  config: AiConfig;
  onConfigChange: (key: 'imageResolution' | 'imageVersion' | 'size', value: string) => void;
  theme: CanvasTheme;
  showTitle?: boolean;
  className?: string;
};

type ImageParameterName = 'ratio' | 'resolution' | 'version';

export function imageParameterLabelKey(name: ImageParameterName) {
  return {
    ratio: 'settingsPanels.image.aspectRatio',
    resolution: 'settingsPanels.video.resolution',
    version: 'settingsPanels.image.quality',
  }[name];
}

export function ImageSettingsPanel({
  config,
  onConfigChange,
  theme,
  showTitle = true,
  className = 'w-[320px] space-y-4 rounded-2xl px-1 py-0.5',
}: ImageSettingsPanelProps) {
  const { t } = useInfiniteCanvasTranslation();
  const parameters = getSourceImageModelParameters(config.model, config.modelAdapter);

  return (
    <ImageSettingsTheme theme={theme}>
      <div
        className={className}
        style={{ color: theme.node.text }}
        onMouseDown={(event) => {
          event.stopPropagation();
          if (event.target instanceof HTMLInputElement) return;
          if (
            document.activeElement instanceof HTMLInputElement &&
            event.currentTarget.contains(document.activeElement)
          )
            document.activeElement.blur();
        }}
      >
        {showTitle ? <div className='text-lg font-semibold'>{t('settingsPanels.image.title')}</div> : null}
        {parameters.map((parameter) => {
          const value =
            parameter.name === 'ratio'
              ? config.size
              : parameter.name === 'resolution'
                ? config.imageResolution
                : config.imageVersion;
          const key =
            parameter.name === 'ratio'
              ? 'size'
              : parameter.name === 'resolution'
                ? 'imageResolution'
                : 'imageVersion';
          return (
            <div key={parameter.name} className='space-y-2.5'>
              <SettingTitle color={theme.node.muted}>
                {t(imageParameterLabelKey(parameter.name))}
              </SettingTitle>
              <div className='grid grid-cols-4 gap-2.5'>
                {parameter.options.map((option) =>
                  parameter.name === 'ratio' ? (
                    <RatioOption
                      key={option.value}
                      label={option.name}
                      value={option.value}
                      selected={value === option.value}
                      theme={theme}
                      onClick={() => onConfigChange(key, option.value)}
                    />
                  ) : (
                    <OptionPill
                      key={option.value}
                      selected={value === option.value}
                      theme={theme}
                      onClick={() => onConfigChange(key, option.value)}
                    >
                      {option.name}
                    </OptionPill>
                  ),
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ImageSettingsTheme>
  );
}

export function ImageSettingsTheme({ children }: { theme: CanvasTheme; children: ReactNode }) {
  return children;
}

export function imageQualityLabel(value: string) {
  return value || i18n.t('settingsPanels.common.auto');
}

export function imageSizeLabel(size: string) {
  return size || i18n.t('settingsPanels.common.auto');
}

export function imageResolutionLabel(value: string) {
  return value || i18n.t('settingsPanels.common.auto');
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

function RatioOption({
  label,
  value,
  selected,
  theme,
  onClick,
}: {
  label: string;
  value: string;
  selected: boolean;
  theme: CanvasTheme;
  onClick: () => void;
}) {
  const [width, height] = value.split(':').map(Number);
  const ratio = width && height ? width / height : 1;
  const boxWidth = ratio >= 1 ? 24 : Math.max(10, 24 * ratio);
  const boxHeight = ratio >= 1 ? Math.max(10, 24 / ratio) : 24;
  return (
    <button
      type='button'
      className='flex h-[72px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border bg-transparent text-sm transition hover:opacity-80'
      style={{ borderColor: selected ? theme.node.text : theme.node.stroke, color: theme.node.text }}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={onClick}
    >
      {value === '0:0' ? null : (
        <span className='grid h-7 w-9 place-items-center'>
          <span className='border-2' style={{ width: boxWidth, height: boxHeight, borderColor: theme.node.text }} />
        </span>
      )}
      <span>{label}</span>
    </button>
  );
}

function SettingTitle({ children, color }: { children: string; color: string }) {
  return (
    <div className='text-xs font-medium' style={{ color }}>
      {children}
    </div>
  );
}
