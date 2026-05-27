# @telemetriq/cli

Command-line tool for converting CSV data to Telemetriq JSON format.

## Install

```bash
npm install -g @telemetriq/cli
```

## Usage

```bash
telemetriq convert <input.csv> <mapping.json> <output.json>
```

### mapping.json

```json
{
  "time": { "column": "timestamp_ms", "unit": "ms" },
  "position": { "x": "pos_x", "y": "pos_y" },
  "channels": {
    "speed": { "column": "speed_kph", "unit": "km/h" },
    "throttle": { "column": "throttle_pct", "unit": "%" }
  }
}
```
