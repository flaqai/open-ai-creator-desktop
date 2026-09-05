'use client';

import { useState } from 'react';
import { BanIcon } from 'lucide-react';

export default function ImageItem({ imgSrc }: { imgSrc?: string }) {
  const [isErr, setIsErr] = useState(false);

  return (
    <div className='flex size-[45px] items-center justify-center overflow-hidden rounded bg-[#141414]'>
      {imgSrc && !isErr ? (
        <img
          src={imgSrc}
          alt='video'
          className='max-h-full max-w-full bg-contain'
          loading='lazy'
          decoding='async'
          onError={() => setIsErr(true)}
        />
      ) : (
        <BanIcon className='size-5 text-[var(--c-text)]' />
      )}
    </div>
  );
}
