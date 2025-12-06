export interface HydrateBeerConfig {
  projectKey: string;
  sampleRate?: number;
  endpoint?: string;
  flushInterval?: number;
  batchSize?: number;
  slowRenderThreshold?: number;
}

export interface MetricEvent {
  timestamp: number;
  sessionId: string;
  projectKey: string;
  userId?: string;
  eventType: 'hydration' | 'render' | 'navigation' | 'page_timing' | 'custom' | 'error';
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
