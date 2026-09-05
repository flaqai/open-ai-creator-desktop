/* eslint-disable no-param-reassign */
import type { PixelCrop } from 'react-image-crop';

/* eslint-disable import/prefer-default-export */
export const validateImagePx = ({
  imageFile,
  minWidthPx = 50,
  minHeightPx = 50,
}: {
  imageFile: File;
  minWidthPx?: number;
  minHeightPx?: number;
}): Promise<boolean> =>
  new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(imageFile);
    img.src = objectUrl;

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      img.onload = null;
      img.onerror = null;
    };

    img.onload = () => {
      const { width, height } = img;
      cleanup();
      resolve(width >= minWidthPx && height >= minHeightPx);
    };

    img.onerror = () => {
      cleanup();
      resolve(false);
    };
  });

export const getMimeTypeByUrl = (url: string) => {
  const extension = url.split('.').pop()?.toLowerCase();
  return `image/${extension}`;
};

export type CroppedImage = {
  imageUrl: string;
  imageFile: Blob;
};

export const canvasPreview = async (
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0,
): Promise<CroppedImage> => {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  // devicePixelRatio slightly increases sharpness on retina devices
  // at the expense of slightly slower render times and needing to
  // size the image back down if you want to download/upload and be
  // true to the images natural size.
  const pixelRatio = window.devicePixelRatio;
  // const pixelRatio = 1

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const rotateRads = rotate * (Math.PI / 180);
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();

  // 5) Move the crop origin to the canvas origin (0,0)
  ctx.translate(-cropX, -cropY);
  // 4) Move the origin to the center of the original position
  ctx.translate(centerX, centerY);
  // 3) Rotate around the origin
  ctx.rotate(rotateRads);
  // 2) Scale the image
  ctx.scale(scale, scale);
  // 1) Move the center of the image to the origin (0,0)
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, image.naturalWidth, image.naturalHeight);

  ctx.restore();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }
      resolve({ imageUrl: URL.createObjectURL(blob), imageFile: blob });
    }, 'image/png');
  });
};

export const generateImageData = async ({
  image,
  canvasEl,
  crop,
  scale = 1,
  rotate = 0,
}: {
  image: HTMLImageElement;
  crop: PixelCrop;
  canvasEl?: HTMLCanvasElement;
  scale?: number;
  rotate?: number;
}): Promise<CroppedImage> => {
  const canvas = canvasEl || document.createElement('canvas');

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  // devicePixelRatio slightly increases sharpness on retina devices
  // at the expense of slightly slower render times and needing to
  // size the image back down if you want to download/upload and be
  // true to the images natural size.
  const pixelRatio = window.devicePixelRatio;
  // const pixelRatio = 1

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const rotateRads = rotate * (Math.PI / 180);
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();

  // 5) Move the crop origin to the canvas origin (0,0)
  ctx.translate(-cropX, -cropY);
  // 4) Move the origin to the center of the original position
  ctx.translate(centerX, centerY);
  // 3) Rotate around the origin
  ctx.rotate(rotateRads);
  // 2) Scale the image
  ctx.scale(scale, scale);
  // 1) Move the center of the image to the origin (0,0)
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, image.naturalWidth, image.naturalHeight);

  ctx.restore();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }
      resolve({ imageUrl: URL.createObjectURL(blob), imageFile: blob });
    }, 'image/png');
  });
};

/**
 * Convert a local image path to a File object
 * Fetches the image from the path and converts it to a File
 */
export async function urlToFile(url: string, filename?: string): Promise<File> {
  const { fetchMedia, mediaFileName } = await import('@/lib/platform/media');
  const response = await fetchMedia(url);
  const blob = await response.blob();
  const name = filename || mediaFileName(url, 'image.webp');
  return new File([blob], name, { type: blob.type || 'image/webp' });
}

/**
 * Convert multiple local image paths to File objects
 */
export async function urlsToFiles(urls: string[]): Promise<File[]> {
  return Promise.all(urls.map((url) => urlToFile(url)));
}
