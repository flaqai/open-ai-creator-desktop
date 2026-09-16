'use client';

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface HintPreset {
  id: number;
  subject: string;
  object: string | string[];
  aiGeneration: string;
  prompt: string;
}

interface HintsPresetsProps {
  title?: string;
  subjectLabel: string;
  objectLabel: string;
  aiGenerationLabel: string;
  presets: HintPreset[];
  onPresetClick?: (preset: HintPreset) => void;
}

export default function HintsPresets({
  title = 'Hints',
  subjectLabel,
  objectLabel,
  aiGenerationLabel,
  presets,
  onPresetClick,
}: HintsPresetsProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const handleMouseEnter = (preset: HintPreset, button: HTMLButtonElement | null) => {
    if (!button) return;
    const rect = button.getBoundingClientRect();
    setHoverPosition({
      top: rect.top - 8,
      left: rect.left,
    });
    setHoveredId(preset.id);
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
    setHoverPosition(null);
  };

  const hoveredPreset = presets.find((p) => p.id === hoveredId);

  const objectImages = hoveredPreset
    ? Array.isArray(hoveredPreset.object)
      ? hoveredPreset.object
      : [hoveredPreset.object]
    : [];

  // each square slot = 120px + 4px gap + 8px padding
  const slotCount = 2 + objectImages.length; // subject + objects + aiGeneration
  const cardWidth = slotCount * 120 + (slotCount - 1) * 4 + 8;

  return (
    <div className='flex items-center gap-1.5'>
      {title && <span className='text-foreground/40 text-sm'>{title}</span>}
      <div className='relative flex items-center gap-1.5'>
        {presets.map((preset) => (
          <div key={preset.id} className='relative flex items-center justify-center'>
            <button
              ref={(el) => {
                if (el) buttonRefs.current.set(preset.id, el);
              }}
              type='button'
              onClick={() => onPresetClick?.(preset)}
              onMouseEnter={(e) => handleMouseEnter(preset, e.currentTarget)}
              onMouseLeave={handleMouseLeave}
              className='bg-card relative h-12 w-12 overflow-hidden rounded-lg transition-all'
            >
              <img src={preset.aiGeneration} alt={`Hint ${preset.id}`} className='size-full object-contain' />
              {hoveredId === preset.id && (
                <div
                  className='pointer-events-none absolute inset-0 rounded-lg'
                  style={{
                    boxShadow: 'inset 0 0 0 2px var(--color-main)',
                  }}
                />
              )}
            </button>
          </div>
        ))}
      </div>

      {hoveredId !== null &&
        hoverPosition &&
        hoveredPreset &&
        createPortal(
          <div
            className='pointer-events-none fixed z-[99999]'
            style={{
              top: hoverPosition.top,
              left: hoverPosition.left,
              width: cardWidth,
              transform: 'translateY(calc(-100% - 0px))',
            }}
          >
            <div className='bg-card flex gap-1 rounded-xl p-1'>
              {/* Subject */}
              <div className='bg-card relative aspect-square w-[120px] overflow-hidden rounded-lg'>
                <img src={hoveredPreset.subject} alt='Subject' className='h-full w-full object-cover' />
                <div className='absolute right-1 bottom-1 left-1'>
                  <span className='text-primary-foreground inline-flex h-5 max-w-full items-center justify-center rounded bg-[#000000B2] px-2 py-0.5 text-xs font-medium backdrop-blur-[5.33px]'>
                    <span className='truncate'>{subjectLabel}</span>
                  </span>
                </div>
              </div>

              {/* Object(s) */}
              {objectImages.map((src, idx) => (
                <div key={idx} className='bg-card relative aspect-square w-[120px] overflow-hidden rounded-lg'>
                  <img src={src} alt={`Object ${idx + 1}`} className='h-full w-full object-cover' />
                  <div className='absolute right-1 bottom-1 left-1'>
                    <span className='text-primary-foreground inline-flex h-5 max-w-full items-center justify-center rounded bg-[#000000B2] px-2 py-0.5 text-xs font-medium backdrop-blur-[5.33px]'>
                      <span className='truncate'>
                        {objectImages.length > 1 ? `${objectLabel} ${idx + 1}` : objectLabel}
                      </span>
                    </span>
                  </div>
                </div>
              ))}

              {/* AI Generation */}
              <div className='bg-card relative aspect-square w-[120px] overflow-hidden rounded-lg'>
                <img src={hoveredPreset.aiGeneration} alt='AI Generation' className='h-full w-full object-cover' />
                <div className='absolute right-1 bottom-1 left-1'>
                  <span className='inline-flex h-5 max-w-full items-center justify-center rounded bg-[#000000B2] px-2 py-0.5 text-xs font-medium backdrop-blur-[5.33px]'>
                    <span className='text-color-main truncate'>{aiGenerationLabel}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
