# Telemetriq — Development Outline

> Project codename: Telemetriq  
> Related document: [[Telemetriq — PRD]]  
> Tech stack: TypeScript + React + Zustand / useSyncExternalStore + uPlot + Canvas 2D API

## 0. Overall Architecture

Telemetriq recommends a monorepo with core layer and React layer separated:

```txt
telemetriq/
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
  packages/
    core/
      src/
        dataset/
        playback/
        time/
        interpolation/
        validation/
        transforms/
        index.ts
      package.json
    react/
      src/
        provider/
        hooks/
        components/
          MetricChart/
          PathRenderer/
          PlaybackControls/
          gauges/
      package.json
    adapters/
      src/
        csv/
        json/
      package.json
  examples/
    racing-demo/
    drone-demo/
  docs/
```

Priority releases:

- `@telemetriq/core`
- `@telemetriq/react`

CSV adapter can be placed in examples initially, and independently released as `@telemetriq/adapters` once stable.

---

## 1. Tech Stack

### 1.1 Core

- TypeScript strict mode.
- pnpm workspace.
- tsup or Vite library mode.
- Vitest.
- JSON Schema.
- Typed arrays.

### 1.2 React

- React 18+.
- Zustand or `useSyncExternalStore`.
- uPlot.
- Canvas 2D API.
- CSS variables.
- Storybook or Ladle.

### 1.3 Documentation & Publishing

- Docusaurus or VitePress.
- GitHub Pages / Vercel.
- Changesets.
- GitHub Actions CI.
- ESLint + Prettier.

---

## 2. Milestone 0: Project Initialization, Week 0

Goal: Establish a sustainable monorepo foundation.

### Task 0.1 Initialize Repository

```bash
mkdir telemetriq
cd telemetriq
pnpm init
```

Create directories:

```txt
packages/core
packages/react
examples/racing-demo
examples/drone-demo
docs
```

### Task 0.2 Configure Workspace

`pnpm-workspace.yaml`:

```yaml
packages:
  - "packages/*"
  - "examples/*"
  - "docs"
```

### Task 0.3 TypeScript Strict Mode

Root `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true
  }
}
```

### Task 0.4 Set Up CI

GitHub Actions should at least run:

- install
- typecheck
- lint
- test
- build

### Task 0.5 Basic README

README must include:

- Project positioning.
- Installation method.
- Minimal example.
- Roadmap.
- License.

### Acceptance Criteria

- `pnpm install` succeeds.
- `pnpm typecheck` succeeds.
- `pnpm test` succeeds.
- `pnpm build` succeeds.
- GitHub Actions passes.

---

## 3. Milestone 1: Core Engine & Data Standard, Weeks 1-2

Goal: Complete `@telemetriq/core` so data can be validated, indexed, played back, and queried.

### Task 1.1 Define TypeScript Data Types

Create:

```txt
packages/core/src/types.ts
```

Core types:

```ts
export type TimeUnit = "ms" | "s";

export type CoordinateSystem =
  | {
      type: "cartesian";
      axes: { x: string; y: string; z?: string };
    }
  | {
      type: "geographic";
      axes: { lat: string; lon: string; alt?: string };
    };

export type ChannelType = "number" | "boolean" | "string";
export type InterpolationMode = "none" | "previous" | "linear";

export type TelemetriqChannel = {
  key: string;
  label?: string;
  unit?: string;
  type: ChannelType;
  interpolation?: InterpolationMode;
  range?: { min?: number; max?: number };
};

export type TelemetriqSample = {
  t: number;
  position?: Record<string, number>;
  values: Record<string, number | string | boolean | null>;
};

export type TelemetriqEvent = {
  t: number;
  type: string;
  label?: string;
  payload?: Record<string, unknown>;
};

export type TelemetriqDataset = {
  version: string;
  metadata?: {
    id?: string;
    name?: string;
    source?: string;
    createdAt?: string;
    domain?: string;
    description?: string;
  };
  time: {
    unit: TimeUnit;
    start: number;
    end: number;
    sampleRateHz?: number;
  };
  coordinateSystem?: CoordinateSystem;
  channels: TelemetriqChannel[];
  samples: TelemetriqSample[];
  events?: TelemetriqEvent[];
};
```

