# Telemetriq — Product Requirements Document (PRD)

> Project codename: Telemetriq  
> Positioning: General-purpose racing / spatial time-series visualization framework  
> Related document: [[Telemetriq — Development Outline]]

## 0. One-Line Positioning

Telemetriq is an open-source TypeScript / React visualization framework for high-frequency spatial time-series data. It provides a standardized data protocol, high-performance playback engine, synchronized charts, trajectory rendering, and sensor gauge components — enabling developers to rapidly build interactive analysis interfaces for vehicles, drones, robots, sports equipment, and game replays.

The core value is not a "racing-specific dashboard," but rather:

- Unified representation of high-frequency time-series data.
- Multiple components sharing a single playback clock.
- Smooth chart, trajectory, and dashboard synchronization at large data volumes.
- Separation of React UI from framework-agnostic core engine.

---

## 1. Product Goals

### 1.1 Core Objectives

Telemetriq aims to solve three main problems:

1. **Data Protocol Unification**
   - Users can convert CSV, JSON, and log files into the Telemetriq standard data structure.
   - Components don't care whether data comes from a race car, drone, robot, or game — they only care about the standard schema.

2. **Timeline Synchronization**
   - Multiple charts, trajectories, and dashboards share a single playback clock.
   - When the user drags the timeline, all components update synchronously.
   - Play, pause, speed multiplier, jump, and range selection are managed by a unified engine.

3. **High-Performance Visualization**
   - Maintains smooth interaction even with large volumes of data points.
   - Chart cursors, trajectory markers, and dashboard state updates should not trigger large-scale React re-renders.

### 1.2 Non-Goals

v0.1 will NOT include:

- Real map basemaps (e.g., Mapbox / Leaflet).
- 3D trajectory rendering.
- Multi-session comparison.
- Server-side data streams and real-time WebSocket ingest.
- Automatic recognition of arbitrary CSV formats.
- Data cleaning GUI.
- Built-in racing-specific fields (e.g., DRS, ERS, brake bias).
- BI dashboard builder.

---

## 2. Target Users & Use Cases

### 2.1 Frontend Developers

Typical scenarios:

- Developing device trajectory playback in an IoT console.
- Displaying sensor logs on internal platforms.
- Not wanting to implement Canvas, chart synchronization, and timeline systems from scratch.

Requirements:

- Quick usage after `npm install @telemetriq/react`.
- Complete TypeScript types.
- Display with just a standard JSON input.
- Support for color, unit, channel, layout, and theme customization.

### 2.2 Data Analysts / Engineers

Typical scenarios:

- Have CSV / log data.
- Want to quickly build an internal visualization dashboard.
- Not familiar with complex frontend interaction development.

Requirements:

- CSV to Telemetriq JSON conversion guide.
- Example mapping configurations.
- Common timestamp unit handling.
- Missing value and unit documentation.

### 2.3 Racing, Aviation, and Robotics Users

Typical scenarios:

- Racing car speed, throttle, brake, and G-force analysis.
- Drone altitude, heading, battery, and motor RPM playback.
- Robot path, IMU, and control signal analysis.

Requirements:

- Multi-metric linkage.
- High-frequency sampled data zoom.
- Trajectory and line chart synchronization.
- Future support for multi-session overlay.

### 2.4 Game Developers

Typical scenarios:

- Replay analysis for racing, flight, and sports games.
- Displaying player paths, speed curves, and input actions.

Requirements:

- Not bound to real-world coordinates.
- Support for arbitrary `x/y/z` local coordinates.
- Support for custom events (e.g., checkpoint, collision, split).

---

## 3. MVP Scope

### 3.1 v0.1 Must Include

- Telemetriq standard data schema.
- Core playback engine.
- React Provider.
- `MetricChart` line chart component.
- `PathRenderer` 2D trajectory component.
- `PlaybackControls` control bar.
- Basic gauges: numeric, linear bar, G-force ball.
- CSV mapping examples.
- Racing demo.
- Drone demo.
- Documentation site.
- npm publication.

### 3.2 v0.2 / v0.3 Candidates

