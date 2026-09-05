/** One source for discovery, navigation, guides, and parity checks. Keep React out of this module. */
export const FEATURE_MODULES = [
  {
    id: 'ai-media-creator',
    code: 'ai-create',
    href: '/ai-media-creator',
    group: 'workspace',
    icon: 'sparkles',
    featured: true,
  },
  { id: 'text-to-image', code: 'text-to-image', href: '/text-to-image', group: 'image', icon: 'image' },
  { id: 'image-to-image', code: 'image-to-image', href: '/image-to-image', group: 'image', icon: 'layers' },
  { id: 'virtual-try-on', code: 'virtual-try-on', href: '/virtual-try-on', group: 'image', icon: 'shirt' },
  { id: 'text-to-video', code: 'text-to-video', href: '/text-to-video', group: 'video', icon: 'video' },
  { id: 'image-to-video', code: 'image-to-video', href: '/image-to-video', group: 'video', icon: 'play' },
  { id: 'reference-to-video', code: 'reference-to-video', href: '/reference-to-video', group: 'video', icon: 'layers' },
] as const;

export type FeatureId = (typeof FEATURE_MODULES)[number]['id'];
export function featureRoutes(group: 'image' | 'video') {
  return FEATURE_MODULES.filter((feature) => feature.group === group).map(({ code, href }) => ({ code, href }));
}
