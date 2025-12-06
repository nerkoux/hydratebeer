import type { HydrateBeerConfig, MetricEvent } from './types';

export class MetricCollector {
  private config: Required<Omit<HydrateBeerConfig, 'posthogHost'>> & { 
    posthogHost: string;
  };
  private sessionId: string;
  private buffer: MetricEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private endpoint: string;

  constructor(config: HydrateBeerConfig) {
    const posthogHost = config.posthogHost || 'https://app.posthog.com';
    this.endpoint = `${posthogHost}/capture/`;
    
    this.config = {
      posthogApiKey: config.posthogApiKey,
      posthogHost,
      debug: config.debug ?? false,
      batchSize: config.batchSize ?? 10,
      flushInterval: config.flushInterval ?? 5000,
      autoTrackRoutes: config.autoTrackRoutes ?? true,
      trackComponentPerformance: config.trackComponentPerformance ?? true,
      trackErrors: config.trackErrors ?? true,
      trackSessions: config.trackSessions ?? true,
    };

    // Generate anonymous session ID
    this.sessionId = this.generateSessionId();

    // Start flush timer
    this.startFlushTimer();

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush(true));
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flush(true);
        }
      });
    }
  }

  private generateSessionId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private shouldSample(): boolean {
    return true; // Always track for PostHog
  }

  public collect(event: Omit<MetricEvent, 'sessionId' | 'timestamp'>): void {
    if (!this.shouldSample()) {
      return;
    }

    try {
      const metric: MetricEvent = {
        timestamp: Date.now(),
        sessionId: this.sessionId,
        ...event,
      };

      this.buffer.push(metric);
      console.log('🍺 HydrateBeer: Event collected', { 
        type: event.eventType, 
        route: event.route,
        duration: event.duration,
        bufferSize: this.buffer.length 
      });

      if (this.buffer.length >= this.config.batchSize) {
        this.flush();
      }
    } catch (error) {
      // Silently fail - never crash user's app
      console.debug('HydrateBeer: Failed to collect metric', error);
    }
  }

  private startFlushTimer(): void {
    if (typeof window === 'undefined') return;

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  public flush(useBeacon = false): void {
    if (this.buffer.length === 0) return;

    try {
      const events = [...this.buffer];
      this.buffer = [];

      // Transform events to PostHog format
      const posthogEvents = events.map(event => ({
        event: `hydratebeer_${event.eventType}`,
        properties: {
          distinct_id: event.sessionId,
          $session_id: event.sessionId,
          user_id: event.userId || null,
          route: event.route || '',
          component_name: event.componentName || '',
          duration: event.duration || 0,
          timestamp: new Date(event.timestamp).toISOString(),
          ...(event.metadata || {}),
        },
        timestamp: new Date(event.timestamp).toISOString(),
      }));

      console.log(`🍺 HydrateBeer: Sending ${events.length} events to PostHog`);

      if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        // PostHog batch endpoint
        const payload = JSON.stringify({
          api_key: this.config.posthogApiKey,
          batch: posthogEvents,
        });
        const blob = new Blob([payload], { type: 'application/json' });
        const success = navigator.sendBeacon(`${this.config.posthogHost}/batch/`, blob);
        console.log('🍺 HydrateBeer: Events sent via beacon:', success);
      } else {
        // Use batch endpoint for better performance
        fetch(`${this.config.posthogHost}/batch/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: this.config.posthogApiKey,
            batch: posthogEvents,
          }),
          keepalive: true,
        })
          .then(async (response) => {
            if (response.ok) {
              console.log('🍺 HydrateBeer: Events sent successfully to PostHog');
            } else {
              const responseText = await response.text();
              console.error('🍺 HydrateBeer: PostHog returned error', response.status, responseText);
            }
          })
          .catch((error) => {
            console.error('🍺 HydrateBeer: Failed to send metrics', error);
          });
      }
    } catch (error) {
      console.debug('HydrateBeer: Failed to flush metrics', error);
    }
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush(true);
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getConfig() {
    return this.config;
  }
}
