# @telemetriq/core

Core engine for [Telemetriq](https://github.com/sinonchum/Telemetriq) — high-frequency spatial time-series visualization.

## Install

```bash
npm install @telemetriq/core
```

## Usage

```ts
import { createTelemetriqEngine, validateDataset } from '@telemetriq/core';

const engine = createTelemetriqEngine(dataset);
engine.play();
engine.seek(5000);
const speed = engine.getValueAt('speed', 5000);
```

## API

- `validateDataset(data)` — Validate a dataset
- `createTelemetriqEngine(dataset, options?)` — Create a playback engine
- `normalizeDataset(dataset)` — Convert to typed arrays
- `TimeIndex` — Binary search for timestamps
- `getValueAt(normalized, dataset, channel, time)` — Interpolation query
- `PlaybackController` — Low-level playback control

## License
MIT