Acceptance:

- Types can be exported from `@telemetriq/core`.
- Sample dataset passes TypeScript compilation.

### Task 1.2 Implement Schema Validator

Create:

```txt
packages/core/src/validation/validateDataset.ts
packages/core/src/validation/types.ts
```

Features:

- Channel keys are unique.
- Samples are non-empty.
- Timestamps are in ascending order.
- Sample value keys must exist in channels.
- Position and coordinateSystem match.
- Time range is valid.
- Event timestamps are valid.

Test coverage:

- Valid dataset passes.
- Duplicate channel fails.
- Unsorted samples fail.
- Unknown value key fails.
- Invalid position fails.
- Event outside time range fails.

### Task 1.3 Implement TimeIndex

Create:

```txt
packages/core/src/time/TimeIndex.ts
```

API:

```ts
export class TimeIndex {
  constructor(timestamps: Float64Array);
  findNearestIndex(t: number): number;
  findFloorIndex(t: number): number;
  findCeilIndex(t: number): number;
  findRange(start: number, end: number): [number, number];
}
```

Acceptance:

- Binary search is correct.
- Boundary values are correct.
- Empty array throws error.
- Single-element array is correct.
- Large array query performance is stable.

### Task 1.4 Implement DatasetNormalizer

Create:

```txt
packages/core/src/dataset/normalizeDataset.ts
```

Target structure:

```ts
type NormalizedDataset = {
  timestamps: Float64Array;
  channels: Map<string, NormalizedChannel>;
  positions?: {
    x?: Float64Array;
    y?: Float64Array;
    z?: Float64Array;
    lat?: Float64Array;
    lon?: Float64Array;
    alt?: Float64Array;
  };
};
```

Requirements:

- Number channels converted to `Float64Array`.
- Missing values converted to `NaN`.
- Channel order is stable.
- Position is optional.

### Task 1.5 Implement Interpolation Query

Create:

```txt
packages/core/src/interpolation/getValueAt.ts
```

API:

```ts
getValueAt(dataset, channelKey, time): number | string | boolean | null
```

Supports:

- `none`
- `previous`
- `linear`

Acceptance:

- Linear interpolation is accurate.
- Boolean uses previous mode.
- String uses previous mode.
- NaN and null behavior is documented.
- Out-of-bounds time behavior is documented.

### Task 1.6 Implement PlaybackController

Create:

```txt
packages/core/src/playback/PlaybackController.ts
```

API:

```ts
const controller = new PlaybackController({
  startTime: 0,
  endTime: 10000,
  initialTime: 0,
  playbackRate: 1,
  loop: false
});

controller.play();
controller.pause();
controller.seek(5000);
controller.setRate(2);
controller.subscribeTime(callback);
controller.destroy();
```

Implementation notes:

- Based on `requestAnimationFrame`.
- `deltaMs = now - lastFrameTime`.
- `nextTime = currentTime + deltaMs * playbackRate`.
- Clamp delta when tab is hidden and then restored (e.g., max 250ms).
- When loop is false, pause at end.
- Cancel rAF after destroy.

Acceptance:

- Time advances after play.
- Stops after pause.
- Seek is accurate.
- Rate takes effect.
- Loop takes effect.
- rAF stops after destroy.
- Background tab recovery doesn't cause large jumps.

### Task 1.7 Create Core Engine Facade

Create:

```txt
packages/core/src/createTelemetriqEngine.ts
```

API:

```ts
export function createTelemetriqEngine(
  dataset: TelemetriqDataset,
  options?: TelemetriqEngineOptions
): TelemetriqEngine;
```

