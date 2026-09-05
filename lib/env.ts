export const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`)
).replace(/\/$/, '');

export const NEXT_PUBLIC_CONTACT_US_EMAIL = process.env.NEXT_PUBLIC_CONTACT_US_EMAIL as string;
