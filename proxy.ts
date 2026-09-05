import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

const HEADER_IP_KEY = 'x-client-ip';

function getIp(request: NextRequest): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    ''
  );
}

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const ip = getIp(request);
  request.headers.set(HEADER_IP_KEY, ip);

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
