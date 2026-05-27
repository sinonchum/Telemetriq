# CSV to Telemetriq Conversion Guide

This guide shows how to convert CSV telemetry data into the Telemetriq dataset format.

## Input CSV Example

```csv
timestamp_ms,speed_kph,throttle_pct,brake_pct,pos_x,pos_y,rpm
0,0,0,0,0.0,0.0,800
20,5,15,0,0.3,0.0,1200
40,12,25,0,0.8,0.1,1800
60,20,35,0,1.5,0.3,2400
80,28,40,0,2.4,0.5,3000
```

## Mapping Configuration

```ts
const mapping = {
  time: {
    column: 'timestamp_ms',
    unit: 'ms',
  },
  position: {
    x: 'pos_x',
    y: 'pos_y',
  },
  channels: {
    speed: {
      column: 'speed_kph',
      unit: 'km/h',
    },
    throttle: {
      column: 'throttle_pct',
      unit: '%',
    },
    brake: {
      column: 'brake_pct',
      unit: '%',
    },
    rpm: {
      column: 'rpm',
      unit: 'rpm',
    },
  },
};
```

## Conversion Script

```ts
import type { TelemetriqDataset } from '@telemetriq/core';

function csvToTelemetriq(csvText: string, mapping: MappingConfig): TelemetriqDataset {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  const samples = lines.slice(1).map((line) => {
    const values = line.split(',');
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h.trim()] = values[i]?.trim() ?? ''));

    const t = Number(row[mapping.time.column]);
    const position: Record<string, number> = {};
    if (mapping.position) {
      for (const [key, col] of Object.entries(mapping.position)) {
        position[key] = Number(row[col]);
      }
    }
    const channelValues: Record<string, number> = {};
    for (const [key, cfg] of Object.entries(mapping.channels)) {
      channelValues[key] = Number(row[cfg.column]);
    }

    return { t, position: Object.keys(position).length > 0 ? position : undefined, values: channelValues };
  });

  const channels = Object.entries(mapping.channels).map(([key, cfg]) => ({
    key,
    label: key,
    unit: cfg.unit,
    type: 'number' as const,
    interpolation: 'linear' as const,
  }));

  return {
    version: '0.1.0',
    time: { unit: mapping.time.unit as 'ms' | 's', start: samples[0]?.t ?? 0, end: samples[samples.length - 1]?.t ?? 0 },
    channels,
    samples,
  };
}
```

## Output Dataset

```json
{
  "version": "0.1.0",
  "time": { "unit": "ms", "start": 0, "end": 80 },
  "channels": [
    { "key": "speed", "label": "speed", "unit": "km/h", "type": "number", "interpolation": "linear" },
    { "key": "throttle", "label": "throttle", "unit": "%", "type": "number", "interpolation": "linear" }
  ],
  "samples": [
    { "t": 0, "position": { "x": 0.0, "y": 0.0 }, "values": { "speed": 0, "throttle": 0 } },
    { "t": 20, "position": { "x": 0.3, "y": 0.0 }, "values": { "speed": 5, "throttle": 15 } }
  ]
}
```

## Tips

- **Timestamp units**: Telemetriq supports `ms` and `s`. Convert if your CSV uses a different unit.
- **Missing values**: Use `null` in the dataset for missing values. The normalizer converts them to `NaN`.
- **Large files**: For CSV files with 100k+ rows, consider streaming the parse to avoid memory issues.
