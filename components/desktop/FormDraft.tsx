'use client';

import { useEffect, useRef } from 'react';
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form';

import { notifyFormRestored } from '@/hooks/use-form-restoration';
import { useLocalDraft } from '@/hooks/use-local-draft';

import DraftStatus from './DraftStatus';

export default function FormDraft<T extends FieldValues>({
  id,
  form,
  validate,
}: {
  id: string;
  form: UseFormReturn<T>;
  validate?: (data: Record<string, unknown>) => boolean;
}) {
  const anchor = useRef<HTMLDivElement>(null);
  const defaults = useRef(form.formState.defaultValues);
  const draft = useLocalDraft(id, {
    get: () => form.getValues(),
    restore: (data) => {
      form.reset(data as T, { keepDefaultValues: true });
      notifyFormRestored(form.control, data);
    },
    reset: () => {
      form.reset(defaults.current as DefaultValues<T>);
      notifyFormRestored(form.control, form.getValues());
    },
    subscribe: (callback) => {
      const subscription = form.watch(callback);
      return () => subscription.unsubscribe();
    },
    validate,
  });
  useEffect(() => {
    const element = anchor.current?.closest('form');
    if (element) element.inert = draft.status === 'loading';
    return () => {
      if (element) element.inert = false;
    };
  }, [draft.status]);
  return (
    <div ref={anchor}>
      <DraftStatus {...draft} />
    </div>
  );
}
