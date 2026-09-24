// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { useEffect, useMemo, useState } from 'react';
import { ArrowUp, LoaderCircle, Maximize2 } from 'lucide-react';


import { AiCanvasPromptLibrary } from '@/components/canvas-shared/components/ai-canvas-prompt-library/ai-canvas-prompt-library';
import { canvasThemes } from '../../lib/canvas-theme';
import type { CanvasResourceReference } from '../../lib/canvas/canvas-resource-references';
import {
  SOURCE_REFERENCE_VIDEO_MODELS,
  getSourceModelMetadataPatch,
  getSourceVideoModelConfig,
  getSourceVideoModelDefaults,
  resolveSourceReferenceVideoModel,
  sourceModelName,
} from '../../runtime/generation/source-model-data';
import { useInfiniteCanvasTranslation } from '../../runtime/i18n/infinite-canvas-translation';
import { useOptionalInfiniteCanvasIntegrations } from '../../runtime/integrations/infinite-canvas-integrations-context';
import type { CanvasConfigInputSummary } from './canvas-config-node-panel';
import { App, Button, Modal, Segmented, Tooltip } from '../../runtime/ui/source-ui';
import {
  defaultConfig,
  resolveModelForCapability,
  useConfigStore,
  useEffectiveConfig,
  type AiConfig,
} from '../../stores/use-config-store';
import { useThemeStore } from '../../stores/use-theme-store';
import { CanvasNodeType, type CanvasGenerationMode, type CanvasNodeData } from '../../types/canvas';
import { ModelPicker } from '../model-picker';
import { CanvasAudioSettingsPopover, type CanvasAudioSettingKey } from './canvas-audio-settings-popover';
import { CanvasImageSettingsPopover } from './canvas-image-settings-popover';
import { resolveCanvasMusicValues } from '../../lib/canvas/canvas-music-results';
import { CanvasMusicComposerFields } from './canvas-music-composer-fields';
import { CanvasMusicSettingsPopover } from './canvas-music-settings-popover';
import { CanvasPromptChipInput } from './canvas-prompt-chip-input';
import { CanvasVideoSettingsPopover } from './canvas-video-settings-popover';

export type CanvasNodeGenerationMode = CanvasGenerationMode;

type CanvasNodePromptPanelProps = {
  node: CanvasNodeData;
  unavailableMusicInput?: boolean;
  isRunning: boolean;
  onPromptChange: (nodeId: string, prompt: string) => void;
  onContentChange: (nodeId: string, content: string) => void;
  onConfigChange: (nodeId: string, patch: Partial<CanvasNodeData['metadata']>) => void;
  onGenerate: (nodeId: string, mode: CanvasNodeGenerationMode, prompt: string) => void;
  mentionReferences?: CanvasResourceReference[];
  priceInputSummary?: CanvasConfigInputSummary;
  onImageSettingsOpenChange?: (open: boolean) => void;
  modeOverride?: CanvasNodeGenerationMode; // Plugin nodes set their generation type through useBuiltinPanel.mode.
};

