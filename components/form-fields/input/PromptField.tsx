'use client';

import { useCallback, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import CopyBtn from '@/components/CopyBtn';
import SubHeading from '@/components/form/SubHeading';

const MAX_PROMPT_LENGTH = 2000;
const MIN_HEIGHT = 110;
const MAX_HEIGHT = 176;

interface PromptFieldProps {
  show?: boolean;
  title?: string;
  placeholder?: string;
  maxLength?: number;
  translationNamespace?: 'components.video-form' | 'components.image-form';
  fieldName?: string;
}

export default function PromptField({
  show = true,
  title,
  placeholder,
  maxLength = MAX_PROMPT_LENGTH,
  translationNamespace = 'components.video-form',
  fieldName = 'prompt',
}: PromptFieldProps) {
  const { control } = useFormContext();
  const t = useTranslations(translationNamespace);
  const tCommon = useTranslations('Common');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = `${MIN_HEIGHT}px`;
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, MIN_HEIGHT), MAX_HEIGHT);
    textarea.style.height = `${newHeight}px`;
  }, []);

  if (!show) return null;

  return (
    <div className='flex flex-col gap-2.5'>
      <SubHeading>{title || tCommon('prompt')}</SubHeading>
      <FormField
        control={control}
        name={fieldName}
        render={({ field }) => (
          <FormItem className='space-y-0'>
            <FormLabel htmlFor={field.name} className='p-0'>
              <div className='relative w-full rounded-xl border border-white/5 bg-[#232528]'>
                <Textarea
                  {...field}
                  ref={(el) => {
                    field.ref(el);
                    (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
                  }}
                  maxLength={maxLength}
                  placeholder={placeholder || t('promptPlaceholder')}
                  className='custom-scrollbar [field-sizing:initial] resize-none rounded-t-xl border-0 bg-transparent p-3 text-white/80 placeholder:text-white/40 focus:ring-0 focus-visible:ring-0'
                  style={{
                    height: `${MIN_HEIGHT}px`,
                    maxHeight: `${MAX_HEIGHT}px`,
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                  }}
                  onChange={(e) => {
                    field.onChange(e);
                    adjustHeight();
                  }}
                />

                {/* Bottom Action Area with Copy, Clear Buttons and Length Indicator */}
                <div className='flex items-center justify-between rounded-b-xl border-t border-white/5 bg-[#232528] px-3 py-2'>
                  <button
                    type='button'
                    onClick={() => {
                      field.onChange('');
                      if (textareaRef.current) {
                        textareaRef.current.style.height = `${MIN_HEIGHT}px`;
                      }
                    }}
                    className='flex items-center justify-center rounded text-white/40 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70'
                  >
                    <Trash2 className='size-5' />
                  </button>
                  <div className='flex items-center gap-2'>
                    <div className='flex items-center gap-2'>
                      <CopyBtn content={field.value ?? ''} className='text-white/40' />
                    </div>
                    <span className='text-xs text-white/40'>
                      {String(field.value ?? '').length}/{maxLength}
                    </span>
                  </div>
                </div>
              </div>
            </FormLabel>
          </FormItem>
        )}
      />
    </div>
  );
}