- Multi-session comparison.
- Map basemap.
- WebGL renderer.
- Streaming telemetry.
- Vue / Svelte wrapper.
- More complex gauge presets.
- Data import CLI.

---

## 4. Core Concept Model

Telemetriq's core abstractions:

```txt
Dataset
  ├── metadata
  ├── time
  ├── coordinateSystem
  ├── channels
  ├── samples
  └── events
```

Description:

- **Dataset**: A complete recording, e.g., a flight session, a race lap, a robot mission segment.
- **Channel**: A metric that changes over time, e.g., speed, rpm, altitude, battery.
- **Sample**: A set of data at a specific point in time.
- **Spatial / Position**: Spatial coordinate data, can be `x/y/z` or `lat/lon/alt`.
- **Event**: Discrete events, e.g., checkpoint, brake point, collision, warning.

---

## 5. Telemetriq Data Schema

### 5.1 Design Principles

1. **Domain-Neutral**
   - Core schema does not contain racing-specific fields.
   - All domain variables are expressed through channels.

2. **Explicit Types**
   - Each channel has `key`, `label`, `unit`, `type`.
   - Timestamp units are unified.

3. **High-Performance Reading**
   - Raw object arrays can be preprocessed into typed arrays.
   - Components should not traverse complex object trees every frame.

4. **Missing Value Handling**
   - Allow `null` or normalized `NaN`.
   - Each channel has an explicit interpolation strategy.

### 5.2 Recommended JSON Structure

```json
{
  "version": "0.1.0",
  "metadata": {
    "id": "demo-race-session-001",
    "name": "Demo Race Session",
    "source": "csv-import",
    "createdAt": "2026-05-27T12:00:00Z",
    "domain": "racing",
    "description": "Example telemetry dataset"
  },
  "time": {
    "unit": "ms",
    "start": 0,
    "end": 91234,
    "sampleRateHz": 50
  },
  "coordinateSystem": {
    "type": "cartesian",
    "axes": {
      "x": "meters",
      "y": "meters",
      "z": "meters"
    }
  },
  "channels": [
    {
      "key": "speed",
      "label": "Speed",
      "unit": "km/h",
      "type": "number",
      "interpolation": "linear",
      "range": { "min": 0, "max": 320 }
    },
    {
      "key": "throttle",
      "label": "Throttle",
      "unit": "%",
      "type": "number",
      "interpolation": "linear",
      "range": { "min": 0, "max": 100 }
    }
  ],
  "samples": [
    {
      "t": 0,
      "position": { "x": 0, "y": 0, "z": 0 },
      "values": { "speed": 0, "throttle": 0 }
    },
    {
      "t": 20,
      "position": { "x": 0.5, "y": 0.1, "z": 0 },
      "values": { "speed": 12, "throttle": 20 }
    }
  ],
  "events": [
    {
      "t": 15320,
      "type": "marker",
      "label": "Checkpoint 1",
      "payload": { "color": "#3b82f6" }
    }
  ]
}
```

### 5.3 Latitude/Longitude Data

Drone scenarios can use:

```json
{
  "coordinateSystem": {
    "type": "geographic",
    "axes": {
      "lat": "degrees",
      "lon": "degrees",
      "alt": "meters"
    }
  }
}
```

Corresponding sample:

```json
{
  "t": 1000,
  "position": {
    "lat": 48.8566,
    "lon": 2.3522,
    "alt": 120
  },
  "values": {
    "speed": 8.2,
    "battery": 92,
    "heading": 184
  }
}
```

MVP does not connect to map basemaps, but provides projection strategies:

- `cartesian`: Directly draw `x/y`.
- `geographic`: Default equirectangular projection to local plane coordinates.
- Future support for Mapbox / Deck.gl.

### 5.4 Schema Validation

Provides:

```ts
validateTelemetriqDataset(data): ValidationResult
```

Returns:

```ts
type ValidationResult = {
  valid: boolean;
  errors: Array<{ path: string; message: string; code: string }>;
  warnings: Array<{ path: string; message: string; code: string }>;
};
```

Must validate:

