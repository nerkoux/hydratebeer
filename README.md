# 🍺 HydrateBeer

> Zero-config performance monitoring for React and Next.js applications powered by PostHog

**HydrateBeer** is a lightweight, privacy-first performance monitoring SDK that tracks page views, navigation, component renders, and errors in your React and Next.js applications — all integrated with PostHog's powerful analytics platform.

[![npm version](https://badge.fury.io/js/hydrate-beer.svg)](https://www.npmjs.com/package/hydrate-beer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🚀 **PostHog Integration** - Leverage PostHog's powerful analytics platform
- ⚡ **Zero Configuration** - One command to get started
- 📦 **Simple** - No complex setup or infrastructure management
- 🎯 **Focused** - Built specifically for React performance monitoring
- 🆓 **Generous Free Tier** - Up to 1M events/month free on PostHog
- 🔒 **Privacy-First** - No PII tracking, only performance metrics
- 📊 **Real-time** - Instant visibility in PostHog dashboards

## 📊 What Gets Tracked

- **📄 Page Views** - Every route navigation
- **🚀 Navigation** - Route transition timing
- **🎨 Component Renders** - Track render durations and identify slow components (optional)
- **🐛 Errors** - Automatic error tracking with stack traces (optional)
- **📈 Sessions** - User session analytics (optional)
- **🎯 Custom Events** - Your own business metrics

## 🚀 Quick Start

### 1. Sign Up for PostHog

Create a free account at [posthog.com](https://posthog.com) and get your Project API Key from **Project Settings**.

### 2. Initialize your project

```bash
npx hydrate-beer-cli init
```

This will:
- Prompt you to select your PostHog instance (US, EU, or Self-hosted)
- Configure your PostHog API key
- Install the SDK automatically
- Create configuration files

### 3. Add the Provider

**Next.js App Router:**

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

**Next.js Pages Router:**

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

**React (Vite, CRA, etc.):**

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

### 4. View Your Analytics

Visit your PostHog dashboard and filter by events starting with `hydratebeer_` to see:
- Real-time performance metrics
- Page views and navigation patterns
- Component render timing
- Error tracking
- Session analytics

## 📦 Packages

This monorepo contains:

- **[hydrate-beer](./packages/hydrate-beer)** - Main SDK package
- **[hydrate-beer-cli](./packages/hydrate-beer-cli)** - CLI tool for setup

## 🛠️ Usage

### Track Custom Events

```typescript
'use client';

import { useHydrateBeer } from "hydrate-beer/react";

export default function CheckoutButton() {
  const { trackCustomEvent, trackError } = useHydrateBeer();

  const handleCheckout = async () => {
    try {
      await processCheckout();
      trackCustomEvent("checkout_completed", {
        amount: 99.99,
        currency: "USD",
      });
    } catch (error) {
      trackError(error as Error, {
        context: "checkout",
      });
    }
  };

  return <button onClick={handleCheckout}>Complete Purchase</button>;
}
```

### Configuration Options

```typescript
interface HydrateBeerConfig {
  // Required
  posthogApiKey: string;
  
  // Optional
  posthogHost?: string;              // Default: 'https://us.posthog.com'
  debug?: boolean;                   // Default: false
  batchSize?: number;                // Default: 10
  flushInterval?: number;            // Default: 5000 (ms)
  autoTrackRoutes?: boolean;         // Default: true
  trackComponentPerformance?: boolean; // Default: true
  trackErrors?: boolean;             // Default: true
  trackSessions?: boolean;           // Default: true
}
```

## 🎯 PostHog Events

All events are prefixed with `hydratebeer_`:

- `hydratebeer_page_view` - Page navigation
- `hydratebeer_navigation` - Route transitions
- `hydratebeer_component_render` - Component performance
- `hydratebeer_error` - Error tracking
- `hydratebeer_session_start` - Session starts
- `hydratebeer_custom` - Your custom events

## 🏗️ Architecture

```
Your App (SDK) → PostHog Batch API → PostHog Analytics → Dashboards & Insights
```

1. **SDK** collects performance metrics in your React/Next.js app
2. **PostHog** processes and stores data in real-time
3. **Dashboards** provide instant visibility into performance
4. **Insights** help you optimize your application

## 🔒 Privacy

HydrateBeer is privacy-first and **never** collects:

- ❌ User identity or personal information (PII)
- ❌ Component props or state values
- ❌ Form inputs or user-entered data
- ❌ Cookies or authentication tokens
- ❌ Passwords or sensitive information

Only performance metrics and custom event names are tracked.

## 📚 Documentation

- **Full Documentation:** [hydrate.beer](https://hydrate.beer)
- **Quick Start Guide:** [hydrate.beer/docs/quick-start](https://hydrate.beer/docs/quick-start)
- **API Reference:** [hydrate.beer/docs/api](https://hydrate.beer/docs/api)
- **Configuration:** [hydrate.beer/docs/configuration](https://hydrate.beer/docs/configuration)

## 🔗 Links

- **PostHog:** [posthog.com](https://posthog.com)
- **NPM (SDK):** [npmjs.com/package/hydrate-beer](https://www.npmjs.com/package/hydrate-beer)
- **NPM (CLI):** [npmjs.com/package/hydrate-beer-cli](https://www.npmjs.com/package/hydrate-beer-cli)
- **GitHub:** [github.com/nerkoux/hydratebeer](https://github.com/nerkoux/hydratebeer)
- **Example Demo:** [github.com/nerkoux/Hydrate-Beer-Demo](https://github.com/nerkoux/Hydrate-Beer-Demo)

## ❓ FAQ

### Is this really free?

Yes! PostHog offers a generous free tier with up to 1M events/month. HydrateBeer itself is also completely free and open-source.

### Do I need a backend?

No! PostHog handles all the backend infrastructure for you. Just add the SDK and you're done.

### Who owns the data?

Your data is stored in PostHog's secure infrastructure (or your own if self-hosted). PostHog is GDPR and SOC 2 compliant.

### What frameworks are supported?

- Next.js App Router
- Next.js Pages Router
- Create React App
- Vite
- Any React 18+ application

### Can I use this in production?

Absolutely! HydrateBeer is production-ready and designed to never crash your app. All operations are wrapped in try/catch blocks.

## 🛠️ Development

### Project Structure

```
HydrateJS/
├── packages/
│   ├── hydrate-beer/          # Main SDK
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── react.tsx
│   │   │   ├── collector.ts   # PostHog event batching
│   │   │   └── types.ts       # TypeScript definitions
│   │   └── package.json
│   └── hydrate-beer-cli/      # CLI tool
│       ├── src/
│       │   ├── cli.ts
│       │   ├── commands/
│       │   │   └── init.ts    # PostHog setup
│       │   └── templates/
│       └── package.json
├── docsforhydrate/            # Documentation site
└── hydrate-beer-demo/         # Example app
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/nerkoux/hydratebeer.git
cd HydrateJS

# Install dependencies
npm install

# Build packages
npm run build

# Link for local development
cd packages/hydrate-beer
npm link

cd ../hydrate-beer-cli
npm link

# Use in demo app
cd ../../hydrate-beer-demo
npm link hydrate-beer
```

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

MIT © [HydrateBeer](https://hydrate.beer)

---

**Made with 🍺 by developer, for developers.**

