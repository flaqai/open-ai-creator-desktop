import { useEffect, useState } from 'react';

const useVideoLastFrame = (videoUrl: string): string | null => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!videoUrl) {
      setImageUrl(null);
      return;
    }

    const fetchLastFrame = async () => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous'; // Handle CORS if necessary

      await new Promise<void>((resolve) => {
        video.onloadeddata = () => resolve();
      });

      video.currentTime = video.duration - 0.1; // Seek to the last frame
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
      });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        setImageUrl(canvas.toDataURL('image/png'));
      }
    };

    fetchLastFrame();
  }, [videoUrl]);

  return imageUrl;
};

export default useVideoLastFrame;
