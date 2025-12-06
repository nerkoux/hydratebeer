# Quick Start: Publishing hydrate-beer to NPM

## Before Publishing

1. **Choose a unique package name**
   
   Check if the name is available:
   ```bash
   npm search hydrate-beer
   ```
   
   If taken, update `packages/hydrate-beer/package.json`:
   ```json
   {
     "name": "@your-username/hydrate-beer",
     ...
   }
   ```

2. **Update package metadata** in `packages/hydrate-beer/package.json`:
   ```json
   {
     "name": "hydrate-beer",
     "version": "1.0.0",
     "description": "Zero-config performance monitoring for React and Next.js",
     "author": "Your Name <your.email@example.com>",
     "repository": {
       "type": "git",
       "url": "https://github.com/yourusername/hydrate-beer"
     },
     "bugs": {
       "url": "https://github.com/yourusername/hydrate-beer/issues"
     },
     "homepage": "https://github.com/yourusername/hydrate-beer#readme"
   }
   ```

## Publishing Steps

### 1. Build the package
```bash
cd packages/hydrate-beer
npm run build
```

Verify the `dist/` folder contains:
- `index.js` (CommonJS)
- `index.mjs` (ES Module)
- `index.d.ts` (TypeScript types)

### 2. Test locally (optional)
```bash
# In packages/hydrate-beer
npm link

# In your test project
npm link hydrate-beer
```

### 3. Login to NPM
```bash
npm login
# Enter your username, password, and email
```

If you don't have an account, create one at https://www.npmjs.com/signup

### 4. Publish
```bash
# Dry run to see what will be published
npm publish --dry-run

# Actually publish
npm publish

# For scoped packages (@your-username/hydrate-beer)
npm publish --access public
```

### 5. Verify publication
```bash
npm view hydrate-beer

# Or visit
# https://www.npmjs.com/package/hydrate-beer
```

## Using the Published Package

### Install in any project
```bash
npm install hydrate-beer
```

### Basic usage
```typescript
import { initHydrateBeer, withHydrateBeer } from 'hydrate-beer';

// Initialize
initHydrateBeer({
  projectKey: 'your-project-key',
  sampleRate: 1.0,
});

// Profile a component
function MyComponent() {
  return <div>Hello</div>;
}

export default withHydrateBeer(MyComponent);
```

## Updating the Package

When you make changes:

1. **Update version** in `package.json`:
   ```bash
   npm version patch  # 1.0.0 → 1.0.1
   npm version minor  # 1.0.0 → 1.1.0
   npm version major  # 1.0.0 → 2.0.0
   ```

2. **Rebuild and publish**:
   ```bash
   npm run build
   npm publish
   ```

## Alternative: Use Locally Without Publishing

If you want to use it in other projects without publishing to NPM:

### Option 1: npm link (for development)
```bash
# In packages/hydrate-beer
npm link

# In your project
npm link hydrate-beer
```

### Option 2: File path in package.json
```json
{
  "dependencies": {
    "hydrate-beer": "file:../path/to/HydrateJS/packages/hydrate-beer"
  }
}
```

### Option 3: Install from Git
```bash
npm install git+https://github.com/yourusername/hydrate-beer.git
```

Or in package.json:
```json
{
  "dependencies": {
    "hydrate-beer": "github:yourusername/hydrate-beer"
  }
}
```

## Next Steps

1. ✅ Publish package to NPM
2. ✅ Set up Tinybird backend (see `tinybird/README.md`)
3. ✅ Install in your React/Next.js app
4. ✅ Configure environment variables
5. ✅ Start tracking performance!

Full usage documentation: See `USAGE_GUIDE.md`
