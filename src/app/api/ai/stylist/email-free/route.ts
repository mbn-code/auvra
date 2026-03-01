import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendFreeLookbookEmail } from '@/lib/email';
import { headers } from 'next/headers';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 3;
const WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) {
    return false;
  }
  entry.count++;
  return true;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const headerStore = await headers();
    const ip = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { email, slots } = await req.json();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Capture as a lead (if not already)
    const crypto = await import('crypto');
    const emailHash = crypto.createHash('sha256').update(email).digest('hex');

    // Check if this email has already used the free lookbook feature
    const { data: existingConsent } = await supabaseAdmin
      .from('newsletter_consent')
      .select('source')
      .eq('email_hash', emailHash)
      .eq('source', 'website_free_lookbook')
      .maybeSingle();

    if (existingConsent) {
      return NextResponse.json(
        { error: 'This email has already claimed its free network test. Upgrade to Society for unlimited access or use a different email.' }, 
        { status: 403 }
      );
    }

    await supabaseAdmin
      .from('newsletter_consent')
      .upsert(
        {
          email_hash: emailHash,
          consented_at: new Date().toISOString(),
          ip_address: ip,
          source: 'website_free_lookbook',
        },
        { onConflict: 'email_hash' }
      );

    // Fetch product details for the email
    const productIds = Object.values(slots).filter(id => id !== null) as string[];
    let products: any[] = [];
    
    if (productIds.length > 0) {
      const { data } = await supabaseAdmin
        .from('pulse_inventory')
        .select('id, title, brand, listing_price, images')
        .in('id', productIds);
      products = data || [];
    }

    await sendFreeLookbookEmail(email, products);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[EmailFreeOutfit] Error:', error);
    return NextResponse.json({ error: 'Failed to send lookbook' }, { status: 500 });
  }
}
