// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { resolveCanvasMusicValues } from '../../lib/canvas/canvas-music-results';
import { useEffect, type CSSProperties } from 'react';
import { Box, Image as ImageIcon, LoaderCircle, Music2, Play, Settings2, Video } from 'lucide-react';
// import { MessageSquare } from 'lucide-react';

import { canvasThemes } from '../../lib/canvas-theme';
import { hasCanvasThreeDModels } from '../../infinite-canvas-model-adapter';
import {
  SOURCE_REFERENCE_VIDEO_MODELS,
  getSourceModelMetadataPatch,
  resolveSourceReferenceVideoModel,
  sourceModelName,
} from '../../runtime/generation/source-model-data';
import { useInfiniteCanvasTranslation } from '../../runtime/i18n/infinite-canvas-translation';
import { useOptionalInfiniteCanvasIntegrations } from '../../runtime/integrations/infinite-canvas-integrations-context';
import { Button, Segmented } from '../../runtime/ui/source-ui';
import {
  defaultConfig,
  resolveModelForCapability,
  useConfigStore,
  useEffectiveConfig,
  type AiConfig,
} from '../../stores/use-config-store';
import { useThemeStore } from '../../stores/use-theme-store';
import type { CanvasGenerationMode, CanvasNodeData, CanvasNodeMetadata } from '../../types/canvas';
import { ModelPicker } from '../model-picker';
import { CanvasImageSettingsPopover } from './canvas-image-settings-popover';
import { CanvasAdvancedSettings } from './canvas-advanced-settings';
// import { CanvasTextSettingsPopover } from './canvas-text-settings-popover';
import { CanvasVideoSettingsPopover } from './canvas-video-settings-popover';
import { CanvasMusicSettingsPopover } from './canvas-music-settings-popover';

export type CanvasConfigInputSummary = {
  textCount: number;
  imageCount: number;
  videoCount: number;
  audioCount: number;
  referenceDurationSeconds?: number;
  referenceVideoDurationSeconds?: number;
  referenceAudioDurationSeconds?: number;
};

type CanvasConfigNodePanelProps = {
  prompt?: string;
  connectedText?: string;
  node: CanvasNodeData;
  unavailableMusicInput?: boolean;
  isRunning: boolean;
  inputSummary: CanvasConfigInputSummary;
  onConfigChange: (nodeId: string, patch: Partial<CanvasNodeMetadata>) => void;
  onGenerate: (nodeId: string) => void;
  onComposerToggle: () => void;
};

