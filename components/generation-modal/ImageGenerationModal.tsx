'use client';

import { useEffect, useRef, useState } from 'react';
import useUserImageHistory from '@/network/image/history';
import useImageFormStore from '@/store/form/useImageFormStore';
import { useTranslations } from 'next-intl';

import {
  GPT_PROVIDER,
  NANO_BANANA_PROVIDER,
  SEEDREAM_PROVIDER,
  type ImageModelVersionConfig,
} from '@/lib/constants/image';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ModalImageDisplay from '@/components/generation-modal/ModalImageDisplay';
import ImageHistoryMasonry from '@/components/history/ImageHistoryMasonry';
import ImageForm from '@/components/image-ui-form/image-form';
import ImageHistory from '@/components/image-ui-form/image-history';
import ImageHistoryTitle from '@/components/image-ui-form/image-history-title';
import { ScrollRef } from '@/components/image-ui-form/shared/scroll';

const ALL_AVAILABLE_VERSIONS: ImageModelVersionConfig[] = [
  ...GPT_PROVIDER.versions,
  ...SEEDREAM_PROVIDER.versions,
  ...NANO_BANANA_PROVIDER.versions,
];

interface ImageGenerationModalProps {
  // The following three properties are injected via cloneElement, so marked as optional
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onImageSelect?: (imageUrl: string) => void;
  generateTabTitle: string;
  historyTabTitle: string;
  confirmButtonText?: string;
  // Conditional display control
  showMultiImageUpload?: boolean;
  showAspectRatio?: boolean;
  showResolution?: boolean;
  useBottomActionArea?: boolean;
  requireImageUpload?: boolean;
  // Default value configuration
  defaultAspectRatio?: string;
  // Slot props
  customUploadSection?: React.ReactNode;
  customHintsSection?: React.ReactNode;
  // Support independent polling state for start and end frames
  imageObjContext?: 'default' | 'start-frame' | 'end-frame';
}

export default function ImageGenerationModal({
  open,
  onOpenChange,
  onImageSelect,
  generateTabTitle,
  historyTabTitle,
  confirmButtonText,
  showMultiImageUpload = true,
  showAspectRatio = true,
  showResolution = true,
  useBottomActionArea = false,
  requireImageUpload = false,
  defaultAspectRatio,
  customUploadSection,
  customHintsSection,
  imageObjContext = 'default',
}: ImageGenerationModalProps) {
  const t = useTranslations('components.image-form');

  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [pageNum, setPageNum] = useState(1);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollRef = useRef<ScrollRef>(null);

  const { data: imageHistory, total: imageHistoryTotal, isLoading } = useUserImageHistory(pageNum, 30);
  const updateImageObj = useImageFormStore((state) => state.updateImageObj);

  // Default to GPT Image 2 for text-to-image generation.
  const defaultVersion =
    GPT_PROVIDER.versions.find((v) => v.modelVersion === 'gpt-image-2') || GPT_PROVIDER.versions[0];

  // Reset tab when modal closes, but keep imageObj to allow polling to complete and save results
  useEffect(() => {
    if (!open) {
      setActiveTab('generate');
      // Don't reset imageObj, allow background polling to continue and save results
    }
  }, [open]);

  const handleImageSelect = (imageUrl: string) => {
    onImageSelect?.(imageUrl);
    onOpenChange?.(false);
  };

  const showBackToStart = scrollLeft > 200;

  const handleBackToStart = () => {
    scrollRef.current?.scrollToStart();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='flex h-[90vh] w-full max-w-5xl flex-col gap-0 overflow-hidden bg-[#0f1011] p-0 sm:h-[85vh] sm:max-w-5xl md:h-[90vh]'
        overlayClassName='bg-black/50'
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className='border-foreground/10 border-b px-3 pt-2.5 sm:px-4 sm:pt-3 md:px-6 md:pt-4'>
          <DialogTitle className='flex flex-row items-center gap-2 text-base font-normal sm:gap-3 sm:text-lg md:gap-4'>
            <button
              type='button'
              onClick={() => setActiveTab('generate')}
              className={cn(
                'cursor-pointer whitespace-nowrap transition-all',
                activeTab === 'generate' ? 'text-color-main' : 'text-foreground/40 hover:text-foreground/60',
              )}
            >
              {generateTabTitle}
            </button>
            <button
              type='button'
              onClick={() => setActiveTab('history')}
              className={cn(
                'cursor-pointer whitespace-nowrap transition-all',
                activeTab === 'history' ? 'text-color-main' : 'text-foreground/40 hover:text-foreground/60',
              )}
            >
              {historyTabTitle}
            </button>
          </DialogTitle>
          <DialogDescription className='sr-only'>{generateTabTitle}</DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            'flex flex-1 flex-col overflow-auto p-2 sm:p-3 md:overflow-hidden',
            activeTab !== 'generate' && 'hidden',
          )}
        >
          <div className='h-full w-full md:[&>div]:!h-full'>
            <ImageForm
              imageFormType='text-to-image'
              customVersionList={ALL_AVAILABLE_VERSIONS}
              imageObjContext={imageObjContext}
              defaultValuePriority={{
                aspectRatio: ['9:16', 'auto', '1:1'],
                resolution: ['2k'],
              }}
              defaultValues={{
                modelVersion: defaultVersion?.modelVersion || 'gpt-image-2',
                aspectRatio: defaultAspectRatio || defaultVersion?.options?.ratio?.[0]?.value || '9:16',
                resolution: '2k',
              }}
              showRatio={showAspectRatio}
              imageUploadMode={showMultiImageUpload ? 'auto' : 'none'}
              requireImageUpload={requireImageUpload}
              submitBtnId='text-to-image-modal-submitBtnId'
              slotNodeAfterModel={
                customUploadSection ? (
                  <>
                    {customUploadSection}
                    {customHintsSection}
                  </>
                ) : customHintsSection ? (
                  customHintsSection
                ) : undefined
              }
              customRightContent={
                <div className='flex min-h-[400px] w-full flex-1 flex-col gap-3 overflow-hidden lg:h-full'>
                  <ModalImageDisplay imageObjContext={imageObjContext} onImageSelect={handleImageSelect} />
                  <ImageHistoryTitle showBackToStart={showBackToStart} onBackToStart={handleBackToStart} />
                  <ImageHistory ref={scrollRef} imageObjContext={imageObjContext} onScrollChange={setScrollLeft} />
                </div>
              }
            />
          </div>
        </div>

        <div
          className={cn(
            'flex flex-1 flex-col overflow-hidden rounded-xl p-2 sm:p-3',
            activeTab !== 'history' && 'hidden',
          )}
        >
          <ImageHistoryMasonry
            imageHistory={imageHistory}
            total={imageHistoryTotal || 0}
            isLoading={isLoading}
            pageNum={pageNum}
            onPageChange={setPageNum}
            onImageSelect={handleImageSelect}
            confirmButtonText={confirmButtonText}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
