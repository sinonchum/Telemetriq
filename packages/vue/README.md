# @telemetriq/vue

Vue 3 composables for [Telemetriq](https://github.com/sinonchum/Telemetriq) — high-frequency spatial time-series visualization.

## Install

```bash
npm install @telemetriq/core @telemetriq/vue
```

## Usage

```vue
<script setup lang="ts">
import { provideTelemetriq, usePlaybackState, useChannelValue } from '@telemetriq/vue';

const engine = provideTelemetriq(dataset);
const playbackState = usePlaybackState();
const speed = useChannelValue('speed');
</script>

<template>
  <div>
    <p>Speed: {{ speed }}</p>
    <button @click="engine.play()">Play</button>
    <button @click="engine.pause()">Pause</button>
  </div>
</template>
```

## Composables

- `provideTelemetriq(dataset, options?)` — Create and provide engine (call in parent)
- `useTelemetriq()` — Get engine instance
- `usePlaybackState()` — Reactive playback state
- `useChannelValue(key)` — Reactive channel value
