# Tinybird Configuration for Hydrate.beer

This directory contains all Tinybird data sources, pipes, and endpoints.

## Structure

```
tinybird/
├── datasources/
│   └── events.datasource       # Main events data source
├── pipes/
│   ├── hydration_aggregates.pipe
│   ├── component_aggregates.pipe
│   ├── navigation_stats.pipe
│   ├── hydration_timeseries.pipe
│   ├── page_timings.pipe
│   └── overview.pipe
└── endpoints/
    └── ingest.pipe              # Ingestion endpoint
```

## Setup

1. Install Tinybird CLI:
```bash
pip install tinybird-cli
```

2. Authenticate:
```bash
tb auth
```

3. Deploy data sources:
```bash
tb push datasources/events.datasource
```

4. Deploy pipes:
```bash
tb push pipes/*.pipe
tb push endpoints/ingest.pipe
```

## Tokens

- **WRITE token** (`ingest_events`): Used by SDK to send events
- **READ token** (`read_token`): Used by dashboard to query metrics

Generate tokens in Tinybird UI or via CLI.

## Data Source Schema

### events
- `timestamp` (DateTime): Event timestamp
- `projectKey` (String): Project identifier
- `sessionId` (String): Anonymous session UUID
- `eventType` (String): 'hydration', 'render', 'navigation', 'page_timing'
- `route` (String): URL path
- `componentName` (String): Component name (for render events)
- `duration` (Float32): Event duration in milliseconds
- `metadata` (String): JSON string with additional data

## Available Pipes

### hydration_aggregates
Aggregated hydration metrics by route (avg, p50, p95, p99)

### component_aggregates
Component render statistics (count, duration, slow renders)

### navigation_stats
Route transition performance metrics

### hydration_timeseries
Hourly time-series data for hydration performance

### page_timings
Page-level metrics (TTI, TTFB, DOM events)

### overview
High-level project metrics dashboard

## Query Examples

### Get hydration metrics
```bash
tb query "SELECT * FROM hydration_aggregates(projectKey='your-key', days=7)"
```

### Get component stats
```bash
tb query "SELECT * FROM component_aggregates(projectKey='your-key', days=7)"
```

## Environment Variables

Set these in your dashboard `.env`:

```
TINYBIRD_API_URL=https://api.tinybird.co/v0
TINYBIRD_READ_TOKEN=your_read_token
TINYBIRD_INGEST_ENDPOINT=https://api.tinybird.co/v0/events?name=events
```
