'use client';

import { useState } from 'react';

export default function useCopyToClipboard(delay: number = 2000) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), delay);
      })
      .catch((err: any) => {
        console.error('Failed to copy:', err);
      });
  };

  return { isCopied, copyToClipboard };
}
