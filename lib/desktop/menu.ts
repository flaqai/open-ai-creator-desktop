export const DESKTOP_MENU_ROUTES = {
  nav_workspace: '/',
  nav_ai_create: '/ai-media-creator',
  nav_canvas: '/ai-canvas',
  nav_library: '/recommended-prompts',
  nav_text_to_image: '/text-to-image',
  nav_image_to_image: '/image-to-image',
  nav_virtual_try_on: '/virtual-try-on',
  nav_text_to_video: '/text-to-video',
  nav_image_to_video: '/image-to-video',
  nav_reference_to_video: '/reference-to-video',
} as const;

export function desktopMenuRoute(id: string) {
  return Object.hasOwn(DESKTOP_MENU_ROUTES, id) ? DESKTOP_MENU_ROUTES[id as keyof typeof DESKTOP_MENU_ROUTES] : null;
}
