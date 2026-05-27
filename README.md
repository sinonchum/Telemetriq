# Telemetriq

> Open-source TypeScript / React visualization framework for high-frequency spatial time-series data.

[![CI](https://github.com/sinonchum/Telemetriq/actions/workflows/ci.yml/badge.svg)](https://github.com/sinonchum/Telemetriq/actions)

## Features

- **Unified Data Protocol** — Standard schema for time-series data across any domain
- **Playback Engine** — Shared clock for all components with play, pause, seek, and speed control
- **High-Performance Visualization** — Smooth charts and trajectories with 100k+ data points
- **Framework-Agnostic Core** — Core engine separated from React UI layer
- **Rich Components** — MetricChart, PathRenderer, PlaybackControls, and gauge components

## Quick Start

```bash
npm install @telemetriq/core @telemetriq/react
```

```tsx
import {
  TelemetriqProvider,
  MetricChart,
  PathRenderer,
  PlaybackControls
} from "@telemetriq/react";

function App() {
  return (
    <TelemetriqProvider dataset={dataset}>
      <PathRenderer height={400} />
      <MetricChart channels={[{ key: "speed" }]} />
      <PlaybackControls />
    </TelemetriqProvider>
  );
}
```

## Packages

| Package | Description |
|---------|-------------|
| `@telemetriq/core` | Core engine, data validation, playback controller |
| `@telemetriq/react` | React provider, hooks, and visualization components |

## Documentation

- [Product Requirements](./PRD.md)
- [Development Outline](./Development-Outline.md)
- [Implementation Plan](./docs/plans/implementation-plan.md)

## Development

```bash
# Install dependencies
pnpm install

# Type check
pnpm typecheck

# Run tests
pnpm test

# Build all packages
pnpm build
```

## License

MIT
