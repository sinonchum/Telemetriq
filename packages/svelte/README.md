# @telemetriq/svelte

Svelte stores for [Telemetriq](https://github.com/sinonchum/Telemetriq).

## Install

```bash
npm install @telemetriq/core @telemetriq/svelte
```

## Usage

```svelte
<script lang="ts">
  import { createTelemetriqContext, createChannelValueStore } from '@telemetriq/svelte';

  const ctx = createTelemetriqContext(dataset);
  const speed = createChannelValueStore(ctx.engine, 'speed');
  const { playbackState } = ctx;
</script>

<div>
  <p>Speed: {$speed}</p>
  <button on:click={() => ctx.engine.play()}>Play</button>
  <button on:click={() => ctx.engine.pause()}>Pause</button>
  <p>Time: {$playbackState.currentTime}</p>
</div>
```

## Stores

- `createTelemetriqContext(dataset, options?)` — Create engine + reactive stores
- `createChannelValueStore(engine, key)` — Reactive channel value
- `ctx.playbackState` — Svelte store for playback state
- `ctx.currentTime` — Svelte store for current time
