import { useCallback, useState } from 'react';

import { exportImage } from '@/lib/platform/image-export';

export type ImageType = 'webp' | 'png' | 'jpg';

export const imageTypesList: ImageType[] = ['webp', 'png', 'jpg'];

interface ConvertAndDownloadData {
  imageUrl: string;
  type: ImageType;
  imageName: string;
}

interface UseImageConverterResult {
  convertAndDownload: (data: ConvertAndDownloadData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const useImageConverter = (): UseImageConverterResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertAndDownload = useCallback(async ({ imageUrl, type, imageName }: ConvertAndDownloadData) => {
    setIsLoading(true);
    setError(null);

    try {
      await exportImage(imageUrl, type, imageName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { convertAndDownload, isLoading, error };
};

export default useImageConverter;
