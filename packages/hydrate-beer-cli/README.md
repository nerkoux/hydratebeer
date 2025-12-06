# 🍺 HydrateBeer CLI

Command-line tool for zero-config performance monitoring with password-protected dashboards.

## Installation

```bash
npx hydrate-beer init
```

No need to install globally - use with `npx`.

## Commands

### `init`

Initialize HydrateBeer in your project:

```bash
npx hydrate-beer init
```

This will:
- Auto-generate a unique project ID
- Prompt for a secure password for monitoring
- Request your Tinybird API token
- Detect your project type (React/Next.js)
- Create `hydrate-beer.config.ts` and `.env.local`
- Auto-install `hydrate-beer-sdk`
- Update `.gitignore`

### `setup-tinybird`

Deploy Tinybird datasources and pipes to your account:

```bash
npx hydrate-beer setup-tinybird
```

This creates:
- `events` datasource (stores all metrics)
- `overview` pipe (aggregated statistics)
- `realtime_metrics` pipe (recent events feed)

### `monitor`

Open password-protected monitoring dashboard:

```bash
npx hydrate-beer monitor
```

Features:
- Password authentication
- 5-minute session timeout
- Auto-refresh every 5 seconds
- Runs on `http://localhost:3500`

## Quick Start

### Step 1: Initialize

```bash
cd my-next-app
npx hydrate-beer init
```

You'll be prompted for:
1. **Password** - For dashboard access (min 6 characters)
2. **Tinybird Token** - Get from [tinybird.co/tokens](https://ui.tinybird.co/tokens)
3. **Config Format** - TypeScript, JavaScript, or ENV

### Step 2: Deploy Tinybird Backend

```bash
npx hydrate-beer setup-tinybird
```

One-time setup that creates your analytics infrastructure.

### Step 3: Add Provider to Your App

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
  flushInterval: 5000,                 // ms
  batchSize: 50,                       // events
};
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_HYDRATE_BEER_PROJECT_ID=proj_abc123...
NEXT_PUBLIC_HYDRATE_BEER_TINYBIRD_TOKEN=p.ey...
```

## Security Features

- 🔐 **Password-protected monitoring** - Only you can access your dashboard
- ⏱️ **5-minute session timeout** - Auto-logout after inactivity
- 🔒 **Bcrypt password hashing** - Passwords never stored in plain text
- 🔑 **Token-based sessions** - Secure authentication flow

## Data Flow

```
Your App (SDK) → Tinybird Events API → Analytics Pipes → Monitor Dashboard
```

## Getting Tinybird Token

1. Create a FREE account at [tinybird.co](https://tinybird.co)
2. Go to [Tokens page](https://ui.tinybird.co/tokens)
3. Copy your API token
4. Paste when prompted by `init` command

## Troubleshooting

### "Configuration not found"
Run `npx hydrate-beer init` first.

### "Tinybird API error"
- Check your token is valid
- Verify region is correct (`us-east` or `eu-central`)
- Ensure internet connection

### "Password incorrect"
Password is hashed in config. If forgotten, re-run `init`.

## What Gets Tracked

- ⚡ Hydration timing
- 🎨 Component render performance
- 🚀 Route navigation timing
- 📊 Web Vitals (TTI, TTFB, etc.)

## Links

- **Documentation:** [hydrate.beer](https://hydrate.beer)
- **SDK Package:** [hydrate-beer-sdk](https://www.npmjs.com/package/hydrate-beer-sdk)
- **GitHub:** [nerkoux/hydratebeer](https://github.com/nerkoux/hydratebeer)

## License

MIT
