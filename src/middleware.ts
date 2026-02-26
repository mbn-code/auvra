import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase-middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin Terminal Protection
  if (pathname.startsWith('/admin/review') || pathname.startsWith('/admin/orders')) {
    const session = request.cookies.get('admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 2. Society Member Protection
  // Ensure session is refreshed for Supabase Auth
  const { supabase, response } = await createClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (pathname.startsWith('/account') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    // Match all request paths except for static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
