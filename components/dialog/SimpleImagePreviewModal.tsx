'use client';

import { useRouter } from '@/i18n/navigation';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Dialog, DialogContent, DialogPortal } from '@/components/ui/dialog';

import { MediaGrid, ModelTag, PromptSection } from './DetailModalComponents';

interface SimpleImagePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: {
    url: string;
    originalUrls?: string[];
    prompt?: string;
    modelName?: string;
  };
}

export default function SimpleImagePreviewModal({ open, onOpenChange, image }: SimpleImagePreviewModalProps) {
  const t = useTranslations('nano-banana-prompt.modal');
  const tDetail = useTranslations('Profile.image-history.detail');
  const router = useRouter();

  const handleRecreate = () => {
    onOpenChange(false);
    router.push(`/text-to-image${image.prompt ? `?prompt=${encodeURIComponent(image.prompt)}` : ''}`);
  };

  const userImageUrlList = image.originalUrls || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent
          className='h-[calc(100vh-24px)] max-h-[700px] w-[calc(100vw-16px)] max-w-[1453px] border-none bg-transparent p-0 shadow-none sm:max-w-[1453px]'
          showCloseButton={false}
          overlayClassName='bg-black/80'
          hiddenTitle={t('title')}
        >
          <div className='flex h-full w-full flex-col overflow-hidden rounded-lg shadow-lg lg:flex-row'>
            {/* Left: Image Section */}
            <div className='flex h-[40vh] w-full shrink-0 items-center justify-center bg-[#111214] p-3 lg:h-full lg:flex-1 lg:p-6'>
              <img src={image.url} alt='Preview' className='max-h-full max-w-full rounded object-contain' />
            </div>

            {/* Right: Info Panel */}
            <div className='flex min-h-0 w-full flex-1 flex-col bg-[#16171b] lg:h-full lg:w-[450px] lg:flex-none'>
              {/* Header - Fixed */}
              <div className='flex shrink-0 items-center justify-between border-b border-[#34353b] p-3'>
                <h2 className='text-2xl leading-8 font-medium text-white capitalize'>{t('title')}</h2>
                <button
                  type='button'
                  onClick={() => onOpenChange(false)}
                  className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-[3px] transition-colors hover:bg-white/10'
                >
                  <X className='h-5 w-5 text-white' />
                </button>
              </div>

              {/* Scrollable Content Section */}
              <div className='custom-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto p-3'>
                {/* Images Section - Show original image if exists */}
                {userImageUrlList.length > 0 && (
                  <MediaGrid
                    title={tDetail('images')}
                    mediaUrls={userImageUrlList}
                    columns={5}
                    itemHeight='h-20 aspect-square'
                  />
                )}

                {/* Prompt Section */}
                {image.prompt && <PromptSection prompt={image.prompt} />}

                {/* Model Version Tag */}
                {image.modelName && <ModelTag modelName={image.modelName} />}
              </div>

              {/* Bottom Actions - Fixed */}
              <div className='flex shrink-0 gap-2 border-t border-[#34353b] p-3'>
                {/* Recreate Button */}
                <button
                  type='button'
                  onClick={handleRecreate}
                  className='bg-color-main hover:bg-color-main/80 flex h-[42px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-colors'
                >
                  {t('recreate')}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
