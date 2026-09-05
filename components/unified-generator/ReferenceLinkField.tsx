'use client';

import { Link2, Plus, X } from 'lucide-react';

import { Input } from '@/components/ui/input';

interface ReferenceLinkFieldProps {
  label: string;
  placeholder: string;
  links: string[];
  max: number;
  onChange: (links: string[]) => void;
}

export default function ReferenceLinkField({ label, placeholder, links, max, onChange }: ReferenceLinkFieldProps) {
  const visibleLinks = links.length ? links : [''];

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between text-sm text-white/70'>
        <span>{label}</span>
        <span>
          {links.filter(Boolean).length}/{max}
        </span>
      </div>
      {visibleLinks.map((link, index) => (
        <div key={index} className='flex items-center gap-2'>
          <div className='relative flex-1'>
            <Link2 className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40' />
            <Input
              type='url'
              value={link}
              placeholder={placeholder}
              className='border-white/10 bg-black/20 pl-9 text-white'
              onChange={(event) => {
                const next = [...visibleLinks];
                next[index] = event.target.value;
                onChange(next);
              }}
            />
          </div>
          {visibleLinks.length > 1 && (
            <button
              type='button'
              className='flex size-9 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white'
              onClick={() => onChange(visibleLinks.filter((_, linkIndex) => linkIndex !== index))}
              aria-label={`${label} ${index + 1}`}
            >
              <X className='size-4' />
            </button>
          )}
        </div>
      ))}
      {visibleLinks.length < max && visibleLinks.every(Boolean) && (
        <button
          type='button'
          className='flex items-center gap-1 text-xs text-white/50 hover:text-white/80'
          onClick={() => onChange([...visibleLinks, ''])}
        >
          <Plus className='size-3.5' />
          {label}
        </button>
      )}
    </div>
  );
}
