'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Mention, type MentionNodeAttrs, type MentionOptions } from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor } from '@tiptap/react';
import type { ReactNodeViewProps } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Music2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createRoot, type Root } from 'react-dom/client';

import type { UnifiedGeneratorReferencePromptNode } from '@/lib/constants/unified-generator/types';
import { cn } from '@/lib/utils';
import {
  createReferencePromptDocFromText,
  EMPTY_REFERENCE_PROMPT_DOC,
  getReferencePromptLength,
  type UnifiedGeneratorReferenceMentionAsset,
} from '@/lib/utils/reference-video-prompt';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type ReferenceMentionItem = UnifiedGeneratorReferenceMentionAsset & {
  label: string;
  previewUrl: string;
};

type ReferenceMentionSelectedProps = MentionNodeAttrs & {
  assetId?: string;
  kind?: UnifiedGeneratorReferenceMentionAsset['kind'];
  previewUrl?: string;
};
type ReferenceEditor = NonNullable<ReturnType<typeof useEditor>>;
type ReferenceMentionSuggestionProps = {
  items: ReferenceMentionItem[];
  command: (item: ReferenceMentionSelectedProps) => void;
  clientRect?: (() => DOMRect | null) | null;
};

export type ReferenceMentionInsertRequest = {
  asset: UnifiedGeneratorReferenceMentionAsset;
  key: number;
};

function toReferenceMentionItem(
  asset: UnifiedGeneratorReferenceMentionAsset,
  previewUrl: string,
): ReferenceMentionItem {
  return {
    ...asset,
    label: `@${asset.id}`,
    previewUrl,
  };
}

function useReferenceMentionItems(assets: UnifiedGeneratorReferenceMentionAsset[]) {
  const [items, setItems] = useState<ReferenceMentionItem[]>([]);

  useEffect(() => {
    const objectUrls: string[] = [];
    const nextItems = assets.map((asset) => {
      if (typeof asset.source === 'string') {
        return toReferenceMentionItem(asset, asset.source);
      }

      const objectUrl = URL.createObjectURL(asset.source);
      objectUrls.push(objectUrl);
      return toReferenceMentionItem(asset, objectUrl);
    });

    setItems(nextItems);

    return () => {
      // Let TipTap reconcile or unmount nodes that still contain the previous preview URLs.
      window.setTimeout(() => {
        objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
      }, 0);
    };
  }, [assets]);

  return items;
}

function getEmptyMentionLabel(kind: UnifiedGeneratorReferenceMentionAsset['kind']) {
  if (kind === 'video') return 'V';
  if (kind === 'audio') return 'A';
  return 'I';
}

function ReferenceMentionMedia({
  item,
  className,
  autoPlay = false,
}: {
  item: ReferenceMentionItem;
  className: string;
  autoPlay?: boolean;
}) {
  if (!item.previewUrl) {
    return (
      <span className={cn(className, 'inline-flex items-center justify-center text-[10px] uppercase')}>
        {getEmptyMentionLabel(item.kind)}
      </span>
    );
  }

  if (item.kind === 'audio') {
    return (
      <span className={cn(className, 'inline-flex items-center justify-center bg-white/10 text-white')}>
        <Music2 className='size-3.5' />
      </span>
    );
  }

  if (item.kind === 'video') {
    return (
      <video src={item.previewUrl} className={className} muted loop playsInline preload='metadata' autoPlay={autoPlay}>
        <track kind='captions' />
      </video>
    );
  }

  return <img src={item.previewUrl} alt={item.id} className={className} />;
}

