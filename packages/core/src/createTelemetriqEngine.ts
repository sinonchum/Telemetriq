import type { TelemetriqDataset } from './types';
import { validateDataset } from './validation/validateDataset';
import { normalizeDataset } from './dataset/normalizeDataset';
import { PlaybackController, type PlaybackState } from './playback/PlaybackController';
import { getValueAt } from './interpolation/getValueAt';

export type TelemetriqEngineOptions = {
  loop?: boolean;
  initialTime?: number;
  playbackRate?: number;
};

export type TelemetriqEngine = {
  play(): void;
  pause(): void;
  seek(time: number): void;
  setRate(rate: number): void;
  setLoop(loop: boolean): void;
  getCurrentTime(): number;
  getState(): PlaybackState;
  getDuration(): number;
  getValueAt(channelKey: string, time: number): number | string | boolean | null;
  subscribeTime(listener: (time: number) => void): () => void;
  subscribeState(listener: (state: PlaybackState) => void): () => void;
  destroy(): void;
};

export function createTelemetriqEngine(
  dataset: TelemetriqDataset,
  options?: TelemetriqEngineOptions
): TelemetriqEngine {
  const validation = validateDataset(dataset);
  if (!validation.valid) {
    throw new Error(`Invalid dataset: ${validation.errors.map((e) => e.message).join(', ')}`);
  }

  const normalized = normalizeDataset(dataset);
  const controller = new PlaybackController({
    startTime: dataset.time.start,
    endTime: dataset.time.end,
    initialTime: options?.initialTime ?? dataset.time.start,
    playbackRate: options?.playbackRate ?? 1,
    loop: options?.loop ?? false,
  });

  return {
    play: () => controller.play(),
    pause: () => controller.pause(),
    seek: (time: number) => controller.seek(time),
    setRate: (rate: number) => controller.setRate(rate),
    setLoop: (loop: boolean) => controller.setLoop(loop),
    getCurrentTime: () => controller.getCurrentTime(),
    getState: () => controller.getState(),
    getDuration: () => dataset.time.end - dataset.time.start,
    getValueAt: (channelKey: string, time: number) =>
      getValueAt(normalized, dataset, channelKey, time),
    subscribeTime: (listener) => controller.subscribeTime(listener),
    subscribeState: (listener) => controller.subscribeState(listener),
    destroy: () => controller.destroy(),
  };
}
