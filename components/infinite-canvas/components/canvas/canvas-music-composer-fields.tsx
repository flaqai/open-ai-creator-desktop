import { Fragment, useEffect, useId, useRef, useState } from 'react';
import { ChevronRight, LoaderCircle, WandSparkles } from 'lucide-react';
import type { AiConfig } from '../../stores/use-config-store';
import type { CanvasMusicParameter, CanvasMusicValues } from '../../music.types';
import { canvasThemes } from '../../lib/canvas-theme';
import { useThemeStore } from '../../stores/use-theme-store';
import { useInfiniteCanvasTranslation } from '../../runtime/i18n/infinite-canvas-translation';
import { useOptionalInfiniteCanvasIntegrations } from '../../runtime/integrations/infinite-canvas-integrations-context';

export function CanvasMusicComposerFields({ config, fields, prompt, connectedText, onPromptChange, onMusicChange, activeKey, onActiveKeyChange, expanded = false }: {
  readonly activeKey?: string;
  readonly onActiveKeyChange?: (key: string) => void;
  readonly expanded?: boolean;
  readonly config: AiConfig;
  readonly fields: readonly CanvasMusicParameter[];
  readonly prompt: string;
  readonly connectedText: string;
  readonly onPromptChange: (value: string) => void;
  readonly onMusicChange: (value: CanvasMusicValues) => void;
}) {
  const id = useId();
  const { t } = useInfiniteCanvasTranslation();
  const integrations = useOptionalInfiniteCanvasIntegrations();
  const theme = canvasThemes[useThemeStore((state) => state.theme)];
  const [selected, setSelected] = useState('');
  const [helper, setHelper] = useState(false);
  const [themes, setThemes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const request = useRef<AbortController | null>(null);
  const music = config.music || {};
  const inputs = fields.filter((field) => !field.disabled);
  const active = inputs.find((field) => field.key === (activeKey ?? selected)) || inputs[0];
  // A changed model or field invalidates an in-flight helper, never filling another field with its result.
  useEffect(() => {
    setHelper(false);
    setBusy(false);
    return () => request.current?.abort();
  }, [config.model, active?.key]);
  if (!active) return null;
  const value = (active.key === 'style' || active.key === 'prompt') ? prompt : active.key === 'lyrics'
    ? String(music.lyricsEdited ? music.lyrics || '' : music.lyrics || connectedText)
    : String(music[active.key] || '');
  const update = (next: string) => (active.key === 'style' || active.key === 'prompt') ? onPromptChange(next)
    : onMusicChange({ ...music, [active.key]: next, ...(active.key === 'lyrics' ? { lyricsEdited: true } : {}) });
  const canGenerate = Boolean(!active.readOnly && integrations?.generateMusicField && (active.key === 'lyrics' || active.key === 'style'));
  const helperLabel = canGenerate ? t(active.key === 'lyrics' ? 'music.generateLyrics' : 'music.generateStyle') : '';
  const helperPlaceholder = canGenerate ? t(active.key === 'lyrics' ? 'music.lyricsTheme' : 'music.styleArtist') : '';
  const generate = async () => {
    if (!integrations?.generateMusicField || busy || !themes[active.key]?.trim()) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    try {
      const result = await integrations?.generateMusicField({ field: active.key as 'lyrics' | 'style', model: config.model,
        prompt: themes[active.key]!.trim(), signal: controller.signal });
      if (!controller.signal.aborted) update(result);
    } catch (error) {
      if (!controller.signal.aborted) integrations?.onError?.(error, 'generate-music-field');
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  };
  return <div className='min-w-0 space-y-2' data-canvas-no-zoom>
    <div role='tablist' className='custom-scrollbar flex h-9 items-stretch gap-2 overflow-x-auto'>
      {inputs.map((field, index) => <Fragment key={field.key}>
        {index > 0 && <ChevronRight aria-hidden='true' className='size-3.5 shrink-0 self-center opacity-50' />}
        <button type='button' role='tab' id={`${id}-${field.key}-tab`} aria-controls={`${id}-panel`}
          aria-selected={active.key === field.key} disabled={busy} onClick={() => { setSelected(field.key); onActiveKeyChange?.(field.key); }}
          className='shrink-0 cursor-pointer border-b-2 px-1 text-sm transition-opacity hover:opacity-75 active:opacity-60 focus-visible:outline-2 focus-visible:outline-canvas-accent disabled:cursor-not-allowed disabled:opacity-50'
          style={{ borderColor: active.key === field.key ? theme.node.text : 'transparent', color: active.key === field.key ? theme.node.text : theme.node.muted }}>
          {field.label}
        </button>
      </Fragment>)}
    </div>
    <div className={`flex min-w-0 gap-3 ${expanded ? 'h-[52dvh] min-h-80' : 'h-[190px]'}`}>
      <div role='tabpanel' id={`${id}-panel`} aria-labelledby={`${id}-${active.key}-tab`} className='flex min-w-0 flex-1 flex-col'>
        <textarea aria-label={active.label} value={value} readOnly={active.readOnly} disabled={busy} maxLength={active.max}
          className='custom-scrollbar min-h-0 w-full flex-1 resize-none border-0 bg-transparent px-3 py-2 text-sm shadow-none outline-none disabled:cursor-not-allowed disabled:opacity-50'
          style={{ background: 'transparent', color: theme.node.text }}
          onChange={(event) => update(event.target.value)} />
        <div className='flex h-8 shrink-0 items-center justify-between gap-2 text-xs' style={{ color: theme.node.muted }}>
          {canGenerate ? <button type='button' aria-expanded={helper} onClick={() => setHelper(!helper)} className='inline-flex cursor-pointer items-center gap-1 rounded transition-opacity hover:opacity-75 active:opacity-60 focus-visible:outline-2 focus-visible:outline-canvas-accent'>
            <WandSparkles className='size-3.5' />{helperLabel}
          </button> : <span />}
          <span>{value.length}{active.max !== undefined ? `/${active.max}` : ''}</span>
        </div>
      </div>
      {canGenerate && helper && <div className='flex w-[38%] min-w-0 shrink-0 flex-col border-l pl-3' style={{ borderColor: theme.node.stroke }}>
        <textarea aria-label={helperPlaceholder} placeholder={helperPlaceholder} value={themes[active.key] || ''} disabled={busy}
          onChange={(event) => setThemes({ ...themes, [active.key]: event.target.value })}
          className='custom-scrollbar min-h-0 flex-1 resize-none bg-transparent text-sm outline-none' />
        <button type='button' onClick={generate} disabled={busy || !themes[active.key]?.trim()} className='flex h-8 shrink-0 cursor-pointer items-center justify-end gap-1 rounded text-xs transition-opacity hover:opacity-75 active:opacity-60 focus-visible:outline-2 focus-visible:outline-canvas-accent disabled:cursor-not-allowed disabled:opacity-40'>
          {busy && <LoaderCircle className='size-3.5 animate-spin' />}{helperLabel}
        </button>
      </div>}
    </div>
  </div>;
}
