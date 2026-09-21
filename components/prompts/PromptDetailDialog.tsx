'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ComponentType,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Check,
  Copy,
  Download,
  Expand,
  FileText,
  GripVertical,
  Hand,
  ImageIcon,
  Minimize2,
  RotateCcw,
  Save,
  Wifi,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { toast } from 'sonner';

import { downloadMedia, mediaFileName, saveMedia } from '@/lib/platform/media';
import {
  clampDividerPercent,
  clampMediaZoom,
  clampPan,
  containSize,
  DEFAULT_SPLIT_MEDIA_PERCENT,
  MAX_MEDIA_ZOOM,
  MAX_SPLIT_MEDIA_PERCENT,
  MIN_MEDIA_ZOOM,
  MIN_SPLIT_MEDIA_PERCENT,
  panBounds,
  promptResizeIntent,
  resolvePromptResize,
  supportsMediaInteraction,
  supportsPromptPanelResize,
  zoomAroundPoint,
  type Point,
  type PromptResizeIntent,
  type PromptViewerMode,
  type Size,
} from '@/lib/prompt-media-viewport';
import type { RecommendedPrompt } from '@/lib/recommended-prompts';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

const ZOOM_STEP = 0.25;
const KEYBOARD_RESIZE_STEP = 2;
const WIDE_VIEW_QUERY = '(min-width: 900px)';
const CENTER: Point = { x: 0, y: 0 };
const EMPTY_SIZE: Size = { width: 0, height: 0 };

type MotionExtras = {
  initial?: false | object;
  animate?: object;
  exit?: object;
  transition?: object;
  whileTap?: object;
  layout?: boolean;
  onAnimationComplete?: () => void;
};

const MotionDiv = motion.div as unknown as ComponentType<ComponentProps<'div'> & MotionExtras>;
const MotionSection = motion.section as unknown as ComponentType<ComponentProps<'section'> & MotionExtras>;
const MotionButton = motion.button as unknown as ComponentType<ComponentProps<'button'> & MotionExtras>;

function VideoPreview({ prompt, zh, className = '' }: { prompt: RecommendedPrompt; zh: boolean; className?: string }) {
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  if (prompt.media.type !== 'video') return null;

  if (failed) {
    return (
      <div className={`bg-muted flex flex-col items-center justify-center gap-3 p-5 text-center ${className}`}>
        <Wifi className='text-muted-foreground size-7' />
        <p className='text-muted-foreground max-w-xs text-xs leading-5'>
          {zh
            ? '在线视频暂时无法加载，请检查网络后重试。'
            : 'The online video could not load. Check your connection and try again.'}
        </p>
        <Button
          type='button'
          size='sm'
          variant='outline'
          onClick={() => {
            setFailed(false);
            setRetry((value) => value + 1);
          }}
        >
          {zh ? '重试' : 'Retry'}
        </Button>
      </div>
    );
  }

  return (
    <video
      key={retry}
      src={prompt.media.url}
      poster={prompt.media.image}
      controls
      playsInline
      preload='none'
      onError={() => setFailed(true)}
      className={`bg-black object-contain ${className}`}
    >
      <track kind='captions' />
    </video>
  );
}

export function PromptMedia({
  prompt,
  zh,
  compact = false,
}: {
  prompt: RecommendedPrompt;
  zh: boolean;
  compact?: boolean;
}) {
  if (prompt.media.type === 'video') {
    return (
      <VideoPreview prompt={prompt} zh={zh} className={compact ? 'size-full' : 'max-h-full max-w-full rounded-2xl'} />
    );
  }

  return (
    <img
      src={prompt.media.image}
      alt={prompt.title}
      loading={compact ? 'lazy' : 'eager'}
      draggable={false}
      className={compact ? 'size-full object-cover' : 'max-h-full max-w-full rounded-2xl object-contain'}
    />
  );
}

function mediaSource(prompt: RecommendedPrompt) {
  return prompt.media.type === 'video' ? prompt.media.url : prompt.media.image;
}

function fallbackFilename(prompt: RecommendedPrompt) {
  const extension = prompt.media.type === 'video' ? 'mp4' : 'jpg';
  const safeTitle = prompt.title
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return `${safeTitle || 'flaq-prompt-media'}.${extension}`;
}

