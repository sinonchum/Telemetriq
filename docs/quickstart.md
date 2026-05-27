# Quick Start

## Install

```bash
npm install @telemetriq/core @telemetriq/react
```

## Create a Dataset

```ts
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
```

## Render

```tsx
import { TelemetriqProvider, MetricChart, PlaybackControls } from '@telemetriq/react';

function App() {
  return (
    <TelemetriqProvider dataset={dataset}>
      <MetricChart channels={[{ key: 'speed' }]} />
      <PlaybackControls />
    </TelemetriqProvider>
  );
}
```

## Run Demos Locally

```bash
git clone https://github.com/sinonchum/Telemetriq.git
cd Telemetriq
pnpm install
pnpm --filter @telemetriq/racing-demo dev
```
