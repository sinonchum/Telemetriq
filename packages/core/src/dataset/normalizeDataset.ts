import type { TelemetriqDataset } from '../types';

export type NormalizedChannel = {
  data: Float64Array;
};

export type NormalizedDataset = {
  timestamps: Float64Array;
  channels: Map<string, NormalizedChannel>;
};

export function normalizeDataset(dataset: TelemetriqDataset): NormalizedDataset {
  const samples = dataset.samples;
  const n = samples.length;

  const timestamps = new Float64Array(n);
  const channelKeys = dataset.channels.map((c) => c.key);
  const channels = new Map<string, NormalizedChannel>();

  for (const key of channelKeys) {
    channels.set(key, { data: new Float64Array(n) });
  }

  for (let i = 0; i < n; i++) {
    timestamps[i] = samples[i].t;
    for (const key of channelKeys) {
      const raw = samples[i].values[key];
      const ch = channels.get(key)!;
      if (raw === null || raw === undefined) {
        ch.data[i] = NaN;
      } else if (typeof raw === 'number') {
        ch.data[i] = raw;
      } else if (typeof raw === 'boolean') {
        ch.data[i] = raw ? 1 : 0;
      } else {
        // string — stored as NaN in Float64Array; read from samples directly
        ch.data[i] = NaN;
      }
    }
  }

  return { timestamps, channels };
}
