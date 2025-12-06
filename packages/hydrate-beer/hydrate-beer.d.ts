declare module 'hydrate-beer' {
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
    eventType: 'hydration' | 'render' | 'navigation' | 'page_timing';
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

  /**
   * Initialize HydrateBeer monitoring
   * @param config - Configuration options
   */
  export function initHydrateBeer(config: HydrateBeerConfig): void;

  /**
   * Wrap React's hydrateRoot to track hydration timing
   * @param hydrateRoot - React's hydrateRoot function
   * @returns Wrapped hydrateRoot function
   */
  export function wrapHydrateRoot(hydrateRoot: any): any;

  /**
   * HOC to add performance profiling to a component
   * @param Component - React component to profile
   * @param componentName - Optional name for the component
   * @returns Profiled component
   */
  export function withHydrateBeer<P extends object>(
    Component: React.ComponentType<P>,
    componentName?: string
  ): React.ComponentType<P>;

  /**
   * Setup tracking for Next.js router
   * @param router - Next.js router instance
   */
  export function trackNextRouter(router: any): void;

  /**
   * Manually track a custom metric
   * @param eventType - Type of event
   * @param duration - Duration in milliseconds
   * @param metadata - Optional additional data
   */
  export function trackMetric(
    eventType: 'hydration' | 'render' | 'navigation' | 'page_timing',
    duration: number,
    metadata?: Record<string, any>
  ): void;

  /**
   * Cleanup and flush remaining metrics
   */
  export function destroyHydrateBeer(): void;

  /**
   * Get the metric collector instance
   */
  export function getCollector(): any;

  /**
   * Get the hydration tracker instance
   */
  export function getHydrationTracker(): any;

  /**
   * Get the component tracker instance
   */
  export function getComponentTracker(): any;

  /**
   * Get the navigation tracker instance
   */
  export function getNavigationTracker(): any;
}
