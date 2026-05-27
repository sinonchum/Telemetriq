import type { NormalizedDataset } from '../dataset/normalizeDataset';
import type { TelemetriqDataset } from '../types';
import { TimeIndex } from '../time/TimeIndex';

export function getValueAt(
  normalized: NormalizedDataset,
  dataset: TelemetriqDataset,
  channelKey: string,
  time: number
): number | string | boolean | null {
  const channel = dataset.channels.find((c) => c.key === channelKey);
  if (!channel) return null;

  const timeIndex = new TimeIndex(normalized.timestamps);
  const ch = normalized.channels.get(channelKey);
  if (!ch) return null;

  if (time < normalized.timestamps[0] || time > normalized.timestamps[normalized.timestamps.length - 1]) {
    return NaN;
  }

  const floorIdx = timeIndex.findFloorIndex(time);
  if (normalized.timestamps[floorIdx] === time) {
    if (channel.type === 'string') {
      return dataset.samples[floorIdx].values[channelKey] as string;
    }
    return ch.data[floorIdx];
  }

  const mode = channel.interpolation || 'none';

  if (mode === 'none' || mode === 'previous' || channel.type === 'string' || channel.type === 'boolean') {
    if (channel.type === 'string') {
      return dataset.samples[floorIdx].values[channelKey] as string;
    }
    return ch.data[floorIdx];
  }

  const ceilIdx = Math.min(floorIdx + 1, normalized.timestamps.length - 1);
  const t0 = normalized.timestamps[floorIdx];
  const t1 = normalized.timestamps[ceilIdx];
  const v0 = ch.data[floorIdx];
  const v1 = ch.data[ceilIdx];

  if (isNaN(v0) || isNaN(v1)) return NaN;

  const ratio = (time - t0) / (t1 - t0);
  return v0 + ratio * (v1 - v0);
}
