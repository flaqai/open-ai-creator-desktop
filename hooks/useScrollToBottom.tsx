'use client';

import { useEffect, useRef } from 'react';

export default function useScrollToBottom(...data: any[]) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scroll({
        top: ref.current.scrollHeight,
        behavior: 'smooth',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...data]);

  return { ref };
}
