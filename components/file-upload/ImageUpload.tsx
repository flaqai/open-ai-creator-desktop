'use client';

import { ChangeEventHandler, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Trash2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

import { maxSizeInBytes } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { getFileByUrl } from '@/lib/utils/fileUtils';
import { validateImagePx } from '@/lib/utils/imageUtils';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

import AgSwitch from '../AgSwitch';
import BorderLightB from '../svg/image/BorderLightB';

// const ImageCropDialog = dynamic(() => import('@/components/image/ImageCropDialog'), { ssr: false });
const CompressImageDialog = dynamic(() => import('@/components/file-upload/CompressImageDialog'), { ssr: false });

function Text({ title, icon, className }: { title?: string; icon: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'border-main-gray flex h-8 w-full items-center justify-center rounded-lg border bg-black px-2 text-sm text-white/40',
        className,
      )}
    >
      {title}
      {icon}
    </div>
  );
}

const acceptedImageTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];

export default function ImageUpload({
  name,
  title,
  minWidthPx = 300,
  minHeightPx = 300,
  defaultOff = false,
  showDisabledBtn = false,
  isValidateImagePx = true,
  // openCropWhenUpload = true,
  // showCropBtn = true,
  className,
  allowUpload = true,
  allowUploadCb,
  color,
}: {
  name: string;
  title?: string;
  minWidthPx?: number;
  minHeightPx?: number;
  defaultOff?: boolean;
  showDisabledBtn?: boolean;
  isValidateImagePx?: boolean;
  // openCropWhenUpload?: boolean;
  // showCropBtn?: boolean;
  className?: string;
  allowUpload?: boolean;
  allowUploadCb?: () => void;
  color?: string;
}) {
  const t = useTranslations('components.ImageUpload');
  const methods = useFormContext();

  const [off, setOff] = useState(defaultOff);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [openCompressImageDialog, setOpenCompressImageDialog] = useState(false);
  const [originalImage, setOriginalImage] = useState<{ id: string; file: File } | null>(null);
  // const [openImageCropDialog, setOpenImageCropDialog] = useState(false);
  // const [originalImageUrl, setOriginalImageUrl] = useState<string>('');

  const clearInputValue = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateFile = async (file: File | Blob | null | string) => {
    if (typeof file === 'string') {
      setFileUrl(file);
      const imageFile = await getFileByUrl(file);
      methods.setValue(name, imageFile);
      return;
    }

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        setFileUrl(url);
      };
      reader.readAsDataURL(file);
      methods.setValue(name, file);
    } else {
      methods.setValue(name, null);
      setFileUrl(null);
      clearInputValue();
    }
  };

  const localUpload = (file: File) => {
    updateFile(file);
    // if (file) {
    //   const imageUrl = URL.createObjectURL(file);
    //   setOriginalImageUrl(imageUrl);
    //   if (openCropWhenUpload) {
    //     setOpenImageCropDialog(true);
    //   }
    // }
  };

  const deleteFile = () => {
    updateFile(null);
    clearInputValue();
  };

  const inputOnChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (isValidateImagePx) {
        const isValid = await validateImagePx({ imageFile: file, minWidthPx, minHeightPx });
        if (!isValid) {
          toast.error(`${t('min width')} ${minWidthPx} px ${t('or')} ${t('min height')} ${minHeightPx} px`);
          return;
        }
      }

      if (file.size > maxSizeInBytes) {
        setOriginalImage({ id: Date.now().toString(), file });
        setOpenCompressImageDialog(true);
        return;
      }

      localUpload(file);
    }
  };

  const onClickDisabledBtn = (checked: boolean) => {
    setOff(checked);
  };

  const onClickUpload: React.MouseEventHandler<HTMLLabelElement> = (e) => {
    if (!allowUpload && allowUploadCb) {
      allowUploadCb();
      e.preventDefault();
    }
  };

  return (
    <>
      <div className='flex flex-col'>
        <div className='border-main-gray bg-card-black mr-auto flex h-8 w-full items-center gap-1.5 rounded-t-xl border border-b-0 p-3'>
          <div className={cn('font-semibold', showDisabledBtn && !off && 'text-white/40')}>{title}</div>
          {showDisabledBtn && <AgSwitch checked={!!off} onCheckedChange={onClickDisabledBtn} />}
        </div>
        <div
          className={cn(
            'border-main-gray bg-card-black relative flex h-[268px] w-[172px] flex-col items-end gap-2 rounded-b-xl border p-2',
            className,
          )}
        >
          {showDisabledBtn && !off && (
            <div className='absolute inset-0 z-10 size-full rounded-xl bg-black/40 backdrop-blur-xs' />
          )}
          <div className='border-main-gray relative flex w-full flex-1 items-center justify-center overflow-hidden rounded-xl border bg-black'>
            {fileUrl ? (
              <>
                <button
                  type='button'
                  onClick={deleteFile}
                  className='absolute top-0.5 left-0.5 z-20 flex size-8 items-center justify-center rounded-lg bg-black/70 backdrop-blur-xs'
                >
                  <Trash2 className='size-4 text-white/40' />
                  <span className='sr-only'>delete</span>
                </button>
                <img src={fileUrl} alt={name} className='max-h-full max-w-full bg-contain' />
              </>
            ) : (
              <BorderLightB style={{ color }} className='absolute -bottom-px left-0' />
            )}
          </div>
          <FormField
            control={methods.control}
            name={name}
            render={() => (
              <FormItem className='relative w-full space-y-0'>
                <div className='flex w-full items-center gap-1'>
                  <FormLabel className='w-full cursor-pointer' onClick={onClickUpload}>
                    <Text icon={<Upload className='size-5' />} />
                  </FormLabel>
                  {/* {showCropBtn && fileUrl && (
                    <button type='button' onClick={() => setOpenImageCropDialog(true)} className=''>
                      <Text icon={<Crop />} />
                      <span className='sr-only'>crop</span>
                    </button>
                  )} */}
                </div>
                <FormControl>
                  <input
                    type='file'
                    ref={fileInputRef}
                    accept={acceptedImageTypes.join(',')}
                    className='hidden'
                    required={false}
                    onChange={inputOnChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
      {/* {originalImageUrl && (
        <ImageCropDialog
          originalImage={originalImageUrl}
          onCropComplete={({ imageFile }) => updateFile(imageFile)}
          open={openImageCropDialog}
          setOpen={setOpenImageCropDialog}
        />
      )} */}
      <CompressImageDialog
        key={originalImage?.id}
        open={openCompressImageDialog}
        setOpen={setOpenCompressImageDialog}
        imageFile={originalImage?.file || null}
        reUploadHandler={() => {
          if (fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
        setFile={updateFile}
      />
    </>
  );
}
