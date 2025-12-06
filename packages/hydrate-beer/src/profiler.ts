import * as React from 'react';
import type { MetricCollector } from './collector';

export class ComponentTracker {
  private collector: MetricCollector;
  private renderCounts = new Map<string, number>();
  private slowRenderThreshold: number;

  constructor(collector: MetricCollector) {
    this.collector = collector;
    this.slowRenderThreshold = collector.getConfig().slowRenderThreshold;
  }

  public createProfiler(componentName: string) {
    const tracker = this;

    const onRender = (
      id: string,
      phase: 'mount' | 'update' | 'nested-update',
      actualDuration: number,
      baseDuration: number,
      startTime: number,
      commitTime: number
    ) => {
      try {
        const count = tracker.renderCounts.get(componentName) || 0;
        tracker.renderCounts.set(componentName, count + 1);

        const isSlow = actualDuration > tracker.slowRenderThreshold;

        // Only report slow renders or mount phases to reduce noise
        if (isSlow || phase === 'mount') {
          tracker.collector.collect({
            eventType: 'render',
            route: tracker.getCurrentRoute(),
            componentName,
            duration: actualDuration,
            metadata: {
              phase,
              baseDuration,
              renderCount: count + 1,
              isSlow,
              commitTime: commitTime - startTime,
            },
          });
        }
      } catch (error) {
        console.debug('HydrateBeer: Failed to track render', error);
      }
    };

    return onRender;
  }

  public withProfiler<P extends object>(
    Component: React.ComponentType<P>,
    componentName?: string
  ): React.ComponentType<P> {
    const name = componentName || Component.displayName || Component.name || 'Anonymous';
    const onRender = this.createProfiler(name);

    const ProfiledComponent = (props: P) => {
      return React.createElement(
        React.Profiler,
        { id: name, onRender },
        React.createElement(Component, props)
      );
    };

    ProfiledComponent.displayName = `withHydrateBeer(${name})`;

    return ProfiledComponent;
  }

  private getCurrentRoute(): string {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname;
  }

  public getRenderCount(componentName: string): number {
    return this.renderCounts.get(componentName) || 0;
  }
}