Public methods:

```ts
engine.play();
engine.pause();
engine.seek(12345);
engine.setRate(2);
engine.getCurrentTime();
engine.getValueAt("speed", 12345);
engine.getSampleAt(12345);
engine.subscribeTime(callback);
engine.subscribePlayback(callback);
engine.destroy();
```

Acceptance:

- User只需一个函数即可创建 engine。
- engine 内部完成 validate + normalize + playback。
- 错误信息清晰。

---

## 4. Milestone 2: React Wrapper & Basic Components, Weeks 3-5

Goal: Complete React Provider, hooks, playback controls, and first batch of visualization components.

### Task 2.1 Implement `<TelemetriqProvider>`

Create:

```txt
packages/react/src/provider/TelemetriqProvider.tsx
packages/react/src/provider/TelemetriqContext.ts
```

API:

```tsx
<TelemetriqProvider dataset={dataset}>{children}</TelemetriqProvider>
```

Key points:

- Engine created with `useMemo`.
- Destroy old engine when dataset changes.
- Context only passes engine reference.
- Don't put `currentTime` in regular React state for per-frame updates.

Acceptance:

- Child components can read engine.
- engine.destroy is called on unmount.
- Playback doesn't cause the entire provider subtree to render every frame.

### Task 2.2 Implement Hooks

Create:

```txt
packages/react/src/hooks/useTelemetriq.ts
packages/react/src/hooks/usePlaybackControls.ts
packages/react/src/hooks/usePlaybackState.ts
packages/react/src/hooks/useChannelValue.ts
```

Requirements:

- `usePlaybackControls` returns stable functions.
- `usePlaybackState` only handles low-frequency states (e.g., playing/rate/loop).
- High-frequency time update components use direct subscription.

Acceptance:

- Hook reports clear error when used outside provider.
- play/pause/seek works.
- Current value query is correct.

### Task 2.3 Implement `<PlaybackControls>`

Create:

```txt
packages/react/src/components/PlaybackControls/PlaybackControls.tsx
packages/react/src/components/PlaybackControls/PlaybackControls.css
```

Features:

- Play/pause.
- Progress range input.
- Current time display.
- Duration display.
- Speed selector.
- Loop toggle.

Acceptance:

- Time advances after clicking play.
- All components sync when dragging progress bar.
- Speed multiplier switching takes effect.
- No noticeable UI stutter.

### Task 2.4 Implement `<MetricChart>`

Create:

```txt
packages/react/src/components/MetricChart/MetricChart.tsx
packages/react/src/components/MetricChart/buildUplotData.ts
packages/react/src/components/MetricChart/useUplotCursorSync.ts
```

Technical notes:

- Create uPlot on mount.
- Rebuild data when dataset/channel changes.
- Only update cursor on playback time change.
- Chart click calls engine.seek.
- Support left/right axis.
- Support legend.

Acceptance:

- 1 chart displays correctly.
- Multi-channel display is normal.
- Crosshair moves with playback.
- Click chart jumps to time.
- 5 charts + 100k points still smooth.

### Task 2.5 Implement `<PathRenderer>`

Create:

```txt
packages/react/src/components/PathRenderer/PathRenderer.tsx
packages/react/src/components/PathRenderer/renderPath.ts
packages/react/src/components/PathRenderer/colorScale.ts
packages/react/src/components/PathRenderer/geometry.ts
```

Technical notes:

- Use `<canvas>`.
- devicePixelRatio adaptation.
- Draw static path on initialization.
- Only update marker during playback.
- Support fit bounds.
- Support colorBy.
- Support click seek.

Acceptance:

- Path displays correctly.
- Marker follows time movement.
- colorBy takes effect.
- Canvas is not blurry on Retina screens.
- 100k points performance is acceptable.

### Task 2.6 Implement Basic Gauges

Create:

