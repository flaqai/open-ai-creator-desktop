'use client';

import { useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  window.addEventListener('scroll', toggleVisibility);

  return (
    <div>
      {isVisible && (
        <button
          type='button'
          onClick={scrollToTop}
          className='border-foreground fixed right-48 bottom-52 hidden items-center justify-center rounded-full border p-2 hover:opacity-70 lg:flex'
        >
          <ArrowUp />
          <span className='sr-only'>Go to Top</span>
        </button>
      )}
    </div>
  );
}