export default function PromptDetailDialog({
  prompt,
  zh,
  copied,
  onCopy,
  onClose,
}: {
  prompt: RecommendedPrompt | null;
  zh: boolean;
  copied: boolean;
  onCopy: (prompt: RecommendedPrompt) => void;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const splitRef = useRef<HTMLDivElement>(null);
  const mediaPanelRef = useRef<HTMLElement>(null);
  const dividerRef = useRef<HTMLButtonElement>(null);
  const promptPreviewRef = useRef<HTMLDivElement>(null);
  const mediaPreviewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const panHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activePointerRef = useRef<number | null>(null);
  const dragStartRef = useRef<{ pointer: Point; pan: Point } | null>(null);
  const dividerPointerRef = useRef<number | null>(null);
  const dividerBoundsRef = useRef<{ left: number; width: number } | null>(null);
  const dividerFrameRef = useRef<number | null>(null);
  const pendingDividerXRef = useRef<number | null>(null);
  const dragPercentRef = useRef(DEFAULT_SPLIT_MEDIA_PERCENT);
  const dragStartModeRef = useRef<PromptViewerMode>('split');
  const splitPercentRef = useRef(DEFAULT_SPLIT_MEDIA_PERCENT);
  const resizeIntentRef = useRef<PromptResizeIntent>('split');
  const [splitPercent, setSplitPercent] = useState(DEFAULT_SPLIT_MEDIA_PERCENT);
  const [viewerMode, setViewerMode] = useState<PromptViewerMode>('split');
  const [isDividerDragging, setIsDividerDragging] = useState(false);
  const [isWide, setIsWide] = useState(true);
  const [zoom, setZoom] = useState(MIN_MEDIA_ZOOM);
  const [pan, setPan] = useState<Point>(CENTER);
  const [canvasSize, setCanvasSize] = useState<Size>(EMPTY_SIZE);
  const [intrinsicSize, setIntrinsicSize] = useState<Size>(EMPTY_SIZE);
  const [isPanning, setIsPanning] = useState(false);
  const [showPanHint, setShowPanHint] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isImage = prompt?.media.type === 'image';
  const canInteract = prompt ? supportsMediaInteraction(prompt.media.type, isWide) : false;
  const promptExpanded = viewerMode === 'prompt' && !isDividerDragging;
  const mediaExpanded = viewerMode === 'media' && !isDividerDragging;
  const isCompleteMode = promptExpanded || mediaExpanded;
  const compactMediaToolbar = viewerMode === 'split' && splitPercent < 36;
  const fittedSize = useMemo(() => containSize(canvasSize, intrinsicSize), [canvasSize, intrinsicSize]);
  const currentPanBounds = useMemo(() => panBounds(canvasSize, fittedSize, zoom), [canvasSize, fittedSize, zoom]);

  const releasePointer = useCallback(() => {
    const pointerId = activePointerRef.current;
    if (pointerId !== null && canvasRef.current?.hasPointerCapture(pointerId)) {
      canvasRef.current.releasePointerCapture(pointerId);
    }
    activePointerRef.current = null;
    dragStartRef.current = null;
    setIsPanning(false);
  }, []);

  const resetViewer = useCallback(() => {
    releasePointer();
    setZoom(MIN_MEDIA_ZOOM);
    setPan(CENTER);
    setShowPanHint(false);
    if (panHintTimerRef.current) clearTimeout(panHintTimerRef.current);
  }, [releasePointer]);

  const setResizePreview = useCallback((intent: PromptResizeIntent) => {
    resizeIntentRef.current = intent;
    const setPreviewVisibility = (node: HTMLDivElement | null, visible: boolean) => {
      if (!node) return;
      node.style.opacity = visible ? '1' : '0';
      node.style.visibility = visible ? 'visible' : 'hidden';
      node.setAttribute('aria-hidden', String(!visible));
    };
    setPreviewVisibility(promptPreviewRef.current, intent === 'prompt');
    setPreviewVisibility(mediaPreviewRef.current, intent === 'media');
  }, []);

  const writeDividerPercent = useCallback(
    (percent: number) => {
      const safePercent = clampDividerPercent(percent);
      dragPercentRef.current = safePercent;
      if (mediaPanelRef.current) mediaPanelRef.current.style.width = `${safePercent}%`;
      if (dividerRef.current) dividerRef.current.style.left = `${safePercent}%`;
      setResizePreview(promptResizeIntent(safePercent));
      return safePercent;
    },
    [setResizePreview],
  );

  const cancelDividerFrame = useCallback(() => {
    if (dividerFrameRef.current !== null) cancelAnimationFrame(dividerFrameRef.current);
    dividerFrameRef.current = null;
    pendingDividerXRef.current = null;
  }, []);

  const resetDividerSession = useCallback(() => {
    cancelDividerFrame();
    const pointerId = dividerPointerRef.current;
    if (pointerId !== null && dividerRef.current?.hasPointerCapture(pointerId)) {
      dividerPointerRef.current = null;
      dividerRef.current.releasePointerCapture(pointerId);
    }
    dividerPointerRef.current = null;
    dividerBoundsRef.current = null;
    setResizePreview('split');
    setIsDividerDragging(false);
  }, [cancelDividerFrame, setResizePreview]);

  useEffect(() => {
    const query = window.matchMedia(WIDE_VIEW_QUERY);
    const update = () => {
      setIsWide(query.matches);
      if (!query.matches) {
        resetViewer();
        resetDividerSession();
        setViewerMode((current) => (current === 'media' ? 'split' : current));
      }
    };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [resetDividerSession, resetViewer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const update = () => {
      if (isDividerDragging) return;
      const bounds = canvas.getBoundingClientRect();
      setCanvasSize({ width: bounds.width, height: bounds.height });
      const image = imageRef.current;
      if (image?.naturalWidth) {
        setIntrinsicSize({ width: image.naturalWidth, height: image.naturalHeight });
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [isDividerDragging, prompt?.id, viewerMode]);

  useEffect(() => {
    splitPercentRef.current = DEFAULT_SPLIT_MEDIA_PERCENT;
    dragPercentRef.current = DEFAULT_SPLIT_MEDIA_PERCENT;
    setSplitPercent(DEFAULT_SPLIT_MEDIA_PERCENT);
    setViewerMode('split');
    resetDividerSession();
    setIntrinsicSize(EMPTY_SIZE);
    resetViewer();
  }, [prompt?.id, resetDividerSession, resetViewer]);

  useEffect(() => {
    const image = imageRef.current;
    if (isImage && image?.complete && image.naturalWidth > 0) {
      setIntrinsicSize({ width: image.naturalWidth, height: image.naturalHeight });
    }
  }, [isImage, prompt?.id]);

  useEffect(() => {
    setPan((current) => clampPan(current, currentPanBounds));
  }, [currentPanBounds]);

  useEffect(
    () => () => {
      if (panHintTimerRef.current) clearTimeout(panHintTimerRef.current);
      cancelDividerFrame();
      releasePointer();
    },
    [cancelDividerFrame, releasePointer],
  );

  if (!prompt) return null;

  const source = mediaSource(prompt);
  const filename = mediaFileName(source, fallbackFilename(prompt));
  const fullMediaLabel = isImage ? (zh ? '完整图片' : 'Full image') : zh ? '完整视频' : 'Full video';
  const fullMediaActionLabel = isImage
    ? zh
      ? '完整显示图片'
      : 'Show full image'
    : zh
      ? '完整显示视频'
      : 'Show full video';
  const panelTransition = reduceMotion
    ? { duration: 0 }
    : isCompleteMode
      ? { type: 'spring' as const, stiffness: 142, damping: 27, mass: 0.92, delay: 0.16 }
      : { type: 'spring' as const, stiffness: 178, damping: 28, mass: 0.82, delay: 0.1 };
  const mediaContentTransition = reduceMotion
    ? { duration: 0 }
    : promptExpanded
      ? { duration: 0.28, ease: [0.4, 0, 1, 1] as const }
      : mediaExpanded
        ? { type: 'spring' as const, stiffness: 210, damping: 24, mass: 0.72, delay: 0.26 }
        : { type: 'spring' as const, stiffness: 210, damping: 24, mass: 0.72, delay: 0.3 };
  const promptContentTransition = reduceMotion
    ? { duration: 0 }
    : promptExpanded
      ? { type: 'spring' as const, stiffness: 165, damping: 25, mass: 0.78, delay: 0.34 }
      : { duration: 0.18, ease: [0.4, 0, 1, 1] as const };
  const promptLayoutTransition =
    reduceMotion || isDividerDragging
      ? { duration: 0 }
      : { layout: { type: 'spring' as const, stiffness: 150, damping: 28, mass: 0.88 } };

  const showDragHint = () => {
    setShowPanHint(true);
    if (panHintTimerRef.current) clearTimeout(panHintTimerRef.current);
    panHintTimerRef.current = setTimeout(() => setShowPanHint(false), 1500);
  };

  const setViewerZoom = (nextZoom: number, pointer?: Point) => {
    if (!canInteract) return;
    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    const image = imageRef.current;
    const measuredCanvas = canvasBounds ? { width: canvasBounds.width, height: canvasBounds.height } : canvasSize;
    const measuredIntrinsic = image?.naturalWidth
      ? { width: image.naturalWidth, height: image.naturalHeight }
      : intrinsicSize;
    const measuredFitted = containSize(measuredCanvas, measuredIntrinsic);
    setCanvasSize(measuredCanvas);
    setIntrinsicSize(measuredIntrinsic);
    const next = clampMediaZoom(nextZoom);
    const wasFitted = zoom === MIN_MEDIA_ZOOM;
    const result = zoomAroundPoint({
      currentZoom: zoom,
      nextZoom: next,
      pan,
      pointer: pointer ?? { x: measuredCanvas.width / 2, y: measuredCanvas.height / 2 },
      viewport: measuredCanvas,
      fitted: measuredFitted,
    });
    setZoom(result.zoom);
    setPan(result.pan);
    if (wasFitted && result.zoom > MIN_MEDIA_ZOOM) showDragHint();
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!canInteract) return;
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    setViewerZoom(zoom + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP), {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  };

  const handlePanStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canInteract || zoom <= MIN_MEDIA_ZOOM || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    activePointerRef.current = event.pointerId;
    dragStartRef.current = { pointer: { x: event.clientX, y: event.clientY }, pan };
    setIsPanning(true);
    setShowPanHint(false);
  };

  const handlePanMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const image = imageRef.current;
    const viewport = { width: bounds.width, height: bounds.height };
    const measuredFitted = containSize(viewport, {
      width: image?.naturalWidth ?? intrinsicSize.width,
      height: image?.naturalHeight ?? intrinsicSize.height,
    });
    const measuredBounds = panBounds(viewport, measuredFitted, zoom);
    setPan((current) =>
      clampPan(
        {
          x: current.x + event.movementX,
          y: current.y + event.movementY,
        },
        measuredBounds,
      ),
    );
  };

  const dividerPercentFromClientX = (clientX: number) => {
    const bounds = dividerBoundsRef.current;
    if (!bounds || bounds.width <= 0) return dragPercentRef.current;
    return clampDividerPercent(((clientX - bounds.left) / bounds.width) * 100);
  };

  const applyDividerClientX = (clientX: number) => writeDividerPercent(dividerPercentFromClientX(clientX));

  const scheduleDividerClientX = (clientX: number) => {
    pendingDividerXRef.current = clientX;
    if (dividerFrameRef.current !== null) return;
    dividerFrameRef.current = requestAnimationFrame(() => {
      dividerFrameRef.current = null;
      const pendingX = pendingDividerXRef.current;
      pendingDividerXRef.current = null;
      if (pendingX !== null) applyDividerClientX(pendingX);
    });
  };

  const handleDividerStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!supportsPromptPanelResize(isWide) || event.button !== 0) return;
    const bounds = splitRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const startPercent = viewerMode === 'prompt' ? 0 : viewerMode === 'media' ? 100 : splitPercentRef.current;
    dragStartModeRef.current = viewerMode;
    dragPercentRef.current = startPercent;
    dividerBoundsRef.current = { left: bounds.left, width: bounds.width };
    dividerPointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDividerDragging(true);
    writeDividerPercent(startPercent);
  };

  const handleDividerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dividerPointerRef.current !== event.pointerId || !event.currentTarget.hasPointerCapture(event.pointerId))
      return;
    scheduleDividerClientX(event.clientX);
  };

  const handleDividerEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dividerPointerRef.current !== event.pointerId) return;
    cancelDividerFrame();
    const releasePercent = applyDividerClientX(event.clientX);
    const result = resolvePromptResize(releasePercent, splitPercentRef.current);
    dividerPointerRef.current = null;
    dividerBoundsRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    splitPercentRef.current = result.splitPercent;
    dragPercentRef.current = result.mode === 'prompt' ? 0 : result.mode === 'media' ? 100 : result.splitPercent;
    setSplitPercent(result.splitPercent);
    setResizePreview('split');
    setIsDividerDragging(false);
    setViewerMode(result.mode);
    if (result.mode === 'prompt') resetViewer();
  };

  const cancelDividerDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dividerPointerRef.current !== event.pointerId) return;
    const startMode = dragStartModeRef.current;
    const restorePercent = startMode === 'prompt' ? 0 : startMode === 'media' ? 100 : splitPercentRef.current;
    dividerPointerRef.current = null;
    dividerBoundsRef.current = null;
    cancelDividerFrame();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    writeDividerPercent(restorePercent);
    setResizePreview('split');
    setIsDividerDragging(false);
    setViewerMode(startMode);
  };

  const restoreSplitView = () => {
    dragPercentRef.current = splitPercentRef.current;
    setViewerMode('split');
  };

  const enterViewerMode = (mode: Exclude<PromptViewerMode, 'split'>) => {
    if (mode === 'media' && !supportsPromptPanelResize(isWide)) return;
    if (mode === 'prompt') resetViewer();
    dragPercentRef.current = mode === 'prompt' ? 0 : 100;
    setViewerMode(mode);
  };

  const handleDividerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    let nextPercent: number | null = null;
    if (event.key === 'ArrowLeft') {
      nextPercent = viewerMode === 'media' ? MAX_SPLIT_MEDIA_PERCENT : splitPercentRef.current - KEYBOARD_RESIZE_STEP;
    } else if (event.key === 'ArrowRight') {
      nextPercent = viewerMode === 'prompt' ? MIN_SPLIT_MEDIA_PERCENT : splitPercentRef.current + KEYBOARD_RESIZE_STEP;
    } else if (event.key === 'Home') {
      nextPercent = MIN_SPLIT_MEDIA_PERCENT;
    } else if (event.key === 'End') {
      nextPercent = MAX_SPLIT_MEDIA_PERCENT;
    }
    if (nextPercent === null) return;
    event.preventDefault();
    const nextSplitPercent = Math.min(MAX_SPLIT_MEDIA_PERCENT, Math.max(MIN_SPLIT_MEDIA_PERCENT, nextPercent));
    splitPercentRef.current = nextSplitPercent;
    dragPercentRef.current = nextSplitPercent;
    setSplitPercent(nextSplitPercent);
    setViewerMode('split');
  };

  const handleClose = () => {
    splitPercentRef.current = DEFAULT_SPLIT_MEDIA_PERCENT;
    dragPercentRef.current = DEFAULT_SPLIT_MEDIA_PERCENT;
    setSplitPercent(DEFAULT_SPLIT_MEDIA_PERCENT);
    setViewerMode('split');
    resetDividerSession();
    resetViewer();
    onClose();
  };

  const runMediaAction = async (mode: 'download' | 'save') => {
    setIsSaving(true);
    try {
      const saved = mode === 'download' ? await downloadMedia(source, filename) : await saveMedia(source, filename);
      if (saved) {
        toast.success(
          mode === 'download'
            ? zh
              ? '已保存到下载目录。'
              : 'Saved to Downloads.'
            : zh
              ? '媒体已另存。'
              : 'Media saved.',
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        data-testid='prompt-detail-dialog'
        showCloseButton={false}
        overlayClassName='bg-black/70 backdrop-blur-[3px]'
        className='bg-background/96 h-[min(864px,calc(100vh-32px))] w-[calc(100vw-32px)] max-w-[1380px] overflow-hidden rounded-[30px] border-0 p-0 shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:max-w-[1380px]'
      >
        <button
          type='button'
          onClick={handleClose}
          className='text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-5 right-5 z-40 flex size-8 items-center justify-center transition-colors focus-visible:ring-2 focus-visible:outline-none min-[900px]:top-6 min-[900px]:right-6'
          aria-label={zh ? '关闭' : 'Close'}
        >
          <X className='size-5' />
        </button>

        <div className='grid size-full min-h-0 grid-rows-[76px_minmax(0,1fr)] min-[900px]:grid-rows-[88px_minmax(0,1fr)]'>
          <header
            data-testid='prompt-detail-header'
            className='relative z-10 flex min-w-0 items-start gap-3 px-4 pt-4 pr-14 min-[900px]:px-7 min-[900px]:pt-7 min-[900px]:pr-16'
          >
            <DialogTitle
              data-testid='prompt-detail-title'
              className='min-w-0 truncate text-xl leading-8 font-semibold tracking-[-0.02em] min-[900px]:px-1 min-[900px]:text-2xl'
            >
              {prompt.title}
            </DialogTitle>
            <AnimatePresence initial={false}>
              {isCompleteMode ? (
                <MotionDiv
                  key={viewerMode}
                  initial={reduceMotion ? false : { opacity: 0, x: -8, scale: 0.94 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: -5, scale: 0.96 }}
                  transition={promptContentTransition}
                  className='border-primary/15 bg-primary/8 text-primary mt-1.5 shrink-0 rounded-full border px-2.5 py-1 text-[10px] leading-4 font-semibold tracking-[0.12em] uppercase'
                >
                  {viewerMode === 'prompt' ? (zh ? '完整提示词' : 'Full prompt') : fullMediaLabel}
                </MotionDiv>
              ) : null}
            </AnimatePresence>
          </header>

          <div
            ref={splitRef}
            data-testid='prompt-detail-split'
            data-dragging={isDividerDragging ? 'true' : 'false'}
            className='relative flex min-h-0 min-w-0 flex-col min-[900px]:flex-row'
          >
            <MotionSection
              ref={mediaPanelRef}
              id='prompt-detail-media'
              data-testid='prompt-detail-media'
              className='relative grid min-h-0 min-w-0 shrink-0 grid-rows-[minmax(0,1fr)] overflow-hidden min-[900px]:grid-rows-[minmax(0,1fr)_78px]'
              initial={false}
              animate={
                isWide
                  ? {
                      width: isDividerDragging
                        ? `${dragPercentRef.current}%`
                        : promptExpanded
                          ? 0
                          : mediaExpanded
                            ? '100%'
                            : `${splitPercent}%`,
                      height: '100%',
                    }
                  : { width: '100%', height: promptExpanded ? 0 : '48%' }
              }
              transition={isDividerDragging ? { duration: 0 } : panelTransition}
              aria-hidden={promptExpanded}
              inert={promptExpanded ? true : undefined}
              onAnimationComplete={() => {
                if (promptExpanded) resetViewer();
              }}
            >
              <MotionDiv
                ref={canvasRef}
                data-testid='prompt-media-canvas'
                className={`relative mx-4 mb-3 flex min-h-0 items-center justify-center overflow-hidden rounded-2xl select-none min-[900px]:mx-7 min-[900px]:mb-5 ${
                  canInteract && zoom > MIN_MEDIA_ZOOM ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : ''
                }`}
                initial={false}
                animate={{
                  opacity: promptExpanded ? 0 : 1,
                  scale: promptExpanded ? 0.97 : 1,
                  x: promptExpanded ? -16 : 0,
                }}
                transition={mediaContentTransition}
                onWheel={handleWheel}
                onPointerDown={handlePanStart}
                onPointerMove={handlePanMove}
                onPointerUp={releasePointer}
                onPointerCancel={releasePointer}
                onLostPointerCapture={releasePointer}
              >
                {isImage ? (
                  <img
                    ref={imageRef}
                    src={prompt.media.image}
                    alt={prompt.title}
                    draggable={false}
                    onLoad={(event) =>
                      setIntrinsicSize({
                        width: event.currentTarget.naturalWidth,
                        height: event.currentTarget.naturalHeight,
                      })
                    }
                    className='max-h-full max-w-full rounded-2xl object-contain shadow-sm will-change-transform'
                    style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})` }}
                  />
                ) : (
                  <VideoPreview prompt={prompt} zh={zh} className='max-h-full max-w-full rounded-2xl' />
                )}

                <AnimatePresence>
                  {showPanHint && canInteract ? (
                    <MotionDiv
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className='pointer-events-none absolute rounded-full bg-black/68 px-3 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-md'
                    >
                      <span className='flex items-center gap-2'>
                        <Hand className='size-4' />
                        {zh ? '按住拖动查看' : 'Hold and drag to explore'}
                      </span>
                    </MotionDiv>
                  ) : null}
                </AnimatePresence>
              </MotionDiv>

              <MotionDiv
                className='hidden min-[900px]:flex min-[900px]:items-center min-[900px]:justify-between min-[900px]:gap-4 min-[900px]:px-7'
                initial={false}
                animate={{ opacity: promptExpanded ? 0 : 1, x: promptExpanded ? -8 : 0, y: promptExpanded ? 6 : 0 }}
                transition={mediaContentTransition}
              >
                <div className='flex items-center gap-1 rounded-2xl border border-white/12 bg-black/72 p-1.5 text-white shadow-xl backdrop-blur-xl'>
                  <button
                    type='button'
                    onClick={() => void runMediaAction('download')}
                    disabled={isSaving}
                    className='flex size-9 items-center justify-center rounded-xl text-white/75 transition hover:bg-white/12 hover:text-white disabled:opacity-40'
                    aria-label={zh ? '下载' : 'Download'}
                    title={zh ? '下载' : 'Download'}
                  >
                    <Download className='size-4' />
                  </button>
                  <button
                    type='button'
                    onClick={() => void runMediaAction('save')}
                    disabled={isSaving}
                    className='flex h-9 items-center gap-2 rounded-xl px-3 text-xs text-white/75 transition hover:bg-white/12 hover:text-white disabled:opacity-40'
                    aria-label={zh ? '另存为' : 'Save as'}
                    title={zh ? '另存为' : 'Save as'}
                  >
                    <Save className='size-4' />
                    <span className={compactMediaToolbar ? 'sr-only' : undefined}>{zh ? '另存为' : 'Save as'}</span>
                  </button>
                  {!mediaExpanded ? (
                    <button
                      type='button'
                      onClick={() => enterViewerMode('media')}
                      className='flex h-9 items-center gap-2 rounded-xl px-3 text-xs text-white/75 transition hover:bg-white/12 hover:text-white'
                      aria-label={fullMediaActionLabel}
                      title={fullMediaActionLabel}
                    >
                      <ImageIcon className='size-4' />
                      <span className={compactMediaToolbar ? 'sr-only' : undefined}>{fullMediaLabel}</span>
                    </button>
                  ) : null}
                  {isImage && !compactMediaToolbar ? (
                    <>
                      <span className='mx-1 h-5 w-px bg-white/15' />
                      <button
                        type='button'
                        onClick={() => setViewerZoom(zoom - ZOOM_STEP)}
                        disabled={zoom <= MIN_MEDIA_ZOOM}
                        className='flex size-9 items-center justify-center rounded-xl text-white/75 transition hover:bg-white/12 hover:text-white disabled:opacity-30'
                        aria-label={zh ? '缩小' : 'Zoom out'}
                        title={zh ? '缩小' : 'Zoom out'}
                      >
                        <ZoomOut className='size-4' />
                      </button>
                      <span className='w-11 text-center text-[11px] text-white/65 tabular-nums'>
                        {Math.round(zoom * 100)}%
                      </span>
                      <button
                        type='button'
                        onClick={() => setViewerZoom(zoom + ZOOM_STEP)}
                        disabled={zoom >= MAX_MEDIA_ZOOM}
                        className='flex size-9 items-center justify-center rounded-xl text-white/75 transition hover:bg-white/12 hover:text-white disabled:opacity-30'
                        aria-label={zh ? '放大' : 'Zoom in'}
                        title={zh ? '放大' : 'Zoom in'}
                      >
                        <ZoomIn className='size-4' />
                      </button>
                      <button
                        type='button'
                        onClick={resetViewer}
                        disabled={zoom === MIN_MEDIA_ZOOM}
                        className='flex size-9 items-center justify-center rounded-xl text-white/75 transition hover:bg-white/12 hover:text-white disabled:opacity-30'
                        aria-label={zh ? '适应窗口' : 'Fit to view'}
                        title={zh ? '适应窗口' : 'Fit to view'}
                      >
                        <RotateCcw className='size-4' />
                      </button>
                    </>
                  ) : null}
                </div>
                {mediaExpanded ? (
                  <MotionDiv
                    whileTap={reduceMotion ? undefined : { scale: 0.975 }}
                    transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 28 }}
                  >
                    <Button type='button' variant='ghost' size='sm' onClick={restoreSplitView}>
                      <Minimize2 className='size-4' />
                      {zh ? '返回分栏' : 'Return to split view'}
                    </Button>
                  </MotionDiv>
                ) : null}
              </MotionDiv>
            </MotionSection>

            <div
              ref={promptPreviewRef}
              className='bg-background/88 pointer-events-none invisible absolute inset-0 z-20 flex items-center justify-center opacity-0 backdrop-blur-sm transition-[opacity,visibility] duration-150'
              aria-hidden='true'
            >
              <div className='border-primary/15 bg-primary/10 text-primary flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-lg'>
                <FileText className='size-4' />
                {zh ? '松开显示完整提示词' : 'Release to show the full prompt'}
              </div>
            </div>

            <div
              ref={mediaPreviewRef}
              className='pointer-events-none invisible absolute inset-0 z-20 flex items-center justify-center bg-black/48 opacity-0 backdrop-blur-sm transition-[opacity,visibility] duration-150'
              aria-hidden='true'
            >
              <div className='flex items-center gap-2 rounded-full border border-white/15 bg-black/68 px-4 py-2.5 text-sm font-semibold text-white shadow-xl'>
                <ImageIcon className='size-4' />
                {isImage
                  ? zh
                    ? '松开显示完整图片'
                    : 'Release to show the full image'
                  : zh
                    ? '松开显示完整视频'
                    : 'Release to show the full video'}
              </div>
            </div>

            <MotionButton
              ref={dividerRef}
              type='button'
              role='separator'
              className='group focus-visible:ring-primary/45 absolute inset-y-0 z-30 hidden w-8 cursor-col-resize touch-none items-center justify-center focus-visible:ring-2 focus-visible:outline-none min-[900px]:flex'
              initial={false}
              animate={{
                left: isDividerDragging
                  ? `${dragPercentRef.current}%`
                  : promptExpanded
                    ? '0%'
                    : mediaExpanded
                      ? '100%'
                      : `${splitPercent}%`,
                x: isDividerDragging ? '-50%' : promptExpanded ? '0%' : mediaExpanded ? '-100%' : '-50%',
              }}
              transition={isDividerDragging ? { duration: 0 } : panelTransition}
              onPointerDown={handleDividerStart}
              onPointerMove={handleDividerMove}
              onPointerUp={handleDividerEnd}
              onPointerCancel={cancelDividerDrag}
              onLostPointerCapture={cancelDividerDrag}
              onKeyDown={handleDividerKeyDown}
              aria-label={zh ? '调整图片和提示词宽度' : 'Resize media and prompt panels'}
              aria-orientation='vertical'
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={promptExpanded ? 0 : mediaExpanded ? 100 : Math.round(splitPercent)}
              aria-valuetext={
                promptExpanded
                  ? zh
                    ? '完整提示词'
                    : 'Full prompt'
                  : mediaExpanded
                    ? fullMediaLabel
                    : zh
                      ? `图片 ${Math.round(splitPercent)}%，提示词 ${100 - Math.round(splitPercent)}%`
                      : `Image ${Math.round(splitPercent)}%, prompt ${100 - Math.round(splitPercent)}%`
              }
              aria-controls='prompt-detail-media prompt-detail-prompt'
              title={zh ? '拖动调整分栏，方向键微调' : 'Drag to resize; use arrow keys for fine adjustments'}
            >
              <span className='bg-border group-hover:bg-primary group-focus-visible:bg-primary absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors' />
              <span className='bg-background border-border group-hover:border-primary relative flex h-9 w-4 items-center justify-center rounded-full border shadow-sm transition-colors'>
                <GripVertical className='text-muted-foreground group-hover:text-primary size-3 transition-colors' />
              </span>
            </MotionButton>

            <MotionSection
              id='prompt-detail-prompt'
              layout={!reduceMotion && !isDividerDragging}
              className='border-border grid min-h-0 min-w-0 flex-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden border-l'
              initial={false}
              animate={{ opacity: mediaExpanded ? 0 : 1, x: mediaExpanded ? 16 : 0 }}
              transition={promptLayoutTransition}
              aria-hidden={mediaExpanded}
              inert={mediaExpanded ? true : undefined}
            >
              <div
                data-testid='prompt-detail-scroll'
                className='custom-scrollbar min-h-0 overflow-y-auto px-5 pt-3 pb-5 min-[900px]:px-6 min-[900px]:pt-5 min-[900px]:pb-8'
              >
                <MotionDiv
                  layout={!reduceMotion && !isDividerDragging}
                  initial={false}
                  animate={{ opacity: promptExpanded ? 1 : 0.94 }}
                  transition={promptContentTransition}
                >
                  <DialogDescription
                    className={`${
                      promptExpanded
                        ? 'text-foreground/80 max-w-5xl text-base leading-8'
                        : 'text-muted-foreground text-sm leading-7 min-[900px]:text-[15px]'
                    } whitespace-pre-line ${
                      isDividerDragging
                        ? 'transition-none'
                        : 'transition-[color,font-size,line-height] duration-500 ease-out motion-reduce:transition-none'
                    }`}
                  >
                    {prompt.prompt}
                  </DialogDescription>
                </MotionDiv>
              </div>
              <div
                data-testid='prompt-detail-footer'
                className='border-border flex min-h-[78px] items-center justify-between gap-3 border-t px-5 py-4 min-[900px]:px-6'
              >
                <Button type='button' onClick={() => onCopy(prompt)}>
                  {copied ? <Check className='size-4' /> : <Copy className='size-4' />}
                  {copied
                    ? zh
                      ? '已复制'
                      : 'Copied'
                    : promptExpanded
                      ? zh
                        ? '复制完整提示词'
                        : 'Copy full prompt'
                      : zh
                        ? '复制提示词'
                        : 'Copy prompt'}
                </Button>
                <MotionDiv
                  whileTap={reduceMotion ? undefined : { scale: 0.975 }}
                  transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 28 }}
                >
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    aria-expanded={promptExpanded}
                    onClick={() => (promptExpanded ? restoreSplitView() : enterViewerMode('prompt'))}
                    className='transition-colors duration-200'
                  >
                    <MotionDiv
                      className='inline-flex'
                      initial={false}
                      animate={{ rotate: promptExpanded ? 180 : 0, scale: promptExpanded ? 0.96 : 1 }}
                      transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 22 }}
                    >
                      {promptExpanded ? <Minimize2 className='size-4' /> : <Expand className='size-4' />}
                    </MotionDiv>
                    {promptExpanded ? (zh ? '返回分栏' : 'Return to split view') : zh ? '完整显示' : 'Full view'}
                  </Button>
                </MotionDiv>
              </div>
            </MotionSection>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
