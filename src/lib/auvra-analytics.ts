// src/lib/auvra-analytics.ts
type EventType = 'page_view' | 'session_start' | 'heartbeat' | 'scroll_depth' | 'click' | string;

interface AuvraEvent {
  event_type: EventType;
  metadata?: Record<string, any>;
  timestamp: string;
}

class AuvraAnalytics {
  private queue: AuvraEvent[] = [];
  private isInitialized = false;
  private isFlushing = false;
  private lastHeartbeat = 0;
  private scrollMarks = new Set<number>();
  private readonly MAX_BATCH = 10;
  private readonly FLUSH_INTERVAL = 5000;
  private readonly HEARTBEAT_INTERVAL = 30000;

  public init() {
    if (typeof window === 'undefined' || this.isInitialized) return;
    this.isInitialized = true;

    this.track('session_start', { url: window.location.href });
    this.track('page_view', { url: window.location.pathname });

    setInterval(() => this.flush(), this.FLUSH_INTERVAL);
    setInterval(() => this.handleHeartbeat(), 5000);

    window.addEventListener('beforeunload', () => this.flush(true));
    document.addEventListener('visibilitychange', () => this.handleVisibility());
    document.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    document.addEventListener('click', (e) => this.handleClick(e), { capture: true, passive: true });

    // Override pushState/replaceState to track soft navigations in Next.js
    const originalPushState = history.pushState;
    history.pushState = function() {
      originalPushState.apply(this, arguments as any);
      window.dispatchEvent(new Event('pushstate'));
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function() {
      originalReplaceState.apply(this, arguments as any);
      window.dispatchEvent(new Event('replacestate'));
    };

    window.addEventListener('popstate', () => this.trackPageView());
    window.addEventListener('pushstate', () => this.trackPageView());
    window.addEventListener('replacestate', () => this.trackPageView());
  }

  public track(eventType: EventType, metadata?: Record<string, any>) {
    if (typeof window === 'undefined') return;

    this.queue.push({
      event_type: eventType,
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    });

    if (this.queue.length >= this.MAX_BATCH) {
      this.flush();
    }
  }

  private trackPageView() {
    // Reset scroll marks on new page view
    this.scrollMarks.clear();
    this.track('page_view', { url: window.location.pathname });
  }

  private handleHeartbeat() {
    if (document.visibilityState !== 'visible') return;
    const now = Date.now();
    if (now - this.lastHeartbeat >= this.HEARTBEAT_INTERVAL) {
      this.track('heartbeat');
      this.lastHeartbeat = now;
    }
  }

  private handleVisibility() {
    if (document.visibilityState === 'hidden') {
      this.flush(true);
    } else {
      this.lastHeartbeat = Date.now();
    }
  }

  private handleScroll() {
    const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
    const marks = [25, 50, 75, 100];
    
    for (const mark of marks) {
      if (scrollPercent >= mark && !this.scrollMarks.has(mark)) {
        this.scrollMarks.add(mark);
        this.track('scroll_depth', { depth: mark });
      }
    }
  }

  private lastClickTime = 0;
  private handleClick(e: MouseEvent) {
    const now = Date.now();
    if (now - this.lastClickTime < 100) return; // Throttle 100ms
    this.lastClickTime = now;

    const target = e.target as HTMLElement;
    const closest = target.closest('button, a, [data-track]') as HTMLElement;
    
    if (closest) {
      const metadata: Record<string, any> = {
        tag: closest.tagName.toLowerCase(),
        text: closest.textContent?.substring(0, 50).trim() || '',
      };
      
      if (closest.id) metadata.id = closest.id;
      if (closest.hasAttribute('href')) metadata.href = closest.getAttribute('href');
      if (closest.dataset.track) metadata.track_id = closest.dataset.track;

      this.track('click', metadata);
    }
  }

  private async flush(isSync = false, isRetry = false) {
    if (this.queue.length === 0 || this.isFlushing || typeof fetch === 'undefined') return;

    this.isFlushing = true;
    const batch = [...this.queue];
    this.queue = []; // Optimistically clear

    try {
      const payload = JSON.stringify({ events: batch });

      if (isSync && navigator.sendBeacon) {
        navigator.sendBeacon('/api/events/ingest', payload);
      } else {
        const response = await fetch('/api/events/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        });

        if (!response.ok && !isRetry) {
          throw new Error('Flush failed');
        }
      }
    } catch (e) {
      // Re-queue on failure if it's the first attempt
      if (!isRetry) {
        this.queue = [...batch, ...this.queue];
        setTimeout(() => this.flush(false, true), 1000);
      }
    } finally {
      this.isFlushing = false;
    }
  }
}

export const auvraAnalytics = new AuvraAnalytics();
