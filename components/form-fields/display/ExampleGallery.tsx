'use client';

import { useState } from 'react';
import { Masonry } from 'react-plock';

import { cn } from '@/lib/utils';
import SimpleImagePreviewModal from '@/components/dialog/SimpleImagePreviewModal';
import SubHeading from '@/components/internal-page/sub-heading';
import { ExampleIcon } from '@/components/svg/section/common';

export interface ExampleImage {
  id: string;
  url: string;
  originalUrls?: string[];
  prompt?: string;
  modelName?: string;
}

interface ExampleGalleryProps {
  title: string;
  description?: string;
  images: ExampleImage[];
  className?: string;
}

export default function ExampleGallery({ title, description, images, className }: ExampleGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ExampleImage | null>(null);

  return (
    <>
      <div className={cn('container-centered container-py', className)}>
        <SubHeading icon={<ExampleIcon />} title={title} description={description} className='mb-8' />

        <Masonry
          items={images}
          config={{
            columns: [2, 6],
            gap: [12, 20],
            media: [768, 1709],
          }}
          render={(image) => (
            <div
              key={image.id}
              className='group relative cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-[1.02]'
              onClick={() => setSelectedImage(image)}
            >
              <img src={image.url} alt={image.id} className='h-auto w-full' />
              <div className='absolute inset-0 bg-black/0 transition-all group-hover:bg-black/20' />
            </div>
          )}
        />
      </div>

      {selectedImage && (
        <SimpleImagePreviewModal
          open={!!selectedImage}
          onOpenChange={(open) => !open && setSelectedImage(null)}
          image={selectedImage}
        />
      )}
    </>
  );
}
