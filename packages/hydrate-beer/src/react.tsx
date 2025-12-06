'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import type { HydrateBeerConfig } from './types';
import { initHydrateBeer, getCollector, destroyHydrateBeer } from './index';

interface HydrateBeerContextValue {
  trackCustomEvent: (eventName: string, metadata?: Record<string, any>) => void;
  trackError: (error: Error, metadata?: Record<string, any>) => void;
}

const HydrateBeerContext = createContext<HydrateBeerContextValue | null>(null);

export function HydrateBeerProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: HydrateBeerConfig;
}) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initHydrateBeer(config);
      initialized.current = true;
    }

    return () => {
      if (initialized.current) {
        destroyHydrateBeer();
        initialized.current = false;
      }
    };
  }, [config]);

  const trackCustomEvent = (eventName: string, metadata?: Record<string, any>) => {
    const collector = getCollector();
    if (collector) {
      collector.collect({
        eventType: 'custom',
        route: typeof window !== 'undefined' ? window.location.pathname : '/',
        duration: 0,
        metadata: { eventName, ...metadata },
      });
    }
  };

  const trackError = (error: Error, metadata?: Record<string, any>) => {
    const collector = getCollector();
    if (collector) {
      collector.collect({
        eventType: 'error',
        route: typeof window !== 'undefined' ? window.location.pathname : '/',
        duration: 0,
        metadata: {
          errorMessage: error.message,
          errorStack: error.stack,
          ...metadata,
        },
      });
    }
  };

  return (
    <HydrateBeerContext.Provider value={{ trackCustomEvent, trackError }}>
      {children}
    </HydrateBeerContext.Provider>
  );
}

export function useHydrateBeer() {
  const context = useContext(HydrateBeerContext);
  if (!context) {
    throw new Error('useHydrateBeer must be used within HydrateBeerProvider');
  }
  return context;
}
