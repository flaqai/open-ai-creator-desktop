import { useEffect, useState } from 'react';

type UseMergedImageReturn = {
  mergedImageUrl: string | null;
  mergedBlob: Blob | null;
};

const useMergedImage = ({
  leftImageFile,
  rightImageFile,
}: {
  leftImageFile?: File;
  rightImageFile?: File;
}): UseMergedImageReturn => {
  const [mergedImageUrl, setMergedImageUrl] = useState<string | null>(null);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);

  const loadImage = (file: File): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });

  useEffect(() => {
    const mergeImages = async () => {
      if (!leftImageFile || !rightImageFile) {
        setMergedImageUrl(null);
        setMergedBlob(null);
        return;
      }

      try {
        const img1 = await loadImage(leftImageFile);
        const img2 = await loadImage(rightImageFile);

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) throw new Error('Failed to get canvas context');

        const targetHeight = img1.height;
        const scaleFactor = targetHeight / img2.height;
        const targetWidth = img1.width + img2.width * scaleFactor;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        context.drawImage(img1, 0, 0);

        context.drawImage(img2, img1.width, 0, img2.width * scaleFactor, targetHeight);

        canvas.toBlob((blob) => {
          if (blob) {
            setMergedBlob(blob);
            const url = URL.createObjectURL(blob);
            setMergedImageUrl(url);
          }
        });
      } catch (error) {
        console.error('Failed to merge images', error);
      }
    };

    mergeImages();
  }, [leftImageFile, rightImageFile]);

  return { mergedImageUrl, mergedBlob };
};

export default useMergedImage;
