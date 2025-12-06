# 🍺 hydrate-beer

Zero-config performance monitoring SDK for React and Next.js applications with PostHog analytics integration.

## Installation

```bash
npm install hydrate-beer
```

Or auto-install with CLI:

```bash
npx hydrate-beer-cli init
```

## Quick Start

### Next.js App Router

```typescript
// app/layout.tsx
'use client';

import { HydrateBeerProvider } from "hydrate-beer/react";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <HydrateBeerProvider
          config={{
            posthogApiKey: process.env.NEXT_PUBLIC_HYDRATE_BEER_POSTHOG_API_KEY!,
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
import { HydrateBeerProvider } from "hydrate-beer/react";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <HydrateBeerProvider
      config={{
        posthogApiKey: process.env.NEXT_PUBLIC_HYDRATE_BEER_POSTHOG_API_KEY!,
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
import { HydrateBeerProvider } from "hydrate-beer/react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <HydrateBeerProvider
    config={{
      posthogApiKey: import.meta.env.VITE_HYDRATE_BEER_POSTHOG_API_KEY,
    }}
  >
    <App />
  </HydrateBeerProvider>
);
```

## Configuration

```typescript
interface HydrateBeerConfig {
  // Required
  posthogApiKey: string;
  
  // Optional
  posthogHost?: string;             // Default: 'https://us.posthog.com'
  debug?: boolean;                   // Default: false
  batchSize?: number;                // Default: 10
  flushInterval?: number;            // Default: 5000 (ms)
  autoTrackRoutes?: boolean;         // Default: true
  trackComponentPerformance?: boolean; // Default: true
  trackErrors?: boolean;             // Default: true
  trackSessions?: boolean;           // Default: true
}
```

### Environment Variables

Create a `.env.local` file:

```bash
# For Next.js
NEXT_PUBLIC_HYDRATE_BEER_POSTHOG_API_KEY=phc_your_api_key_here

# For Vite
VITE_HYDRATE_BEER_POSTHOG_API_KEY=phc_your_api_key_here

# For Create React App
REACT_APP_HYDRATE_BEER_POSTHOG_API_KEY=phc_your_api_key_here
```

## Track Custom Events

```typescript
'use client';

import { useHydrateBeer } from "hydrate-beer/react";

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

## What Gets Tracked Automatically

- 📊 **Page views** - Every route navigation
- 🚀 **Navigation** - Route transition timing  
- 🎨 **Component renders** - Duration and performance (configurable)
- 🐛 **Errors** - Unhandled exceptions with stack traces (configurable)
- 📈 **Sessions** - User session tracking (configurable)

## PostHog Events

All events are sent to PostHog with the `hydratebeer_` prefix:

- `hydratebeer_page_view`
- `hydratebeer_navigation`
- `hydratebeer_component_render`
- `hydratebeer_error`
- `hydratebeer_session_start`
- `hydratebeer_custom`

View and analyze them in your PostHog dashboard.

## Privacy-First

HydrateBeer **never** collects:
- ❌ User identity or personal information (PII)
- ❌ Component props or state values
- ❌ Form inputs or user data
- ❌ Cookies or authentication tokens
- ❌ IP addresses (unless PostHog GeoIP is enabled)
- ❌ Passwords or sensitive information

## Data Flow

```
Your App (SDK) → Tinybird Events API → Analytics Pipes → Monitor Dashboard
```

## CLI Commands

Initialize with the CLI:

```bash
npx hydrate-beer-cli init    # Setup PostHog integration
```

## PostHog Setup

1. Sign up for a free PostHog account at [posthog.com](https://posthog.com)
2. Get your Project API Key from PostHog settings
3. Run `npx hydrate-beer-cli init` and enter your API key
4. View your analytics in the PostHog dashboard

## Links

- **CLI Package:** [hydrate-beer-cli](https://www.npmjs.com/package/hydrate-beer-cli)
- **Documentation:** [hydrate.beer](https://hydrate.beer)
- **GitHub:** [nerkoux/hydratebeer](https://github.com/nerkoux/hydratebeer)
- **PostHog:** [posthog.com](https://posthog.com)

## Features

✅ Zero-config setup  
✅ PostHog integration  
✅ Framework agnostic (Next.js, React, Vite, CRA)  
✅ Lightweight (<5KB gzipped)  
✅ Privacy-first  
✅ TypeScript support  
✅ Production-ready

## License

MIT