function ReferenceMentionNodeView({ node }: ReactNodeViewProps) {
  const [open, setOpen] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isAudioPreviewing, setIsAudioPreviewing] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const item: ReferenceMentionItem = {
    assetId: node.attrs.assetId || '',
    id: node.attrs.id || '',
    label: node.attrs.label || `@${node.attrs.id}`,
    kind: node.attrs.kind === 'video' || node.attrs.kind === 'audio' ? node.attrs.kind : 'image',
    source: node.attrs.previewUrl || '',
    previewUrl: node.attrs.previewUrl || '',
  };

  const stopAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setAudioProgress(0);
    setIsAudioPreviewing(false);
  };

  const playAudioFromStart = () => {
    const audio = audioRef.current;
    if (!audio || !item.previewUrl) return;

    audio.pause();
    audio.currentTime = 0;
    setAudioProgress(0);
    setIsAudioPreviewing(true);
    audio.play().catch(() => setIsAudioPreviewing(false));
  };

  const updateAudioProgress = () => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
      setAudioProgress(0);
      return;
    }

    setAudioProgress(Math.min((audio.currentTime / audio.duration) * 100, 100));
  };

  if (item.kind === 'audio') {
    return (
      <NodeViewWrapper
        as='span'
        className='inline-flex items-center align-middle'
        data-id={item.id}
        data-asset-id={item.assetId}
        data-label={item.label}
        data-kind={item.kind}
        data-preview-url={item.previewUrl}
        data-missing={node.attrs.missing ? 'true' : 'false'}
        title={item.label}
        contentEditable={false}
      >
        <button
          type='button'
          tabIndex={-1}
          className='relative inline-flex appearance-none items-center gap-1.5 overflow-hidden border-0 bg-transparent p-0 text-inherit outline-none'
          onMouseEnter={playAudioFromStart}
          onMouseLeave={stopAudio}
          onMouseDown={(event) => event.preventDefault()}
        >
          <ReferenceMentionMedia item={item} className='size-5 shrink-0 rounded object-cover' />
          <span className='max-w-28 truncate'>{item.id}</span>
          {item.previewUrl ? (
            <>
              <span
                className={cn(
                  'absolute inset-x-0 bottom-0 h-[2px] overflow-hidden rounded-full bg-white/15 transition-opacity',
                  isAudioPreviewing ? 'opacity-100' : 'opacity-0',
                )}
              >
                <span className='bg-color-main block h-full rounded-full' style={{ width: `${audioProgress}%` }} />
              </span>
              <audio
                ref={audioRef}
                src={item.previewUrl}
                preload='metadata'
                onTimeUpdate={updateAudioProgress}
                onEnded={stopAudio}
              >
                <track kind='captions' />
              </audio>
            </>
          ) : null}
        </button>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper
      as='span'
      className='inline-flex items-center align-middle'
      data-id={item.id}
      data-asset-id={item.assetId}
      data-label={item.label}
      data-kind={item.kind}
      data-preview-url={item.previewUrl}
      data-missing={node.attrs.missing ? 'true' : 'false'}
      title={item.label}
      contentEditable={false}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type='button'
            tabIndex={-1}
            className='inline-flex appearance-none items-center gap-1.5 border-0 bg-transparent p-0 text-inherit outline-none'
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onMouseDown={(event) => event.preventDefault()}
          >
            <ReferenceMentionMedia item={item} className='size-5 shrink-0 rounded object-cover' />
            <span className='max-w-28 truncate'>{item.id}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          side='top'
          align='center'
          sideOffset={8}
          className='border-color-b1 bg-color-c1 pointer-events-none w-72 rounded-xl p-2 shadow-2xl'
        >
          <ReferenceMentionMedia item={item} className='max-h-64 w-full rounded-lg object-contain' autoPlay />
          <div className='text-color-t2 mt-2 truncate px-1 text-xs'>{item.id}</div>
        </PopoverContent>
      </Popover>
    </NodeViewWrapper>
  );
}

