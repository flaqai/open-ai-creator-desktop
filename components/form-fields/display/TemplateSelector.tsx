'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';
import SubHeading from '@/components/form/SubHeading';

interface TemplateSelectorProps {
  // Template data
  templates: Array<{
    key: string;
    imageUrl: string;
    prompt: string;
  }>;

  // Default selected template key
  defaultTemplate?: string;

  // Translation namespace prefix
  translationNamespace: string;

  // Form field names
  templateFieldName?: string;
  promptFieldName?: string;

  // Title
  title?: string;
}

const TemplateSelector = forwardRef<{ resetSelection: () => void }, TemplateSelectorProps>(
  (
    {
      templates,
      defaultTemplate = templates[0]?.key || '',
      translationNamespace,
      templateFieldName = 'template',
      promptFieldName = 'prompt',
      title,
    },
    ref,
  ) => {
    const t = useTranslations(translationNamespace);
    const methods = useFormContext();
    const [selectedTemplate, setSelectedTemplate] = useState<string>(defaultTemplate);
    const handleTemplateSelect = (template: (typeof templates)[0]) => {
      setSelectedTemplate(template.key);
      methods.setValue(templateFieldName, template.key);
      methods.setValue(promptFieldName, template.prompt);
    };

    const resetSelection = () => {
      const defaultTpl = templates.find((t) => t.key === defaultTemplate) || templates[0];
      setSelectedTemplate(defaultTpl.key);
      methods.setValue(templateFieldName, defaultTpl.key);
      methods.setValue(promptFieldName, defaultTpl.prompt);
    };

    useImperativeHandle(ref, () => ({
      resetSelection,
    }));

    return (
      <div className='flex w-full flex-col gap-2.5'>
        <SubHeading>{title || t('template')}</SubHeading>
        <div className='grid grid-cols-3 gap-1.5'>
          {templates.map((template) => (
            <button
              key={template.key}
              type='button'
              onClick={() => handleTemplateSelect(template)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg border-2 transition-colors',
                selectedTemplate === template.key ? 'border-color-main' : 'border-transparent',
              )}
            >
              <img
                src={template.imageUrl}
                alt={t(`templates-options.${template.key}` as any)}
                className='h-full w-full object-cover'
              />
              <div className='absolute inset-x-0 bottom-0 bg-black/50 py-1.5 text-center text-xs font-normal text-white'>
                {t(`templates-options.${template.key}` as any)}
              </div>
              {selectedTemplate === template.key && (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='bg-color-main rounded-full p-1'>
                    <svg className='h-4 w-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  },
);

TemplateSelector.displayName = 'TemplateSelector';

export default TemplateSelector;