```txt
packages/react/src/components/gauges/NumericGauge.tsx
packages/react/src/components/gauges/LinearGauge.tsx
packages/react/src/components/gauges/GForceCircle.tsx
```

MVP:

- NumericGauge.
- LinearGauge.
- GForceCircle.

Acceptance:

- Value updates with time.
- Individual components work standalone.
- Style customizable via CSS variables.

---

## 5. Milestone 3: Data Adapters, Examples & Documentation, Weeks 6-7

Goal: Enable external developers to understand, run, and integrate their own data.

### Task 3.1 Create Racing Demo Dataset

Path:

```txt
examples/racing-demo/src/data/demoRace.ts
```

Fields:

- speed.
- throttle.
- brake.
- rpm.
- steeringAngle.
- gLat.
- gLong.
- position x/y.

Requirements:

- Use synthetic dataset.
- At least 60 seconds.
- Sample rate 50Hz.
- Approximately 3000 samples.

### Task 3.2 Create Drone Demo Dataset

Path:

```txt
examples/drone-demo/src/data/demoDrone.ts
```

Fields:

- speed.
- altitude.
- battery.
- heading.
- verticalSpeed.
- signalStrength.
- position lat/lon/alt.

Requirements:

- Demonstrate geographic coordinates.
- Use the same set of components.
- Prove the framework is not racing-specific.

### Task 3.3 CSV Mapping Guide

Documentation:

```txt
docs/docs/guides/csv-to-telemetriq.md
```

Content:

- Input CSV example.
- Field mapping configuration.
- Timestamp unit handling.
- Channel configuration.
- Position configuration.
- Missing value handling.
- Output JSON example.

Example:

```ts
const mapping = {
  time: {
    column: "timestamp_ms",
    unit: "ms"
  },
  position: {
    x: "pos_x",
    y: "pos_y"
  },
  channels: {
    speed: {
      column: "speed_kph",
      unit: "km/h"
    },
    throttle: {
      column: "throttle_pct",
      unit: "%"
    }
  }
};
```

### Task 3.4 Documentation Site

Recommended structure:

```txt
docs/
  introduction.md
  quickstart.md
  concepts/
    dataset.md
    playback-engine.md
    channels.md
    coordinate-systems.md
  components/
    telemetriq-provider.md
    metric-chart.md
    path-renderer.md
    playback-controls.md
    gauges.md
  guides/
    csv-to-telemetriq.md
    racing-dashboard.md
    drone-flight-replay.md
  api/
    core.md
    react.md
```

Quickstart:

```tsx
import {
  TelemetriqProvider,
  MetricChart,
  PathRenderer,
  PlaybackControls
} from "@telemetriq/react";

export function App() {
  return (
    <TelemetriqProvider dataset={dataset}>
      <PathRenderer height={400} />
      <MetricChart channels={[{ key: "speed" }]} />
      <PlaybackControls />
    </TelemetriqProvider>
  );
}
```

### Task 3.5 Storybook / Ladle

Each component should have at least:

- Default.
- Large dataset.
- Empty state.
- Missing values.
- Custom theme.
- Multiple charts sync.

---

## 6. Milestone 4: Testing, Publishing & Open-Source Preparation, Week 8

Goal: Release a usable, trustworthy, open-source-friendly v0.1.

### Task 4.1 Test Suite

Core tests:

- Validation.
- Normalization.
- Time index.
- Interpolation.
- Playback controller.
- Coordinate projection.

React tests:

- Provider mount/unmount.
- Hooks error handling.
- PlaybackControls interactions.
- Chart component smoke test.
- Path component smoke test.

Performance scripts:

```txt
packages/benchmarks/
  generateDataset.ts
  playbackBenchmark.ts
  chartBenchmark.ts
```

At least output:

- Dataset size.
- Init time.
- Average frame time.
- Max frame time.
- Rough memory usage.

### Task 4.2 Package Exports

