// -nocheck
// Pinned OSS source; compatibility is isolated outside this closure.
// @ts-nocheck -- pinned OSS source; compatibility is isolated outside this closure.
import { useEffect, useMemo, useState } from 'react';
import { ImagePlus } from 'lucide-react';

import {
  MAX_UPSCALE_LONG_EDGE,
  resolveUpscaleSize,
  type ImageUpscaleAlgorithm,
  type ImageUpscaleParams,
} from '../../lib/canvas/canvas-image-data';
import { readImageMeta } from '../../lib/image-utils';
import { useInfiniteCanvasTranslation } from '../../runtime/i18n/infinite-canvas-translation';
import { Button, Modal, Segmented } from '../../runtime/ui/source-ui';

export type CanvasImageUpscaleParams = ImageUpscaleParams;

const algorithms: ImageUpscaleAlgorithm[] = ['high', 'bilinear', 'nearest'];

const targetOptions = [
  { label: '1K', value: 1024 },
  { label: '2K', value: 2048 },
  { label: '4K', value: MAX_UPSCALE_LONG_EDGE },
];

const defaultParams: CanvasImageUpscaleParams = {
  targetLongEdge: 2048,
  algorithm: 'high',
};

export function CanvasNodeUpscaleDialog({
  dataUrl,
  open,
  onClose,
  onConfirm,
}: {
  dataUrl: string;
  open: boolean;
  onClose: () => void;
  onConfirm: (params: CanvasImageUpscaleParams) => void;
}) {
  const { t } = useInfiniteCanvasTranslation();
  const [params, setParams] = useState<CanvasImageUpscaleParams>(defaultParams);
  const [image, setImage] = useState<{ width: number; height: number } | null>(null);
  const sourceLongEdge = image ? Math.max(image.width, image.height) : 0;
  const outputSize = useMemo(
    () => (image ? resolveUpscaleSize(image.width, image.height, params.targetLongEdge) : null),
    [image, params.targetLongEdge],
  );
  const canUpscale = Boolean(
    image && sourceLongEdge < params.targetLongEdge && params.targetLongEdge <= MAX_UPSCALE_LONG_EDGE,
  );
  const reachedMax = Boolean(image && sourceLongEdge >= MAX_UPSCALE_LONG_EDGE);

  useEffect(() => {
    if (!open) return;
    setParams(defaultParams);
    setImage(null);
  }, [dataUrl, open]);

  useEffect(() => {
    if (!open) return;
    void readImageMeta(dataUrl).then(setImage);
  }, [dataUrl, open]);

  useEffect(() => {
    if (!image) return;
    const nextTarget = targetOptions.find((option) => sourceLongEdge < option.value)?.value || MAX_UPSCALE_LONG_EDGE;
    setParams((current) => ({ ...current, targetLongEdge: nextTarget }));
  }, [image, sourceLongEdge]);

  return (
    <Modal
      title={null}
      open={open && Boolean(dataUrl)}
      onCancel={onClose}
      footer={null}
      width={820}
      centered
      destroyOnHidden
    >
      <div className='space-y-5'>
        <div>
          <h2 className='text-xl font-semibold'>{t('canvas.editors.upscaleTitle')}</h2>
        </div>
        <div className='grid gap-6 md:grid-cols-[minmax(260px,1fr)_360px]'>
          <div className='rounded-xl border border-canvas-border bg-canvas-panel p-4'>
            <div className='grid min-h-[280px] place-items-center rounded-lg border border-canvas-border bg-canvas-surface'>
              <img
                src={dataUrl}
                alt=''
                className='max-h-[320px] max-w-full rounded-lg object-contain shadow-xl'
                draggable={false}
              />
            </div>
            <div className='mt-3 flex items-center justify-between text-sm'>
              <span className='opacity-60'>{t('canvas.editors.source')}</span>
              <span className='font-semibold'>
                {image ? `${image.width} x ${image.height} px` : t('canvas.editors.loading')}
              </span>
            </div>
          </div>
          <div className='space-y-6 py-2'>
            <div className='space-y-2'>
              <div className='font-medium opacity-75'>{t('canvas.editors.targetPixels')}</div>
              <Segmented
                className='flex w-full border border-canvas-border bg-canvas-surface'
                value={params.targetLongEdge}
                options={targetOptions.map((option) => ({
                  label: `${option.label} · ${option.value}px`,
                  value: option.value,
                  disabled: Boolean(image && sourceLongEdge >= option.value),
                }))}
                onChange={(value) => setParams((current) => ({ ...current, targetLongEdge: Number(value) }))}
              />
              {image && !canUpscale ? (
                <div className='text-destructive-color text-xs font-medium'>
                  {reachedMax ? t('canvas.editors.maxReached') : t('canvas.editors.targetReached')}
                </div>
              ) : null}
            </div>
            <div className='space-y-2'>
              <div className='font-medium opacity-75'>{t('canvas.editors.algorithm')}</div>
              <Segmented
                className='flex w-full flex-col gap-1 border border-canvas-border bg-canvas-panel [&>button]:!h-auto [&>button]:w-full [&>button]:justify-start [&>button]:border [&>button]:border-transparent [&>button]:px-3 [&>button]:py-2.5 [&>button]:text-left [&>button[aria-pressed=true]]:border-canvas-border [&>button[aria-pressed=true]]:bg-canvas-surface'
                value={params.algorithm}
                options={algorithms.map((algorithm) => ({
                  value: algorithm,
                  label: (
                    <span className='flex min-h-10 min-w-0 flex-col justify-center text-left leading-5'>
                      <span className='font-medium'>{t(`canvas.editors.${algorithm}`)}</span>
                      <span className='text-xs opacity-55'>{t(`canvas.editors.${algorithm}Description`)}</span>
                    </span>
                  ),
                }))}
                onChange={(value) =>
                  setParams((current) => ({ ...current, algorithm: value as ImageUpscaleAlgorithm }))
                }
              />
            </div>
            <div className='rounded-xl border border-canvas-border bg-canvas-surface px-4 py-3 text-sm text-canvas-text'>
              <div className='flex items-center justify-between'>
                <span className='opacity-60'>{t('canvas.editors.outputSize')}</span>
                <span className='font-semibold'>
                  {outputSize ? `${outputSize.width} x ${outputSize.height} px` : t('canvas.editors.unknown')}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className='flex justify-end'>
          <Button
            type='primary'
            size='large'
            icon={<ImagePlus className='size-4' />}
            disabled={!canUpscale}
            onClick={() => onConfirm(params)}
          >
            {t('canvas.editors.upscale')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
