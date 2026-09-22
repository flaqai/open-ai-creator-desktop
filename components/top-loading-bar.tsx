'use client';

import NextTopLoader from 'nextjs-toploader';

import { BRAND_COLOR_CSS } from '@/lib/theme/colors';

export default function TopLoadingBar() {
  return (
    <NextTopLoader
      color={BRAND_COLOR_CSS.primary}
      initialPosition={0.08}
      crawlSpeed={200}
      height={2}
      crawl
      showSpinner={false}
      easing='ease'
      speed={200}
      shadow={`0 0 10px ${BRAND_COLOR_CSS.primary}, 0 0 5px ${BRAND_COLOR_CSS.primary}`}
      zIndex={1600}
      showAtBottom={false}
    />
  );
}
