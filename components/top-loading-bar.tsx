'use client';

import NextTopLoader from 'nextjs-toploader';

export default function TopLoadingBar() {
  return (
    <NextTopLoader
      color='#417CF1'
      initialPosition={0.08}
      crawlSpeed={200}
      height={2}
      crawl
      showSpinner={false}
      easing='ease'
      speed={200}
      shadow='0 0 10px #417CF1,0 0 5px #417CF1'
      zIndex={1600}
      showAtBottom={false}
    />
  );
}
