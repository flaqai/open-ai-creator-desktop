'use client';

import { Clock3, ImageIcon, Mic, Music4, Palette, Scaling } from 'lucide-react';

import { cn } from '@/lib/utils';
import { getModelIconConfig } from '@/lib/utils/modelIcons';

interface ModelFeature {
  icon: 'duration' | 'resolution' | 'audio' | 'sound' | 'bgm' | 'style' | 'endFrame';
  label: string;
}

interface ModelSelectItemProps {
  value: string;
  label: string;
  features: ModelFeature[];
  isSelected?: boolean;
  isDisabled?: boolean;
  showComingSoon?: boolean;
  onClick?: () => void;
}

export default function ModelSelectItem({
  value,
  label,
  features,
  isSelected,
  isDisabled = false,
  showComingSoon = false,
  onClick,
}: ModelSelectItemProps) {
  const modelIcon = getModelIconConfig(value);

  // Render corresponding icon based on feature type
  const renderFeatureIcon = (iconType: string) => {
    switch (iconType) {
      case 'duration':
        return <Clock3 className='h-3.5 w-3.5' />;
      case 'resolution':
        return <Scaling className='h-3.5 w-3.5' />;
      case 'audio':
        return <Mic className='h-3.5 w-3.5' />;
      case 'sound':
        return <Mic className='h-3.5 w-3.5' />;
      case 'bgm':
        return <Music4 className='h-3.5 w-3.5' />;
      case 'style':
        return <Palette className='h-3.5 w-3.5' />;
      case 'endFrame':
        return <ImageIcon className='h-3.5 w-3.5' />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'border-foreground/10 box-border flex w-full max-w-full min-w-full cursor-pointer flex-col gap-3 border-b p-2',
        isSelected && 'bg-foreground/5',
        isDisabled && 'cursor-not-allowed opacity-60',
      )}
      onClick={!isDisabled ? onClick : undefined}
      onKeyDown={(e) => {
        if (!isDisabled && onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={isDisabled ? -1 : 0}
      role='button'
      aria-pressed={isSelected}
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          {/* Model icon, model name, and radio icon in same row, justified between */}
          <div className='mb-1 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {/* Model icon */}
              {modelIcon.src ? (
                <span
                  className={cn(
                    'flex size-5 flex-shrink-0 items-center justify-center overflow-hidden rounded',
                    modelIcon.background === 'light' && 'bg-foreground p-0.5',
                  )}
                >
                  <img src={modelIcon.src} alt={value} className='size-full object-contain' />
                </span>
              ) : (
                <div className='h-5 w-5 flex-shrink-0' />
              )}
              <h3 className='text-foreground text-base font-medium'>{label}</h3>
              {/* Coming Soon badge */}
              {showComingSoon && (
                <span className='rounded bg-[#f3eeff] px-2 py-0.5 text-xs text-[#7D52FF]'>Coming Soon</span>
              )}
            </div>
            {/* Radio style */}
            <div className='flex-shrink-0'>
              {isSelected ? (
                <div className='flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#427cf1] bg-[#427cf1]'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='12'
                    height='12'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='white'
                    strokeWidth='3'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='lucide lucide-check'
                  >
                    <path d='M20 6 9 17l-5-5' />
                  </svg>
                </div>
              ) : (
                <div className='border-foreground/20 flex h-5 w-5 items-center justify-center rounded-full border' />
              )}
            </div>
          </div>
          {/* Render model feature icons */}
          <div className='flex flex-wrap gap-2'>
            {features.map((feature, index) => (
              <div
                key={index}
                className='border-foreground/10 text-foreground/70 flex items-center gap-1 rounded-md border px-2 py-1 text-xs'
              >
                {renderFeatureIcon(feature.icon)}
                {feature.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
