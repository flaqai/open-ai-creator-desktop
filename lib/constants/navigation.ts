import { FEATURE_MODULES, featureRoutes } from '@/lib/features/catalog';

export type RouteItem = {
  code: string;
  href: string;
  title?: string;
  hideInNav?: boolean;
  hideInFooter?: boolean;
  hideInSitemap?: boolean;
};

export type NavLink = RouteItem & { children?: RouteItem[] };

export const VIDEO_CHILDREN_LIST: RouteItem[] = featureRoutes('video');

export const IMAGE_CHILDREN_LIST: RouteItem[] = featureRoutes('image');

export const API_CHILDREN_LIST: RouteItem[] = [
  { code: 'nano-banana-2', href: 'https://flaq.ai/models/google/nano-banana-2/' },
  { code: 'nano-banana-pro', href: 'https://flaq.ai/models/google/nano-banana-pro/' },
  { code: 'seedream-4-5', href: 'https://flaq.ai/models/bytedance/seedream-4-5/' },
  { code: 'seedream-5-0', href: 'https://flaq.ai/models/bytedance/seedream-5-0/' },
  { code: 'veo-3-1', href: 'https://flaq.ai/models/google/veo3-1-text-to-video/' },
  { code: 'kling-3-0', href: 'https://flaq.ai/models/kuaishou/kling-3-0-std-text-to-video/' },
  { code: 'vidu-q3', href: 'https://flaq.ai/models/vidu/vidu-q3-turbo-text-to-video/' },
  { code: 'wan-2-7', href: 'https://flaq.ai/models/alibaba/wan-2-7-text-to-video/' },
];

export const SUPPORT_LINKS: RouteItem[] = [
  { code: 'privacy', href: '/privacy-policy' },
  { code: 'termsConditions', href: '/terms-of-service' },
  { code: 'refundPolicy', href: '/refund-policy' },
];

export const ALL_FEATURE_ROUTES: RouteItem[] = FEATURE_MODULES.map(({ code, href }) => ({ code, href }));

export const NAV_LINKS: NavLink[] = [
  { code: 'ai-create', href: '/ai-media-creator' },
  { code: 'video-ai', href: '', children: VIDEO_CHILDREN_LIST.filter((r) => !r.hideInNav) },
  { code: 'image-ai', href: '', children: IMAGE_CHILDREN_LIST.filter((r) => !r.hideInNav) },
  { code: 'ai-api', href: '', children: API_CHILDREN_LIST },
];

export const UTM_SOURCE = 'flaq-saas-template';
