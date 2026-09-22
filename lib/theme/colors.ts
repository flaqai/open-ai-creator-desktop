export const BRAND_COLOR_CSS = {
  primary: 'var(--brand-primary)',
  primarySoft: 'var(--brand-primary-soft)',
} as const;

export function readBrandColor(color: keyof typeof BRAND_COLOR_CSS) {
  if (typeof document === 'undefined') return '#000000';
  const property = color === 'primary' ? '--brand-primary' : '--brand-primary-soft';
  return getComputedStyle(document.documentElement).getPropertyValue(property).trim() || '#000000';
}
