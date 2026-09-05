'use client';

import { useEffect, useState } from 'react';

export default function useHeaderObserver({ domId, headingTag = 'h2' }: { domId: string; headingTag?: string }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    setActiveId(window.location.hash.includes('#') ? window.location.hash.split('#')[1] : '');

    const observer = new IntersectionObserver(
      (entries: any) => {
        entries.forEach((entry: any) => {
          if (entry?.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-88px 0px -40% 0px',
      },
    );

    document
      .getElementById(domId)
      ?.querySelectorAll(headingTag)
      .forEach((header) => {
        const element = document.getElementById(header.id);
        if (element) {
          observer.observe(element);
        }
      });

    return () => observer.disconnect();
  }, []);

  return activeId;
}
