import { useCallback, useEffect, useState } from 'react';

interface ScrollOptions {
  threshold?: number;
  throttleMs?: number;
}

export default function useScrollPosition({ threshold = 0, throttleMs = 100 }: ScrollOptions = {}) {
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    return () => {
      if (timeoutId) return;

      timeoutId = setTimeout(() => {
        setIsScrolled(window.scrollY > threshold);
        timeoutId = null;
      }, throttleMs);
    };
  }, [threshold, throttleMs]);

  useEffect(() => {
    const throttledHandler = handleScroll();
    window.addEventListener('scroll', throttledHandler);

    // Initial check
    setIsScrolled(window.scrollY > threshold);

    return () => window.removeEventListener('scroll', throttledHandler);
  }, [handleScroll]);

  return isScrolled;
}