const ReferenceMention = Mention.extend<MentionOptions<ReferenceMentionItem, ReferenceMentionSelectedProps>>({
  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => ({ 'data-id': attributes.id }),
      },
      assetId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-asset-id'),
        renderHTML: (attributes) => ({ 'data-asset-id': attributes.assetId }),
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes) => ({ 'data-label': attributes.label }),
      },
      kind: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-kind'),
        renderHTML: (attributes) => ({ 'data-kind': attributes.kind }),
      },
      previewUrl: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-preview-url'),
        renderHTML: (attributes) => ({ 'data-preview-url': attributes.previewUrl }),
      },
      missing: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-missing') === 'true',
        renderHTML: (attributes) => ({ 'data-missing': attributes.missing ? 'true' : 'false' }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ReferenceMentionNodeView, {
      as: 'span',
      className: 'reference-mention',
      attrs: ({ node }) => {
        const label = node.attrs.label || `@${node.attrs.id}`;

        return {
          'data-id': node.attrs.id,
          'data-asset-id': node.attrs.assetId,
          'data-label': label,
          'data-kind': node.attrs.kind,
          'data-preview-url': node.attrs.previewUrl,
          'data-missing': node.attrs.missing ? 'true' : 'false',
          title: label,
          contenteditable: 'false',
        };
      },
    });
  },
});

function ReferenceMentionSuggestionItem({
  item,
  isSelected,
  command,
}: {
  item: ReferenceMentionItem;
  isSelected: boolean;
  command: (item: ReferenceMentionItem) => void;
}) {
  return (
    <button
      type='button'
      data-selected={isSelected}
      className={cn(
        'border-color-b1 text-color-t1 flex w-full items-center gap-2 rounded-lg border px-2 py-2 text-left text-sm outline-none',
        'hover:border-white/40',
        isSelected && 'border-white/60 bg-white/10',
      )}
      onMouseDown={(event) => {
        event.preventDefault();
        command(item);
      }}
    >
      <ReferenceMentionMedia item={item} className='size-10 shrink-0 rounded-md object-cover' />
      <span className='truncate'>{item.id}</span>
    </button>
  );
}

