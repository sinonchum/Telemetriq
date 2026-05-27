# @telemetriq/react

React components for [Telemetriq](https://github.com/sinonchum/Telemetriq) — high-frequency spatial time-series visualization.

## Install

```bash
npm install @telemetriq/core @telemetriq/react
```

## Quick Start

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

## Components

- `TelemetriqProvider` — Context provider
- `MetricChart` — uPlot line chart
- `PathRenderer` — Canvas 2D trajectory
- `PlaybackControls` — Play/pause/seek UI
- `NumericGauge` / `LinearGauge` / `GForceCircle` — Gauge widgets

## Hooks

- `useTelemetriq()` — Get engine instance
- `usePlaybackControls()` — Play/pause/seek/setRate
- `usePlaybackState()` — Subscribe to playback state
- `useChannelValue(key)` — Subscribe to channel value

## License
MIT
