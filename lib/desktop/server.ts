export const isDesktopServerRender =
  process.env.FLAQ_DESKTOP_BUILD === 'true' || process.env.FLAQ_DESKTOP_RUNTIME === 'true';
