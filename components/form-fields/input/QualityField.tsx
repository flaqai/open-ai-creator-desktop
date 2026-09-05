'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SubHeading from '@/components/form/SubHeading';

interface QualityFieldProps {
  qualityOptions: Array<{ name: string; value: string }>;
  show?: boolean;
  translationNamespace?: 'components.video-form' | 'components.image-form';
}

export default function QualityField({
  qualityOptions,
  show = false,
  translationNamespace = 'components.image-form',
}: QualityFieldProps) {
  const t = useTranslations(translationNamespace);
  const { control } = useFormContext();

  if (!show || !qualityOptions || qualityOptions.length === 0) return null;

  return (
    <FormField
      control={control}
      name='quality'
      render={({ field }) => (
        <FormItem className='space-y-1.5'>
          <Label className='text-sm font-normal text-white/70'>{t('quality')}</Label>
          <Select value={field.value || qualityOptions[0]?.value || 'medium'} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger className='h-10 w-full rounded-xl border border-white/5 bg-[#232528] text-white/80'>
                <SelectValue placeholder='' />
              </SelectTrigger>
            </FormControl>
            <SelectContent className='border-[#303030] bg-[#232528] text-white'>
              {qualityOptions.map((quality) => (
                <SelectItem key={quality.value} value={quality.value}>
                  {quality.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
}
