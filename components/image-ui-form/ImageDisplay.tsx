'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { deleteImageById } from '@/network/image/client';
import { refreshImageHistory } from '@/network/image/history';
import useImageFormStore from '@/store/form/useImageFormStore';
import { ChevronDown, Download, ImageIcon, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { ALL_IMAGE_MODELS, getImageModelVersionName } from '@/lib/constants/image';
import { cn } from '@/lib/utils';
import { detectImageFormat } from '@/lib/utils/fileUtils';
import { formatDate } from '@/lib/utils/timeUtils';
import useImageConverter, { ImageType, imageTypesList } from '@/hooks/useImageConverter';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import CopyBtn from '@/components/CopyBtn';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import Spinning from '@/components/Spinning';

import { useImageContext } from './image-context-provider';
import ImageItem from './shared/image-item';
import Loading from './shared/loading';

const ImageDetailModal = dynamic(() => import('@/components/dialog/ImageDetailModal'), { ssr: false });

export default function ImageDisplay() {
  const t = useTranslations('components.image-form.display');
  const tCommon = useTranslations('Common');
  const formType = useImageContext();
  const imageObj = useImageFormStore((state) => state.imageObj);
  const updateImageObj = useImageFormStore((state) => state.updateImageObj);
  // const layerImageObj = useImageFormStore((state) => state.layerImageObj);
  const isPolling = useImageFormStore((state) => state.isPolling);

  const { convertAndDownload, isLoading } = useImageConverter();
  const [imageType, setImageType] = useState<ImageType>('png');
  const [showVideoInfo, setShowVideoInfo] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);

  // Detect actual image format and set as default
  useEffect(() => {
    if (!imageObj || typeof imageObj !== 'object' || !imageObj.src) return;

    detectImageFormat(imageObj.src).then((format) => {
      if (format) {
        const formatMap: Record<string, ImageType> = {
          WEBP: 'webp',
          PNG: 'png',
          JPG: 'jpg',
        };
        const detectedType = formatMap[format];
        if (detectedType) setImageType(detectedType);
      }
    });
  }, [imageObj]);

  const imageHasData = !!imageObj && typeof imageObj === 'object';

  const onShowDetail = () => {
    if (!!imageObj && typeof imageObj === 'object') {
      setIsDetailModalOpen(true);
    }
  };

  let previewImgSrc = '';
  let mode: 'preview' | 'fallback' = 'fallback';

  if (typeof imageObj === 'object' && imageObj?.mediaList) {
    const fallbackMedia = imageObj.mediaList.find((item) => item.formType === formType);

    if (fallbackMedia) {
      mode = 'fallback';
      previewImgSrc = fallbackMedia.imgSrc;
    }
  }

  if (typeof imageObj === 'object' && imageObj?.src) {
    mode = 'preview';
    previewImgSrc = imageObj.src;
  }

  // Preset image (fallback) or no imageObj disables all action buttons
  const btnDisabled = !imageObj || imageObj === 'loading' || mode === 'fallback';

  const onDownload = async () => {
    if (!!imageObj && typeof imageObj === 'object' && imageObj.src && imageObj.name) {
      convertAndDownload({ imageUrl: imageObj.src, type: imageType, imageName: imageObj.name });
    }
  };

  const onDelete = async () => {
    if (!imageObj || typeof imageObj !== 'object' || !imageObj.id) return;
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const res = await deleteImageById(imageObj.id);
      if (res.code === 200) {
        refreshImageHistory();
        toast.success(res.msg || t('deleteSuccess'));
        updateImageObj(null);
      } else {
        toast.error(res.msg || t('deleteFail'));
      }
    } catch (error: any) {
      toast.error(error.message || t('deleteFail'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      id='ImageDisplay'
      className='flex h-[440px] w-full flex-col overflow-hidden rounded-2xl contain-strict lg:flex-1'
    >
      <div className='bg-card relative flex size-full flex-col rounded-2xl'>
        {/* Image display area - uses flex-1 to automatically occupy remaining space */}
        <div className='relative flex flex-1 items-center justify-center overflow-hidden p-2'>
          {previewImgSrc && (
            <>
              <img
                key={previewImgSrc}
                src={previewImgSrc}
                alt='img'
                data-mode={mode}
                loading='eager'
                decoding='async'
                className='max-h-full max-w-full rounded object-contain'
              />

              <button
                type='button'
                onClick={() => updateImageObj(null)}
                className='absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-lg bg-black/20 text-white/70 backdrop-blur'
              >
                <X className='size-4' />
              </button>
            </>
          )}

          {!imageHasData && imageObj !== 'loading' && !isPolling && (
            <div className='text-foreground/60 flex flex-col items-center gap-3'>
              <ImageIcon className='text-foreground/40 size-10' />
              {t('noImage')}
            </div>
          )}

          {(imageObj === 'loading' || isPolling) && !imageHasData && (
            <div className='flex items-center justify-center'>
              <Loading />
            </div>
          )}
        </div>

        {/* Toolbar area */}
        {!btnDisabled && (
          <div className='bg-card relative flex flex-none flex-wrap items-start justify-between gap-2 rounded-b-xl p-2 lg:items-center lg:gap-3'>
            {/* Left info: time, resolution, model */}
            <div className='text-foreground/60 flex flex-col gap-1 text-xs'>
              <div className='flex items-center gap-1.5'>
                {imageObj.createTime && <span>{formatDate(imageObj.createTime)}</span>}
                {imageObj.createTime && (imageObj.resolution || (imageObj.width && imageObj.height)) && (
                  <span className='hidden lg:inline'>|</span>
                )}
                {imageObj.resolution ? (
                  <span>{imageObj.resolution}</span>
                ) : imageObj.width && imageObj.height ? (
                  <span>
                    {imageObj.width}x{imageObj.height}
                  </span>
                ) : null}
              </div>
              {imageObj.modelName && (
                <div className='text-foreground/80'>
                  {tCommon('model')}: {getImageModelVersionName(imageObj.modelName) || imageObj.modelName}
                </div>
              )}
            </div>

            {/* Right action buttons */}
            <div className='flex flex-wrap items-center gap-1'>
              {/* Prompt */}
              {imageObj.prompt && (
                <div className='border-border bg-card flex h-9 items-center gap-1 rounded-xl border px-2 lg:h-10'>
                  <CopyBtn content={imageObj.prompt} />
                  <Popover open={showVideoInfo} onOpenChange={setShowVideoInfo}>
                    <PopoverTrigger asChild>
                      <button
                        type='button'
                        onClick={() => setShowVideoInfo(!showVideoInfo)}
                        className='text-muted-foreground flex cursor-pointer items-center gap-1 text-xs lg:text-sm'
                      >
                        {t('prompt')}
                        <ChevronDown
                          className={cn('size-3.5 rotate-0 transition duration-200', showVideoInfo && '-rotate-180')}
                        />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      side='top'
                      className='border-border bg-card text-foreground max-h-60 overflow-auto p-3 shadow-md'
                      sideOffset={15}
                    >
                      {imageObj.prompt}
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Image detail */}
              <button
                type='button'
                onClick={onShowDetail}
                className='border-border bg-card text-muted-foreground hover:bg-card flex h-9 cursor-pointer items-center rounded-xl border px-3 text-xs lg:h-10 lg:text-sm'
              >
                {t('imageDetail')}
              </button>

              {/* Download button + format selection */}
              <div className='border-border bg-card relative flex h-9 items-center rounded-xl border lg:h-10'>
                <button
                  type='button'
                  onClick={onDownload}
                  disabled={isLoading}
                  className='hover:bg-card flex h-full cursor-pointer items-center justify-center rounded-l-xl px-2.5 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {isLoading ? (
                    <Spinning className='text-foreground size-4 lg:size-5' />
                  ) : (
                    <Download className='text-foreground size-4 lg:size-5' />
                  )}
                </button>
                <div className='bg-card h-full w-px' />
                <button
                  type='button'
                  onClick={() => setShowFormatMenu(!showFormatMenu)}
                  className='hover:bg-card flex h-full cursor-pointer items-center gap-1 rounded-r-xl px-2.5'
                >
                  <span className='text-foreground text-xs uppercase lg:text-sm'>{imageType}</span>
                  <ChevronDown className='text-foreground size-3.5' />
                </button>

                {/* Format Menu */}
                {showFormatMenu && (
                  <div className='border-border bg-card absolute right-0 bottom-full z-50 mb-2 flex flex-col gap-1 rounded-xl border p-1 shadow-lg'>
                    {imageTypesList.map((type) => (
                      <button
                        key={type}
                        type='button'
                        onClick={() => {
                          setImageType(type);
                          setShowFormatMenu(false);
                        }}
                        className='text-foreground hover:bg-foreground/10 rounded-lg px-3 py-1.5 text-sm uppercase transition-colors'
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Delete */}
              <button
                type='button'
                onClick={() => setOpenDeleteDialog(true)}
                disabled={isDeleting}
                className='border-border bg-card text-muted-foreground flex size-9 cursor-pointer items-center justify-center rounded-xl border hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 lg:size-10'
              >
                <Trash2 className='size-4 lg:size-5' strokeWidth={1} />
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog open={openDeleteDialog} setOpen={setOpenDeleteDialog} callback={onDelete} />
      {isDetailModalOpen && imageObj && typeof imageObj === 'object' && (
        <ImageDetailModal
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          onDelete={() => updateImageObj(null)}
          image={{
            id: imageObj.id!,
            url: imageObj.src!,
            title: imageObj.name,
            prompt: imageObj.prompt,
            createTime: imageObj.createTime,
            width: imageObj.width,
            height: imageObj.height,
            resolution: imageObj.resolution,
            modelName: imageObj.modelName,
            userImageUrlList: imageObj.userImageUrlList,
            size: imageObj.size,
          }}
        />
      )}
    </div>
  );
}
