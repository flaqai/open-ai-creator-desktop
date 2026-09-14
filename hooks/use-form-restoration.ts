'use client';

import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

type Values = Record<string, unknown>;
const listeners = new WeakMap<object, Set<(values: Values) => void>>();

// Upload controls have local preview state separate from RHF. Restore both together.
export function notifyFormRestored(control: object, values: Values) {
  listeners.get(control)?.forEach((listener) => listener(values));
}

export function useFormRestoration(callback: (values: Values, preview: (source: unknown) => string | null) => void) {
  const { control, getValues } = useFormContext();
  const current = useRef(callback);
  current.current = callback;
  useEffect(() => {
    let urls: string[] = [];
    const receive = (values: Values) => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls = [];
      current.current(values, (source) => {
        if (typeof source === 'string') return source;
        if (!(source instanceof Blob)) return null;
        const url = URL.createObjectURL(source);
        urls.push(url);
        return url;
      });
    };
    const group = listeners.get(control) || new Set();
    group.add(receive);
    listeners.set(control, group);
    receive(getValues());
    return () => {
      group.delete(receive);
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [control, getValues]);
}
