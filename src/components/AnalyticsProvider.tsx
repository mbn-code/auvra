"use client";

import { useEffect } from "react";
import { auvraAnalytics } from "@/lib/auvra-analytics";

export function AnalyticsProvider() {
  useEffect(() => {
    auvraAnalytics.init();
  }, []);

  return null;
}
