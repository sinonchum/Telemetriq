# Telemetriq

> Open-source TypeScript / React visualization framework for high-frequency spatial time-series data.

## Overview

Telemetriq provides a standardized data protocol, high-performance playback engine, synchronized charts, trajectory rendering, and sensor gauge components — enabling developers to rapidly build interactive analysis interfaces for vehicles, drones, robots, sports equipment, and game replays.

## Core Features

- **Unified Data Protocol** — Standard schema for time-series data across any domain
- **Playback Engine** — Shared clock for all components with play, pause, seek, and speed control
- **High-Performance Visualization** — Smooth charts and trajectories with 100k+ data points
- **Framework-Agnostic Core** — Core engine separated from React UI layer
- **Rich Components** — MetricChart, PathRenderer, PlaybackControls, and gauge components

## Tech Stack

- TypeScript (strict mode)
- React 18+
- uPlot (charts)
- Canvas 2D API (trajectory rendering)
- Zustand / useSyncExternalStore (state management)
- pnpm workspace (monorepo)

## Documentation

- [PRD (Product Requirements Document)](./PRD.md)
- [Development Outline](./Development-Outline.md)

## License

TBD
