import type { MetricCollector } from './collector';

export class HydrationTracker {
  private collector: MetricCollector;
  private hydrationStart: number | null = null;
  private currentRoute: string;

  constructor(collector: MetricCollector) {
    this.collector = collector;
    this.currentRoute = this.getCurrentRoute();
  }

  private getCurrentRoute(): string {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname;
  }

  public markHydrationStart(): void {
    this.hydrationStart = performance.now();
  }

  public markHydrationEnd(): void {
    if (this.hydrationStart === null) return;

    try {
      const endTime = performance.now();
      const duration = endTime - this.hydrationStart;

      this.collector.collect({
        eventType: 'hydration',
        route: this.currentRoute,
        duration,
        metadata: {
          startTime: this.hydrationStart,
          endTime,
        },
      });

      this.hydrationStart = null;
    } catch (error) {
      console.debug('HydrateBeer: Failed to track hydration', error);
    }
  }

  public wrapHydrateRoot(originalHydrateRoot: any) {
    const tracker = this;
    
    return function wrappedHydrateRoot(
      container: Element | Document,
      children: React.ReactNode,
      options?: any
    ) {
      tracker.markHydrationStart();

      const result = originalHydrateRoot(container, children, options);

      // Use requestIdleCallback or setTimeout to mark end after hydration completes
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => tracker.markHydrationEnd(), { timeout: 1000 });
      } else {
        setTimeout(() => tracker.markHydrationEnd(), 0);
      }

      return result;
    };
  }

  public setupPerformanceObserver(): void {
    if (typeof window === 'undefined') return;
    if (!('PerformanceObserver' in window)) return;

    try {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            
            // Time to Interactive approximation
            const tti = navEntry.domInteractive - navEntry.fetchStart;
            
            this.collector.collect({
              eventType: 'page_timing',
              route: this.currentRoute,
              duration: tti,
              metadata: {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
                loadComplete: navEntry.loadEventEnd - navEntry.fetchStart,
                ttfb: navEntry.responseStart - navEntry.fetchStart,
              },
            });
          }
        }
      });

      navObserver.observe({ entryTypes: ['navigation'] });

      // Observe long tasks
      if ('PerformanceLongTaskTiming' in window) {
        const taskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.collector.collect({
              eventType: 'page_timing',
              route: this.currentRoute,
              duration: entry.duration,
              metadata: {
                type: 'long_task',
                startTime: entry.startTime,
              },
            });
          }
        });

        taskObserver.observe({ entryTypes: ['longtask'] });
      }
    } catch (error) {
      console.debug('HydrateBeer: Failed to setup performance observer', error);
    }
  }
}