- `version` exists.
- `samples` is non-empty.
- `samples` are sorted by `t` in ascending order.
- `time.start <= time.end`.
- Sample `t` values are within range.
- Keys in `values` exist in `channels`.
- Position fields match coordinate system.
- Channel keys are unique.
- `sampleRateHz` is a positive number.
- Duplicate timestamps.
- Warning when missing value ratio is too high.

---

## 6. Core Component Requirements

### 6.1 `<TelemetriqProvider>`

Responsibilities:

- Receives dataset.
- Initializes Telemetriq core engine.
- Provides React context.
- Manages playback state.
- Provides subscription capabilities.
- Avoids frequent parent component re-renders.

Recommended API:

```tsx
<TelemetriqProvider
  dataset={dataset}
  options={{
    loop: false,
    initialTime: 0,
    playbackRate: 1,
    interpolation: "linear",
    autoFitTimeRange: true
  }}
>
  <MyTelemetryDashboard />
</TelemetriqProvider>
```

Must provide hooks:

```ts
useTelemetriq();
usePlaybackState();
usePlaybackControls();
useChannelValue(channelKey: string);
useCurrentSample();
useTimeRange();
```

Note: High-frequency states like `currentTime` should not trigger React renders every frame. Must provide imperative subscription:

```ts
engine.subscribeTime((time) => {
  // direct canvas/uPlot update
});
```

### 6.2 `<MetricChart>`

Goal: High-performance display of one or more channel time series, with a crosshair that follows the global timeline.

MVP features:

- Multi-line per chart.
- Left/right Y axes.
- Color configuration.
- Unit display.
- Zoom.
- Drag to select time range.
- Crosshair synchronization.
- Click chart to jump to corresponding time.
- Decimation / downsampling.

Recommended API:

```tsx
<MetricChart
  channels={[
    { key: "speed", label: "Speed", color: "#ef4444", axis: "left" },
    { key: "rpm", label: "RPM", color: "#3b82f6", axis: "right" }
  ]}
  height={240}
  syncCursor
  showLegend
  yAxes={{
    left: { label: "Speed", unit: "km/h", min: 0 },
    right: { label: "RPM", unit: "rpm" }
  }}
/>
```

Acceptance criteria:

- 5 `MetricChart` instances.
- 2 lines per chart.
- Total data points ≥ 100,000.
- Smooth playback at 1x / 2x / 4x and progress bar dragging.
- No continuous long tasks > 50ms on the main thread.
- Average FPS ≥ 50.
- Seek response latency < 32ms.
- Playback should not trigger React commits every frame.

### 6.3 `<PathRenderer>`

Goal: Draw spatial trajectories and display a current position marker based on the current time.

MVP features:

- 2D trajectory drawing.
- Auto fit bounds.
- Pan / zoom.
- Current marker.
- Color mapping by channel.
- Line width mapping by channel.
- Hover to show time and current values.
- Click path to jump to nearest time point.

Recommended API:

```tsx
<PathRenderer
  height={400}
  position={{ x: "position.x", y: "position.y" }}
  colorBy={{
    channel: "speed",
    scale: {
      type: "linear",
      domain: [0, 300],
      range: ["#22c55e", "#facc15", "#ef4444"]
    }
  }}
  widthBy={{
    channel: "brake",
    scale: {
      type: "linear",
      domain: [0, 100],
      range: [1, 5]
    }
  }}
  marker={{ visible: true, radius: 6, color: "#111827" }}
/>
```

Canvas strategy:

- Pre-compute path coordinates on initialization.
- Calculate bounds.
- Build time → index lookup structure.
- Draw static path to offscreen canvas.
- Only update marker during playback.
- Redraw path on pan/zoom.

Acceptance criteria:

- 100,000 trajectory points initialize in < 500ms (target adjustable by machine).
- No noticeable stutter during marker playback.
- Click path jump error less than nearest sampling interval.
- Zoom/pan does not cause high-frequency React renders.

### 6.4 Gauges

Recommended to split into small components rather than one large component:

```tsx
<NumericGauge channel="speed" unit="km/h" />
<LinearPedalGauge channel="throttle" label="Throttle" />
<LinearPedalGauge channel="brake" label="Brake" />
<SteeringGauge channel="steeringAngle" />
<GForceCircle xChannel="gLat" yChannel="gLong" />
```

