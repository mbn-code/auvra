/**
 * GDPR Consent Utilities
 *
 * Consent state is stored in localStorage ('cookie-consent': 'true' | 'false').
 * This module provides a shared helper so all analytics surfaces read from the
 * same source of truth rather than duplicating the localStorage key string.
 *
 * 'true'  = user clicked "Accept All" — non-essential analytics may run.
 * 'false' = user clicked "Essential Only" — only strictly-necessary cookies allowed.
 * null    = user has not yet responded — treat as no-consent until they do.
 *
 * NOTE: This module is client-side only. Never import it in server components.
 */

export const CONSENT_KEY = 'cookie-consent';

/** Returns true only when the user has explicitly accepted all cookies. */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_KEY) === 'true';
}

/** Returns true when the user has made any choice (accepted or rejected). */
export function hasConsentDecision(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_KEY) !== null;
}
