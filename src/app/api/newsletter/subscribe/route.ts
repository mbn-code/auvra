import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { sendNewsletterWelcomeEmail } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createHash } from 'crypto';

// Simple in-memory rate limiter: max 3 requests per IP per hour.
// Resets on cold start — sufficient to block casual spam without external infra.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

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

// Basic email format validation (stricter than just checking for '@')
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const headerStore = await headers();
    const ip = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // ── GDPR Consent Record ──────────────────────────────────────────────────
    // Store a consent record to demonstrate lawful basis for email marketing.
    // GDPR Art. 6(1)(a) — explicit consent; Art. 7 — demonstrable consent.
    //
    // We store a SHA-256 hash of the email (not the plaintext) to minimise PII
    // exposure in the consent log, while still being able to prove that a
    // specific subscriber gave consent (by hashing the email at query time).
    // The IP address is stored as-is for audit purposes; it is considered PII
    // and is disclosed in the privacy policy under "Newsletter & Consent Records".
    // ────────────────────────────────────────────────────────────────────────
    const emailHash = createHash('sha256').update(email).digest('hex');
    await supabaseAdmin
      .from('newsletter_consent')
      .upsert(
        {
          email_hash: emailHash,
          consented_at: new Date().toISOString(),
          ip_address: ip,
          source: 'website_signup',
        },
        { onConflict: 'email_hash' }
      );
    // Note: we intentionally swallow upsert errors here — failure to write
    // the consent record must not block the user's signup. The error will
    // surface in Supabase logs. Consider adding alerting if this matters.

    // Send the welcome email
    await sendNewsletterWelcomeEmail(email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
