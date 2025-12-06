import type { HydrateBeerConfig, MetricEvent } from './types';

export class MetricCollector {
  private config: Required<HydrateBeerConfig>;
  private sessionId: string;
  private buffer: MetricEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: HydrateBeerConfig) {
    this.config = {
      projectKey: config.projectKey,
      sampleRate: config.sampleRate ?? 1.0,
      endpoint: config.endpoint ?? 'https://api.us-east.tinybird.co/v0/events?name=events',
      flushInterval: config.flushInterval ?? 5000,
      batchSize: config.batchSize ?? 50,
      slowRenderThreshold: config.slowRenderThreshold ?? 16,
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
    return Math.random() < this.config.sampleRate;
  }

  public collect(event: Omit<MetricEvent, 'sessionId' | 'projectKey' | 'timestamp'>): void {
    if (!this.shouldSample()) {
      return;
    }

    try {
      const metric: MetricEvent = {
        timestamp: Date.now(),
        sessionId: this.sessionId,
        projectKey: this.config.projectKey,
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

      // Transform events to match Tinybird schema
      const tinybirdEvents = events.map(event => ({
        timestamp: new Date(event.timestamp).toISOString(),
        projectId: this.config.projectKey,
        sessionId: event.sessionId,
        userId: event.userId || '',
        eventType: event.eventType,
        route: event.route || '',
        componentName: event.componentName || '',
        duration: event.duration || 0,
        metadata: event.metadata ? JSON.stringify(event.metadata) : '{}',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        country: '',
        city: ''
      }));

      // Tinybird Events API expects newline-delimited JSON (NDJSON)
      const payload = tinybirdEvents.map(e => JSON.stringify(e)).join('\n');

      console.log(`🍺 HydrateBeer: Sending ${events.length} events to Tinybird`);

      if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(this.config.endpoint, blob);
        console.log('🍺 HydrateBeer: Events sent via beacon');
      } else {
        fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload,
          keepalive: true,
        })
          .then((response) => {
            if (response.ok) {
              console.log('🍺 HydrateBeer: Events sent successfully to Tinybird');
            } else {
              console.warn('🍺 HydrateBeer: Tinybird returned error', response.status);
            }
          })
          .catch((error) => {
            console.warn('🍺 HydrateBeer: Failed to send metrics', error);
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

  public getConfig(): Required<HydrateBeerConfig> {
    return this.config;
  }
}