function ReferenceMentionSuggestionList({
  items,
  selectedIndex,
  command,
}: {
  items: ReferenceMentionItem[];
  selectedIndex: number;
  command: (item: ReferenceMentionItem) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return items.map((item, index) => (
    <ReferenceMentionSuggestionItem key={item.id} item={item} isSelected={index === selectedIndex} command={command} />
  ));
}

const SUGGESTION_VIEWPORT_PADDING = 8;
const SUGGESTION_GAP = 6;

function setSuggestionPosition(element: HTMLDivElement, clientRect?: (() => DOMRect | null) | null) {
  const rect = clientRect?.();
  if (!rect) return;

  const viewport = window.visualViewport;
  const viewportLeft = viewport?.offsetLeft ?? 0;
  const viewportTop = viewport?.offsetTop ?? 0;
  const viewportWidth = viewport?.width ?? document.documentElement.clientWidth;
  const viewportHeight = viewport?.height ?? window.innerHeight;
  const viewportRight = viewportLeft + viewportWidth;
  const viewportBottom = viewportTop + viewportHeight;
  const elementWidth = element.offsetWidth;
  const elementHeight = element.offsetHeight;
  const minLeft = viewportLeft + SUGGESTION_VIEWPORT_PADDING;
  const maxLeft = Math.max(minLeft, viewportRight - elementWidth - SUGGESTION_VIEWPORT_PADDING);
  const left = Math.min(Math.max(rect.left, minLeft), maxLeft);
  const bottomPosition = rect.bottom + SUGGESTION_GAP;
  const topPosition = rect.top - elementHeight - SUGGESTION_GAP;
  const spaceBelow = viewportBottom - bottomPosition - SUGGESTION_VIEWPORT_PADDING;
  const spaceAbove = rect.top - viewportTop - SUGGESTION_GAP - SUGGESTION_VIEWPORT_PADDING;
  const top =
    elementHeight > 0 && elementHeight > spaceBelow && spaceAbove > spaceBelow
      ? Math.max(viewportTop + SUGGESTION_VIEWPORT_PADDING, topPosition)
      : Math.min(
          bottomPosition,
          Math.max(
            viewportTop + SUGGESTION_VIEWPORT_PADDING,
            viewportBottom - elementHeight - SUGGESTION_VIEWPORT_PADDING,
          ),
        );

  element.style.left = `${left}px`;
  element.style.top = `${top}px`;
}

function createMentionSuggestion(items: ReferenceMentionItem[]) {
  return {
    char: '@',
    items: ({ query }: { query: string }) => {
      const normalizedQuery = query.toLowerCase();

      return items.filter((item) => item.id.toLowerCase().includes(normalizedQuery)).slice(0, 8);
    },
    command: ({
      editor,
      range,
      props,
    }: {
      editor: ReferenceEditor;
      range: { from: number; to: number };
      props: ReferenceMentionSelectedProps;
    }) => {
      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          {
            type: 'mention',
            attrs: {
              id: props.id,
              assetId: props.assetId,
              label: props.label,
              kind: props.kind,
              previewUrl: props.previewUrl,
              missing: false,
            },
          },
          {
            type: 'text',
            text: ' ',
          },
        ])
        .run();
    },
    render: () => {
      let element: HTMLDivElement | null = null;
      let root: Root | null = null;
      let currentItems: ReferenceMentionItem[] = [];
      let selectedIndex = 0;
      let currentCommand: ((item: ReferenceMentionSelectedProps) => void) | null = null;
      let currentClientRect: ReferenceMentionSuggestionProps['clientRect'] = null;
      let positionAnimationFrame: number | null = null;

      const renderItems = () => {
        root?.render(
          <ReferenceMentionSuggestionList
            items={currentItems}
            selectedIndex={selectedIndex}
            command={(item) => currentCommand?.(item)}
          />,
        );
      };

      const updatePosition = () => {
        if (!element) return;
        setSuggestionPosition(element, currentClientRect);
      };

      const schedulePositionUpdate = () => {
        updatePosition();
        if (positionAnimationFrame !== null) {
          window.cancelAnimationFrame(positionAnimationFrame);
        }
        positionAnimationFrame = window.requestAnimationFrame(() => {
          positionAnimationFrame = null;
          updatePosition();
        });
      };

      const update = (props: ReferenceMentionSuggestionProps) => {
        if (!element) return;

        currentItems = props.items || [];
        currentCommand = props.command;
        currentClientRect = props.clientRect;
        selectedIndex = Math.min(selectedIndex, Math.max(currentItems.length - 1, 0));
        renderItems();
        schedulePositionUpdate();
      };

      return {
        onStart: (props: ReferenceMentionSuggestionProps) => {
          element = document.createElement('div');
          element.className =
            'custom-scrollbar fixed z-[1000] flex max-h-64 w-56 flex-col gap-1 overflow-auto rounded-lg border border-color-b1 bg-color-c1 p-1 shadow-xl';
          document.body.appendChild(element);
          root = createRoot(element);
          update(props);
          window.addEventListener('resize', schedulePositionUpdate);
          window.visualViewport?.addEventListener('resize', schedulePositionUpdate);
        },
        onUpdate: update,
        onKeyDown: (props: { event: KeyboardEvent }) => {
          if (props.event.key === 'ArrowDown') {
            selectedIndex = (selectedIndex + 1) % Math.max(currentItems.length, 1);
            renderItems();
            return true;
          }

          if (props.event.key === 'ArrowUp') {
            selectedIndex = (selectedIndex + Math.max(currentItems.length, 1) - 1) % Math.max(currentItems.length, 1);
            renderItems();
            return true;
          }

          if (props.event.key === 'Enter') {
            const item = currentItems[selectedIndex];
            if (item) {
              currentCommand?.(item);
            }
            return true;
          }

          return false;
        },
        onExit: () => {
          window.removeEventListener('resize', schedulePositionUpdate);
          window.visualViewport?.removeEventListener('resize', schedulePositionUpdate);
          if (positionAnimationFrame !== null) {
            window.cancelAnimationFrame(positionAnimationFrame);
            positionAnimationFrame = null;
          }
          root?.unmount();
          root = null;
          element?.remove();
          element = null;
        },
      };
    },
  };
}

