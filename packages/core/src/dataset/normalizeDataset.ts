import type { TelemetriqDataset } from '../types';

export type NormalizedChannel = {
  data: Float64Array;
  type: 'number' | 'boolean' | 'string';
};

export type NormalizedDataset = {
  timestamps: Float64Array;
  channels: Map<string, NormalizedChannel>;
  positions?: {
    x?: Float64Array;
    y?: Float64Array;
    z?: Float64Array;
    lat?: Float64Array;
    lon?: Float64Array;
    alt?: Float64Array;
  };
};

export function normalizeDataset(dataset: TelemetriqDataset): NormalizedDataset {
  const n = dataset.samples.length;
  const timestamps = new Float64Array(n);
  const channels = new Map<string, NormalizedChannel>();

  for (const ch of dataset.channels) {
    channels.set(ch.key, { data: new Float64Array(n), type: ch.type });
  }

  const positionKeys = new Set<string>();
  let positions: NormalizedDataset['positions'] | undefined;
  for (const sample of dataset.samples) {
    if (sample.position) {
      for (const key of Object.keys(sample.position)) {
        positionKeys.add(key);
      }
    }
  }
  if (positionKeys.size > 0) {
    positions = {};
    for (const key of positionKeys) {
      (positions as any)[key] = new Float64Array(n);
    }
  }

  for (let i = 0; i < n; i++) {
    const sample = dataset.samples[i];
    timestamps[i] = sample.t;
    for (const ch of dataset.channels) {
      const val = sample.values[ch.key];
      const arr = channels.get(ch.key)!.data;
      arr[i] = val == null ? NaN : Number(val);
    }
    if (positions && sample.position) {
      for (const key of positionKeys) {
        (positions as any)[key][i] = sample.position[key] ?? NaN;
      }
    }
  }

  return { timestamps, channels, positions };
}
