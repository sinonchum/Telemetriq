import { inject, provide, ref, onUnmounted, type InjectionKey, type Ref } from 'vue';
import { createTelemetriqEngine, type TelemetriqDataset, type TelemetriqEngine, type TelemetriqEngineOptions, type PlaybackState } from '@telemetriq/core';

export const TelemetriqInjectionKey: InjectionKey<TelemetriqEngine> = Symbol('TelemetriqEngine');

export function provideTelemetriq(dataset: TelemetriqDataset, options?: TelemetriqEngineOptions): TelemetriqEngine {
  const engine = createTelemetriqEngine(dataset, options);
  provide(TelemetriqInjectionKey, engine);
  return engine;
}

export function useTelemetriq(): TelemetriqEngine {
  const engine = inject(TelemetriqInjectionKey);
  if (!engine) throw new Error('useTelemetriq() requires a TelemetriqEngine provided via provideTelemetriq()');
  return engine;
}

export function usePlaybackState(): Ref<PlaybackState> {
  const engine = useTelemetriq();
  const state = ref<PlaybackState>({
    playing: false,
    currentTime: engine.getCurrentTime(),
    playbackRate: 1,
    loop: false,
  }) as Ref<PlaybackState>;
  const unsub = engine.subscribeState((s) => { state.value = s; });
  onUnmounted(unsub);
  return state;
}

export function useChannelValue(channelKey: string): Ref<number | string | boolean | null> {
  const engine = useTelemetriq();
  const value = ref<number | string | boolean | null>(null) as Ref<number | string | boolean | null>;
  const unsub = engine.subscribeTime((time) => {
    value.value = engine.getValueAt(channelKey, time);
  });
  onUnmounted(unsub);
  return value;
}
