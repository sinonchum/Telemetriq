# Telemetriq

High-performance telemetry visualization for the browser.

[![CI](https://github.com/sinonchum/Telemetriq/actions/workflows/ci.yml/badge.svg)](https://github.com/sinonchum/Telemetriq/actions)
[![npm version](https://img.shields.io/npm/v/@telemetriq/core)](https://www.npmjs.com/package/@telemetriq/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Overview

Telemetriq is an open-source TypeScript framework for building interactive telemetry dashboards. It is designed for high-frequency, spatially-aware time-series data -- the kind produced by racing cars, unmanned aerial vehicles, industrial robots, and IoT sensor networks.

The core problem Telemetriq solves: **synchronized playback of multi-channel telemetry data across heterogeneous visualization components.** A speedometer, a track map, and a lap-time chart must all reflect the same moment in time, respond to the same seek input, and degrade gracefully at scale.

### Design Principles

- **Framework-agnostic core.** The engine (`@telemetriq/core`) has zero frontend dependencies. It handles data validation, time indexing, interpolation, and playback control as a pure TypeScript library. Framework bindings are thin wrappers.
- **Single clock, many renderers.** One `TelemetriqEngine` instance drives all connected components. Play, pause, seek, and speed changes propagate synchronously through a subscription model.
- **Performance at scale.** The pipeline is optimized for datasets with 100k+ samples. LTTB decimation preserves visual fidelity while reducing render load. Canvas 2D, WebGL, and SVG renderers are available for different performance profiles.
- **Typed end-to-end.** The dataset schema, component props, and engine API are fully typed. TypeScript strict mode is enforced across all packages.

---

## Packages

| Package | Version | Description | Size |
|---------|---------|-------------|------|
| `@telemetriq/core` | [![npm](https://img.shields.io/npm/v/@telemetriq/core)](https://www.npmjs.com/package/@telemetriq/core) | Engine, validation, interpolation, playback, transforms | ~18 KB |
| `@telemetriq/react` | [![npm](https://img.shields.io/npm/v/@telemetriq/react)](https://www.npmjs.com/package/@telemetriq/react) | React hooks, components, and dashboard presets | ~40 KB |
| `@telemetriq/vue` | [![npm](https://img.shields.io/npm/v/@telemetriq/vue)](https://www.npmjs.com/package/@telemetriq/vue) | Vue 3 composables | ~2 KB |
| `@telemetriq/svelte` | [![npm](https://img.shields.io/npm/v/@telemetriq/svelte)](https://www.npmjs.com/package/@telemetriq/svelte) | Svelte stores | ~1 KB |
| `@telemetriq/cli` | [![npm](https://img.shields.io/npm/v/@telemetriq/cli)](https://www.npmjs.com/package/@telemetriq/cli) | CSV-to-dataset converter | ~2 KB |

---

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
  channels: [
    { key: 'speed', type: 'number', unit: 'km/h', interpolation: 'linear' },
  ],
  samples: [
    { t: 0, values: { speed: 0 } },
    { t: 5000, values: { speed: 100 } },
    { t: 10000, values: { speed: 200 } },
  ],
};

function App() {
  return (
    <TelemetriqProvider dataset={dataset}>
      <PathRenderer height={400} position={{ x: 'pos.x', y: 'pos.y' }} />
      <MetricChart channels={[{ key: 'speed', label: 'Speed' }]} />
      <NumericGauge channel="speed" unit="km/h" />
      <PlaybackControls />
    </TelemetriqProvider>
  );
}
```

---

## Architecture

```
@telemetriq/core (zero dependencies)
  |-- validation/      Dataset schema validation
  |-- time/            TimeIndex for O(1) sample lookup
  |-- dataset/         Normalization and channel extraction
  |-- interpolation/   Linear, step, and nearest-neighbor interpolation
  |-- playback/        PlaybackController (RAF-based, rate control, loop)
  |-- multi/           Multi-engine for side-by-side session comparison
  |-- transforms/      LTTB decimation, CSV export, slice, merge
  |-- streaming/       WebSocket / EventSource real-time ingest
  |
  +-- @telemetriq/react   (React bindings + 10 components)
  +-- @telemetriq/vue     (Vue 3 composables)
  +-- @telemetriq/svelte  (Svelte stores)
  +-- @telemetriq/cli     (CSV converter)
```

### Dataset Schema

Telemetriq uses a self-describing JSON format:

```ts
{
  version: '0.1.0',
  time: { unit: 'ms', start: 0, end: 60000 },
  metadata?: { session: string; driver: string; track: string },
  channels: [
    { key: 'speed', type: 'number', unit: 'km/h', interpolation: 'linear' },
    { key: 'throttle', type: 'number', unit: '%', interpolation: 'linear' },
  ],
  samples: [
    { t: 0, position: { x: 0, y: 0 }, values: { speed: 0, throttle: 0 } },
    { t: 20, position: { x: 0.5, y: 0.1 }, values: { speed: 12, throttle: 45 } },
  ],
  events?: [{ t: 15000, type: 'marker', label: 'Lap 1' }],
}
```

Full schema documentation: [Dataset Schema](./docs/concepts/dataset.md)

---

## Components (React)

| Component | Description |
|-----------|-------------|
| `TelemetriqProvider` | Context provider; creates and manages the engine lifecycle |
| `MultiTelemetriqProvider` | Multi-session provider for side-by-side comparison |
| `MetricChart` | uPlot-based line chart with playback cursor sync |
| `ComparisonChart` | Multi-session overlay chart |
| `PathRenderer` | Canvas 2D trajectory with color-mapped segments |
| `MapPathRenderer` | Leaflet-based geographic trajectory with tile layer |
| `WebGLPathRenderer` | WebGL trajectory renderer for 100k+ point datasets |
| `PathRenderer3D` | Three.js 3D trajectory with orbit controls |
| `PlaybackControls` | Play/pause, progress bar, rate selector, loop toggle |
| `NumericGauge` | Numeric value display with unit |
| `LinearGauge` | Horizontal bar gauge |
| `GForceCircle` | SVG lateral/longitudinal G-force visualization |
| `SteeringGauge` | Steering angle indicator |
| `GearIndicator` | Current gear display |
| `RacingDashboard` | Preset layout for motorsport telemetry |
| `DroneDashboard` | Preset layout for UAV telemetry |

---

## Performance

Benchmarked on a 100,000-sample dataset (10 channels, 10 Hz):

| Metric | Value |
|--------|-------|
| Engine initialization | ~55 ms |
| Single-channel query | ~0.01 ms |
| LTTB decimation (100k to 1k points) | ~8 ms |
| Memory footprint (100k samples) | ~12 MB |

The LTTB (Largest Triangle Three Buckets) decimation algorithm reduces rendered point count by 90-99% while preserving the visual shape of the data. This enables smooth rendering of multi-hour sessions in browser-based dashboards.

---

## Development

### Prerequisites

- Node.js >= 18
- pnpm 11+

### Setup

```bash
git clone https://github.com/sinonchum/Telemetriq.git
cd Telemetriq
pnpm install
```

### Commands

```bash
pnpm build          # Build all packages
pnpm test           # Run test suites (64 core + 4 react + 3 cli)
pnpm lint           # ESLint across all packages
pnpm typecheck      # TypeScript strict mode check

# Demos
pnpm --filter racing-demo dev      # Racing telemetry demo
pnpm --filter drone-demo dev       # Drone telemetry demo

# Benchmarking
pnpm --filter @telemetriq/benchmarks start
```

### Project Structure

```
Telemetriq/
  packages/
    core/            Core engine (framework-agnostic)
    react/           React bindings + components
    vue/             Vue 3 composables
    svelte/          Svelte stores
    cli/             CLI data converter
    benchmarks/      Performance benchmarks
  examples/
    racing-demo/     Motorsport telemetry demo
    drone-demo/      UAV telemetry demo
  docs/              VitePress documentation site
```

---

## Use Cases

**Motorsport Engineering**
Real-time and post-session analysis of car telemetry. Overlay multiple laps, compare driver inputs, visualize track position with color-coded speed or throttle.

**Unmanned Systems**
Flight path visualization with altitude, battery, and signal strength. 3D trajectory rendering for mission review.

**Industrial IoT**
Sensor fleet monitoring with synchronized playback of event sequences. Identify correlations across channels and time ranges.

**Simulation and Testing**
Replay simulation runs with deterministic playback. Compare test iterations side-by-side using the multi-engine API.

---

## Roadmap

- [x] v0.1 -- Core engine, React components, dataset schema, demos
- [x] v0.2 -- Multi-session comparison, CLI converter, enhanced gauges
- [x] v0.3 -- Leaflet map integration, LTTB decimation, dashboard presets
- [x] v0.4 -- WebGL renderer, streaming adapter, Vue/Svelte wrappers
- [x] v0.5 -- 3D trajectory (Three.js), Svelte bindings, data utilities
- [ ] v0.6 -- Svelte component library, data cleaning GUI, plugin system

---

## Contributing

Contributions are welcome. Please open an issue to discuss proposed changes before submitting a pull request.

```bash
pnpm test        # Ensure all tests pass
pnpm lint        # Ensure no lint errors
pnpm typecheck   # Ensure no type errors
```

---

## License

[MIT](LICENSE)