MVP only includes:

- `NumericGauge`
- `LinearGauge`
- `GForceCircle`

Style: flat, clean, high-contrast, CSS variables for theming.

### 6.5 `<PlaybackControls>`

Features:

- Play / pause.
- Current time display.
- Total duration display.
- Progress bar dragging.
- Speed multiplier selection.
- Jump to start.
- Jump to end.
- Loop toggle.
- Optional range playback.

Recommended API:

```tsx
<PlaybackControls
  showRateControl
  rates={[0.25, 0.5, 1, 2, 4, 8]}
  showLoopToggle
  showTimeDisplay
/>
```

Behavior:

- Real-time seek while dragging progress bar.
- Restore playback state after releasing.
- Seek throttled to `requestAnimationFrame`.
- Time format: `mm:ss.SSS` or `hh:mm:ss.SSS`.

---

## 7. Non-Functional Requirements

### 7.1 Performance Metrics

Recommended benchmark environment:

- MacBook Air M1 or equivalent machine.
- Latest Chrome version.
- Production build.
- 100,000 samples.
- 8 numeric channels.
- 1 path renderer.
- 5 metric charts.

Targets:

- Initial demo load < 2s.
- Playback average FPS ≥ 50.
- Seekbar drag response < 32ms.
- React commits no more than 10/second, ideally playback triggers no React commits.
- Memory increment < 200MB.
- Chart cursor updates don't rebuild uPlot.
- Path marker updates don't redraw complete path.

### 7.2 Maintainability

- Core layer test coverage > 85%.
- React components have basic render tests.
- Storybook / Ladle covers main component states.
- All public APIs have TSDoc.
- Schema has JSON Schema file.
- npm package exports ESM; CJS support needs to be explicitly decided.

### 7.3 Extensibility

Must ensure:

- Playback core does not depend on React.
- Renderers only subscribe to engine.
- Dataset schema is not bound to UI.
- Channels are generic key-value, not fixed fields.

---

## 8. User Stories & Acceptance Criteria

### User Story 1: Quick Speed Curve Display

As a frontend developer, I want to display a speed curve with a single component after passing in a standard dataset, so I can quickly build a device playback page.

Acceptance:

- Given a dataset containing a `speed` channel.
- Using `<MetricChart channels={[{ key: "speed" }]} />`.
- Chart displays the speed curve.
- Crosshair moves synchronously during playback.
- Clicking chart allows time jump.

### User Story 2: Trajectory Playback

As a developer, I want to display a motion path and current point after passing in position data, so I can replay vehicle, drone, or robot trajectories.

Acceptance:

- Dataset contains position data.
- PathRenderer auto-fits bounds.
- Current marker moves with playback.
- Marker jumps to corresponding position after seek.

### User Story 3: CSV Import

As a data analyst, I want to convert CSV to standard JSON using a mapping configuration, so I don't have to hand-write complex data structures.

Acceptance:

- Documentation provides CSV input example.
- Documentation provides mapping configuration.
- Documentation provides output dataset example.
- Demo can render using the converted dataset.

### User Story 4: Multi-Component Synchronization

As a user, I want trajectory, speed chart, throttle chart, and dashboard to share the same timeline, so I can analyze the comprehensive state at a given moment.

Acceptance:

- All components synchronize after clicking play.
- All components synchronize after dragging progress bar.
- Trajectory marker synchronizes after clicking chart.
- Chart crosshair synchronizes after clicking path.

---

## 9. MVP Definition of Done

Minimum standard for v0.1 release:

- `@telemetriq/core` is installable, can validate datasets, can play, can seek.
- `@telemetriq/react` can display path, chart, controls, and gauges.
- Racing demo runs.
- Drone demo runs.
- 100k points demo runs with performance notes.
- Documentation includes quickstart, schema, and component API.
- npm package type exports are correct.
- GitHub README has screenshots/GIF.
- CI is all green.
- License is clear.
- No hardcoded racing fields enter the core schema.
