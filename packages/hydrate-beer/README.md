# 🍺 hydrate-beer-sdk

Zero-config performance monitoring SDK for React and Next.js applications with privacy-first analytics.

## Installation

```bash
npm install hydrate-beer-sdk
```

Or auto-install with CLI:

```bash
npx hydrate-beer init
```

## Quick Start

### Next.js App Router

```typescript
// app/layout.tsx
import { HydrateBeerProvider } from "hydrate-beer-sdk/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <HydrateBeerProvider
          config={{
            projectId: process.env.NEXT_PUBLIC_HYDRATE_BEER_PROJECT_ID!,
          }}
        >
          {children}
        </HydrateBeerProvider>
      </body>
    </html>
  );
}
```

### Next.js Pages Router

```typescript
// pages/_app.tsx
import { HydrateBeerProvider } from "hydrate-beer-sdk/react";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <HydrateBeerProvider
      config={{
        projectId: process.env.NEXT_PUBLIC_HYDRATE_BEER_PROJECT_ID!,
      }}
    >
      <Component {...pageProps} />
    </HydrateBeerProvider>
  );
}
```
### React (Vite, CRA, etc.)

```typescript
// src/main.tsx
import { HydrateBeerProvider } from "hydrate-beer-sdk/react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <HydrateBeerProvider
    config={{
      projectId: import.meta.env.VITE_HYDRATE_BEER_PROJECT_ID,
    }}
  >
    <App />
  </HydrateBeerProvider>
);
```

## Track Custom Events

```typescript
'use client';

import { useHydrateBeer } from "hydrate-beer-sdk/react";

export default function MyComponent() {
  const { trackCustomEvent, trackError } = useHydrateBeer();

  const handleClick = () => {
    trackCustomEvent("button_clicked", {
      buttonName: "submit",
      timestamp: Date.now(),
    });
  };

  const handleError = (error: Error) => {
    trackError(error, {
      component: "MyComponent",
      action: "submit",
    });
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

## Component Profiling (Optional)

```typescript
import { withHydrateBeer } from 'hydrate-beer-sdk';

function MyComponent() {
  return <div>Hello World</div>;
}

export default withHydrateBeer(MyComponent, 'MyComponent');
```

## Configuration Options

```typescript
interface HydrateBeerConfig {
  projectId: string;                // Required: Your project ID
  sampleRate?: number;              // Default: 1.0 (100%)
  flushInterval?: number;           // Default: 5000ms
  batchSize?: number;               // Default: 50 events
  slowRenderThreshold?: number;     // Default: 16ms
}
```

## What Gets Tracked Automatically

- ⚡ **Hydration timing** - Start, end, and duration
- 🎨 **Component renders** - Duration, phase, slow renders
- 🚀 **Route transitions** - Navigation timing
- 📊 **Page metrics** - TTI, TTFB, DOM events

## Privacy-First

HydrateBeer **never** collects:
- ❌ User identity or personal information
- ❌ Component props or state values
- ❌ Form inputs or user data
- ❌ Cookies or authentication tokens

## Data Flow

```
Your App (SDK) → Tinybird Events API → Analytics Pipes → Monitor Dashboard
```

## CLI Commands

Initialize and monitor with the CLI:

```bash
npx hydrate-beer init              # Setup project
npx hydrate-beer setup-tinybird    # Deploy backend
npx hydrate-beer monitor           # View dashboard
```

## Links

- **CLI Package:** [hydrate-beer](https://www.npmjs.com/package/hydrate-beer)
- **Documentation:** [hydrate.beer](https://hydrate.beer)
- **GitHub:** [nerkoux/hydratebeer](https://github.com/nerkoux/hydratebeer)

## License

MIT

## Privacy

- No PII collected
- No props/state captured
- Only performance metrics: durations, names, timestamps

## License

MIT
