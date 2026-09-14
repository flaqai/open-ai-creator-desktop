'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';

import { FrameImageUpload } from '@/components/form-fields';
import type { FrameImageUploadRef } from '@/components/form-fields';
import SubHeading from '@/components/form/SubHeading';
import { ObjectIcon, SubjectIcon } from '@/components/svg/form/image-upload-with-frame';

// Empty modal component, as ProductUploadSection doesn't need a modal
function EmptyModal() {
  return null;
}

export interface ProductUploadSectionRef {
  setSubjectImage: (file: File | string) => void;
  setObjectImage: (file: File | string) => void;
}

interface ProductUploadSectionProps {
  title?: string;
  subjectLabel: string;
  objectLabel: string;
  sampleImages?: {
    subject: string;
    object: string;
  };
  hintsSection?: React.ReactNode;
}

const ProductUploadSection = forwardRef<ProductUploadSectionRef, ProductUploadSectionProps>(
  ({ title, subjectLabel, objectLabel, sampleImages, hintsSection }, ref) => {
    const subjectRef = useRef<FrameImageUploadRef>(null);
    const objectRef = useRef<FrameImageUploadRef>(null);

    useImperativeHandle(
      ref,
      () => ({
        setSubjectImage: (file: File | string) => {
          subjectRef.current?.previewImage(file);
        },
        setObjectImage: (file: File | string) => {
          objectRef.current?.previewImage(file);
        },
      }),
      [],
    );

    return (
      <div className='flex flex-col gap-2.5'>
        {title && <SubHeading>{title}</SubHeading>}

        <div className='border-border bg-card flex flex-col gap-1 rounded-xl border p-1'>
          <FrameImageUpload
            ref={subjectRef}
            name='subjectImage'
            label={subjectLabel}
            icon={<SubjectIcon className='text-foreground/70 size-5' />}
            sampleImage={sampleImages?.subject}
            showAiGeneration={false}
            modalComponent={<EmptyModal />}
          />

          <FrameImageUpload
            ref={objectRef}
            name='objectImage'
            label={objectLabel}
            icon={<ObjectIcon className='text-foreground/70 size-5' />}
            sampleImage={sampleImages?.object}
            showAiGeneration={false}
            modalComponent={<EmptyModal />}
          />

          {hintsSection && (
            <>
              <div className='border-border border-t' />
              {hintsSection}
            </>
          )}
        </div>
      </div>
    );
  },
);

ProductUploadSection.displayName = 'ProductUploadSection';

export default ProductUploadSection;
