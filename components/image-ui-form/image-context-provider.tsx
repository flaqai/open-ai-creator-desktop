'use client';

import { createContext, useContext } from 'react';

export type ImageFormType = 'image-to-image' | 'text-to-image' | 'virtual-try-on';

export const ImageTypeContenxt = createContext<ImageFormType | null>(null);

export default function ImageContenxtProvider({
  imageFormType,
  children,
}: {
  imageFormType: ImageFormType;
  children: React.ReactNode;
}) {
  return <ImageTypeContenxt.Provider value={imageFormType}>{children}</ImageTypeContenxt.Provider>;
}

export function useImageContext() {
  return useContext(ImageTypeContenxt);
}
