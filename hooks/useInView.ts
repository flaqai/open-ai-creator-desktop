import { useEffect, useRef, useState } from 'react';

const useInView = <R extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit,
): [React.RefObject<R | null>, boolean] => {
  const [isInView, setIsInView] = useState<boolean>(false);
  const ref = useRef<R | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.1, // Adjust this threshold as needed
        ...options,
      },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, isInView];
};

export default useInView;