`@telemetriq/core`:

```ts
export * from "./types";
export * from "./createTelemetriqEngine";
export * from "./validation";
export * from "./time";
```

`@telemetriq/react`:

```ts
export * from "./provider";
export * from "./hooks";
export * from "./components";
```

### Task 4.3 npm Publishing Preparation

Requirements:

- Package name.
- License.
- README.
- Changelog.
- Examples.
- Keywords.

Recommended keywords:

```json
[
  "telemetry",
  "timeseries",
  "visualization",
  "react",
  "canvas",
  "uplot",
  "racing",
  "drone",
  "iot",
  "playback"
]
```

### Task 4.4 GitHub Launch Content

README above-the-fold includes:

1. Project screenshot / GIF.
2. One-line positioning.
3. Installation command.
4. Quickstart in under 20 lines.
5. Core features.
6. Data schema example.
7. Demo links.
8. Roadmap.
9. License.

---

## 7. 8-Week Roadmap

### Week 0: Project Scaffolding

Deliverables:

- Monorepo.
- TypeScript strict.
- build/test/lint.
- CI.
- README draft.

### Week 1: Schema + Validation

Deliverables:

- TypeScript types.
- JSON Schema.
- Validator.
- Sample datasets.
- Schema docs.

### Week 2: Core Engine

Deliverables:

- normalizeDataset.
- TimeIndex.
- Interpolation.
- PlaybackController.
- createTelemetriqEngine.
- Core tests.

### Week 3: React Provider + Controls

Deliverables:

- TelemetriqProvider.
- Hooks.
- PlaybackControls.
- Basic demo app.

### Week 4: MetricChart

Deliverables:

- uPlot wrapper.
- Multi-channel chart.
- Cursor sync.
- Click-to-seek.
- Left/right axes.
- Chart tests.

### Week 5: PathRenderer + Gauges

Deliverables:

- Canvas path renderer.
- Marker sync.
- colorBy / widthBy.
- NumericGauge.
- LinearGauge.
- GForceCircle.

### Week 6: Examples

Deliverables:

- Racing demo.
- Drone demo.
- Synthetic data generator.
- CSV mapping guide.

### Week 7: Docs + Performance

Deliverables:

- Docs site.
- Storybook / Ladle.
- Benchmark scripts.
- Large dataset demo.
- API docs.

### Week 8: Release

Deliverables:

- npm package.
- GitHub release.
- README polish.
- Changelog.
- Announcement posts.
- Demo GIF/video.

---

## 8. Suggested GitHub Issues Breakdown

### Foundation

1. Initialize pnpm monorepo.
2. Add TypeScript strict config.
3. Add Vitest, ESLint, Prettier.
4. Add GitHub Actions CI.
5. Create package build pipeline.

### Core

6. Define TelemetriqDataset TypeScript types.
7. Add JSON Schema for dataset.
8. Implement dataset validator.
9. Implement TimeIndex.
10. Implement dataset normalization.
11. Implement channel value interpolation.
12. Implement PlaybackController.
13. Implement createTelemetriqEngine facade.
14. Add core test suite.

### React

15. Implement TelemetriqProvider.
16. Implement useTelemetriq.
17. Implement usePlaybackControls.
18. Implement usePlaybackState.
19. Implement PlaybackControls.
20. Implement MetricChart uPlot wrapper.
21. Add MetricChart cursor sync.
22. Add MetricChart click-to-seek.
23. Implement PathRenderer canvas renderer.
24. Add PathRenderer colorBy support.
25. Add PathRenderer marker sync.
26. Implement NumericGauge.
27. Implement LinearGauge.
28. Implement GForceCircle.

### Examples

29. Add synthetic racing dataset generator.
30. Add racing dashboard example.
31. Add synthetic drone dataset generator.
32. Add drone replay example.
33. Add CSV mapping documentation.
34. Add large dataset performance demo.

### Docs / Release

