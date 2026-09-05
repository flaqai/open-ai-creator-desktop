'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';

import Loading from '../Loading';

export default function ImageWithPlaiceholder({
  id,
  src,
  className,
  alt,
  title,
  onDelete,
  showDeleteBtn = false,
  route,
  onClick,
  isFailed = false,
}: {
  id: string;
  src: string;
  className?: string;
  alt: string;
  title: string;
  onDelete: (id: string) => void;
  showDeleteBtn?: boolean;
  route?: string;
  onClick?: () => void;
  isFailed?: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  const onLoad = () => {
    setIsLoaded(true);
  };

  return (
    <figure
      className={cn(
        'group relative w-full overflow-hidden rounded-xl',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className,
      )}
    >
      {showDeleteBtn && (
        <button
          type='button'
          onClick={() => onDelete(id)}
          className={cn(
            'absolute top-1 right-1 z-20 size-7 items-center justify-center rounded-lg bg-black/40 backdrop-blur-xs',
            isFailed ? 'flex' : 'hidden group-hover:flex',
          )}
        >
          <Trash2 className='size-5 text-white/40' />
          <span className='sr-only'>delete</span>
        </button>
      )}
      {onClick ? (
        <div onClick={onClick} className='w-full cursor-pointer'>
          <img
            className='w-full transition-all duration-200 group-hover:scale-125'
            loading='lazy'
            decoding='async'
            onLoad={onLoad}
            src={src}
            alt={alt}
          />
        </div>
      ) : route ? (
        <Link key={id} href={`${route}/${id}`} className='w-full'>
          <img
            className='w-full transition-all duration-200 group-hover:scale-125'
            loading='lazy'
            decoding='async'
            onLoad={onLoad}
            src={src}
            alt={alt}
          />
        </Link>
      ) : null}
      <div className={cn('absolute inset-0 -z-10 h-auto w-full bg-[#26232D]')}>
        <div className='flex-xy-center h-full min-h-[300px] w-full'>
          <Loading className='h-[35px] w-[50px]' />
        </div>
      </div>
      <figcaption className='absolute bottom-0 left-0 w-full p-2'>
        <div className='flex w-full flex-col rounded-lg bg-black/40 p-2'>
          <span className='line-clamp-1 text-xs'>{title}</span>
        </div>
      </figcaption>
    </figure>
  );
}
