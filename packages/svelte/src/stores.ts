import { writable, derived, type Readable } from 'svelte/store';
import { createTelemetriqEngine, type TelemetriqDataset, type TelemetriqEngine, type TelemetriqEngineOptions, type PlaybackState } from '@telemetriq/core';

export type TelemetriqContext = {
  engine: TelemetriqEngine;
  playbackState: Readable<PlaybackState>;
  currentTime: Readable<number>;
};

export function createTelemetriqContext(dataset: TelemetriqDataset, options?: TelemetriqEngineOptions): TelemetriqContext {
  const engine = createTelemetriqEngine(dataset, options);

  const playbackStateStore = writable<PlaybackState>(
    { playing: false, currentTime: 0, playbackRate: 1, loop: false },
    () => {
      const unsub = engine.subscribeState((state) => {
        playbackStateStore.set(state);
      });
      return unsub;
    }
  );

  const currentTimeStore = writable<number>(0, () => {
    const unsub = engine.subscribeTime((time) => {
      currentTimeStore.set(time);
    });
    return unsub;
  });

  return {
    engine,
    playbackState: playbackStateStore,
    currentTime: currentTimeStore,
  };
}

export function createChannelValueStore(engine: TelemetriqEngine, channelKey: string): Readable<number | string | boolean | null> {
  return writable<number | string | boolean | null>(null, (set) => {
    const unsub = engine.subscribeTime((time) => {
      set(engine.getValueAt(channelKey, time));
    });
    return unsub;
  });
}