function isSameReferencePromptContent(left: unknown, right: unknown) {
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
}

function reconcileReferencePromptDoc(
  node: UnifiedGeneratorReferencePromptNode,
  assets: ReferenceMentionItem[],
): UnifiedGeneratorReferencePromptNode {
  if (node.type === 'mention') {
    const asset = node.attrs?.assetId
      ? assets.find((item) => item.assetId === node.attrs?.assetId)
      : assets.find((item) => item.id === node.attrs?.id);

    if (!asset) {
      return {
        ...node,
        attrs: {
          ...node.attrs,
          missing: true,
          previewUrl: '',
        },
      };
    }

    return {
      ...node,
      attrs: {
        ...node.attrs,
        id: asset.id,
        assetId: asset.assetId,
        label: asset.label,
        kind: asset.kind,
        previewUrl: asset.previewUrl,
        missing: false,
      },
    };
  }

  if (!node.content) {
    return node;
  }

  return {
    ...node,
    content: node.content.map((child) => reconcileReferencePromptDoc(child, assets)),
  };
}

export function ReferenceMentionPickerPopover({
  assets,
  disabled = false,
  onSelect,
}: {
  assets: UnifiedGeneratorReferenceMentionAsset[];
  disabled?: boolean;
  onSelect: (asset: UnifiedGeneratorReferenceMentionAsset) => void;
}) {
  const t = useTranslations('components.hero-form.reference-upload');
  const [open, setOpen] = useState(false);
  const items = useReferenceMentionItems(assets);
  const isDisabled = disabled || items.length === 0;

  return (
    <Popover open={isDisabled ? false : open} onOpenChange={(nextOpen) => setOpen(isDisabled ? false : nextOpen)}>
      <PopoverTrigger asChild>
        <button
          type='button'
          disabled={isDisabled}
          aria-label={t('mention')}
          className={cn(
            'border-color-b1 text-color-t1 flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition',
            isDisabled ? 'cursor-not-allowed opacity-40' : 'hover:border-white/40 hover:bg-white/10',
          )}
        >
          @
        </button>
      </PopoverTrigger>
      <PopoverContent
        side='bottom'
        align='center'
        sideOffset={8}
        className='border-color-b1 bg-color-c1 flex max-h-64 w-56 flex-col gap-1 overflow-auto rounded-lg p-1 shadow-xl'
      >
        <ReferenceMentionSuggestionList
          items={items}
          selectedIndex={-1}
          command={(item) => {
            setOpen(false);
            onSelect(item);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export default function ReferencePromptEditor({
  value,
  assets,
  insertMentionRequest,
  maxLength,
  onChange,
}: {
  value: UnifiedGeneratorReferencePromptNode;
  assets: UnifiedGeneratorReferenceMentionAsset[];
  insertMentionRequest?: ReferenceMentionInsertRequest | null;
  maxLength: number;
  onChange: (value: UnifiedGeneratorReferencePromptNode) => void;
}) {
  const t = useTranslations('components.hero-form');
  const lastInsertMentionRequestKeyRef = useRef(insertMentionRequest?.key ?? 0);
  const mentionItems = useReferenceMentionItems(assets);
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        blockquote: false,
        bulletList: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
        orderedList: false,
      }),
      Placeholder.configure({
        placeholder: t('image-video.prompt-placeholder'),
      }),
      ReferenceMention.configure({
        HTMLAttributes: {
          class: 'reference-mention',
        },
        renderText({ node }) {
          return node.attrs.label || `@${node.attrs.id}`;
        },
        renderHTML({ node }) {
          const label = node.attrs.label || `@${node.attrs.id}`;

          return [
            'span',
            {
              class: 'reference-mention',
              'data-id': node.attrs.id,
              'data-asset-id': node.attrs.assetId,
              'data-label': label,
              'data-kind': node.attrs.kind,
              'data-preview-url': node.attrs.previewUrl,
              'data-missing': node.attrs.missing ? 'true' : 'false',
              title: label,
            },
            label,
          ];
        },
        suggestion: createMentionSuggestion(mentionItems),
      }),
    ],
    [mentionItems, t],
  );
  const editor = useEditor(
    {
      extensions,
      content: value || EMPTY_REFERENCE_PROMPT_DOC,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class:
            'custom-scrollbar text-color-t1 placeholder:text-color-t3 h-full min-h-0 w-full flex-1 overflow-y-auto bg-transparent text-[15px] leading-7 outline-none',
        },
      },
      onUpdate: ({ editor: activeEditor }) => {
        const nextValue = activeEditor.getJSON() as UnifiedGeneratorReferencePromptNode;
        if (getReferencePromptLength(nextValue) > maxLength) {
          activeEditor.commands.undo();
          return;
        }
        onChange(nextValue);
      },
    },
    [extensions, maxLength],
  );
  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }

    const nextContent =
      typeof value === 'string'
        ? createReferencePromptDocFromText(value)
        : reconcileReferencePromptDoc(value || EMPTY_REFERENCE_PROMPT_DOC, mentionItems);

    if (isSameReferencePromptContent(editor.getJSON(), nextContent)) {
      return;
    }

    editor.commands.setContent(nextContent, { emitUpdate: false });
  }, [editor, mentionItems, value]);

  useEffect(() => {
    if (
      !editor ||
      editor.isDestroyed ||
      !insertMentionRequest ||
      insertMentionRequest.key === lastInsertMentionRequestKeyRef.current
    ) {
      return;
    }

    const requestKey = insertMentionRequest.key;
    const item = mentionItems.find((mentionItem) => mentionItem.assetId === insertMentionRequest.asset.assetId);
    if (!item) {
      return;
    }
    const animationFrameId = window.requestAnimationFrame(() => {
      if (editor.isDestroyed || requestKey === lastInsertMentionRequestKeyRef.current) {
        return;
      }

      lastInsertMentionRequestKeyRef.current = requestKey;
      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: 'mention',
            attrs: {
              id: item.id,
              assetId: item.assetId,
              label: item.label,
              kind: item.kind,
              previewUrl: item.previewUrl,
              missing: false,
            },
          },
          {
            type: 'text',
            text: ' ',
          },
        ])
        .run();
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [editor, insertMentionRequest, mentionItems]);

  return (
    <div
      className={cn(
        'reference-prompt-editor relative flex h-full min-h-0 w-full flex-1 overflow-hidden',
        '[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none',
        '[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left',
        '[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0',
        '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-color-t3',
        '[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
        '[&_.reference-mention]:inline-flex [&_.reference-mention]:items-center [&_.reference-mention]:align-middle',
        '[&_.reference-mention]:border-color-b1 [&_.reference-mention]:rounded [&_.reference-mention]:border',
        '[&_.reference-mention]:text-color-t1 [&_.reference-mention]:px-1.5 [&_.reference-mention]:py-0.5',
        '[&_.reference-mention[data-missing=true]]:border-color-main',
        '[&_.reference-mention[data-missing=true]]:text-color-main',
      )}
    >
      <EditorContent editor={editor} className='flex min-h-0 flex-1 pr-24' />
      <div className='text-color-t3 pointer-events-none absolute right-3 bottom-3 text-sm'>
        {getReferencePromptLength(value)} / {maxLength}
      </div>
    </div>
  );
}
