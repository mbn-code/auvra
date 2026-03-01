"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { auvraAnalytics } from "@/lib/auvra-analytics";
import { hasAnalyticsConsent, CONSENT_KEY } from "@/lib/consent";

/**
 * GDPR-gated analytics provider.
 *
 * Checks consent before initialising any non-essential tracking:
 *   1. Auvra internal analytics (scroll depth, clicks, heartbeat, page views)
 *   2. Vercel Analytics
 *
 * Consent is stored in localStorage under the 'cookie-consent' key by
 * CookieConsent.tsx. We also listen for the storage event so that accepting
 * consent on one tab immediately activates analytics on the same tab after
 * the banner is dismissed.
 *
 * If the user selected "Essential Only" (value: 'false') or has not yet
 * chosen, neither analytics system is loaded.
 */
export function AnalyticsProvider() {
  const [consentGranted, setConsentGranted] = useState(false);

  useEffect(() => {
    // Initial check on mount
    if (hasAnalyticsConsent()) {
      setConsentGranted(true);
      auvraAnalytics.init();
    }

    // Re-check whenever localStorage changes (e.g. user accepts via banner)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CONSENT_KEY && e.newValue === 'true') {
        setConsentGranted(true);
        auvraAnalytics.init();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Only mount Vercel Analytics after consent is confirmed
  if (!consentGranted) return null;

  return <Analytics />;
}
