# How to Use hydrate-beer NPM Package

## Step 1: Publish to NPM

First, publish the package to npm registry:

```bash
cd packages/hydrate-beer

# Login to npm (if not already logged in)
npm login

# Build the package
npm run build

# Publish (make sure version in package.json is correct)
npm publish
```

If you get an error about the package name being taken, update the `name` field in `package.json` to something unique like `@yourorg/hydrate-beer`.

## Step 2: Install in Your React App

Once published, install it in any React/Next.js project:

```bash
npm install hydrate-beer
# or
yarn add hydrate-beer
# or
pnpm add hydrate-beer
```

## Step 3: Use in Your Application

### For React 18+ (Vite/CRA)

**src/main.tsx** or **src/index.tsx**:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { initHydrateBeer } from 'hydrate-beer';
import App from './App';

// Initialize HydrateBeer
initHydrateBeer({
  projectKey: process.env.VITE_HYDRATE_BEER_KEY!, // or REACT_APP_HYDRATE_BEER_KEY
  sampleRate: 1.0,
  endpoint: process.env.VITE_HYDRATE_BEER_ENDPOINT,
});

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
```

### For Next.js App Router

**app/providers.tsx**:
```typescript
'use client';

import { useEffect } from 'react';
import { initHydrateBeer } from 'hydrate-beer';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initHydrateBeer({
      projectKey: process.env.NEXT_PUBLIC_HYDRATE_BEER_KEY!,
      sampleRate: 1.0,
    });
  }, []);

  return <>{children}</>;
}
```

**app/layout.tsx**:
```typescript
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### For Next.js Pages Router

**pages/_app.tsx**:
```typescript
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { initHydrateBeer, trackNextRouter } from 'hydrate-beer';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    initHydrateBeer({
      projectKey: process.env.NEXT_PUBLIC_HYDRATE_BEER_KEY!,
      sampleRate: 1.0,
    });
    
    trackNextRouter(router);
  }, [router]);

  return <Component {...pageProps} />;
}

export default MyApp;
```

## Step 4: Profile Components (Optional)

Wrap any component to track its render performance:

```typescript
import { withHydrateBeer } from 'hydrate-beer';

function MyComponent() {
  return <div>Hello World</div>;
}

export default withHydrateBeer(MyComponent, 'MyComponent');
```

## Step 5: Set Up Environment Variables

Create `.env.local`:

```env
# For Vite
VITE_HYDRATE_BEER_KEY=your-project-key-here
VITE_HYDRATE_BEER_ENDPOINT=https://api.tinybird.co/v0/events?name=events&token=YOUR_TOKEN

# For Create React App
REACT_APP_HYDRATE_BEER_KEY=your-project-key-here
REACT_APP_HYDRATE_BEER_ENDPOINT=https://api.tinybird.co/v0/events?name=events&token=YOUR_TOKEN

# For Next.js
NEXT_PUBLIC_HYDRATE_BEER_KEY=your-project-key-here
NEXT_PUBLIC_HYDRATE_BEER_ENDPOINT=https://api.tinybird.co/v0/events?name=events&token=YOUR_TOKEN
```

## Step 6: Set Up Tinybird (Backend)

1. **Install Tinybird CLI**:
```bash
pip install tinybird-cli
```

2. **Authenticate**:
```bash
tb auth
```

3. **Deploy Tinybird resources**:
```bash
cd tinybird

# Deploy data source
tb push datasources/events.datasource --force

# Deploy all pipes
tb push pipes/hydration_aggregates.pipe --force
tb push pipes/component_aggregates.pipe --force
tb push pipes/navigation_stats.pipe --force
tb push pipes/hydration_timeseries.pipe --force
tb push pipes/page_timings.pipe --force
tb push pipes/overview.pipe --force

# Deploy ingestion endpoint
tb push endpoints/ingest.pipe --force
```

4. **Create tokens**:
```bash
# Create write token for SDK
tb token create --name "sdk_write" --scope "events:write"

# Create read token for dashboard (future use)
tb token create --name "dashboard_read" --scope "*:read"
```

5. **Get your endpoint URL**:
The ingestion endpoint will be:
```
https://api.tinybird.co/v0/events?name=events&token=YOUR_WRITE_TOKEN
```

## Configuration Options

```typescript
interface HydrateBeerConfig {
  projectKey: string;           // Required: Your unique project identifier
  sampleRate?: number;          // Default: 1.0 (100% of sessions)
  endpoint?: string;            // Your Tinybird ingestion endpoint
  flushInterval?: number;       // Default: 5000ms (how often to send metrics)
  batchSize?: number;           // Default: 50 (send after N events)
  slowRenderThreshold?: number; // Default: 16ms (flag slow renders)
}
```

## Advanced Usage

### Manual Metric Tracking

```typescript
import { trackMetric } from 'hydrate-beer';

// Track API call
const start = performance.now();
await fetch('/api/data');
const duration = performance.now() - start;

trackMetric('page_timing', duration, {
  type: 'api_call',
  endpoint: '/api/data',
});
```

### Hydration Tracking (SSR)

```typescript
import { wrapHydrateRoot } from 'hydrate-beer';
import { hydrateRoot } from 'react-dom/client';

const wrappedHydrateRoot = wrapHydrateRoot(hydrateRoot);
wrappedHydrateRoot(document.getElementById('root')!, <App />);
```

## Production Best Practices

1. **Use sampling** to reduce data volume:
```typescript
initHydrateBeer({
  projectKey: 'prod-key',
  sampleRate: 0.1, // Track only 10% of sessions
});
```

2. **Environment-based initialization**:
```typescript
if (process.env.NODE_ENV === 'production') {
  initHydrateBeer({
    projectKey: process.env.NEXT_PUBLIC_HYDRATE_BEER_KEY!,
    sampleRate: 0.1,
  });
}
```

3. **Conditional profiling**:
```typescript
// Only profile in development
const Component = process.env.NODE_ENV === 'development'
  ? withHydrateBeer(MyComponent, 'MyComponent')
  : MyComponent;
```

## What Gets Tracked

✅ **Hydration Performance**
- Start time, end time, duration
- Route information

✅ **Component Renders**
- Render duration
- Mount vs Update phase
- Slow renders (exceeds threshold)
- Render count

✅ **Route Transitions**
- Navigation start/end
- Duration between pages

✅ **Page Metrics**
- Time to Interactive (TTI)
- Time to First Byte (TTFB)
- DOM Content Loaded
- Long tasks

## Viewing Your Data

Query your metrics using Tinybird SQL or API:

```bash
# Get hydration metrics
tb query "SELECT * FROM hydration_aggregates(projectKey='your-key', days=7)"

# Get component stats
tb query "SELECT * FROM component_aggregates(projectKey='your-key', days=7)"
```

Or via API:
```bash
curl "https://api.tinybird.co/v0/pipes/hydration_aggregates.json?projectKey=your-key&days=7&token=YOUR_READ_TOKEN"
```

## Troubleshooting

**Metrics not showing up?**
- Check browser console for debug logs
- Verify your Tinybird endpoint is correct
- Check that your write token has correct permissions

**Too many events?**
- Reduce `sampleRate`
- Increase `batchSize` to send less frequently
- Only profile critical components

**Performance impact?**
- The SDK is < 5KB gzipped
- Batching minimizes network calls
- Silent failures never crash your app

## Privacy & Security

- ✅ No PII collected
- ✅ No props or state captured
- ✅ Only performance metrics
- ✅ Anonymous session IDs
- ✅ GDPR compliant