export function CanvasConfigNodePanel({
  prompt,
  connectedText,
  node,
  unavailableMusicInput = false,
  isRunning,
  inputSummary,
  onConfigChange,
  onGenerate,
  onComposerToggle,
}: CanvasConfigNodePanelProps) {
  const { i18n, t } = useInfiniteCanvasTranslation();
  const integrations = useOptionalInfiniteCanvasIntegrations();
  const globalConfig = useEffectiveConfig();
  const openConfigDialog = useConfigStore((state) => state.openConfigDialog);
  const theme = canvasThemes[useThemeStore((state) => state.theme)];
  const savedMode = visibleConfigGenerationMode(node.metadata?.generationMode);
  const hasVideoInput = inputSummary.videoCount > 0;
  const preservesInputs = Boolean(globalConfig.modelAdapter?.getUnavailableReason);
  const mode = hasVideoInput && savedMode !== '3d' && !preservesInputs ? 'video' : savedMode;
  const configuredModel = resolveModelForCapability(globalConfig, node.metadata?.model, mode);
  const resolvedModel = preservesInputs ? configuredModel : resolveConfigNodeVideoModel(configuredModel, mode, inputSummary, globalConfig.modelAdapter);
  const config = buildNodeConfig(globalConfig, node, mode, resolvedModel);
  const advancedParameters = mode === 'image' || mode === 'video' ? globalConfig.modelAdapter?.getAdvancedParameters?.(resolvedModel, mode) : undefined;
  const chipStyle = { background: theme.node.fill, borderColor: theme.node.stroke, color: theme.node.text };
  const hasAnyInput = Boolean(
    inputSummary.textCount || inputSummary.imageCount || inputSummary.videoCount || inputSummary.audioCount,
  );
  const hasComposerContent = Boolean((node.metadata?.composerContent ?? node.metadata?.prompt ?? '').trim());
  const unavailable = unavailableMusicInput ? t('music.selectAvailableResult') : mode === '3d' ? undefined : globalConfig.modelAdapter?.getUnavailableReason?.(config, {
    mode, prompt: prompt ?? node.metadata?.composerContent ?? node.metadata?.prompt ?? '', connectedText, ...inputSummary,
  });
  const canGenerate = (hasComposerContent || hasAnyInput || mode === 'music') && !unavailable;
  const videoInputContext = {
    hasAudioSubjects: inputSummary.audioCount > 0,
    hasImage: inputSummary.imageCount > 0,
    hasEndFrame: globalConfig.modelAdapter ? inputSummary.imageCount > 1 : undefined,
    hasVideoSubjects: inputSummary.videoCount > 0,
  };
  const usesReferenceVideoModel = mode === 'video' && hasVideoInput;

  useEffect(() => {
    if (preservesInputs || !hasVideoInput || savedMode === 'video' || savedMode === '3d') return;
    onConfigChange(node.id, {
      ...getSourceModelMetadataPatch(resolvedModel, 'video', videoInputContext, globalConfig.modelAdapter),
      generationMode: 'video',
    });
  }, [
    globalConfig.modelAdapter,
    hasVideoInput,
    node.id,
    onConfigChange,
    resolvedModel,
    savedMode,
    videoInputContext.hasAudioSubjects,
    videoInputContext.hasEndFrame,
    videoInputContext.hasImage,
    videoInputContext.hasVideoSubjects,
  ]);

  useEffect(() => {
    if (
      preservesInputs || savedMode !== 'video' ||
      !usesReferenceVideoModel ||
      sourceModelName(node.metadata?.model || '') === sourceModelName(resolvedModel)
    ) {
      return;
    }
    onConfigChange(
      node.id,
      getSourceModelMetadataPatch(resolvedModel, 'video', {
        hasAudioSubjects: inputSummary.audioCount > 0,
        hasImage: inputSummary.imageCount > 0,
        hasVideoSubjects: true,
      }, globalConfig.modelAdapter),
    );
  }, [
    globalConfig.modelAdapter,
    inputSummary.audioCount,
    inputSummary.imageCount,
    inputSummary.videoCount,
    node.id,
    node.metadata?.model,
    onConfigChange,
    resolvedModel,
    savedMode,
    usesReferenceVideoModel,
  ]);

  return (
    <div
      className='custom-scrollbar flex h-full w-full cursor-move flex-col overflow-y-auto px-3 pb-3 pt-7 text-sm'
      style={{ color: theme.node.text }}
      onDoubleClick={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
    >
      <div className='mb-2 flex flex-wrap items-center justify-between gap-3'>
        <div className='shrink-0 text-sm font-semibold'>{t('canvas.configNode.title')}</div>
        <div className='cursor-default' onMouseDown={(event) => event.stopPropagation()}>
          <Segmented
            size='small'
            className='canvas-config-mode !rounded-md !p-0.5'
            value={mode === 'lyrics' ? 'music' : mode}
            onChange={(value) => {
              const generationMode = value as CanvasGenerationMode;
              const defaults = globalConfig.modelAdapter
                ? getSourceModelMetadataPatch(
                    resolveModelForCapability(globalConfig, undefined, generationMode),
                    generationMode,
                    videoInputContext,
                    globalConfig.modelAdapter,
                  )
                : {};
              onConfigChange(node.id, { ...defaults, generationMode });
            }}
            options={[
              {
                value: 'image',
                disabled: hasVideoInput && !preservesInputs,
                label: (
                  <span className='inline-flex items-center gap-1'>
                    <ImageIcon className='size-3.5' />
                    {t('canvas.configNode.image')}
                  </span>
                ),
              },
              /* Text generation is temporarily hidden; retain its controls for re-enabling.
              {
                value: 'text',
                label: (
                  <span className='inline-flex items-center gap-1'>
                    <MessageSquare className='size-3.5' />
                    {t('canvas.configNode.text')}
                  </span>
                ),
              },
              */
              {
                value: 'video',
                label: (
                  <span className='inline-flex items-center gap-1'>
                    <Video className='size-3.5' />
                    {t('canvas.configNode.video')}
                  </span>
                ),
              },
              ...(globalConfig.modelAdapter?.music ? [
                { value: 'music', label: <span className='inline-flex items-center gap-1'><Music2 className='size-3.5' />{globalConfig.modelAdapter.music.label}</span> },
              ] : []),
              ...(hasCanvasThreeDModels(globalConfig.modelAdapter) && integrations?.renderThreeDPreview ? [{
                value: '3d',
                label: <span className='inline-flex items-center gap-1'><Box className='size-3.5' />{globalConfig.modelAdapter.threeD.label}</span>,
              }] : []),
            ]}
          />
        </div>
      </div>

      {(mode === 'music' || mode === 'lyrics') && globalConfig.modelAdapter?.music?.lyrics ? (
        <div className='mb-3 cursor-default' onMouseDown={(event) => event.stopPropagation()}>
          <Segmented
            size='small'
            value={mode}
            onChange={(value) => onConfigChange(node.id, { generationMode: value as CanvasGenerationMode })}
            options={[
              { value: 'music', label: globalConfig.modelAdapter.music.label },
              { value: 'lyrics', label: globalConfig.modelAdapter.music.lyricsLabel },
            ]}
          />
        </div>
      ) : null}
      <div className='mb-2 flex flex-wrap gap-1.5'>
        <InputChip
          label={t('canvas.configNode.prompt')}
          value={t('canvas.configNode.items', { count: inputSummary.textCount })}
          style={chipStyle}
        />
        {mode !== 'lyrics' ? <>
        <InputChip
          label={t('canvas.configNode.references')}
          value={t('canvas.configNode.images', { count: inputSummary.imageCount })}
          style={chipStyle}
        />
        <InputChip
          label={t('canvas.configNode.videoReferences')}
          value={t('canvas.configNode.items', { count: inputSummary.videoCount })}
          style={chipStyle}
        />
        <InputChip
          label={t('canvas.configNode.audioReferences')}
          value={t('canvas.configNode.items', { count: inputSummary.audioCount })}
          style={chipStyle}
        />
        </> : null}
        <button
          type='button'
          className='inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border px-2 text-[11px]'
          style={chipStyle}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={onComposerToggle}
        >
          <Settings2 className='size-3.5' />
          {t('canvas.configNode.compose')}
        </button>
        {advancedParameters ? (
          <CanvasAdvancedSettings
            parameters={advancedParameters}
            config={config}
            onChange={(patch) => onConfigChange(node.id, patch)}
          />
        ) : null}
      </div>

      <div
        className={`mb-2 grid min-w-0 cursor-default items-center gap-2 ${mode === '3d' || mode === 'lyrics' ? 'grid-cols-1' : 'grid-cols-[minmax(0,1fr)_148px]'}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {mode !== 'lyrics' ? <ModelPicker
          className='canvas-compact-control'
          appearance='integration-form'
          config={config}
          value={config.model}
          onChange={(model) => onConfigChange(node.id, getSourceModelMetadataPatch(model, mode, videoInputContext, globalConfig.modelAdapter))}
          capability={mode === 'lyrics' ? 'music' : mode}
          allowedModels={mode === 'lyrics' ? globalConfig.modelAdapter?.music?.lyricsModels : !preservesInputs && usesReferenceVideoModel ? (globalConfig.modelAdapter
            ? [...globalConfig.modelAdapter.referenceVideoModels, ...globalConfig.modelAdapter.videoToVideoModels]
            : SOURCE_REFERENCE_VIDEO_MODELS) : undefined}
          onMissingConfig={() => openConfigDialog(true)}
          fullWidth
        /> : globalConfig.modelAdapter?.music?.lyrics ? (
          <label className='flex items-center justify-between gap-3 text-sm'>
            {globalConfig.modelAdapter.music.lyrics.languageLabel}
            <select
              className='custom-scrollbar h-9 rounded-lg border px-2'
              style={chipStyle}
              value={String(config.music?.language || globalConfig.modelAdapter.music.lyrics.defaultLanguage)}
              onChange={(event) => onConfigChange(node.id, { music: { ...config.music, language: event.target.value } })}
            >
              {globalConfig.modelAdapter.music.lyrics.languages.map((language) => <option key={language.value} value={language.value}>{language.label}</option>)}
            </select>
          </label>
        ) : null}
        {mode === 'music' && globalConfig.modelAdapter?.music ? (
          <CanvasMusicSettingsPopover
            config={config}
            audioCount={inputSummary.audioCount}
            placement='topRight'
            buttonClassName='canvas-compact-control !h-10 !w-full !justify-start !rounded-lg !px-2'
            onConfigChange={(music) => onConfigChange(node.id, { music })}
          />
        ) : mode === 'video' ? (
          <CanvasVideoSettingsPopover
            config={config}
            inputContext={videoInputContext}
            placement='topRight'
            buttonClassName='canvas-compact-control !h-10 !w-full !justify-start !rounded-lg !px-2'
            onConfigChange={(key, value) => onConfigChange(node.id, videoConfigPatch(key, value))}
          />
        ) : mode === 'image' ? (
          <CanvasImageSettingsPopover
            config={config}
            placement='topRight'
            autoAdjustOverflow={false}
            buttonClassName='canvas-compact-control !h-10 !w-full !justify-start !rounded-lg !px-2'
            onConfigChange={(key, value) => onConfigChange(node.id, { [key]: value })}
          />
        ) : (
          /* Text generation settings are temporarily hidden, not removed.
          <CanvasTextSettingsPopover
            config={config}
            placement='topRight'
            buttonClassName='canvas-compact-control !h-10 !w-full !justify-start !rounded-lg !px-2'
            onConfigChange={(_, value) => onConfigChange(node.id, { reasoningEffort: value })}
          />
          */
          null
        )}
      </div>

      {unavailable ? <p className='mb-2 text-xs text-red-400' role='status'>{unavailable}</p> : null}
      {(mode === 'image' || mode === 'video') && integrations?.renderGenerationPrice ? (
        <div className='mb-1 cursor-default text-center text-xs' onMouseDown={(event) => event.stopPropagation()}>
          {integrations.renderGenerationPrice({ config, mode, ...inputSummary })}
        </div>
      ) : null}

      {isRunning ? (
        <div className='mt-auto flex h-9 w-full items-center justify-center gap-1.5 rounded-lg'>
          <LoaderCircle className='size-4 animate-spin' aria-hidden='true' />
          <span className='sr-only' role='status'>
            {i18n.generation.paidTaskContinues}
          </span>
          <span aria-hidden='true'>{i18n.generation.generating}</span>
        </div>
      ) : (
        <Button
          type='primary'
          className='mt-auto !h-9 !w-full !cursor-pointer !rounded-lg'
          disabled={!canGenerate}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={() => onGenerate(node.id)}
        >
          <span className='inline-flex items-center gap-1.5'>
            <Play className='size-4' />
            <span>{t('canvas.configNode.generate')}</span>
          </span>
        </Button>
      )}
    </div>
  );
}

function InputChip({ label, value, style }: { label: string; value: string; style: CSSProperties }) {
  return (
    <div className='inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11px]' style={style}>
      <span>{label}</span>
      <span className='font-medium'>{value}</span>
    </div>
  );
}

function buildNodeConfig(
  globalConfig: AiConfig,
  node: CanvasNodeData,
  mode: CanvasGenerationMode,
  model = resolveModelForCapability(globalConfig, node.metadata?.model, mode),
): AiConfig {
  return {
    ...globalConfig,
    music: resolveCanvasMusicValues(node),
    model,
    seed: node.metadata?.seed ?? globalConfig.seed,
    negativePrompt: node.metadata?.negativePrompt ?? globalConfig.negativePrompt,
    isTranslate: node.metadata?.isTranslate ?? globalConfig.isTranslate,
    imageResolution:
      node.metadata?.imageResolution || globalConfig.imageResolution || defaultConfig.imageResolution,
    imageVersion: node.metadata?.imageVersion ?? node.metadata?.quality ?? globalConfig.imageVersion,
    reasoningEffort: node.metadata?.reasoningEffort || globalConfig.reasoningEffort || defaultConfig.reasoningEffort,
    quality: node.metadata?.quality || globalConfig.quality || defaultConfig.quality,
    size: node.metadata?.size || globalConfig.size || defaultConfig.size,
    background: node.metadata?.background ?? globalConfig.background ?? defaultConfig.background,
    videoSeconds: node.metadata?.seconds || globalConfig.videoSeconds || defaultConfig.videoSeconds,
    vquality: node.metadata?.vquality || globalConfig.vquality || defaultConfig.vquality,
    videoGenerateAudio:
      node.metadata?.generateAudio || globalConfig.videoGenerateAudio || defaultConfig.videoGenerateAudio,
    videoWatermark: node.metadata?.watermark || globalConfig.videoWatermark || defaultConfig.videoWatermark,
    audioVoice: node.metadata?.audioVoice || globalConfig.audioVoice || defaultConfig.audioVoice,
    audioFormat: node.metadata?.audioFormat || globalConfig.audioFormat || defaultConfig.audioFormat,
    audioSpeed: node.metadata?.audioSpeed || globalConfig.audioSpeed || defaultConfig.audioSpeed,
    audioInstructions:
      node.metadata?.audioInstructions || globalConfig.audioInstructions || defaultConfig.audioInstructions,
    count: String(
      node.metadata?.count ||
        (mode === 'image' ? globalConfig.canvasImageCount || globalConfig.count : globalConfig.count) ||
        defaultConfig.count,
    ),
  };
}

function videoConfigPatch(key: keyof AiConfig, value: string) {
  if (key === 'videoSeconds') return { seconds: value };
  if (key === 'videoGenerateAudio') return { generateAudio: value };
  if (key === 'videoWatermark') return { watermark: value };
  return { [key]: value };
}

export function visibleConfigGenerationMode(mode?: CanvasGenerationMode): 'image' | 'video' | '3d' | 'music' | 'lyrics' {
  // Restore this resolver together with the commented Text controls when re-enabling Text mode.
  // return mode === 'audio' ? 'image' : mode || 'image';
  return mode === 'music' || mode === 'lyrics' || mode === '3d' || mode === 'video' ? mode : 'image';
}

export function resolveConfigNodeVideoModel(
  model: string,
  mode: CanvasGenerationMode,
  inputSummary: CanvasConfigInputSummary,
  adapter?: AiConfig['modelAdapter'],
): string {
  if (adapter?.videoToVideoModels.includes(sourceModelName(model))) return model;
  return mode === 'video' && inputSummary.videoCount > 0
    ? resolveSourceReferenceVideoModel(model, adapter)
    : model;
}
