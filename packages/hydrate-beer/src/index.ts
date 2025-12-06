import type { HydrateBeerConfig } from './types';
import { MetricCollector } from './collector';
import { HydrationTracker } from './hydration';
import { ComponentTracker } from './profiler';
import { NavigationTracker } from './navigation';

let collector: MetricCollector | null = null;
let hydrationTracker: HydrationTracker | null = null;
let componentTracker: ComponentTracker | null = null;
let navigationTracker: NavigationTracker | null = null;

export function initHydrateBeer(config: HydrateBeerConfig): void {
  if (typeof window === 'undefined') {
    console.debug('HydrateBeer: Cannot initialize on server');
    return;
  }

  try {
    // Initialize collector
    collector = new MetricCollector(config);

    // Initialize trackers
    hydrationTracker = new HydrationTracker(collector);
    componentTracker = new ComponentTracker(collector);
    navigationTracker = new NavigationTracker(collector);

    // Setup performance observers
    hydrationTracker.setupPerformanceObserver();

    console.debug('HydrateBeer: Initialized successfully');
  } catch (error) {
    console.debug('HydrateBeer: Initialization failed', error);
  }
}

export function getCollector(): MetricCollector | null {
  return collector;
}

export function getHydrationTracker(): HydrationTracker | null {
  return hydrationTracker;
}

export function getComponentTracker(): ComponentTracker | null {
  return componentTracker;
}

export function getNavigationTracker(): NavigationTracker | null {
  return navigationTracker;
}

// Wrap hydrateRoot for React 18+
export function wrapHydrateRoot(hydrateRoot: any) {
  if (!hydrationTracker) {
    console.warn('HydrateBeer: Not initialized. Call initHydrateBeer first.');
    return hydrateRoot;
  }
  return hydrationTracker.wrapHydrateRoot(hydrateRoot);
}

// HOC for component profiling
export function withHydrateBeer<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  if (!componentTracker) {
    console.warn('HydrateBeer: Not initialized. Returning original component.');
    return Component;
  }
  return componentTracker.withProfiler(Component, componentName);
}

// Setup Next.js router tracking
export function trackNextRouter(router: any): void {
  if (!navigationTracker) {
    console.warn('HydrateBeer: Not initialized. Call initHydrateBeer first.');
    return;
  }
  navigationTracker.setupNextRouter(router);
}

// Manual metric collection
export function trackMetric(
  eventType: 'hydration' | 'render' | 'navigation' | 'page_timing',
  duration: number,
  metadata?: Record<string, any>
): void {
  if (!collector) {
    console.warn('HydrateBeer: Not initialized.');
    return;
  }

  collector.collect({
    eventType,
    route: typeof window !== 'undefined' ? window.location.pathname : '/',
    duration,
    metadata,
  });
}

// Cleanup
export function destroyHydrateBeer(): void {
  if (collector) {
    collector.destroy();
    collector = null;
  }
  hydrationTracker = null;
  componentTracker = null;
  navigationTracker = null;
}

// Re-export React components and hooks
export { HydrateBeerProvider, useHydrateBeer } from './react';

// Re-export types
export type {
  HydrateBeerConfig,
  MetricEvent,
  HydrationMetric,
  RenderMetric,
  NavigationMetric,
} from './types';
