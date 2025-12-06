# 🍺 HydrateBeer CLI

Command-line tool for zero-config performance monitoring with PostHog integration.

## Installation

```bash
npx hydrate-beer-cli init
```

No need to install globally - use with `npx`.

## Commands

### `init`

Initialize HydrateBeer in your project with PostHog:

```bash
npx hydrate-beer-cli init
```

This will:
- Prompt you to select your PostHog instance (US, EU, or Self-hosted)
- Request your PostHog Project API Key
- Detect your project type (React/Next.js/Vite)
- Create `hydrate-beer.config.ts` and `.env.local`
- Auto-install `hydrate-beer` package
- Update `.gitignore`

## Quick Start

### Step 1: Get PostHog API Key

1. Sign up for free at [posthog.com](https://posthog.com)
2. Navigate to **Project Settings**
3. Copy your **Project API Key** (starts with `phc_`)

### Step 2: Initialize

```bash
cd my-next-app
npx hydrate-beer-cli init
```

You'll be prompted for:
1. **PostHog Instance** - US Cloud, EU Cloud, or Self-hosted URL
2. **PostHog API Key** - Your Project API Key from PostHog

### Step 3: Add Provider to Your App

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

### Step 4: Monitor Your App

```bash
npx hydrate-beer monitor
```

Enter your password and view real-time metrics!

## Configuration

After running `init`, you'll have:

### TypeScript Config

```typescript
// hydrate-beer.config.ts
export default {
  projectId: "proj_abc123...",        // Auto-generated
  passwordHash: "$2a$10$...",          // Bcrypt hash
  tinybirdToken: "p.ey...",            // Your token
  tinybirdRegion: "us-east",           // or "eu-central"
  sampleRate: 1.0,                     // 0.0-1.0
  slowRenderThreshold: 16,             // ms
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

**React/Vite:**

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

### Step 4: View Analytics

Visit your PostHog dashboard to see:
- Real-time performance metrics
- Page views and navigation
- Component render timing
- Error tracking
- Session analytics

All events are prefixed with `hydratebeer_` for easy filtering.

## Configuration

The CLI creates `hydrate-beer.config.ts`:

```typescript
import type { HydrateBeerConfig } from 'hydrate-beer';

const config: HydrateBeerConfig = {
  posthogApiKey: process.env.NEXT_PUBLIC_HYDRATE_BEER_POSTHOG_API_KEY!,
  posthogHost: 'https://us.posthog.com',  // or 'https://eu.posthog.com'
  debug: false,
  batchSize: 10,
  flushInterval: 5000,
};

export default config;
```

### Environment Variables

```bash
# .env.local

# For Next.js
NEXT_PUBLIC_HYDRATE_BEER_POSTHOG_API_KEY=phc_your_api_key_here

# For Vite
VITE_HYDRATE_BEER_POSTHOG_API_KEY=phc_your_api_key_here

# For Create React App
REACT_APP_HYDRATE_BEER_POSTHOG_API_KEY=phc_your_api_key_here
```

## PostHog Setup

### Getting Your API Key

1. Sign up at [posthog.com](https://posthog.com) (free tier: 1M events/month)
2. Navigate to **Project Settings**
3. Copy your **Project API Key** (starts with `phc_`)
4. Choose your instance:
   - **US Cloud:** `https://us.posthog.com`
   - **EU Cloud:** `https://eu.posthog.com`
   - **Self-hosted:** Your custom URL

### Viewing Events

1. Go to **Activity** → **Events**
2. Filter by `hydratebeer_*` events
3. Create insights and dashboards
4. Set up alerts for errors

## Data Flow

```
Your App (SDK) → PostHog Batch API → PostHog Analytics → Dashboards
```

## What Gets Tracked

- 📊 **Page views** - Every route navigation
- 🚀 **Navigation** - Route transition timing
- 🎨 **Component renders** - Performance metrics (optional)
- 🐛 **Errors** - Unhandled exceptions (optional)
- 📈 **Sessions** - User session tracking (optional)
- 🎯 **Custom events** - Your business metrics

## Troubleshooting

### "Configuration not found"
Run `npx hydrate-beer-cli init` first.

### "PostHog API error"
- Check your API key is valid
- Verify the PostHog host URL is correct
- Ensure internet connection
- Check PostHog instance is accessible

### Events not appearing
- Enable debug mode: `debug: true` in config
- Check browser console for errors
- Verify API key has correct permissions
- Check PostHog dashboard filters

## Features

✅ **Zero-config setup** - One command to initialize  
✅ **PostHog integration** - Powerful analytics platform  
✅ **Framework support** - Next.js, React, Vite, CRA  
✅ **Auto-detection** - Detects your project type  
✅ **Privacy-first** - No PII tracking  
✅ **TypeScript** - Full type safety

## Links

- **Documentation:** [hydrate.beer](https://hydrate.beer)
- **SDK Package:** [hydrate-beer](https://www.npmjs.com/package/hydrate-beer)
- **GitHub:** [nerkoux/hydratebeer](https://github.com/nerkoux/hydratebeer)
- **Example Demo:** [Hydrate-Beer-Demo](https://github.com/nerkoux/Hydrate-Beer-Demo)
- **PostHog:** [posthog.com](https://posthog.com)

## License

MIT
