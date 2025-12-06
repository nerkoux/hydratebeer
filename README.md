# 🍺 HydrateBeer

> Zero-config performance monitoring for React and Next.js applications

**HydrateBeer** is a lightweight, privacy-first performance monitoring SDK that tracks hydration timing, component renders, and navigation performance in your React and Next.js applications.

[![npm version](https://badge.fury.io/js/hydrate-beer-sdk.svg)](https://www.npmjs.com/package/hydrate-beer-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🆓 **100% Free** - Uses Tinybird's generous free tier
- 🔐 **Own Your Data** - Your own Tinybird account, full privacy
- ⚡ **Zero Configuration** - Three commands to get started
- 📦 **Simple** - No complex setup or hosting required
- 🎯 **Focused** - Built specifically for React hydration and performance
- 🔒 **Secure** - Password-protected monitoring with session timeout
- 📊 **Real-time** - Live dashboard with 5-second refresh

## 📊 What Gets Tracked

- **⚡ Hydration Performance** - Measure how long your app takes to become interactive
- **🎨 Component Renders** - Track render durations and identify slow components
- **🚀 Route Transitions** - Monitor navigation timing between pages
- **📈 Web Vitals** - Collect TTI, TTFB, and other core metrics

## 🚀 Quick Start

### 1. Initialize your project

```bash
npx hydrate-beer init
```

This will:
- Generate a unique project ID
- Set up a secure password for monitoring
- Configure Tinybird integration (free account required)
- Install the SDK automatically

### 2. Deploy your analytics backend

```bash
npx hydrate-beer setup-tinybird
```

One-time setup that creates datasources and pipes in your Tinybird account.

### 3. Add the Provider

**Next.js App Router:**

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

**Next.js Pages Router:**

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

**React (Vite, CRA, etc.):**

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

### 4. Monitor your app

```bash
npx hydrate-beer monitor
```

Enter your password and view real-time performance metrics in your browser!

## 📦 Packages

This monorepo contains:

- **`packages/hydrate-beer`** - CLI for project management and monitoring
- **`packages/hydrate-beer-sdk`** - React SDK for performance tracking
- **`docsforhydrate`** - Documentation site

## 🔧 CLI Commands

### `init`
Initialize HydrateBeer in your project
```bash
npx hydrate-beer init
```

### `setup-tinybird`
Deploy Tinybird datasources and pipes
```bash
npx hydrate-beer setup-tinybird
```

### `monitor`
Open live monitoring dashboard (password required)
```bash
npx hydrate-beer monitor
```

## 🎨 Track Custom Events

Use the `useHydrateBeer` hook in any component:

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

  return <button onClick={handleClick}>Click Me</button>;
}
```

## 🔐 Security Features

- **Password-protected monitoring** - Only you can view your dashboard
- **5-minute session timeout** - Auto-logout after inactivity
- **Bcrypt password hashing** - Passwords never stored in plain text
- **Token-based sessions** - Secure authentication flow
- **Own your data** - Data stays in your Tinybird account

## 📊 Data Flow

```
Your App (SDK) → Tinybird Events API → Analytics Pipes → Monitor Dashboard
```

1. **SDK** collects performance metrics in your React/Next.js app
2. **Tinybird** stores and processes data in your own account
3. **CLI** provides password-protected monitoring dashboard
4. **You** own all your data with full privacy

## 🏗️ Development

### Prerequisites

- Node.js 16+
- pnpm (recommended)

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Build specific package
cd packages/hydrate-beer-sdk
pnpm build
```

### Project Structure

```
HydrateJS/
├── packages/
│   ├── hydrate-beer/          # CLI package
│   │   ├── src/
│   │   │   ├── cli.ts
│   │   │   └── commands/
│   │   │       ├── init.ts
│   │   │       ├── setup-tinybird.ts
│   │   │       └── monitor.ts
│   │   └── package.json
│   └── hydrate-beer-sdk/      # SDK package
│       ├── src/
│       │   ├── index.ts
│       │   ├── collector.ts
│       │   ├── react.tsx
│       │   └── types.ts
│       └── package.json
├── docsforhydrate/            # Documentation site
└── tinybird/                  # Tinybird schema
    ├── datasources/
    └── pipes/
```

## 📚 Documentation

Full documentation available at [hydrate.beer/docs](https://hydrate.beer/docs)

- [Installation Guide](https://hydrate.beer/docs/installation)
- [Quick Start](https://hydrate.beer/docs/quick-start)
- [Configuration](https://hydrate.beer/docs/configuration)
- [API Reference](https://hydrate.beer/docs/api)
- [What Gets Tracked](https://hydrate.beer/docs/tracking)

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](./LICENSE) files in individual packages.

## 🔗 Links

- **NPM Package (SDK):** [hydrate-beer-sdk](https://www.npmjs.com/package/hydrate-beer-sdk)
- **NPM Package (CLI):** [hydrate-beer](https://www.npmjs.com/package/hydrate-beer)
- **Documentation:** [hydrate.beer](https://hydrate.beer)
- **GitHub:** [nerkoux/hydratebeer](https://github.com/nerkoux/hydratebeer)
- **Tinybird:** [tinybird.co](https://tinybird.co)

## ❓ FAQ

### Is this really free?

Yes! HydrateBeer uses Tinybird's free tier which includes:
- 1,000 requests/day
- 10GB storage
- 90-day data retention

Perfect for most small-to-medium apps.

### Do I need to host anything?

No! Just create a free Tinybird account. The CLI sets everything up automatically.

### What about privacy?

You own 100% of your data. It lives in YOUR Tinybird account. We never see or store anything.

### Can I use this in production?

Absolutely! HydrateBeer is production-ready with:
- Silent error handling (never crashes your app)
- Configurable sampling rates
- Efficient batching and compression
- Lightweight bundle size (<5KB gzipped)

### How do I get support?

- Check the [documentation](https://hydrate.beer/docs)
- Open an issue on [GitHub](https://github.com/nerkoux/hydratebeer/issues)
- Join our community (coming soon!)

---

Built with 🍺 by the HydrateBeer team

  return children;
}
```

#### Next.js Pages Router

```typescript
// pages/_app.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { initHydrateBeer, trackNextRouter } from 'hydrate-beer';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    initHydrateBeer({
      projectKey: process.env.NEXT_PUBLIC_HYDRATE_BEER_KEY!,
    });
    trackNextRouter(router);
  }, []);

  return <Component {...pageProps} />;
}
```

### 3. Profile Components (Optional)

```typescript
import { withHydrateBeer } from 'hydrate-beer';

function MyComponent() {
  return <div>Hello World</div>;
}

export default withHydrateBeer(MyComponent, 'MyComponent');
```

## What Gets Tracked

- **Hydration Performance**: Start time, end time, duration
- **Component Renders**: Duration, phase (mount/update), slow renders
- **Route Transitions**: Navigation timing between pages
- **Page Metrics**: TTI, TTFB, DOM events, long tasks

## Configuration Options

```typescript
interface HydrateBeerConfig {
  projectKey: string;           // Required: Your project key
  sampleRate?: number;          // Default: 1.0 (100% of sessions)
  endpoint?: string;            // Default: Tinybird endpoint
  flushInterval?: number;       // Default: 5000ms
  batchSize?: number;           // Default: 50 events
  slowRenderThreshold?: number; // Default: 16ms
}
```

## Development

### Build SDK

```bash
cd packages/hydrate-beer
npm install
npm run build
```

### Deploy Tinybird

```bash
cd tinybird
tb auth
tb push datasources/events.datasource --force
tb push pipes/*.pipe --force
tb push endpoints/ingest.pipe --force
```

## Documentation

- [SDK Documentation](./packages/hydrate-beer/README.md)
- [Tinybird Setup](./tinybird/README.md)
- [Examples](./packages/hydrate-beer/examples/README.md)
- [Deployment Guide](./DEPLOYMENT.md)

## Privacy & Performance

- **Zero PII**: No user data, props, or state collected
- **Lightweight**: < 5KB gzipped
- **Non-blocking**: Never crashes your app
- **Silent failures**: Gracefully handles network issues

## License

MIT
