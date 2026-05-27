# Dataset Schema

A Telemetriq dataset represents a complete recording — a race lap, drone flight, or robot mission.

## Structure

```txt
Dataset
  ├── version
  ├── metadata
  ├── time
  ├── coordinateSystem
  ├── channels
  ├── samples
  └── events
```

## Fields

### version
Required. Schema version string (e.g., `"0.1.0"`).

### metadata
Optional. Object with `id`, `name`, `source`, `createdAt`, `domain`, `description`.

### time
Required. Object with:
- `unit`: `"ms"` or `"s"`
- `start`: First timestamp (number)
- `end`: Last timestamp (number)
- `sampleRateHz`: Optional sample rate

### channels
Required. Array of channel definitions:
- `key`: Unique identifier (used in sample values)
- `label`: Display name
- `unit`: Unit string
- `type`: `"number"`, `"boolean"`, or `"string"`
- `interpolation`: `"none"`, `"previous"`, or `"linear"`
- `range`: Optional `{ min, max }`

### samples
Required. Array of time-indexed data points:
- `t`: Timestamp (must be in ascending order)
- `position`: Optional spatial coordinates
- `values`: Key-value map matching channel keys

### events
Optional. Discrete events with `t`, `type`, `label`, `payload`.

## Validation

Use `validateDataset()` to check a dataset before passing it to the engine:

```ts
import { validateDataset } from '@telemetriq/core';

const result = validateDataset(myData);
if (!result.valid) {
  console.error(result.errors);
}
```

## Coordinate Systems

- `cartesian`: `{ x, y, z }` in arbitrary units (meters, etc.)
- `geographic`: `{ lat, lon, alt }` in degrees/meters