export function CanvasNodePromptPanel({
  node,
  unavailableMusicInput = false,
  isRunning,
  onPromptChange,
  onContentChange,
  onConfigChange,
  onGenerate,
  mentionReferences = [],
  priceInputSummary,
  onImageSettingsOpenChange,
  modeOverride,
}: CanvasNodePromptPanelProps) {
  const { message } = App.useApp();
  const { i18n, t } = useInfiniteCanvasTranslation();
  const integrations = useOptionalInfiniteCanvasIntegrations();
  const globalConfig = useEffectiveConfig();
  const openConfigDialog = useConfigStore((state) => state.openConfigDialog);
  const theme = canvasThemes[useThemeStore((state) => state.theme)];
  const mode = modeOverride ?? (node.metadata?.generationMode === 'music' ? 'music' : defaultMode(node.type));
  const isTextNode = node.type === CanvasNodeType.Text;
  const hasTextContent = node.type === CanvasNodeType.Text && Boolean(node.metadata?.content?.trim());
  const hasImageContent = node.type === CanvasNodeType.Image && Boolean(node.metadata?.content);
  const hasSourceVideoReference = node.type === CanvasNodeType.Video && Boolean(node.metadata?.content);
  const config = buildNodeConfig(globalConfig, node, mode, hasSourceVideoReference);
  const isEditingExistingContent = hasTextContent || hasImageContent;
  const [prompt, setPrompt] = useState(
    isTextNode ? (node.metadata?.content ?? '') : (node.metadata?.composerContent ?? node.metadata?.prompt ?? ''),
  );
  const [optimizationMedia, setOptimizationMedia] = useState<'image' | 'video'>('image');
  const [optimizing, setOptimizing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeMusicField, setActiveMusicField] = useState('');
  const isBusy = isRunning || optimizing;
  const videoInputContext = {
    hasAudioSubjects: mentionReferences.some((reference) => reference.kind === 'audio'),
    hasImage: mentionReferences.some((reference) => reference.kind === 'image'),
    hasEndFrame: globalConfig.modelAdapter ? mentionReferences.filter((reference) => reference.kind === 'image').length > 1 : undefined,
    hasVideoSubjects:
      hasSourceVideoReference || mentionReferences.some((reference) => reference.kind === 'video'),
  };
  const videoModelConfig =
    mode === 'video'
      ? getSourceVideoModelConfig(
          config.model,
          {
            duration: config.videoSeconds,
            enableAudio: config.videoGenerateAudio === 'true',
            ratio: config.size,
            resolution: config.vquality,
          },
          videoInputContext,
          config.modelAdapter,
        )
      : null;
  const promptOptional = mode === 'music';
  const musicFields = mode === 'music' ? config.modelAdapter?.music?.getComposerParameters?.(config, { hasMusicResult: Boolean(node.metadata?.musicRecordId), audioCount: mentionReferences.filter((reference) => reference.kind === 'audio').length }) : undefined;
  const selectedMusicField = musicFields?.find((field) => !field.disabled && field.key === activeMusicField) || musicFields?.find((field) => !field.disabled);
  const unavailable = unavailableMusicInput ? t('music.selectAvailableResult') : ['image', 'video', 'music'].includes(mode)
    ? config.modelAdapter?.getUnavailableReason?.(config, {
        mode, prompt, connectedText: mentionReferences.filter((reference) => reference.kind === 'text').map((reference) => reference.text || '').join('\n\n'),
        imageCount: mentionReferences.filter((reference) => reference.kind === 'image').length + (hasImageContent ? 1 : 0),
        videoCount: mentionReferences.filter((reference) => reference.kind === 'video').length + (hasSourceVideoReference ? 1 : 0),
        audioCount: mentionReferences.filter((reference) => reference.kind === 'audio').length,
        referenceAudioDurationSeconds: priceInputSummary?.referenceAudioDurationSeconds,
      })
    : undefined;
  const missingRequiredVideoImage = videoModelConfig?.ui.requiresImage === true && !videoInputContext.hasImage;

  // Restore prompts only when switching nodes; preserve the current input after generation on the same node.
  useEffect(() => {
    setPrompt(
      isTextNode ? (node.metadata?.content ?? '') : (node.metadata?.composerContent ?? node.metadata?.prompt ?? ''),
    );
    setOptimizationMedia('image');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id]);

  useEffect(() => {
    if (isTextNode) setPrompt(node.metadata?.content ?? '');
  }, [isTextNode, node.metadata?.content]);

  const updatePrompt = (value: string) => {
    setPrompt(value);
    if (isTextNode) onContentChange(node.id, value);
    else if (isEditingExistingContent) onConfigChange(node.id, { composerContent: value });
    else onPromptChange(node.id, value);
  };

  const updateActiveField = (value: string) => {
    const fields = musicFields?.filter((field) => !field.disabled) || [];
    const field = fields.find((item) => item.key === activeMusicField) || fields[0];
    if (field?.readOnly) return;
    if (!field || field.key === 'style' || field.key === 'prompt') updatePrompt(value);
    else onConfigChange(node.id, { music: { ...config.music, [field.key]: value, ...(field.key === 'lyrics' ? { lyricsEdited: true } : {}) } });
  };

  const submit = () => {
    const text = prompt.trim();
    if ((!text && !promptOptional) || missingRequiredVideoImage || unavailable || isBusy) return;
    if (isTextNode) {
      setOptimizing(true);
      const request = integrations?.optimizePrompt
        ? integrations.optimizePrompt(text, optimizationMedia)
        : Promise.reject(new Error(t('modelAdapter.unavailable')));
      void request
        .then((response) => {
          const optimizedPrompt = response.trim();
          if (!optimizedPrompt) throw new Error(t('canvas.projectPage.generationFailed'));
          setPrompt(optimizedPrompt);
          onContentChange(node.id, optimizedPrompt);
        })
        .catch((error: unknown) => {
          console.error(error);
          message.error(error instanceof Error ? error.message : t('canvas.projectPage.generationFailed'));
        })
        .finally(() => setOptimizing(false));
      return;
    }
    onGenerate(node.id, mode, text);
  };

  const openExpandedEditor = () => {
    setExpanded(true);
  };

  return (
    <div
      data-canvas-no-zoom
      className='rounded-2xl border p-3 shadow-2xl backdrop-blur'
      style={{ background: theme.toolbar.panel, borderColor: theme.toolbar.border, color: theme.node.text }}
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
    >
      {musicFields?.length ? <CanvasMusicComposerFields key={node.id} activeKey={activeMusicField} onActiveKeyChange={setActiveMusicField} config={config} fields={musicFields} prompt={prompt}
        connectedText={mentionReferences.filter((reference) => reference.kind === 'text').map((reference) => reference.text || '').join('\n\n')}
        onPromptChange={updatePrompt} onMusicChange={(music) => onConfigChange(node.id, { music })} /> : <CanvasPromptChipInput
        value={prompt}
        references={mentionReferences}
        onChange={updatePrompt}
        onSubmit={submit}
        className='thin-scrollbar h-40 w-full cursor-text resize-none rounded-xl px-3 py-2 text-sm leading-5 outline-none'
        style={{ background: 'transparent', color: theme.node.text }}
        placeholder={t(
          `canvas.promptPanel.${mode === 'image' && hasImageContent ? 'editImage' : mode === 'text' && hasTextContent ? 'editText' : mode}`,
        )}
      />}

      {unavailable ? <p className='mb-2 text-xs text-red-400' role='status'>{unavailable}</p> : null}
      {(mode === 'image' || mode === 'video') && priceInputSummary && integrations?.renderGenerationPrice ? (
        <div className='mt-2 text-right text-xs'>
          {integrations.renderGenerationPrice({ config, mode, ...priceInputSummary })}
        </div>
      ) : null}
      <div className='mt-2 flex min-w-0 items-center justify-between gap-2'>
        <div className='flex min-w-0 items-center gap-2'>
          <Tooltip title={t('canvas.promptPanel.expandEditor')}>
            <Button
              type='text'
              className='!h-8 !w-8 !min-w-8 shrink-0 !rounded-full !bg-transparent !p-0'
              style={{ color: theme.node.text }}
              icon={<Maximize2 className='size-3.5' />}
              onClick={openExpandedEditor}
              aria-label={t('canvas.promptPanel.expandEditor')}
            />
          </Tooltip>
          <span inert={selectedMusicField?.readOnly || undefined} className={selectedMusicField?.readOnly ? 'cursor-not-allowed opacity-40' : undefined}>
            <AiCanvasPromptLibrary mode='dialog' onSelectPrompt={(item) => updateActiveField(item.prompt)} />
          </span>
          {mode === 'image' ? (
            <>
              <ModelPicker
                config={config}
                value={config.model}
                onChange={(model) => onConfigChange(node.id, getSourceModelMetadataPatch(model, 'image', {}, config.modelAdapter))}
                capability='image'
                onMissingConfig={() => openConfigDialog(true)}
                className='max-w-[190px]'
              />
              <CanvasImageSettingsPopover
                config={config}
                placement='topLeft'
                buttonClassName='!h-10 !max-w-[170px] !justify-start !rounded-full !px-3'
                onConfigChange={(key, value) => onConfigChange(node.id, { [key]: value })}
                onMissingConfig={() => openConfigDialog(true)}
                onOpenChange={onImageSettingsOpenChange}
              />
            </>
          ) : mode === 'video' ? (
            <>
              <ModelPicker
                config={config}
                value={config.model}
                onChange={(model) =>
                  onConfigChange(node.id, getSourceModelMetadataPatch(model, 'video', videoInputContext, config.modelAdapter))
                }
                capability='video'
                allowedModels={
                  hasSourceVideoReference && !config.modelAdapter?.getUnavailableReason
                    ? (config.modelAdapter?.referenceVideoModels ?? SOURCE_REFERENCE_VIDEO_MODELS)
                    : undefined
                }
                onMissingConfig={() => openConfigDialog(true)}
                className='max-w-[190px]'
              />
              <CanvasVideoSettingsPopover
                config={config}
                inputContext={videoInputContext}
                buttonClassName='!h-10 !max-w-[170px] !justify-start !rounded-full !px-3'
                onConfigChange={(key, value) => onConfigChange(node.id, videoConfigPatch(key, value))}
              />
            </>
          ) : mode === 'music' ? (
            <>
            <ModelPicker config={config} value={config.model} capability='music'
              onChange={(model) => onConfigChange(node.id, getSourceModelMetadataPatch(model, 'music', {}, config.modelAdapter))}
              onMissingConfig={() => openConfigDialog(true)} className='max-w-[190px]' />
              {config.modelAdapter?.music ? <CanvasMusicSettingsPopover
                config={config}
                audioCount={mentionReferences.filter((reference) => reference.kind === 'audio').length}
                buttonClassName='!h-10 !max-w-[170px] !justify-start !rounded-full !px-3'
                onConfigChange={(music) => onConfigChange(node.id, { music })}
              /> : null}
            </>
          ) : mode === 'audio' ? (
            <>
              <ModelPicker
                config={config}
                value={config.model}
                onChange={(model) => onConfigChange(node.id, getSourceModelMetadataPatch(model, 'audio'))}
                capability='audio'
                onMissingConfig={() => openConfigDialog(true)}
                className='max-w-[190px]'
              />
              <CanvasAudioSettingsPopover
                config={config}
                buttonClassName='!h-10 !max-w-[170px] !justify-start !rounded-full !px-3'
                onConfigChange={(key, value) => onConfigChange(node.id, audioConfigPatch(key, value))}
              />
            </>
          ) : (
            <Segmented
              value={optimizationMedia}
              options={[
                { label: t('canvas.configNode.image'), value: 'image' },
                { label: t('canvas.configNode.video'), value: 'video' },
              ]}
              onChange={setOptimizationMedia}
            />
          )}
        </div>
        {isBusy ? (
          <div className='flex h-10 min-w-16 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 text-sm'>
            <LoaderCircle className='size-4 animate-spin' aria-hidden='true' />
            <span className='sr-only' role='status'>
              {i18n.generation.paidTaskContinues}
            </span>
            <span aria-hidden='true'>{i18n.generation.generating}</span>
          </div>
        ) : (
          <Button
            type='primary'
            className='!h-10 !min-w-16 shrink-0 !rounded-full !px-3'
            disabled={(!prompt.trim() && !promptOptional) || missingRequiredVideoImage || Boolean(unavailable)}
            onClick={submit}
            aria-label={t('canvas.promptPanel.generate')}
          >
            <ArrowUp className='size-4' />
          </Button>
        )}
      </div>
      <Modal
        title={t('canvas.promptPanel.editorTitle')}
        open={expanded}
        centered
        width={760}
        footer={null}
        onCancel={() => setExpanded(false)}
        destroyOnHidden
      >
        <div data-canvas-no-zoom className='pt-2' onWheelCapture={(event) => event.stopPropagation()}>
          {musicFields?.length ? <CanvasMusicComposerFields key={node.id} expanded config={config} fields={musicFields} prompt={prompt}
            activeKey={activeMusicField} onActiveKeyChange={setActiveMusicField}
            connectedText={mentionReferences.filter((reference) => reference.kind === 'text').map((reference) => reference.text || '').join('\n\n')}
            onPromptChange={updatePrompt} onMusicChange={(music) => onConfigChange(node.id, { music })} /> : <CanvasPromptChipInput
            value={prompt}
            references={mentionReferences}
            onChange={updatePrompt}
            className='thin-scrollbar h-[52dvh] min-h-80 w-full cursor-text overflow-y-auto rounded-xl border p-4 text-[15px] leading-6 outline-none'
            style={{ background: 'transparent', borderColor: theme.toolbar.border, color: theme.node.text }}
            placeholder={t(
              `canvas.promptPanel.${mode === 'image' && hasImageContent ? 'editImage' : mode === 'text' && hasTextContent ? 'editText' : mode}`,
            )}
          />}
        </div>
      </Modal>
    </div>
  );
}

