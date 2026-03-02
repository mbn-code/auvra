import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase-middleware';
import { jwtVerify } from 'jose';

// Verify the admin session JWT in middleware.
// The cookie value is now a signed HS256 JWT (see src/lib/admin.ts).
// We verify it here instead of using the static "authenticated" string check,
// preventing session forgery.
async function verifyAdminJwt(token: string): Promise<boolean> {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

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
  // Only set non-essential tracking cookies if the user has granted consent.
  // GDPR Art. 6(1)(a) — explicit consent required for analytics/attribution cookies.
  // The 'auvra_consent' cookie is set by CookieConsent.tsx (client-side) and is
  // readable here because it is NOT HttpOnly.
  const consentCookie = request.cookies.get('auvra_consent')?.value;
  const hasConsent = consentCookie === 'granted';

  const utmCreativeId = searchParams.get('utm_creative_id') || searchParams.get('ref');
  if (utmCreativeId && hasConsent) {
    response.cookies.set('auvra_creative_id', utmCreativeId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  // Session ID Management — essential for order/auth flow, set unconditionally.
  // This is a functional cookie required for checkout; lawful basis: contractual necessity.
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

  // Fingerprint — analytics/fraud-detection use only. Requires consent.
  // Without consent, fingerprinting is suppressed entirely.
  if (hasConsent) {
    const fingerprint = await getFingerprint(request);
    response.cookies.set('auvra_fingerprint', fingerprint, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  // 2. Admin Terminal Protection
  // Verify the signed JWT instead of comparing a static cookie value.
  if (pathname.startsWith('/admin/review') || pathname.startsWith('/admin/orders')) {
    const sessionToken = request.cookies.get('admin_session')?.value;
    const isValid = sessionToken ? await verifyAdminJwt(sessionToken) : false;
    if (!isValid) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 3. Society Member Protection
  const needsAuth = pathname.startsWith('/account') || 
                    pathname.startsWith('/vault') || 
                    pathname.startsWith('/api/stylist/sync') || 
                    pathname.startsWith('/api/pdf/generate');

  if (needsAuth) {
    const { data: { user } } = await supabase.auth.getUser();

    if (pathname.startsWith('/account') && !user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // 4. Society Member Gating (CaaS Pivot)
    if (pathname.startsWith('/vault') || pathname.startsWith('/api/stylist/sync') || pathname.startsWith('/api/pdf/generate')) {
      if (!user) {
        return NextResponse.redirect(new URL('/pricing', request.url));
      }
      
      let isSociety = request.cookies.get('auvra_tier')?.value === 'society';
      
      if (!isSociety) {
        const { data } = await supabase.from('profiles').select('membership_tier').eq('id', user.id).single();
        if (data?.membership_tier === 'society') {
           response.cookies.set('auvra_tier', 'society', { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 });
           isSociety = true;
        } else {
           response.cookies.set('auvra_tier', 'free', { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 });
        }
      }
      
      if (!isSociety) {
        return NextResponse.redirect(new URL('/pricing', request.url));
      }
    }
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
