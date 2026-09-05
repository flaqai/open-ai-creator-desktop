'use client';

import { useRef, useState } from 'react';

import { ScrollRef } from './shared/scroll';
import VideoHistory from './VideoHistory';
import VideoHistoryTitle from './VideoHistoryTitle';

interface VideoHistorySectionProps {
  onClickImage?: () => void;
}

export default function VideoHistorySection({ onClickImage }: VideoHistorySectionProps) {
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollRef = useRef<ScrollRef>(null);

  const showBackToStart = scrollLeft > 200;

  const handleBackToStart = () => {
    scrollRef.current?.scrollToStart();
  };

  return (
    <>
      <VideoHistoryTitle showBackToStart={showBackToStart} onBackToStart={handleBackToStart} />
      <VideoHistory ref={scrollRef} onScrollChange={setScrollLeft} onClickImage={onClickImage} />
    </>
  );
}
