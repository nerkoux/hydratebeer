# Deployment Guide

## SDK Deployment

### Publishing to npm

1. **Build the package:**
```bash
cd packages/hydrate-beer
npm run build
```

2. **Test locally:**
```bash
npm link
cd /path/to/test-project
npm link hydrate-beer
```

3. **Publish to npm:**
```bash
npm login
npm publish
```

### Versioning

Follow semantic versioning:
- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes

Update version in `package.json` before publishing:
```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

## Tinybird Deployment

### Prerequisites

1. **Install Tinybird CLI:**
```bash
pip install tinybird-cli
```

2. **Authenticate:**
```bash
tb auth
```

### Deploy Data Sources

```bash
cd tinybird
tb push datasources/events.datasource --force
```

### Deploy Pipes

```bash
tb push pipes/hydration_aggregates.pipe --force
tb push pipes/component_aggregates.pipe --force
tb push pipes/navigation_stats.pipe --force
tb push pipes/hydration_timeseries.pipe --force
tb push pipes/page_timings.pipe --force
tb push pipes/overview.pipe --force
```

### Deploy Ingestion Endpoint

```bash
tb push endpoints/ingest.pipe --force
```

### Generate Tokens

```bash
# Create write token for SDK
tb token create --name "sdk_ingest" --scope "events:write"

# Create read token for dashboard (future)
tb token create --name "dashboard_read" --scope "*:read"
```

## Environment Configuration

### For SDK Users

Provide these environment variables:

```env
NEXT_PUBLIC_HYDRATE_BEER_KEY=your-project-key
NEXT_PUBLIC_SAMPLE_RATE=1.0
NEXT_PUBLIC_HYDRATE_BEER_ENDPOINT=https://api.tinybird.co/v0/events?name=events&token=YOUR_WRITE_TOKEN
```

### Tinybird Configuration

Set in Tinybird workspace:
- Data retention: 90 days (configurable)
- Materialized views: Enabled for aggregations
- Query cache: 5 minutes

## Monitoring

### SDK Health

Monitor:
- npm download stats
- GitHub issues
- User feedback

### Tinybird Health

Monitor:
- Ingestion rate
- Query latency
- Storage usage
- Error rates

Access Tinybird UI:
```
https://ui.tinybird.co
```

## CI/CD (Optional)

### GitHub Actions for SDK

```yaml
name: Publish SDK
on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Automated Tinybird Deployment

```yaml
name: Deploy Tinybird
on:
  push:
    branches: [main]
    paths:
      - 'tinybird/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pip install tinybird-cli
      - run: tb auth --token ${{ secrets.TINYBIRD_TOKEN }}
      - run: cd tinybird && tb push --force
```

## Rollback Procedures

### SDK Rollback

```bash
npm unpublish hydrate-beer@1.0.1
# Users on this version will continue to work
# New installs will get previous version
```

### Tinybird Rollback

```bash
# Revert to previous pipe version
tb push pipes/hydration_aggregates.pipe --force
```

## Support

- SDK Issues: GitHub Issues
- Tinybird Support: support@tinybird.co
- Documentation: README.md files
