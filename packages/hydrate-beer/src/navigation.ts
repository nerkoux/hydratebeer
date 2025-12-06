import type { MetricCollector } from './collector';

export class NavigationTracker {
  private collector: MetricCollector;
  private navigationStart: number | null = null;
  private previousRoute: string | null = null;
  private currentRoute: string;

  constructor(collector: MetricCollector) {
    this.collector = collector;
    this.currentRoute = this.getCurrentRoute();
    this.setupRouteTracking();
  }

  private getCurrentRoute(): string {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname;
  }

  private setupRouteTracking(): void {
    if (typeof window === 'undefined') return;

    // Track route changes
    let lastRoute = this.currentRoute;

    const checkRouteChange = () => {
      const newRoute = this.getCurrentRoute();
      if (newRoute !== lastRoute) {
        this.onRouteChange(lastRoute, newRoute);
        lastRoute = newRoute;
      }
    };

    // For Next.js App Router
    if (typeof window !== 'undefined' && 'navigation' in window) {
      window.addEventListener('popstate', checkRouteChange);
    }

    // Monkey-patch History API
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      checkRouteChange();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      checkRouteChange();
    };

    // Poll for route changes (fallback)
    setInterval(checkRouteChange, 100);
  }

  private onRouteChange(from: string, to: string): void {
    try {
      // Mark end of previous navigation
      if (this.navigationStart !== null) {
        const duration = performance.now() - this.navigationStart;

        this.collector.collect({
          eventType: 'navigation',
          route: to,
          duration,
          metadata: {
            from,
            to,
          },
        });
      }

      // Mark start of new navigation
      this.navigationStart = performance.now();
      this.previousRoute = from;
      this.currentRoute = to;
    } catch (error) {
      console.debug('HydrateBeer: Failed to track navigation', error);
    }
  }

  public setupNextRouter(router: any): void {
    if (!router || !router.events) return;

    try {
      router.events.on('routeChangeStart', (url: string) => {
        this.navigationStart = performance.now();
        this.previousRoute = this.currentRoute;
      });

      router.events.on('routeChangeComplete', (url: string) => {
        if (this.navigationStart === null) return;

        const duration = performance.now() - this.navigationStart;

        this.collector.collect({
          eventType: 'navigation',
          route: url,
          duration,
          metadata: {
            from: this.previousRoute,
            to: url,
          },
        });

        this.currentRoute = url;
        this.navigationStart = null;
      });

      router.events.on('routeChangeError', () => {
        this.navigationStart = null;
      });
    } catch (error) {
      console.debug('HydrateBeer: Failed to setup Next.js router tracking', error);
    }
  }
}