35. Create docs site.
36. Write quickstart.
37. Write schema guide.
38. Write component API docs.
39. Add benchmark scripts.
40. Configure changesets.
41. Prepare npm release.
42. Polish README.
43. Create launch announcement draft.

---

## 9. Demo Layout Suggestions

### Racing Demo

```txt
┌──────────────────────────────────────────────┐
│ Telemetriq Racing Demo                        │
├───────────────────────┬──────────────────────┤
│ PathRenderer           │ Gauges               │
│                       │ Speed                │
│                       │ Throttle / Brake     │
│                       │ G-Force Circle       │
├───────────────────────┴──────────────────────┤
│ MetricChart: Speed + RPM                      │
├──────────────────────────────────────────────┤
│ MetricChart: Throttle + Brake                 │
├──────────────────────────────────────────────┤
│ PlaybackControls                              │
└──────────────────────────────────────────────┘
```

### Drone Demo

```txt
┌──────────────────────────────────────────────┐
│ Telemetriq Drone Flight Replay                │
├───────────────────────┬──────────────────────┤
│ PathRenderer           │ Status               │
│ GPS path               │ Altitude             │
│                       │ Battery              │
│                       │ Signal               │
├───────────────────────┴──────────────────────┤
│ MetricChart: Altitude + Vertical Speed        │
├──────────────────────────────────────────────┤
│ MetricChart: Battery + Signal                 │
├──────────────────────────────────────────────┤
│ PlaybackControls                              │
└──────────────────────────────────────────────┘
```

---

## 10. Risks & Mitigations

### Risk 1: Scope Creep

Symptoms: Starting with 3D, maps, multi-session, real-time streaming, data cleaning GUI.

Mitigation: v0.1 only includes schema, playback engine, 2D path, metric chart, controls, docs, and two demos.

### Risk 2: React High-Frequency State Causes Stutter

Symptoms: `currentTime` setState every frame causes all components to rerender.

Mitigation: Core engine uses external store / event emitter; React context only passes stable engine; Canvas/uPlot uses imperative updates.

### Risk 3: Schema Too Racing-Specific

Symptoms: Built-in fields like `lap`, `gear`, `drs`, `brakeBias` appear.

Mitigation: Core schema only recognizes channels; racing fields go in demos or presets.

### Risk 4: Performance Claims Unverifiable

Symptoms: README says "high performance" but no benchmarks.

Mitigation: Add benchmark example, specify test data size, record 100k points demo before release.

### Risk 5: uPlot and React Lifecycle Conflicts

Symptoms: Chart rebuilds on every props change.

Mitigation: Only rebuild on dataset/channel change; time updates only set cursor; resize uses ResizeObserver.

---

## 11. Minimal Usage Example

```tsx
import {
  TelemetriqProvider,
  PathRenderer,
  MetricChart,
  PlaybackControls,
  NumericGauge,
  LinearGauge,
  GForceCircle
} from "@telemetriq/react";

export function TelemetryDashboard({ dataset }) {
  return (
    <TelemetriqProvider dataset={dataset}>
      <div className="dashboard">
        <PathRenderer
          height={400}
          colorBy={{
            channel: "speed",
            scale: {
              type: "linear",
              domain: [0, 300],
              range: ["#22c55e", "#facc15", "#ef4444"]
            }
          }}
        />

        <MetricChart
          height={240}
          channels={[
            { key: "speed", color: "#ef4444", axis: "left" },
            { key: "rpm", color: "#3b82f6", axis: "right" }
          ]}
        />

        <div className="gauges">
          <NumericGauge channel="speed" unit="km/h" />
          <LinearGauge channel="throttle" label="Throttle" />
          <LinearGauge channel="brake" label="Brake" />
          <GForceCircle xChannel="gLat" yChannel="gLong" />
        </div>

        <PlaybackControls />
      </div>
    </TelemetriqProvider>
  );
}
```