function defaultMode(type: CanvasNodeData['type']): CanvasNodeGenerationMode {
  return type === CanvasNodeType.Text
    ? 'text'
    : type === CanvasNodeType.Video
      ? 'video'
      : type === CanvasNodeType.Audio
        ? 'audio'
        : 'image';
}

function buildNodeConfig(
  globalConfig: AiConfig,
  node: CanvasNodeData,
  mode: CanvasNodeGenerationMode,
  hasSourceVideoReference: boolean,
): AiConfig {
  const savedModel = node.metadata?.model || globalConfig.videoModel;
  const referenceModel = hasSourceVideoReference && !globalConfig.modelAdapter?.getUnavailableReason
    ? resolveSourceReferenceVideoModel(savedModel, globalConfig.modelAdapter)
    : undefined;
  const usesReferenceDefaults = Boolean(
    referenceModel && sourceModelName(savedModel) !== sourceModelName(referenceModel),
  );
  const referenceDefaults = usesReferenceDefaults
    ? getSourceVideoModelDefaults(referenceModel!, { hasVideoSubjects: true }, globalConfig.modelAdapter)
    : undefined;
  const nodeModel = referenceModel ?? node.metadata?.model;
  return {
    ...globalConfig,
    music: resolveCanvasMusicValues(node) ?? globalConfig.music,
    model: resolveModelForCapability(globalConfig, nodeModel, mode),
    seed: node.metadata?.seed ?? globalConfig.seed,
    negativePrompt: node.metadata?.negativePrompt ?? globalConfig.negativePrompt,
    isTranslate: node.metadata?.isTranslate ?? globalConfig.isTranslate,
    imageResolution:
      node.metadata?.imageResolution || globalConfig.imageResolution || defaultConfig.imageResolution,
    imageVersion: node.metadata?.imageVersion ?? node.metadata?.quality ?? globalConfig.imageVersion,
    reasoningEffort: node.metadata?.reasoningEffort || globalConfig.reasoningEffort || defaultConfig.reasoningEffort,
    quality: node.metadata?.quality || globalConfig.quality || defaultConfig.quality,
    size: referenceDefaults?.ratio || node.metadata?.size || globalConfig.size || defaultConfig.size,
    background: node.metadata?.background ?? globalConfig.background ?? defaultConfig.background,
    videoSeconds:
      referenceDefaults?.duration || node.metadata?.seconds || globalConfig.videoSeconds || defaultConfig.videoSeconds,
    vquality:
      referenceDefaults?.resolution || node.metadata?.vquality || globalConfig.vquality || defaultConfig.vquality,
    videoGenerateAudio:
      referenceDefaults !== undefined
        ? String(referenceDefaults.enableAudio)
        : node.metadata?.generateAudio || globalConfig.videoGenerateAudio || defaultConfig.videoGenerateAudio,
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

function audioConfigPatch(key: CanvasAudioSettingKey, value: string) {
  return { [key]: value };
}
