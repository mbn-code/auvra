/**
 * Auvra Creative Intelligence System (CIS) - Client Analytics
 * 
 * Batches high-volume frontend events (views, drags, interactions)
 * and flushes them to the /api/events/ingest endpoint.
 */

type PulseEventType = 'view' | 'drag' | 'checkout';

interface AnalyticsEvent {
  event_type: PulseEventType;
  metadata?: Record<string, any>;
  timestamp?: string;
  // Note: session_id and creative_id are automatically appended by the ingest API
  // via cookies, but can be explicitly provided if necessary.
}

class AnalyticsBuffer {
  private events: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly MAX_BATCH_SIZE = 20;
  private readonly FLUSH_INTERVAL_MS = 5000;

  constructor() {
    if (typeof window !== 'undefined') {
      // Setup periodic flush
      this.flushInterval = setInterval(() => this.flush(), this.FLUSH_INTERVAL_MS);
      
      // Flush on tab close/visibility change
      window.addEventListener('beforeunload', () => this.flush(true));
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flush(true);
        }
      });
    }
  }

  public track(eventType: PulseEventType, metadata?: Record<string, any>) {
    this.events.push({
      event_type: eventType,
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    });

    if (this.events.length >= this.MAX_BATCH_SIZE) {
      this.flush();
    }
  }

  private async flush(isSync = false) {
    if (this.events.length === 0) return;

    // Make a copy and clear the buffer immediately
    const batch = [...this.events];
    this.events = [];

    try {
      const payload = JSON.stringify({ events: batch });
      
      if (isSync && navigator.sendBeacon) {
        // Use sendBeacon for reliable delivery on page exit
        navigator.sendBeacon('/api/events/ingest', payload);
      } else {
        await fetch('/api/events/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          // keepalive ensures the request finishes even if the page unloads
          keepalive: true 
        });
      }
    } catch (error) {
      console.error('[Analytics] Failed to flush events', error);
      // Optional: Add back to buffer on failure, though this risks unbounded memory growth
      // this.events = [...batch, ...this.events];
    }
  }
}

// Export a singleton instance
export const analytics = new AnalyticsBuffer();
