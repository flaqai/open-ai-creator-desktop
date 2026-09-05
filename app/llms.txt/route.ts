import { getLlmsTxt } from '@/lib/seo/llms';

export const revalidate = 86400;

export function GET() {
  return new Response(getLlmsTxt(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
