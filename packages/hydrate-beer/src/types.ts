export interface HydrateBeerConfig {
  posthogApiKey: string;
  posthogHost?: string; // defaults to https://us.posthog.com
  debug?: boolean;
  batchSize?: number;
  flushInterval?: number;
  autoTrackRoutes?: boolean;
  trackComponentPerformance?: boolean;
  trackErrors?: boolean;
  trackSessions?: boolean;
}

export interface MetricEvent {
  timestamp: number;
  sessionId: string;
  userId?: string;
  eventType: 'hydration' | 'render' | 'navigation' | 'page_timing' | 'page_view' | 'custom' | 'error';
  route: string;
  componentName?: string;
  duration: number;
  metadata?: Record<string, any>;
}

export interface HydrationMetric {
  startTime: number;
  endTime: number;
  duration: number;
  route: string;
}

export interface RenderMetric {
  componentName: string;
  duration: number;
  phase: 'mount' | 'update';
  renderCount: number;
  isSlow: boolean;
}

export interface NavigationMetric {
  from: string;
  to: string;
  duration: number;
}
