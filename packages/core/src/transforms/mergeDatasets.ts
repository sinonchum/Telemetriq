import type { TelemetriqDataset } from '../types';

export function mergeDatasets(datasets: TelemetriqDataset[]): TelemetriqDataset {
  if (datasets.length === 0) throw new Error('Cannot merge empty array of datasets');
  if (datasets.length === 1) return datasets[0];

  const allChannels = new Map<string, TelemetriqDataset['channels'][0]>();
  for (const ds of datasets) {
    for (const ch of ds.channels) {
      if (!allChannels.has(ch.key)) allChannels.set(ch.key, ch);
    }
  }

  const allSamples = datasets.flatMap(ds => ds.samples).sort((a, b) => a.t - b.t);
  const allEvents = datasets.flatMap(ds => ds.events ?? []);

  // Normalize values — fill missing channels with null
  const channelKeys = [...allChannels.keys()];
  const normalizedSamples = allSamples.map(sample => {
    const values: Record<string, number | string | boolean | null> = {};
    for (const key of channelKeys) {
      values[key] = sample.values[key] ?? null;
    }
    return { ...sample, values };
  });

  return {
    version: datasets[0].version,
    time: {
      unit: datasets[0].time.unit,
      start: Math.min(...datasets.map(d => d.time.start)),
      end: Math.max(...datasets.map(d => d.time.end)),
    },
    channels: [...allChannels.values()],
    samples: normalizedSamples,
    events: allEvents.length > 0 ? allEvents.sort((a, b) => a.t - b.t) : undefined,
  };
}
