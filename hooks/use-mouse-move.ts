import { useEffect, useState } from 'react';
import { useDebouncedCallback, useThrottledCallback } from 'use-debounce';

export default function useMouseMove(elementRef: React.RefObject<HTMLElement>) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseMove = useThrottledCallback((e: MouseEvent) => {
    if (elementRef.current && elementRef.current.contains(e.target as Node)) {
      // Get mouse position relative to the element
      const rect = elementRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left, // Mouse position relative to element
        y: e.clientY - rect.top, // Mouse position relative to element
      });
      setIsVisible(true);
    }
  }, 16);

  const handleMouseLeave = useDebouncedCallback(() => {
    setIsVisible(false);
  }, 16);

  useEffect(() => {
    // Only listen to mousemove within the target element
    const targetElement = elementRef.current;
    if (targetElement) {
      targetElement.addEventListener('mousemove', handleMouseMove);
      targetElement.addEventListener('mouseleave', handleMouseLeave); // Listen for mouse leave
    }

    // Cleanup event listener on component unmount
    return () => {
      if (targetElement) {
        targetElement.removeEventListener('mousemove', handleMouseMove);
        targetElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [elementRef, handleMouseMove, handleMouseLeave]);

  return { mousePosition, isVisible };
}
