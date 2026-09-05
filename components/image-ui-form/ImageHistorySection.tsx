'use client';

import { useRef, useState } from 'react';

import ImageHistory from './image-history';
import ImageHistoryTitle from './image-history-title';
import { ScrollRef } from './shared/scroll';

export default function ImageHistorySection() {
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollRef = useRef<ScrollRef>(null);

  const showBackToStart = scrollLeft > 200;

  const handleBackToStart = () => {
    scrollRef.current?.scrollToStart();
  };

  return (
    <>
      <ImageHistoryTitle showBackToStart={showBackToStart} onBackToStart={handleBackToStart} />
      <ImageHistory ref={scrollRef} onScrollChange={setScrollLeft} />
    </>
  );
}
