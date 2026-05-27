# Introduction

Telemetriq is an open-source TypeScript/React visualization framework for high-frequency spatial time-series data.

## What It Does

- **Unified Data Protocol**: Standard schema for telemetry data from any domain
- **Playback Engine**: Shared clock with play, pause, seek, speed control
- **High-Performance Charts**: uPlot-based MetricChart with cursor sync
- **Trajectory Rendering**: Canvas 2D PathRenderer with color mapping
- **Sensor Gauges**: Numeric, linear bar, and G-force circle gauges

## Quick Start

```bash
npm install @telemetriq/core @telemetriq/react
```

```tsx
import { TelemetriqProvider, MetricChart, PathRenderer, PlaybackControls } from '@telemetriq/react';

function App() {
  return (
    <TelemetriqProvider dataset={dataset}>
      <PathRenderer height={400} />
      <MetricChart channels={[{ key: 'speed' }]} />
      <PlaybackControls />
    </TelemetriqProvider>
  );
}
```

## Architecture

```txt
@telemetriq/core          @telemetriq/react
┌─────────────────┐       ┌──────────────────────┐
│ Types            │       │ TelemetriqProvider    │
│ Validation       │       │ Hooks                │
│ TimeIndex        │       │ MetricChart (uPlot)  │
│ NormalizeDataset │       │ PathRenderer (Canvas) │
│ Interpolation    │       │ PlaybackControls     │
│ PlaybackController│      │ Gauges               │
│ Engine Facade    │       │                      │
└─────────────────┘       └──────────────────────┘
```

## Packages

| Package | Description |
|---------|-------------|
| `@telemetriq/core` | Framework-agnostic core engine |
| `@telemetriq/react` | React components and hooks |
