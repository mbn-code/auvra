import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase-middleware';

async function getFingerprint(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const ua = request.headers.get('user-agent') || 'unknown';
  const data = new TextEncoder().encode(`${ip}-${ua}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams, hostname } = request.nextUrl;

  // 0. Subdomain Routing (creative.auvra.eu)
  if (hostname === 'creative.auvra.eu' || hostname === 'creative.localhost') {
    // If they are on the root of the subdomain, rewrite to the admin/creative dashboard
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/admin/creative', request.url));
    }
  }

  // Ensure session is refreshed for Supabase Auth and response is initialized
  const { supabase, response } = await createClient(request);

  // 1. Creative Intelligence System (CIS) Attribution
  const utmCreativeId = searchParams.get('utm_creative_id') || searchParams.get('ref');
  if (utmCreativeId) {
    response.cookies.set('auvra_creative_id', utmCreativeId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  // Session ID Management
  let sessionId = request.cookies.get('auvra_session_id')?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    response.cookies.set('auvra_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  // Fingerprint Fallback
  const fingerprint = await getFingerprint(request);
  response.cookies.set('auvra_fingerprint', fingerprint, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });

  // 2. Admin Terminal Protection
  if (pathname.startsWith('/admin/review') || pathname.startsWith('/admin/orders')) {
    const session = request.cookies.get('admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 3. Society Member Protection
  const { data: { user } } = await supabase.auth.getUser();

  if (pathname.startsWith('/account') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons, etc
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
