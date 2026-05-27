import { createTelemetriqEngine, type TelemetriqEngine, type TelemetriqEngineOptions } from '../createTelemetriqEngine';
import type { TelemetriqDataset } from '../types';
import { PlaybackController, type PlaybackState } from '../playback/PlaybackController';

export type MultiEngineSession = {
  id: string;
  label: string;
  engine: TelemetriqEngine;
};

export type MultiEngine = {
  sessions: MultiEngineSession[];
  play(): void;
  pause(): void;
  seek(time: number): void;
  setRate(rate: number): void;
  getCurrentTime(): number;
  getState(): PlaybackState;
  subscribeTime(listener: (time: number) => void): () => void;
  subscribeState(listener: (state: PlaybackState) => void): () => void;
  destroy(): void;
};

export function createMultiEngine(
  datasets: Array<{ id: string; label: string; dataset: TelemetriqDataset }>,
  options?: TelemetriqEngineOptions
): MultiEngine {
  const start = Math.min(...datasets.map(d => d.dataset.time.start));
  const end = Math.max(...datasets.map(d => d.dataset.time.end));

  const controller = new PlaybackController({
    startTime: start,
    endTime: end,
    initialTime: options?.initialTime ?? start,
    playbackRate: options?.playbackRate ?? 1,
    loop: options?.loop ?? false,
  });

  const sessions: MultiEngineSession[] = datasets.map(({ id, label, dataset }) => ({
    id, label,
    engine: createTelemetriqEngine(dataset, options),
  }));

  const unsubTime = controller.subscribeTime((time) => {
    for (const session of sessions) {
      session.engine.seek(time);
    }
  });

  return {
    sessions,
    play: () => controller.play(),
    pause: () => controller.pause(),
    seek: (t: number) => controller.seek(t),
    setRate: (r: number) => controller.setRate(r),
    getCurrentTime: () => controller.getCurrentTime(),
    getState: () => controller.getState(),
    subscribeTime: (listener) => controller.subscribeTime(listener),
    subscribeState: (listener) => controller.subscribeState(listener),
    destroy: () => {
      unsubTime();
      for (const session of sessions) session.engine.destroy();
      controller.destroy();
    },
  };
}
