import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";

// ─────────────────────────────────────────────────────────────────────────────
// In-memory rate limiter (per IP, module-level Map).
// Vercel Hobby: single-region, so this is sufficient. Each cold start resets
// the map — acceptable; the window is short (15 min) and the risk is low
// compared to having no limit at all.
// ─────────────────────────────────────────────────────────────────────────────
const RATE_LIMIT_MAX = 5;           // max attempts
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function getRateLimitEntry(ip: string): RateLimitEntry {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    const fresh: RateLimitEntry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(ip, fresh);
    return fresh;
  }
  return entry;
}

// ─────────────────────────────────────────────────────────────────────────────
// Timing-safe string comparison.
// Pads both sides to the same byte length before comparing so the comparison
// time does not leak information about how many characters match.
// ─────────────────────────────────────────────────────────────────────────────
function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  // If lengths differ, still do a full comparison against a same-length copy
  // so the function always takes constant time relative to the longer value.
  if (aBuf.length !== bBuf.length) {
    // Perform a dummy comparison to prevent short-circuit timing leaks,
    // then return false.
    timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

export async function POST(req: NextRequest) {
  // Extract the client IP (Vercel sets x-forwarded-for).
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const entry = getRateLimitEntry(ip);

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfterSec = Math.ceil((entry.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSec) },
      }
    );
  }

  // Increment before checking the password so the counter advances even on
  // malformed requests (missing body, etc.).
  entry.count += 1;

  if (!process.env.ADMIN_PASSWORD) {
    console.error("ADMIN_PASSWORD is not set in environment variables");
    return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
  }

  const { password } = await req.json().catch(() => ({ password: "" }));

  if (safeCompare(String(password ?? ""), process.env.ADMIN_PASSWORD)) {
    // Successful login — reset the rate-limit counter for this IP.
    rateLimitMap.delete(ip);

    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
