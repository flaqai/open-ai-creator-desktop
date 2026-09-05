'use client';

import dynamic from 'next/dynamic';

const ImageToVideoForm = dynamic(
  () => import('@/app/[locale]/(with-footer)/(ai-features)/(video)/image-to-video/form'),
  { ssr: false },
);
const TextToVideoForm = dynamic(() => import('@/app/[locale]/(with-footer)/(ai-features)/(video)/text-to-video/form'), {
  ssr: false,
});

export function DesktopImageToVideoForm() {
  return <ImageToVideoForm />;
}

export function DesktopTextToVideoForm() {
  return <TextToVideoForm />;
}
