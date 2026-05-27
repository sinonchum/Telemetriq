import type { TelemetriqDataset } from '../types';

export function sliceDataset(dataset: TelemetriqDataset, startTime: number, endTime: number): TelemetriqDataset {
  const samples = dataset.samples.filter(s => s.t >= startTime && s.t <= endTime);
  const events = dataset.events?.filter(e => e.t >= startTime && e.t <= endTime);

  return {
    ...dataset,
    time: { ...dataset.time, start: startTime, end: endTime },
    samples,
    events,
  };
}
