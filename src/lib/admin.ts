/**
 * Admin session utilities.
 *
 * Security: The admin cookie now contains a signed JWT (HS256) instead of the
 * static string "authenticated". This prevents session forgery — an attacker
 * who can read the cookie value cannot craft a valid session without knowing
 * the ADMIN_JWT_SECRET. The secret must be at least 32 bytes of random data.
 *
 * Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 * Then add to .env.local as ADMIN_JWT_SECRET=<value>
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { createClient } from "./supabase-server";

const ALLOWED_UIDS = ["52f1626b-c411-48af-aa9d-ee9a6beaabc6"];

// Cookie name for the admin session JWT.
export const ADMIN_COOKIE_NAME = "admin_session";

// Session lifetime: 7 days (in seconds for cookie maxAge, in ms for JWT exp).
const SESSION_DURATION_SEC = 60 * 60 * 24 * 7;

/** Returns the HMAC-SHA256 secret key derived from ADMIN_JWT_SECRET env var. */
function getJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error("ADMIN_JWT_SECRET is not set in environment variables");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Issues a signed JWT and sets it as the admin_session cookie.
 * Call this on successful password verification at login.
 */
export async function issueAdminSession(): Promise<void> {
  const secret = getJwtSecret();
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SEC}s`)
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_DURATION_SEC,
    path: "/",
  });
}

/**
 * Clears the admin session cookie.
 * Call this at logout.
 */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

/**
 * Verifies the admin session cookie.
 * Returns true only if the JWT is valid, unexpired, and (in production) the
 * Supabase UID matches the allowed list.
 */
export async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) return false;

  // Verify the JWT signature and expiry.
  let payload: JWTPayload;
  try {
    const secret = getJwtSecret();
    const { payload: verified } = await jwtVerify(token, secret);
    payload = verified;
  } catch {
    // Invalid signature, expired, or malformed token.
    return false;
  }

  if (payload.role !== "admin") return false;

  // In development, the signed JWT is sufficient.
  if (process.env.NODE_ENV === "development") return true;

  // In production, also verify the Supabase UID for defence-in-depth.
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !ALLOWED_UIDS.includes(user.id)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
