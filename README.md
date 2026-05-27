# Telemetriq

> Open-source TypeScript / React visualization framework for high-frequency spatial time-series data.

[![CI](https://github.com/sinonchum/Telemetriq/actions/workflows/ci.yml/badge.svg)](https://github.com/sinonchum/Telemetriq/actions)
[![npm version](https://img.shields.io/npm/v/@telemetriq/core)](https://www.npmjs.com/package/@telemetriq/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

<!-- ![Telemetriq Demo](./docs/public/demo.gif) -->

## What is Telemetriq?

Telemetriq is a framework for building interactive telemetry dashboards. It provides:

- **Unified Data Protocol** — One schema for racing, drones, robots, games, IoT
- **Synchronized Playback** — All components share one clock (play, pause, seek, speed)
- **High Performance** — uPlot charts + Canvas trajectories at 100k+ data points
- **Framework-Agnostic Core** — Core engine has zero React dependency
- **Rich Components** — Charts, trajectories, gauges, controls out of the box

## Quick Start

```bash
npm install @telemetriq/core @telemetriq/react
```

```tsx
import {
  TelemetriqProvider,
  MetricChart,
  PathRenderer,
  PlaybackControls,
  NumericGauge,
} from '@telemetriq/react';

const dataset = {
  version: '0.1.0',
  time: { unit: 'ms', start: 0, end: 10000 },
  channels: [{ key: 'speed', type: 'number', unit: 'km/h' }],
  samples: [
    { t: 0, values: { speed: 0 } },
    { t: 5000, values: { speed: 100 } },
    { t: 10000, values: { speed: 200 } },
  ],
};

function App() {
  return (
    <TelemetriqProvider dataset={dataset}>
      <PathRenderer height={400} />
      <MetricChart channels={[{ key: 'speed' }]} />
      <NumericGauge channel="speed" unit="km/h" />
      <PlaybackControls />
    </TelemetriqProvider>
  );
}
```

## Packages

| Package | Description | Size |
|---------|-------------|------|
| `@telemetriq/core` | Core engine, validation, playback | ![](https://img.shields.io/bundlephobia/minzip/@telemetriq/core) |
| `@telemetriq/react` | React hooks and components | ![](https://img.shields.io/bundlephobia/minzip/@telemetriq/react) |

## Data Schema

```ts
{
  version: '0.1.0',
  time: { unit: 'ms', start: 0, end: 60000, sampleRateHz: 50 },
  channels: [
    { key: 'speed', type: 'number', unit: 'km/h', interpolation: 'linear' },
  ],
  samples: [
    { t: 0, position: { x: 0, y: 0 }, values: { speed: 0 } },
    { t: 20, position: { x: 0.5, y: 0.1 }, values: { speed: 12 } },
  ],
  events: [{ t: 15000, type: 'marker', label: 'Checkpoint' }],
}
```

## Components

| Component | Description |
|-----------|-------------|
| `TelemetriqProvider` | Context provider — creates and manages the engine |
| `MetricChart` | uPlot-based line chart with cursor sync |
| `PathRenderer` | Canvas 2D trajectory with color mapping |
| `PlaybackControls` | Play/pause, progress bar, speed selector |
| `NumericGauge` | Numeric value display |
| `LinearGauge` | Linear bar gauge |
| `GForceCircle` | SVG G-force visualization |

## Development

```bash
git clone https://github.com/sinonchum/Telemetriq.git
cd Telemetriq
pnpm install

# Run tests
pnpm test

# Build all packages
pnpm build

# Run racing demo
pnpm --filter @telemetriq/racing-demo dev

# Run Storybook
pnpm --filter @telemetriq/react storybook

# Run benchmarks
pnpm --filter @telemetriq/benchmarks playback
```

## Documentation

- [Introduction](./docs/introduction.md)
- [Quick Start](./docs/quickstart.md)
- [Dataset Schema](./docs/concepts/dataset.md)
- [CSV Import Guide](./docs/guides/csv-to-telemetriq.md)
- [PRD](./PRD.md)
- [Development Outline](./Development-Outline.md)

## Roadmap

- [x] v0.1 — Core engine, React components, demos
- [ ] v0.2 — Multi-session comparison
- [ ] v0.3 — Map basemap, WebGL renderer
- [ ] v0.4 — Streaming telemetry, Vue/Svelte wrappers

## License

MIT
