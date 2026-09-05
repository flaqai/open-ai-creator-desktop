'use client';

import { Image, Sparkles, Video } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { NAV_LINKS } from '@/lib/constants/navigation';

import TreeSider from './tree-sider';

export default function PanelSider() {
  const t = useTranslations('Navigation');

  const group = [
    {
      id: 'video-ai',
      icon: <Video />,
      title: t('video-ai'),
      items:
        NAV_LINKS.find((item) => item.code === 'video-ai')?.children?.map((item) => ({
          id: item.code,
          title: t(`${item.code}`),
          href: item.href,
        })) || [],
    },
    {
      id: 'image-ai',
      icon: <Image />,
      title: t('image-ai'),
      items:
        NAV_LINKS.find((item) => item.code === 'image-ai')?.children?.map((item) => ({
          id: item.code,
          title: t(`${item.code}`),
          href: item.href,
        })) || [],
    },
  ];

  return (
    <div className='no-scrollbar sticky top-16 hidden h-[calc(100dvh-64px)] w-[232px] shrink-0 overflow-y-auto border-e border-white/10 bg-black/20 lg:block'>
      <TreeSider
        group={group}
        primaryItems={[
          {
            id: 'ai-create',
            icon: <Sparkles className='size-4' />,
            title: t('ai-create'),
            href: '/ai-media-creator',
          },
        ]}
      />
    </div>
  );
}
